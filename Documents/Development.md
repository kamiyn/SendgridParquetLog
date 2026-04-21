# 開発・デバッグガイド

SendGrid Webhook to Parquet Logger の開発およびデバッグに関するドキュメントです。

## 目次

- [ローカル開発](#ローカル開発)
- [SendGrid 署名検証（開発向け）](#sendgrid-署名検証開発向け)
- [トラブルシューティング](#トラブルシューティング)

## ローカル開発

### .NET Aspire環境での開発

.NET Aspireを使用してローカル開発環境を構築できます。Aspire環境では、MinIO (S3互換ストレージ)、Redis、WebAPIが自動的に連携して起動します。

#### 前提条件

- .NET 10.0 SDK
- Docker Desktop
- .NET Aspire Workload

```bash
# .NET Aspire Workloadのインストール
dotnet workload install aspire

# WSL で実行している場合には ホスト側Windows に証明書をインストールするために以下のように作業を行う
dotnet dev-certs https --clean          # 古いものが残っていたら削除
# 新規に作成し C:/temp に証明書を保存する
DOTNET_CLI_HOME=$HOME dotnet dev-certs https -ep /mnt/c/Temp/aspnetcore.pfx -p "MySecretPassword123!"
dotnet dev-certs https --trust

echo IMPORT IN WINDOWS C:/Temp/aspnetcore.pfx
```

#### Aspire環境の起動

```bash
# プロジェクトディレクトリに移動
cd SendgridParquetLog

# Aspire AppHostを実行
dotnet run --project SendgridParquetLog.AppHost
```

#### アクセス先

起動後、以下のURLでアクセスできます:

- **Aspire Dashboard**: https://localhost:17071/ (開発監視ダッシュボード)
- **SendgridParquetLogger API**: Aspire Dashboard上で確認 (動的ポート)
- **MinIO Console**: http://localhost:9001
  - ユーザー名: `minioadmin`
  - パスワード: `minioadmin`
- **MinIO API**: http://localhost:9000

#### 環境変数の自動設定

Aspire環境では以下の環境変数が自動的に設定されます:

- `S3__SERVICEURL`: MinIOのエンドポイント
- `S3__REGION`: jp-north-1
- `S3__ACCESSKEY`: minioadmin
- `S3__SECRETKEY`: minioadmin
- `S3__BUCKETNAME`: sendgrid-events

#### テスト実行 (Aspire環境)

```bash
# Aspire Dashboard でAPIのポートを確認してからテスト実行
apiport=5206
curl -X POST http://localhost:${apiport}/webhook/sendgrid \
  -H "Content-Type: application/json" \
  -d '[{"email":"test@example.com","timestamp":1513299569,"event":"delivered"}]'
```

### 従来のローカル開発

```bash
# プロジェクトディレクトリに移動
cd SendgridParquetLogger

# 依存関係の復元
dotnet restore

# アプリケーションの実行
dotnet run

# テスト実行
curl -X POST http://localhost:5000/webhook/sendgrid \
  -H "Content-Type: application/json" \
  -d '[{"email":"test@example.com","timestamp":1513299569,"event":"delivered"}]'
```

## SendGrid 署名検証（開発向け）

本番環境での公開鍵の設定方法については [デプロイ・構築ガイド](./Deployment.md#署名検証公開鍵の形式) を参照してください。ここではローカル開発での動作確認方法を記載します。

### 開発時の簡易確認（署名検証バイパス）

- `SENDGRID__VERIFICATIONKEY=VERIFIED` とすると署名検証を通過させることができます（開発用途のみ）。
- この場合は署名ヘッダーの付与は不要です。

### ローカルでの署名付きリクエスト例

ローカルで実際の署名検証を行うには、EC 秘密鍵（例: P-256）を用意し、`timestamp + payload`（連結した文字列）の SHA-256 を ECDSA で署名し、その Base64 をヘッダーに設定します。

1) サンプル鍵の作成（OpenSSL）

```bash
openssl ecparam -name prime256v1 -genkey -noout -out ec_private.pem
openssl ec -in ec_private.pem -pubout -out ec_public.pem
# 公開鍵（PEM）の中身を SENDGRID__VERIFICATIONKEY に設定
```

2) 署名と送信（Linux/macOS）

```bash
api=http://localhost:5206
payload='[{"email":"test@example.com","timestamp":1513299569,"event":"delivered"}]'
ts=$(date -u +%s)
sig=$(printf "%s%s" "$ts" "$payload" | openssl dgst -sha256 -sign ec_private.pem | base64 -w0)

curl -X POST "$api/webhook/sendgrid" \
  -H "Content-Type: application/json" \
  -H "X-Twilio-Email-Event-Webhook-Timestamp: $ts" \
  -H "X-Twilio-Email-Event-Webhook-Signature: $sig" \
  -d "$payload"
```

注意:
- 署名対象は「`<UNIX秒のtimestamp>` と `payload(JSON文字列)` をそのまま連結したバイト列」です。
- 署名は DER 形式の ECDSA 署名（OpenSSL の `-sign` 出力）を Base64 化したものを送ります。
- Windows の場合は類似の手順を PowerShell + OpenSSL/MSYS で実行できます。

## トラブルシューティング

### S3接続エラー
- 環境変数が正しく設定されているか確認
- S3エンドポイントURLが正しいか確認
- ネットワーク接続を確認

### Parquet変換エラー
- SendGridから送信されるJSONの形式を確認
- ログを確認してエラーの詳細を把握

### メモリ使用量が高い
- 大量のイベントを一度に処理する場合、バッチサイズを調整
