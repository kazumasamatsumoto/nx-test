# Nx マイクロフロントエンド + マイクロサービス プロジェクト

このプロジェクトは、Nxモノレポを使用したマイクロフロントエンドとマイクロサービスアーキテクチャのデモンストレーションです。

## 技術スタック

### フロントエンド
- **Angular 20** - 最新のAngularフレームワーク
- **Nx Workspace** - モノレポ管理
- **Module Federation** - マイクロフロントエンド実装

### バックエンド
- **NestJS 11** - Node.jsフレームワーク
- **PostgreSQL 18** - データベース

### インフラ
- **Docker & Docker Compose** - コンテナ化
- **Node.js 22 LTS** - ランタイム

## プロジェクト構成

```
nx-test/
├── apps/
│   ├── frontend/
│   │   ├── shell/              # ホストアプリケーション (Port: 4200)
│   │   └── feature-users/      # リモートアプリ - ユーザー管理 (Port: 4201)
│   └── backend/
│       ├── api-gateway/        # APIゲートウェイ (Port: 3000)
│       ├── user-service/       # ユーザーサービス (Port: 3001)
│       └── product-service/    # 商品サービス (Port: 3002)
├── docker/
│   └── postgres/               # PostgreSQL初期化スクリプト
├── docker-compose.yml
└── .env
```

## セットアップ

### 前提条件

- Node.js 22.x LTS (または 25.x)
- npm
- Docker & Docker Compose

### インストール

```bash
# 依存関係のインストール
npm install
```

## 起動方法

### 1. データベースの起動

```bash
# PostgreSQLコンテナを起動
docker-compose up -d

# ログ確認
docker-compose logs -f
```

これにより以下のPostgreSQLインスタンスが起動します:
- **users_db** (Port: 5432) - ユーザーサービス用
- **products_db** (Port: 5433) - 商品サービス用
- **orders_db** (Port: 5434) - 注文サービス用

### 2. バックエンドサービスの起動

別のターミナルウィンドウで各サービスを起動:

```bash
# API Gateway
nx serve api-gateway

# User Service (別のターミナル)
nx serve user-service

# Product Service (別のターミナル)
nx serve product-service
```

### 3. フロントエンドアプリケーションの起動

```bash
# Shell (Host) アプリケーション
nx serve shell

# Feature Users (Remote) アプリケーション (別のターミナル)
nx serve feature-users
```

## アクセスURL

### フロントエンド
- **Shell App**: http://localhost:4200
- **Feature Users**: http://localhost:4201

### バックエンド
- **API Gateway**: http://localhost:3000/api
- **User Service**: http://localhost:3001/api
- **Product Service**: http://localhost:3002/api

### データベース
- **Users DB**: localhost:5432
- **Products DB**: localhost:5433
- **Orders DB**: localhost:5434

## 便利なコマンド

### Nxコマンド

```bash
# すべてのプロジェクトをビルド
nx run-many --target=build --all

# 特定のプロジェクトをビルド
nx build shell
nx build api-gateway

# テストの実行
nx test shell
nx test user-service

# リント
nx lint shell

# 依存関係グラフの可視化
nx graph
```

### Dockerコマンド

```bash
# コンテナの起動
docker-compose up -d

# コンテナの停止
docker-compose stop

# コンテナの削除
docker-compose down

# ログの確認
docker-compose logs -f postgres-users
```

## 開発ワークフロー

### 新しいフロントエンドアプリの追加

```bash
# 新しいAngularアプリケーションを作成
nx g @nx/angular:application --name=feature-products --directory=apps/frontend/feature-products

# Module Federation設定を追加
nx g @nx/angular:setup-mf feature-products --mfType=remote --host=shell --port=4202
```

### 新しいバックエンドサービスの追加

```bash
# 新しいNestJSアプリケーションを作成
nx g @nx/nest:application --name=order-service --directory=apps/backend/order-service
```

## トラブルシューティング

### ポートが既に使用されている

```bash
# 使用中のポートを確認
lsof -i :4200

# プロセスを終了
kill -9 <PID>
```

### データベース接続エラー

```bash
# PostgreSQLコンテナの状態を確認
docker-compose ps

# コンテナを再起動
docker-compose restart postgres-users
```

### Module Federationエラー

1. リモートアプリが起動しているか確認
2. `module-federation.config.ts`のURLを確認
3. ブラウザのコンソールでエラーを確認

## 参考資料

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)

## ライセンス

ISC
