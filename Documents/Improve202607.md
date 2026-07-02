# 改善プラン（2026-07）

本ドキュメントは [Implement.md](./Implement.md) で整理した現状を踏まえた改善プランです。対象は次の 2 点で、**メモリ使用量の抑制を最優先**とします。

1. **Compaction のメモリ使用量の抑制（優先）** — `/compaction` 実行時の OOM 再起動を解消する。
2. **S3 ロック機構の安定化** — Compaction の分散ロックが不安定になる問題を解消する。

各タスクは「対象 / 変更内容 / 期待効果 / リスク」の形で記述します。優先度は P0（即着手・効果大）> P1 > P2 の順。

---

## 1. Compaction のメモリ使用量の抑制（優先）

### 目的・完了条件

- `/compaction` の手動実行・定期実行のいずれでも、**メモリ使用率が上限に張り付かず、OOM 再起動が発生しない**こと。
- 特に [Implement.md](./Implement.md#compaction-のメモリ使用特性) で特定した **75%→100% の急スパイク（RowGroup 一括書き出し）を解消**すること。
- 大量バックログ（複数日分）をまとめて処理しても完走できること。

### 根本原因（要約）

- **スパイク（本質）**: `ParquetService.ConvertToParquetStreamingAsync` → `WriteRowGroupAsync` で、24 列 × 最大 `RowGroupSize`(60,000) 行の生データ・`ToArray()` コピー・Parquet.Net の圧縮バッファが同時に載る。可変長文字列（`response` 等）で実サイズが跳ね、イベントが特定 1 時間へ集中すると連続フラッシュで一気に上限へ達する。
- **ベースライン上昇（背景）**: LOH 断片化＋サーバー GC がメモリを返さないことで 40%→75% までじわじわ上がり、スパイクを吸収するヘッドルームが削られる。

### タスク一覧

#### P0-1. RowGroup を「行数」ではなく「概算バイト数」で区切る ★スパイク直接対策

- **対象**: [SendgridParquet.Shared/ParquetService.cs](../SendgridParquet.Shared/ParquetService.cs) `ConvertToParquetStreamingAsync` / `IColumnBuffer` / `ColumnBuffer<T>`。
- **変更内容**:
  - フラッシュ判定を現在の `buffers[0].Count >= rowGroupSize` から、**バッファ済みの概算バイト数がしきい値（例: 32〜64MB）に達したらフラッシュ**へ変更する。
  - `ColumnBuffer<T>` に「追加したデータの概算バイト数」を持たせる（`string` は `Length*2` 程度、数値型は固定サイズで加算）。文字列長を考慮することで、可変長データによるスパイクを平準化する。
  - あわせて安全上限として最大行数も併用（バイト見積りが外れても暴走しないように `Math.Min` 的にガード）。
- **期待効果**: 1 回のフラッシュで確保する量が**データ内容に依存せず一定バイト量に収まる**ため、急スパイクを構造的に解消する。
- **リスク**: バイト見積りの精度が粗いと効果が薄い／出力 RowGroup 数が増える（読み取り時の RowGroup 数増加。実用上は許容範囲）。

#### P0-2. `RowGroupSize` を設定化し、既定値を引き下げる（暫定・即効）

- **対象**: [SendgridParquetViewer/Services/CompactionService.cs](../SendgridParquetViewer/Services/CompactionService.cs)（`RowGroupSize` 定数）、[Models/CompactionOptions.cs](../SendgridParquetViewer/Models/CompactionOptions.cs)。
- **変更内容**: `RowGroupSize` を `CompactionOptions` に移して環境変数で調整可能にし、既定値を 60,000 → **20,000〜30,000** 程度へ引き下げる（P0-1 導入までの暫定、または併用）。
- **期待効果**: コード修正なしにスパイク高を運用で下げられる。P0-1 の恒久対策までのつなぎ。
- **リスク**: 小さすぎると RowGroup 数が増え圧縮効率・読み取り性能がやや低下。

#### P0-3. `Compaction:MaxBatchSizeBytes` の既定見直し

- **対象**: [Models/CompactionOptions.cs](../SendgridParquetViewer/Models/CompactionOptions.cs)（既定 512MB）。
- **変更内容**: 既定を **128〜256MB** へ引き下げる。1 バッチで 1 つの hour folder に集まる量を抑え、連続フラッシュによるスパイク誘発を緩和する。
- **期待効果**: hour folder の巨大化を抑制し、GC が追いつく余地を作る。
- **リスク**: バッチ数増加で S3 往復・出力ファイル数がやや増える（MoreCompaction で吸収可能）。

#### P1-4. `ToArray()` コピーの削減

- **対象**: [ParquetService.cs](../SendgridParquet.Shared/ParquetService.cs) `ColumnBuffer<T>.BuildDataColumn`。
- **変更内容**: `List<T>.ToArray()` による一時 2 倍確保を避ける。`CollectionsMarshal.AsSpan(list)` や `ArrayPool<T>` の活用、あるいは初回容量を `rowGroupSize` に固定して内部配列を再利用する方針を検討（Parquet.Net の `DataColumn` が配列を要求する点に注意し、安全な範囲で）。
- **期待効果**: フラッシュ時のピークをさらに削減、LOH への大配列生成頻度を低減。
- **リスク**: `DataColumn` が配列の所有権を前提にするため、プール返却タイミングの取り扱いに注意（書き込み完了後に返却）。

#### P1-5. .NET GC / ランタイム設定でベースラインを抑える

- **対象**: Viewer の `runtimeconfig`（csproj の `<PropertyGroup>`）またはコンテナ環境変数（[Deployment.md](./Deployment.md) / deploy.yml / Dockerfile）。
- **変更内容**（候補、実測で取捨）:
  - `DOTNET_GCHeapHardLimitPercent`（または `System.GC.HeapHardLimitPercent`）で**コンテナのメモリ上限を GC に認識**させ、上限手前で積極回収させる。
  - `DOTNET_gcServer=0`（ワークステーション GC）でヒープの過成長を抑制（スループットとのトレードオフ）。
  - `DOTNET_GCConserveMemory`（1〜9）でメモリ優先の挙動に。
  - バッチ/日の区切りで `GCSettings.LargeObjectHeapCompactionMode = CompactOnce` → `GC.Collect()` を**明示実行**し、LOH 断片化をリセット（`ExecuteCompactionOneDayAsync` の日次ループ末尾など、頻度を抑えて）。
- **期待効果**: 第 1 段階の 40%→75% のベースライン上昇を抑え、スパイクを吸収するヘッドルームを確保。
- **リスク**: GC 設定はスループットに影響。明示 `GC.Collect` は多用すると遅くなるため頻度を絞る。

#### P1-6. メモリ観測性の追加

- **対象**: [CompactionService.cs](../SendgridParquetViewer/Services/CompactionService.cs)、ServiceDefaults の OpenTelemetry。
- **変更内容**: RowGroup フラッシュ時のバッファ行数・概算バイト数、`GC.GetTotalMemory` / `Environment.WorkingSet` をログ／メトリクス化。どの時間帯・どの列でスパイクするかを切り分け可能にする。
- **期待効果**: 対策の効果検証と、将来の再発時の一次切り分けが可能に。
- **リスク**: ログ量増加（`ZLogDebug` レベルに)。
- **設計判断（メトリクス収集を Debug 有効時のみに絞らない）**: RowGroup フラッシュ毎の `GC.GetTotalMemory(false)` / `Environment.WorkingSet` 取得を「ログレベルが Debug のときだけ実行する」よう分岐させることも検討したが、**採用しない**。理由は以下:
  - このワークロードで支配的なのは**メモリ消費**であり、CPU 負荷はメトリクス収集中に一時的に約 25% へ上がる程度で**継続的な負荷ではない**（フラッシュは行グループ単位で頻度が低い）。よって収集コストは実運用上無視できる。
  - `ZLogDebug` は**スキップ時に string interpolation を実行しない**（ZLogger の構造化ログにより、ログレベル無効時はメッセージ構築コスト自体が発生しない）ため、ログ出力側のオーバーヘッドも実質ゼロ。
  - 収集を条件分岐で絞ると**コードの複雑性が増す**割に得られる利得が小さく、割に合わない。なおコールバック自体が不要な呼び出し元（`MoreCompactionService`）では `onRowGroupFlushed` を `null` にすることで収集を丸ごとスキップしており、これで十分。

### 検証方法

1. **再現**: スパイクした実データ（特定日・特定時間帯に偏ったバッチ）で `/compaction` を実行し、対策前後の `WorkingSet64` の推移を比較。
2. **合格基準**: ピーク使用率が上限に対して十分な余裕（例: 80% 未満）で完走すること。P0-1 導入後は「データ内容によらずピークが概ね一定」であることを確認。
3. 大量バックログ（複数日）で完走することを確認。

---

## 2. S3 ロック機構の安定化

### 目的・完了条件

- Compaction の分散ロック（`v3compaction/run.lock`）が、**取得・延長・解放・ストール回収を通じて期待どおりに排他**でき、二重実行や「取れない/解放されない」状態に陥らないこと。
- ストレージの条件付き書き込みの挙動差に対して**安全側に倒れる**（排他が崩れるより、取れずにスキップする方を選ぶ）こと。

### 現状の不安定要因（要約）

[Implement.md](./Implement.md#既知の課題改善予定) 参照。条件付き書き込み（`If-Match`/`If-None-Match`）のサポート差、ETag 欠落、クロックスキュー、`run.json` と `run.lock` の別オブジェクト由来のレース、ハートビート連続失敗時の自己キャンセル。

### タスク一覧

#### P0-1. 条件付き書き込みのサポート検証（プリフライト自己テスト）

- **対象**: [SendgridParquet.Shared/S3StorageService.cs](../SendgridParquet.Shared/S3StorageService.cs)（`PutObjectWithConditionAsync` / `PutObjectIfNoneMatchAsync`）、起動時の `CreateBucketService` 付近。
- **変更内容**: 起動時に一時キーへ `If-None-Match: *` と `If-Match` を実際に投げ、**412 が正しく返るか**を自己テストしてログ/メトリクスに残す。サポートされていない場合は警告を出し、ロックに依存する定期実行の扱い（無効化 or 明示警告）を決める。
- **期待効果**: 「そもそも CAS が効いていない」ケースを運用開始時に検知でき、原因切り分けが即座にできる。
- **リスク**: なし（読み書きは一時キーに限定）。

#### P0-2. ETag 欠落・弱い ETag へのハンドリング

- **対象**: [S3StorageService.cs](../SendgridParquet.Shared/S3StorageService.cs)（`GetObjectWithETagAsync` は成功 GET で ETag 欠落時に例外）。
- **変更内容**: ETag 欠落や weak ETag（`W/"..."`）を検出した場合の方針を明確化。ロック操作としては**安全側（取得失敗＝スキップ）**に倒し、例外で処理全体を落とさないようにする。weak ETag の正規化（比較時の扱い）も定義。
- **期待効果**: ストレージ差による例外で Compaction 全体が失敗するのを防ぐ。
- **リスク**: 安全側に倒すことで、正常なストレージでも取得が保守的になりうる（許容）。

#### P1-3. クロックスキュー対策

- **対象**: [SendgridParquetViewer/Services/S3LockService.cs](../SendgridParquetViewer/Services/S3LockService.cs)、[CompactionService.cs](../SendgridParquetViewer/Services/CompactionService.cs)（`expiresAt` 比較・ストール判定）。
- **変更内容**: `expiresAt` 判定にスキュー許容（数十秒程度のマージン）を導入。可能なら判定は「取得時刻からの相対経過」ベースに寄せ、インスタンス間の絶対時刻差の影響を減らす。
- **期待効果**: 時刻ずれによる誤った期限切れ判定・ストール誤検知を低減。
- **リスク**: マージン分だけロック解放後の再取得が遅れる（軽微）。

#### P1-4. `run.json` と `run.lock` の整合強化 / 単一化

- **対象**: [CompactionService.cs](../SendgridParquetViewer/Services/CompactionService.cs)（`FinalizeStalledRunAsync`、ストール判定）、[S3LockService.cs](../SendgridParquetViewer/Services/S3LockService.cs)。
- **変更内容**: ロック状態と進捗が別オブジェクトで一時的に不整合になる問題に対し、
  - ストール判定・強制無効化のロジックを「ロック（`run.lock`）を単一の真実の源」に寄せて簡素化する、または
  - `LockInfo` に進捗・ハートビート時刻を持たせて **1 オブジェクト（run.lock）へ集約**し、`run.json` は表示用途に限定する、のいずれかを検討。
- **期待効果**: レース由来の「ストールと判定されない／されすぎる」挙動を減らす。
- **リスク**: データ構造変更に伴う移行（既存 `run.json`/`run.lock` との後方互換に注意。読めない場合は安全側に）。

#### P1-5. ハートビート失敗時の挙動見直し

- **対象**: [CompactionService.cs](../SendgridParquetViewer/Services/CompactionService.cs) `RunLockHeartbeatAsync`（連続 3 回失敗で自己キャンセル）。
- **変更内容**: 一時的なネットワーク不調で処理が途中終了しやすい問題に対し、**指数バックオフ＋リトライ回数の緩和**、および「延長に失敗しても `expiresAt` まではまだ余裕がある」場合はキャンセルしないよう、**残存有効期限を考慮**した判定に変更する。
- **期待効果**: 一過性の失敗での不要な中断を減らしつつ、二重実行防止は維持。
- **リスク**: 緩和しすぎると二重実行リスク。残存期限を根拠にするため安全性は保てる。

#### P2-6. テスト・観測性

- **対象**: `SendgridParquetLogger.Test`（または Viewer 向けテスト追加）、S3LockService。
- **変更内容**: 取得競合・期限切れ奪取・強制無効化・ハートビート延長競合のユニット/結合テスト。ロック取得/延長/解放の各遷移をメトリクス化。
- **期待効果**: 回帰防止と、本番での状態遷移の可視化。
- **リスク**: なし。

---

## 実施順序（ロードマップ）

1. **メモリ P0（優先）**: P0-1（バイト量ベース RowGroup）を軸に、暫定として P0-2 / P0-3 を先行投入 → OOM を止める。
2. **メモリ P1**: P1-5（GC 設定）で第 1 段階のベースラインを抑制、P1-6 で観測性を確保して効果を検証。P1-4（ToArray 削減）は余力で。
3. **ロック P0**: P0-1（CAS 自己テスト）で「そもそも効いているか」を確定 → P0-2（ETag ハンドリング）。
4. **ロック P1**: クロックスキュー・整合強化・ハートビート見直しを順次。

## 後方互換・リスク管理

- **メモリ対策**は出力 Parquet の RowGroup 分割方針が変わるが、**フォーマット互換は保たれる**（読み取り側は RowGroup 数に非依存）。既存ファイルの再処理は不要。
- **ロック対策**でオブジェクト構造（`LockInfo`/`run.json`）を変える場合は、**読めない旧データは安全側（取得失敗・手動解決）**に倒す方針を維持する（現行 `TryAcquireLockAsync` のデシリアライズ失敗時の挙動と同じ思想）。
- GC 設定・各しきい値は**環境変数で調整可能**にし、本番投入前にステージング相当で実測してから確定する。
