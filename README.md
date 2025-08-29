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
| S3__AccessKey | S3アクセスキー | your-access-key |
| S3__SecretKey | S3シークレットキー | your-secret-key |
| S3__ServiceUrl | S3エンドポイントURL | https://s3.amazonaws.com |
| S3__BucketName | バケット名 | sendgrid-events |

### appsettings.json での設定

```json
{
  "S3": {
    "AccessKey": "your-access-key",
    "SecretKey": "your-secret-key", 
    "ServiceUrl": "https://your-s3-endpoint.com",
    "BucketName": "sendgrid-events"
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

### 2. 環境変数の設定

`.env`ファイルを作成:

```bash
S3__AccessKey=your-access-key
S3__SecretKey=your-secret-key
S3__ServiceUrl=https://your-s3-endpoint.com
S3__BucketName=sendgrid-events
```

### 3. Dockerイメージのビルドと実行

```bash
# イメージをビルド
docker-compose build

# コンテナを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
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

保存されたParquetファイルはDuckDBで直接クエリできます:

```sql
-- DuckDBの起動
duckdb

-- S3からParquetファイルを読み込み
INSTALL httpfs;
LOAD httpfs;

SET s3_access_key_id='your-access-key';
SET s3_secret_access_key='your-secret-key';
SET s3_endpoint='your-s3-endpoint.com';

-- データの読み込みと分析
SELECT 
    event,
    COUNT(*) as count,
    DATE_TRUNC('day', timestamp) as day
FROM read_parquet('s3://sendgrid-events/sendgrid-events/2025/08/29/*.parquet')
GROUP BY event, day
ORDER BY day DESC, count DESC;

-- 特定期間のイベント集計
SELECT 
    email,
    event,
    timestamp
FROM read_parquet('s3://sendgrid-events/sendgrid-events/2025/08/29/*.parquet')
WHERE timestamp >= '2025-08-29 00:00:00'
  AND timestamp < '2025-08-30 00:00:00'
ORDER BY timestamp DESC
LIMIT 100;
```

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

- **Aspire Dashboard**: http://localhost:15000 (開発監視ダッシュボード)
- **SendgridParquetLogger API**: Aspire Dashboard上で確認 (動的ポート)
- **MinIO Console**: http://localhost:9001
  - ユーザー名: `minioadmin`
  - パスワード: `minioadmin`
- **MinIO API**: http://localhost:9000

#### 環境変数の自動設定

Aspire環境では以下の環境変数が自動的に設定されます:

- `S3__ServiceUrl`: MinIOのエンドポイント
- `S3__AccessKey`: minioadmin
- `S3__SecretKey`: minioadmin
- `S3__BucketName`: sendgrid-events

#### テスト実行 (Aspire環境)

```bash
# Aspire Dashboard でAPIのポートを確認してからテスト実行
curl -X POST http://localhost:{api-port}/webhook/sendgrid \
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

## ライセンス

MIT

## サポート

問題が発生した場合は、Issueを作成してください。