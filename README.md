# SendGrid Webhook to Parquet Logger

SendGrid WebHookを受信してParquet形式でS3互換ストレージに保存する.NET 10.0アプリケーション

## 概要

このアプリケーションは、SendGridのEvent Webhookを受信し、イベントデータをParquet形式に変換してS3互換ストレージに保存します。保存されたデータはDuckDBなどのツールで効率的に分析できます。

## 機能

- SendGrid Event Webhookの受信 (POST /webhook/sendgrid)
- Parquet形式への変換 (DuckDB互換)
- S3互換ストレージへの保存
- 自動的なディレクトリ構造での保存 (年/月/日)
- ヘルスチェックエンドポイント (GET /webhook/health)
- Docker対応 (linux/amd64)

## 設定方法

ASP.NET Core のOptions パターンを使用して設定を管理します。

### 環境変数での設定

| 環境変数名 | 説明 | 例 |
|----------|------|-----|
| S3__ACCESSKEY | S3アクセスキー | your-access-key |
| S3__SECRETKEY | S3シークレットキー | your-secret-key |
| S3__SERVICEURL | S3エンドポイントURL | https://s3.amazonaws.com |
| S3__REGION | S3リージョン | us-east-1 |
| S3__BUCKETNAME | バケット名 | sendgrid-events |

### appsettings.json での設定

```json
{
  "S3": {
    "ACCESSKEY": "your-access-key",
    "SECRETKEY": "your-secret-key",
    "SERVICEURL": "https://your-s3-endpoint.com",
    "REGION": "s3-region",
    "BUCKETNAME": "sendgrid-events"
  }
}
```

環境変数は `appsettings.json` の設定を上書きします。

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd SendgridParquetLog
```

### 2. Dockerイメージのビルドと実行

[Docker Compose V2](https://docs.docker.jp/compose/)

[Ubuntu 用 Docker CE の入手](https://docs.docker.jp/engine/install/linux/docker-ce/ubuntu.html)
に従って docker engine をインストール

```bash
sudo apt-get install docker-compose-plugin
＃ Docker コマンドを sudo なしで実行できるようにする場合
sudo usermod -aG docker $USER
```

```bash
# イメージをビルド
docker compose build

# コンテナを起動
docker compose up -d

# ログを確認
docker compose logs -f
```

## SendGrid側の設定

1. SendGridダッシュボードにログイン
2. Settings > Mail Settings > Event Webhookに移動
3. HTTP Post URLに以下を設定:
   ```
   https://your-domain.com/webhook/sendgrid
   ```
4. 必要なイベントタイプを選択
5. 設定を保存

## API エンドポイント

### Webhookイベント受信

```http
POST /webhook/sendgrid
Content-Type: application/json

[
  {
    "email": "example@example.com",
    "timestamp": 1513299569,
    "event": "delivered",
    "sg_event_id": "...",
    "sg_message_id": "..."
  }
]
```

### ヘルスチェック

```http
GET /webhook/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-08-29T10:30:00Z"
}
```

## データ形式

保存されるParquetファイルには以下のカラムが含まれます:

| カラム名 | 型 | 説明 |
|---------|---|------|
| email | string | 受信者のメールアドレス |
| timestamp | DateTime | イベント発生時刻 |
| event | string | イベントタイプ (delivered, opened, clicked等) |
| category | string | カテゴリ (JSON配列形式) |
| sg_event_id | string | SendGridイベントID |
| sg_message_id | string | SendGridメッセージID |
| smtp_id | string | SMTP ID |
| useragent | string | ユーザーエージェント |
| ip | string | IPアドレス |
| url | string | クリックされたURL |
| reason | string | バウンス理由 |
| status | string | ステータスコード |
| response | string | SMTPレスポンス |
| tls | int? | TLS使用有無 |
| attempt | string | 送信試行回数 |
| type | string | イベントのタイプ |
| bounce_classification | string | バウンス分類 |
| asm_group_id | int? | ASMグループID |
| unique_args | string | カスタム引数 (JSON形式) |
| marketing_campaign_id | int? | マーケティングキャンペーンID |
| marketing_campaign_name | string | マーケティングキャンペーン名 |
| pool_name | string | IPプール名 |
| pool_id | int? | IPプールID |
| send_at | DateTime? | 送信予定時刻 |

## DuckDBでの使用例

保存されたParquetファイルはDuckDBで直接クエリできます。
[DuckDBクエリ例](./SendgridParquetLogger/test-duckdb.sql) を参考にしてください。

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

## GitHub Actions による自動デプロイ

このプロジェクトは GitHub Actions を使用して自動的にビルドとデプロイを行います。

### 必要な設定

#### 1. Repository Variables の設定

GitHub リポジトリの Settings > Secrets and variables > Actions > Variables タブで以下の変数を設定:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| CONTAINER_REGISTRY_URL | コンテナレジストリのURL | registry.example.com |
| CONTAINER_REGISTRY_USERNAME | レジストリのユーザー名 | your-username |
| SAKURACLOUD_ACCESS_TOKEN | さくらのクラウドAPIトークン | your-access-token |

#### 2. Repository Variables の追加設定

S3設定に関する Repository Variables も設定してください:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| S3__SERVICEURL | S3互換ストレージのエンドポイントURL | https://s3.amazonaws.com |
| S3__REGION | S3リージョン | us-east-1 |
| S3__ACCESSKEY | S3互換ストレージのアクセスキー | your-access-key |
| S3__BUCKETNAME | データを保存するS3バケット名 | sendgrid-events |

#### 3. Repository Secrets の設定

GitHub リポジトリの Settings > Secrets and variables > Actions > Secrets タブで以下のシークレットを設定:

| シークレット名 | 説明 |
|---------------|------|
| CONTAINER_REGISTRY_PASSWORD | レジストリのパスワード |
| SAKURACLOUD_ACCESS_TOKEN_SECRET | さくらのクラウドAPIシークレット |
| S3__SECRETKEY | S3互換ストレージのシークレットキー |

### 設定手順

1. **GitHub リポジトリの設定画面を開く**
   - リポジトリのページで「Settings」タブをクリック

2. **Variables の設定**
   - 左サイドバーの「Secrets and variables」→「Actions」をクリック
   - 「Variables」タブを選択
   - 「New repository variable」ボタンをクリック
   - 各変数を追加:
     - `CONTAINER_REGISTRY_URL`: コンテナレジストリのURL
     - `CONTAINER_REGISTRY_USERNAME`: レジストリのユーザー名
     - `SAKURACLOUD_ACCESS_TOKEN`: さくらのクラウドAPIトークン
     - `S3__SERVICEURL`: S3互換ストレージのエンドポイントURL
     - `S3__REGION`: S3リージョン
     - `S3__ACCESSKEY`: S3互換ストレージのアクセスキー
     - `S3__BUCKETNAME`: データを保存するS3バケット名

3. **Secrets の設定**
   - 「Secrets」タブを選択
   - 「New repository secret」ボタンをクリック
   - 各シークレットを追加:
     - `CONTAINER_REGISTRY_PASSWORD`: レジストリのパスワード
     - `SAKURACLOUD_ACCESS_TOKEN_SECRET`: さくらのクラウドAPIシークレット
     - `S3__SECRETKEY`: S3互換ストレージのシークレットキー

### ワークフローのトリガー

GitHub Actions ワークフローは以下の条件でトリガーされます:

- `main` ブランチへのプッシュ時
- 手動実行（Actions タブから「Run workflow」ボタンをクリック）

### ワークフローの動作

1. リポジトリのコードをチェックアウト
2. Docker Buildx をセットアップ
3. コンテナレジストリにログイン
4. `docker compose build` でイメージをビルド
5. ビルドしたイメージをレジストリにプッシュ
6. `02deploy.sh` スクリプトを実行してさくらのクラウドにデプロイ

### デプロイの確認

GitHub Actions の実行状況は以下で確認できます:

1. リポジトリの「Actions」タブをクリック
2. 実行中または完了したワークフローを選択
3. 各ステップの詳細ログを確認

エラーが発生した場合は、ログを確認して必要な設定や権限を見直してください。

## ライセンス

MIT

## サポート

問題が発生した場合は、Issueを作成してください。