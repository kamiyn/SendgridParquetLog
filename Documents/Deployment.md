# デプロイ・構築ガイド

SendGrid Webhook to Parquet Logger のデプロイおよび構築に関するドキュメントです。

## 目次

- [設定方法](#設定方法)
- [セットアップ](#セットアップ)
- [SendGrid側の設定](#sendgrid側の設定)
- [GitHub Actions による自動デプロイ](#github-actions-による自動デプロイ)

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
| SENDGRID__VERIFICATIONKEY | SendGrid Event Webhook 検証用公開鍵 (PEM または Base64(SPKI)) | -----BEGIN PUBLIC KEY----- ... |
| SENDGRID__MAXBODYBYTES | Webhook リクエストボディ上限 (バイト) | 1048576 |
| SENDGRID__ALLOWEDSKEW | タイムスタンプ許容スキュー (TimeSpan.Parse 形式) | 00:05:00 |
| SENDGRID__APIKEY | SendGrid API キー (Viewer でのテンプレート取得用) | SG.xxxxxx... |
| OTEL_EXPORTER_OTLP_ENDPOINT | OpenTelemetry OTLP エンドポイントURL | http://localhost:4318 |
| OTEL_EXPORTER_OTLP_PROTOCOL | OTLP プロトコル (`grpc`/`http/protobuf`) | http/protobuf |
| OTEL_EXPORTER_OTLP_HEADERS | OTLP 追加ヘッダー（`k=v,k2=v2` 形式） | x-api-key=xxxxx |

補足: `.NET Aspire` のローカル開発時は `DOTNET_DASHBOARD_OTLP_ENDPOINT_URL`（ダッシュボードの OTLP URL）が設定される場合があり、`OTEL_EXPORTER_OTLP_ENDPOINT` が未設定でも自動的にそれを利用してメトリクス/トレース/ログを送信します。いずれの接続先情報も未設定の場合は OpenTelemetry の「送信」は行われません（計測は有効）。

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

#### 追加オプションの詳細

- `SENDGRID__MAXBODYBYTES`: デフォルトは 1 MiB (1,048,576)。範囲は 1〜100 MiB。
- `SENDGRID__ALLOWEDSKEW`: デフォルトは `00:05:00`（5 分）。`.NET TimeSpan.Parse` 形式で指定（例: `00:00:30`, `01:00:00`, `1.00:00:00`）。

## セットアップ

### リポジトリのクローン

```bash
git clone <repository-url>
cd SendgridParquetLog
```

### DuckDbBundle ファイルの生成

```bash
(cd DuckDbBundle; npm run build)
または
(cd DuckDbBundle; npm run build:dev) # .map ファイルを生成する
```

### Dockerイメージのビルドと実行

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

### 署名検証（公開鍵の形式）

本番環境では、SendGrid の Event Webhook 署名検証を必ず有効にしてください。

- 公開鍵は SPKI 形式を想定しています。以下のいずれかで指定可能:
  - PEM: `-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----`
  - Base64 (PEM の中身のみを Base64 にした文字列)
- 環境変数: `SENDGRID__VERIFICATIONKEY`

開発時の簡易確認（署名検証バイパス）やローカルでの署名付きリクエスト例については [開発・デバッグガイド](./Development.md) を参照してください。

## GitHub Actions による自動デプロイ

このプロジェクトは GitHub Actions を使用して自動的にビルドとデプロイを行います。

<a id="gha-flow"></a>
### 図解

```mermaid
flowchart TD
  subgraph GitHub
    repo["リポジトリ (main)"]
    actions["Actions ワークフロー"]
    vars["Variables"]
    secrets["Secrets"]
  end

  subgraph CI[CI/CD]
    buildx["Docker Buildx セットアップ"]
    login["コンテナレジストリ ログイン"]
    build["docker compose build"]
    push["イメージ Push"]
    deploy["SakuraCloud.sh でデプロイ"]
  end

  subgraph Sakura[さくらインターネット]
    platform["コンテナ実行基盤"]
  end

  repo --> actions
  actions --> buildx --> login --> build --> push --> deploy --> platform

  vars -. 参照 .-> actions
  secrets -. 参照 .-> actions
```

### 必要な設定

#### 1. Repository Variables の設定

GitHub リポジトリの Settings > Secrets and variables > Actions > Variables タブで以下の変数を設定:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| CONTAINER_REGISTRY_URL | コンテナレジストリのURL | registry.example.com |
| CONTAINER_REGISTRY_USERNAME | レジストリのユーザー名 | your-username |
| SAKURACLOUD_ACCESS_TOKEN | さくらのクラウドAPIトークン | your-access-token |

S3設定に関する Repository Variables も設定してください:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| S3__SERVICEURL | S3互換ストレージのエンドポイントURL | https://s3.amazonaws.com |
| S3__REGION | S3リージョン | us-east-1 |
| S3__ACCESSKEY | S3互換ストレージのアクセスキー | your-access-key |
| S3__BUCKETNAME | データを保存するS3バケット名 | sendgrid-events |

SendGrid Webhook に関する Repository Variables も任意で設定できます:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| SENDGRID__MAXBODYBYTES | Webhook リクエストボディ上限 (バイト) | 1048576 |
| SENDGRID__ALLOWEDSKEW | タイムスタンプ許容スキュー (`TimeSpan.Parse` 形式) | 00:05:00 |

#### 2. Repository Secrets の設定

GitHub リポジトリの Settings > Secrets and variables > Actions > Secrets タブで以下のシークレットを設定:

| シークレット名 | 説明 |
|---------------|------|
| CONTAINER_REGISTRY_PASSWORD | レジストリのパスワード |
| SAKURACLOUD_ACCESS_TOKEN_SECRET | さくらのクラウドAPIシークレット |
| S3__SECRETKEY | S3互換ストレージのシークレットキー |
| SENDGRID__VERIFICATIONKEY | SendGrid Event Webhook 検証用公開鍵 (PEM または Base64(SPKI)) |
| SENDGRID__APIKEY | SendGrid API キー (Viewer でのテンプレート取得用、Dynamic Template 読取権限が必要) |

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
     - `SENDGRID__VERIFICATIONKEY`: SendGrid Event Webhook 検証用公開鍵 (PEM または Base64(SPKI))

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
6. `SakuraCloud.sh` スクリプトを実行してさくらのクラウドにデプロイ

### デプロイの確認

GitHub Actions の実行状況は以下で確認できます:

1. リポジトリの「Actions」タブをクリック
2. 実行中または完了したワークフローを選択
3. 各ステップの詳細ログを確認

エラーが発生した場合は、ログを確認して必要な設定や権限を見直してください。
