# Nx マイクロフロントエンド + マイクロサービス アーキテクチャ設計書

## 目次
1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [フォルダ構成](#フォルダ構成)
3. [マイクロフロントエンドについて](#マイクロフロントエンドについて)
4. [マイクロサービスについて](#マイクロサービスについて)
5. [構築手順](#構築手順)
6. [起動方法](#起動方法)
7. [開発ワークフロー](#開発ワークフロー)

---

## アーキテクチャ概要

### システム構成図

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Shell App  │──│  Remote App1 │  │  Remote App2 │ │
│  │  (Host)      │  │  (Feature)   │  │  (Feature)   │ │
│  │  Port: 4200  │  │  Port: 4201  │  │  Port: 4202  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
           │                 │                 │
           └─────────────────┴─────────────────┘
                            │
                ┌───────────▼───────────┐
                │    API Gateway        │
                │    (NestJS)           │
                │    Port: 3000         │
                └───────────┬───────────┘
                            │
        ┏━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━┓
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User Service │    │Product Service│   │ Order Service│
│  (NestJS)    │    │   (NestJS)    │   │  (NestJS)    │
│  Port: 3001  │    │   Port: 3002  │   │  Port: 3003  │
│  + Postgres  │    │   + Postgres  │   │  + Postgres  │
│  Port: 5432  │    │   Port: 5433  │   │  Port: 5434  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 技術スタック

**フロントエンド:**
- Angular 20 (最新版、2025年5月リリース)
- Nx Workspace (最新版)
- Module Federation (Webpack 5)
- RxJS
- Angular Material (UI)

**バックエンド:**
- NestJS 11 (最新版、2025年1月リリース)
- TypeORM 0.3.27 (最新版)
- PostgreSQL 18 (最新版、2025年9月リリース)
- Passport (認証)
- Swagger (API ドキュメント)

**インフラ:**
- Docker & Docker Compose
- Nginx (リバースプロキシ)
- Node.js 22.x LTS (推奨) または Node.js 25.x (最新版)

---

## フォルダ構成

```
nx-test/
├── apps/
│   ├── frontend/
│   │   ├── shell/                    # ホストアプリケーション
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.component.ts
│   │   │   │   │   ├── app.routes.ts
│   │   │   │   │   └── app.config.ts
│   │   │   │   └── main.ts
│   │   │   ├── module-federation.config.ts
│   │   │   └── project.json
│   │   │
│   │   ├── feature-users/            # ユーザー管理機能 (Remote)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── remote-entry/
│   │   │   │   │   ├── users/
│   │   │   │   │   └── user-detail/
│   │   │   │   └── main.ts
│   │   │   ├── module-federation.config.ts
│   │   │   └── project.json
│   │   │
│   │   └── feature-products/         # 商品管理機能 (Remote)
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── remote-entry/
│   │       │   │   ├── products/
│   │       │   │   └── product-detail/
│   │       │   └── main.ts
│   │       ├── module-federation.config.ts
│   │       └── project.json
│   │
│   └── backend/
│       ├── api-gateway/              # APIゲートウェイ
│       │   ├── src/
│       │   │   ├── app/
│       │   │   │   ├── app.module.ts
│       │   │   │   ├── app.controller.ts
│       │   │   │   └── app.service.ts
│       │   │   ├── auth/
│       │   │   ├── proxy/
│       │   │   └── main.ts
│       │   └── project.json
│       │
│       ├── user-service/             # ユーザーサービス
│       │   ├── src/
│       │   │   ├── app/
│       │   │   ├── users/
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   ├── users.module.ts
│       │   │   │   └── entities/
│       │   │   │       └── user.entity.ts
│       │   │   └── main.ts
│       │   └── project.json
│       │
│       ├── product-service/          # 商品サービス
│       │   ├── src/
│       │   │   ├── app/
│       │   │   ├── products/
│       │   │   │   ├── products.controller.ts
│       │   │   │   ├── products.service.ts
│       │   │   │   ├── products.module.ts
│       │   │   │   └── entities/
│       │   │   │       └── product.entity.ts
│       │   │   └── main.ts
│       │   └── project.json
│       │
│       └── order-service/            # 注文サービス
│           ├── src/
│           │   ├── app/
│           │   ├── orders/
│           │   │   ├── orders.controller.ts
│           │   │   ├── orders.service.ts
│           │   │   ├── orders.module.ts
│           │   │   └── entities/
│           │   │       └── order.entity.ts
│           │   └── main.ts
│           └── project.json
│
├── libs/
│   ├── frontend/
│   │   ├── shared/
│   │   │   ├── ui/                   # 共通UIコンポーネント
│   │   │   │   ├── src/
│   │   │   │   │   ├── lib/
│   │   │   │   │   │   ├── button/
│   │   │   │   │   │   ├── card/
│   │   │   │   │   │   └── table/
│   │   │   │   │   └── index.ts
│   │   │   │   └── project.json
│   │   │   │
│   │   │   ├── data-access/          # 共通データアクセス層
│   │   │   │   ├── src/
│   │   │   │   │   ├── lib/
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── state/
│   │   │   │   │   │   └── interceptors/
│   │   │   │   │   └── index.ts
│   │   │   │   └── project.json
│   │   │   │
│   │   │   └── utils/                # 共通ユーティリティ
│   │   │       ├── src/
│   │   │       │   ├── lib/
│   │   │       │   │   ├── helpers/
│   │   │       │   │   ├── validators/
│   │   │       │   │   └── constants/
│   │   │       │   └── index.ts
│   │   │       └── project.json
│   │   │
│   │   └── domain/
│   │       ├── user/                 # ユーザードメインモデル
│   │       │   ├── src/
│   │       │   │   ├── lib/
│   │       │   │   │   ├── models/
│   │       │   │   │   └── interfaces/
│   │       │   │   └── index.ts
│   │       │   └── project.json
│   │       │
│   │       └── product/              # 商品ドメインモデル
│   │           ├── src/
│   │           │   ├── lib/
│   │           │   │   ├── models/
│   │           │   │   └── interfaces/
│   │           │   └── index.ts
│   │           └── project.json
│   │
│   └── backend/
│       ├── shared/
│       │   ├── dto/                  # 共通DTO
│       │   │   ├── src/
│       │   │   │   ├── lib/
│       │   │   │   │   ├── pagination.dto.ts
│       │   │   │   │   └── response.dto.ts
│       │   │   │   └── index.ts
│       │   │   └── project.json
│       │   │
│       │   ├── interfaces/           # 共通インターフェース
│       │   │   ├── src/
│       │   │   │   ├── lib/
│       │   │   │   └── index.ts
│       │   │   └── project.json
│       │   │
│       │   ├── guards/               # 共通ガード
│       │   │   ├── src/
│       │   │   │   ├── lib/
│       │   │   │   │   └── jwt-auth.guard.ts
│       │   │   │   └── index.ts
│       │   │   └── project.json
│       │   │
│       │   └── decorators/           # 共通デコレーター
│       │       ├── src/
│       │       │   ├── lib/
│       │       │   └── index.ts
│       │       └── project.json
│       │
│       └── database/
│           └── postgres/             # PostgreSQL共通設定
│               ├── src/
│               │   ├── lib/
│               │   │   ├── database.module.ts
│               │   │   └── database.config.ts
│               │   └── index.ts
│               └── project.json
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── postgres/
│   │   ├── user-service/
│   │   │   └── init.sql
│   │   ├── product-service/
│   │   │   └── init.sql
│   │   └── order-service/
│   │       └── init.sql
│   ├── nginx/
│   │   └── nginx.conf
│   └── Dockerfile.frontend
│
├── .env.example
├── nx.json
├── package.json
├── tsconfig.base.json
└── README.md
```

---

## マイクロフロントエンドについて

### 概要

マイクロフロントエンド（Micro Frontends）は、フロントエンドアプリケーションを独立した小さな機能単位に分割し、それぞれを別々に開発・デプロイ・運用できるようにするアーキテクチャパターンです。

### 実装方式: Module Federation

このプロジェクトでは、Webpack 5の**Module Federation**を使用してマイクロフロントエンドを実装します。

#### 仕組み

1. **Host (Shell)**: 各リモートアプリケーションを統合するメインアプリケーション
2. **Remote**: 独立して動作可能な機能モジュール
3. **ランタイム統合**: ブルドタイムではなく、ブラウザ実行時にリモートモジュールを読み込む

```typescript
// shell/module-federation.config.ts
module.exports = {
  name: 'shell',
  remotes: {
    'feature-users': 'http://localhost:4201/remoteEntry.js',
    'feature-products': 'http://localhost:4202/remoteEntry.js',
  },
};

// feature-users/module-federation.config.ts
module.exports = {
  name: 'featureUsers',
  exposes: {
    './Routes': './src/app/remote-entry/entry.routes.ts',
  },
};
```

### 利点

#### 1. **独立したデプロイメント**
- 各フロントエンドアプリを個別にデプロイ可能
- 他の機能に影響を与えずに更新できる
- リリースサイクルを短縮できる

#### 2. **チームの自律性**
- チームごとに異なる機能を担当可能
- 技術スタックの選択の自由度（制限あり）
- コードレビューとデプロイの並列化

#### 3. **スケーラビリティ**
- 大規模アプリケーションを管理しやすい小さな単位に分割
- 各チームが独立してスケール可能
- 複雑性を分散

#### 4. **段階的な移行**
- レガシーシステムから段階的に移行可能
- リスクを最小化
- 既存機能を維持しながら新機能を追加

#### 5. **技術的な柔軟性**
- 異なるフレームワークやバージョンの共存が可能（注意が必要）
- 新しい技術を試しやすい
- 段階的なアップグレード

### デメリット

#### 1. **複雑性の増加**
- アーキテクチャが複雑になる
- デバッグが困難になる可能性
- 開発環境のセットアップが複雑

#### 2. **パフォーマンスの懸念**
- 初期ロード時間の増加（複数のバンドルをロード）
- ネットワークレイテンシの影響
- 共有ライブラリの重複ロードのリスク

#### 3. **依存関係の管理**
- 共有ライブラリのバージョン管理が複雑
- 互換性の問題
- 依存関係の衝突

#### 4. **運用コスト**
- 複数のアプリケーションの監視が必要
- デプロイパイプラインの複雑化
- インフラコストの増加

#### 5. **一貫性の維持**
- UIの一貫性を保つのが難しい
- 共通コンポーネントの管理
- デザインシステムの徹底が必要

#### 6. **テストの複雑性**
- 統合テストが複雑
- E2Eテストの実行時間増加
- モックの管理が困難

### いつ使うべきか

**使うべき場合:**
- 大規模なチーム（複数チーム）での開発
- 独立したリリースサイクルが必要
- 異なる機能を異なるペースで更新したい
- 段階的な技術移行が必要

**避けるべき場合:**
- 小規模プロジェクト（5人以下のチーム）
- シンプルなアプリケーション
- 高速なパフォーマンスが最優先
- チーム間の調整が難しい組織

---

## マイクロサービスについて

### 概要

マイクロサービスアーキテクチャは、アプリケーションを小さな独立したサービスの集合として構築するアプローチです。各サービスは特定のビジネス機能を担当し、独立してデプロイ・スケール可能です。

### アーキテクチャパターン

#### 1. **API Gateway パターン**

```
Client → API Gateway → Microservices
```

- すべてのクライアントリクエストの単一エントリーポイント
- 認証、認可、レート制限、ルーティングを担当
- サービス間の複雑性を隠蔽

#### 2. **Database per Service パターン**

各マイクロサービスが独自のデータベースを持つ：

```
User Service → PostgreSQL (Port: 5432)
Product Service → PostgreSQL (Port: 5433)
Order Service → PostgreSQL (Port: 5434)
```

**利点:**
- データの独立性
- スキーマ変更の自由度
- サービス間の疎結合

**課題:**
- トランザクション管理の複雑性
- データの一貫性
- 結合クエリの困難性

### 実装例

```typescript
// user-service/src/users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

```typescript
// api-gateway/src/proxy/proxy.controller.ts
@Controller()
export class ProxyController {
  @Get('users/*')
  async proxyUsers(@Req() req: Request, @Res() res: Response) {
    // Forward to user-service
    const response = await fetch('http://user-service:3001' + req.url);
    return response.json();
  }

  @Get('products/*')
  async proxyProducts(@Req() req: Request, @Res() res: Response) {
    // Forward to product-service
    const response = await fetch('http://product-service:3002' + req.url);
    return response.json();
  }
}
```

### 利点

#### 1. **独立したデプロイメント**
- 各サービスを個別にデプロイ可能
- ダウンタイムを最小化
- リリース頻度の向上

#### 2. **技術的多様性**
- サービスごとに最適な技術スタックを選択可能
- レガシーシステムとの共存
- 段階的な技術移行

#### 3. **スケーラビリティ**
- 負荷の高いサービスのみをスケール
- リソースの効率的な利用
- 水平スケーリングが容易

#### 4. **耐障害性**
- 一つのサービスの障害が全体に影響しにくい
- サーキットブレーカーパターンで障害を隔離
- 部分的なダウングレード運用が可能

#### 5. **チームの自律性**
- チームごとにサービスを担当
- 独立した開発サイクル
- 意思決定の高速化

#### 6. **保守性**
- コードベースが小さく理解しやすい
- 影響範囲が限定的
- リファクタリングが容易

### デメリット

#### 1. **分散システムの複雑性**
- ネットワークレイテンシ
- 部分的な障害への対応
- デバッグの困難性

#### 2. **データの一貫性**
- 分散トランザクションの管理
- Eventual Consistency（結果整合性）への対応
- データの重複

#### 3. **運用コスト**
- 複数のサービスの監視・ロギング
- デプロイパイプラインの複雑化
- インフラコストの増加

#### 4. **開発の複雑性**
- サービス間通信の実装
- API バージョニング
- 統合テストの困難性

#### 5. **パフォーマンス**
- サービス間通信のオーバーヘッド
- ネットワークホップの増加
- シリアライゼーション/デシリアライゼーションのコスト

#### 6. **組織的課題**
- チーム間の調整コスト
- 共通ルールの策定と維持
- スキルセットの多様化

### いつ使うべきか

**使うべき場合:**
- 大規模なアプリケーション
- 複数チームでの開発
- 異なるスケーリング要件を持つ機能
- 高い可用性が必要
- 段階的な技術移行

**避けるべき場合:**
- 小規模プロジェクト
- スタートアップの初期フェーズ
- チームが小さい（5人以下）
- 明確なドメイン境界が定義できない
- ネットワークレイテンシが許容できない

### モノリスとの比較

| 観点 | モノリス | マイクロサービス |
|------|----------|------------------|
| **複雑性** | 低い | 高い |
| **デプロイ** | 一括デプロイ | 独立デプロイ |
| **スケーリング** | 全体をスケール | 部分的にスケール |
| **開発速度（初期）** | 速い | 遅い |
| **開発速度（成長後）** | 遅い | 速い |
| **トランザクション** | シンプル | 複雑 |
| **監視** | シンプル | 複雑 |

---

## 構築手順

### 前提条件

- Node.js 22.x LTS (推奨) または Node.js 25.x 以上
- Docker & Docker Compose
- npm または yarn

### 1. Nx ワークスペースの初期化

```bash
# Nxワークスペースの作成
npx create-nx-workspace@latest nx-test --preset=empty

cd nx-test

# 必要なプラグインのインストール
npm install -D @nx/angular @nx/nest @nx/node
```

### 2. フロントエンドアプリケーションの作成

#### Shell (Host) アプリケーション

```bash
# Shellアプリの作成
nx g @nx/angular:app shell --directory=apps/frontend/shell --standalone --routing

# Module Federation設定
nx g @nx/angular:setup-mf shell --mfType=host --port=4200
```

#### Remote アプリケーション

```bash
# feature-usersアプリの作成
nx g @nx/angular:app feature-users --directory=apps/frontend/feature-users --standalone --routing

# Module Federation設定
nx g @nx/angular:setup-mf feature-users --mfType=remote --host=shell --port=4201

# feature-productsアプリの作成
nx g @nx/angular:app feature-products --directory=apps/frontend/feature-products --standalone --routing

# Module Federation設定
nx g @nx/angular:setup-mf feature-products --mfType=remote --host=shell --port=4202
```

#### 共有ライブラリの作成

```bash
# UIコンポーネントライブラリ
nx g @nx/angular:library ui --directory=libs/frontend/shared/ui --standalone

# データアクセスライブラリ
nx g @nx/angular:library data-access --directory=libs/frontend/shared/data-access --standalone

# ユーティリティライブラリ
nx g @nx/angular:library utils --directory=libs/frontend/shared/utils

# ドメインライブラリ
nx g @nx/angular:library user --directory=libs/frontend/domain/user
nx g @nx/angular:library product --directory=libs/frontend/domain/product
```

### 3. バックエンドアプリケーションの作成

#### API Gateway

```bash
nx g @nx/nest:app api-gateway --directory=apps/backend/api-gateway
```

#### マイクロサービス

```bash
# User Service
nx g @nx/nest:app user-service --directory=apps/backend/user-service

# Product Service
nx g @nx/nest:app product-service --directory=apps/backend/product-service

# Order Service
nx g @nx/nest:app order-service --directory=apps/backend/order-service
```

#### 共有ライブラリの作成

```bash
# DTOライブラリ
nx g @nx/node:library dto --directory=libs/backend/shared/dto

# インターフェースライブラリ
nx g @nx/node:library interfaces --directory=libs/backend/shared/interfaces

# ガードライブラリ
nx g @nx/node:library guards --directory=libs/backend/shared/guards

# デコレーターライブラリ
nx g @nx/node:library decorators --directory=libs/backend/shared/decorators

# PostgreSQL設定ライブラリ
nx g @nx/node:library postgres --directory=libs/backend/database/postgres
```

### 4. 必要なパッケージのインストール

```bash
# フロントエンド
npm install @angular/material @angular/cdk
npm install rxjs

# バックエンド
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install bcrypt

# 開発用
npm install -D @types/passport-jwt @types/bcrypt
```

### 5. Docker設定

#### docker-compose.yml の作成

```yaml
version: '3.8'

services:
  # PostgreSQL Databases
  postgres-users:
    image: postgres:18
    environment:
      POSTGRES_DB: users_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres-users-data:/var/lib/postgresql/data
      - ./docker/postgres/user-service:/docker-entrypoint-initdb.d
    networks:
      - backend

  postgres-products:
    image: postgres:18
    environment:
      POSTGRES_DB: products_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - postgres-products-data:/var/lib/postgresql/data
      - ./docker/postgres/product-service:/docker-entrypoint-initdb.d
    networks:
      - backend

  postgres-orders:
    image: postgres:18
    environment:
      POSTGRES_DB: orders_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5434:5432"
    volumes:
      - postgres-orders-data:/var/lib/postgresql/data
      - ./docker/postgres/order-service:/docker-entrypoint-initdb.d
    networks:
      - backend

  # Backend Services
  api-gateway:
    build:
      context: .
      dockerfile: Dockerfile
      target: api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - USER_SERVICE_URL=http://user-service:3001
      - PRODUCT_SERVICE_URL=http://product-service:3002
      - ORDER_SERVICE_URL=http://order-service:3003
    depends_on:
      - user-service
      - product-service
      - order-service
    networks:
      - backend

  user-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: user-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_HOST=postgres-users
      - DATABASE_PORT=5432
      - DATABASE_USER=user
      - DATABASE_PASSWORD=password
      - DATABASE_NAME=users_db
    depends_on:
      - postgres-users
    networks:
      - backend

  product-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: product-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - DATABASE_HOST=postgres-products
      - DATABASE_PORT=5432
      - DATABASE_USER=user
      - DATABASE_PASSWORD=password
      - DATABASE_NAME=products_db
    depends_on:
      - postgres-products
    networks:
      - backend

  order-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: order-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - DATABASE_HOST=postgres-orders
      - DATABASE_PORT=5432
      - DATABASE_USER=user
      - DATABASE_PASSWORD=password
      - DATABASE_NAME=orders_db
    depends_on:
      - postgres-orders
    networks:
      - backend

  # Frontend Applications
  shell:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
      target: shell
    ports:
      - "4200:4200"
    networks:
      - frontend

  feature-users:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
      target: feature-users
    ports:
      - "4201:4201"
    networks:
      - frontend

  feature-products:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
      target: feature-products
    ports:
      - "4202:4202"
    networks:
      - frontend

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - shell
      - feature-users
      - feature-products
      - api-gateway
    networks:
      - frontend
      - backend

volumes:
  postgres-users-data:
  postgres-products-data:
  postgres-orders-data:

networks:
  frontend:
  backend:
```

### 6. 環境変数の設定

`.env.example` を作成：

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=user
DATABASE_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=1d

# API Gateway
API_GATEWAY_PORT=3000

# Services
USER_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
ORDER_SERVICE_PORT=3003

# Frontend
SHELL_PORT=4200
FEATURE_USERS_PORT=4201
FEATURE_PRODUCTS_PORT=4202
```

---

## 起動方法

### ローカル開発環境（Dockerなし）

#### 1. データベースの起動

```bash
# PostgreSQLのみDockerで起動
docker-compose up -d postgres-users postgres-products postgres-orders
```

#### 2. バックエンドの起動

```bash
# API Gateway
nx serve api-gateway

# User Service
nx serve user-service

# Product Service
nx serve product-service

# Order Service
nx serve order-service
```

#### 3. フロントエンドの起動

```bash
# すべてのフロントエンドアプリを並行起動
nx run-many --target=serve --projects=shell,feature-users,feature-products --parallel=3

# または個別に起動
nx serve shell          # http://localhost:4200
nx serve feature-users  # http://localhost:4201
nx serve feature-products  # http://localhost:4202
```

### Docker環境

#### 1. すべてのサービスを起動

```bash
# ビルドして起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d
```

#### 2. 特定のサービスのみ起動

```bash
# バックエンドのみ
docker-compose up -d postgres-users postgres-products postgres-orders api-gateway user-service product-service order-service

# フロントエンドのみ
docker-compose up -d shell feature-users feature-products nginx
```

#### 3. ログの確認

```bash
# すべてのログ
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f user-service
```

#### 4. 停止と削除

```bash
# 停止
docker-compose stop

# 停止して削除
docker-compose down

# ボリュームも削除
docker-compose down -v
```

### アクセスURL

- **Shell App**: http://localhost:4200
- **Feature Users**: http://localhost:4201
- **Feature Products**: http://localhost:4202
- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001
- **Product Service**: http://localhost:3002
- **Order Service**: http://localhost:3003
- **Nginx (Reverse Proxy)**: http://localhost

---

## 開発ワークフロー

### 1. 新機能の追加

#### フロントエンド

```bash
# 新しいリモートアプリの作成
nx g @nx/angular:app feature-settings --directory=apps/frontend/feature-settings --standalone --routing
nx g @nx/angular:setup-mf feature-settings --mfType=remote --host=shell --port=4203

# 新しいコンポーネントの追加
nx g @nx/angular:component settings --project=feature-settings
```

#### バックエンド

```bash
# 新しいマイクロサービスの作成
nx g @nx/nest:app notification-service --directory=apps/backend/notification-service

# 新しいリソースの追加
nx g @nx/nest:resource notifications --project=notification-service --crud
```

### 2. ビルド

```bash
# すべてをビルド
nx run-many --target=build --all

# 特定のプロジェクトをビルド
nx build shell
nx build user-service

# プロダクションビルド
nx build shell --configuration=production
```

### 3. テスト

```bash
# ユニットテスト
nx test shell
nx test user-service

# すべてのプロジェクトをテスト
nx run-many --target=test --all

# E2Eテスト
nx e2e shell-e2e
```

### 4. リント

```bash
# すべてのプロジェクトをリント
nx run-many --target=lint --all

# 特定のプロジェクトをリント
nx lint shell
```

### 5. 依存関係グラフの確認

```bash
# プロジェクト依存関係の可視化
nx graph
```

### 6. キャッシュのクリア

```bash
# Nxキャッシュのクリア
nx reset
```

---

## ベストプラクティス

### 1. フロントエンド

- **共有ライブラリの活用**: 共通のUIコンポーネントやユーティリティは libs に配置
- **型の共有**: API のインターフェースはフロントエンドとバックエンドで共有
- **遅延ロード**: リモートモジュールは遅延ロードを活用
- **エラーハンドリング**: リモートモジュールの読み込み失敗に対応

### 2. バックエンド

- **API バージョニング**: `/api/v1/users` のようにバージョンを含める
- **DTO の使用**: すべての入出力で DTO を使用
- **バリデーション**: class-validator でリクエストを検証
- **Swagger ドキュメント**: すべての API を文書化

### 3. データベース

- **マイグレーション**: TypeORM のマイグレーション機能を活用
- **インデックス**: 頻繁にクエリされるカラムにインデックスを作成
- **トランザクション**: データ整合性が重要な処理はトランザクションを使用

### 4. Docker

- **マルチステージビルド**: イメージサイズを最小化
- **ヘルスチェック**: コンテナのヘルスチェックを実装
- **環境変数**: 設定は環境変数で管理

### 5. 監視とロギング

- **構造化ログ**: JSON 形式のログを出力
- **相関ID**: リクエスト間の追跡のために相関IDを使用
- **メトリクス**: Prometheus などでメトリクスを収集

---

## トラブルシューティング

### Module Federation エラー

**問題**: リモートモジュールが読み込めない

**解決策**:
1. リモートアプリが起動しているか確認
2. `module-federation.config.ts` の URL を確認
3. CORS 設定を確認

### データベース接続エラー

**問題**: TypeORM が DB に接続できない

**解決策**:
1. PostgreSQL コンテナが起動しているか確認
2. 環境変数の設定を確認
3. ネットワーク設定を確認

### ポート競合

**問題**: ポートが既に使用されている

**解決策**:
```bash
# 使用中のポートを確認
lsof -i :4200

# プロセスを終了
kill -9 <PID>
```

---

## 参考リソース

### 公式ドキュメント

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)

### 学習リソース

- [Micro Frontends - martinfowler.com](https://martinfowler.com/articles/micro-frontends.html)
- [Microservices Patterns - microservices.io](https://microservices.io)
- [Building Microservices Book - Sam Newman](https://samnewman.io/books/building_microservices/)

---

## まとめ

このアーキテクチャは、以下のような場合に適しています：

✅ **適している場合:**
- 大規模チーム（10人以上）
- 長期的なプロジェクト
- 頻繁なリリースが必要
- 複数の機能を並行開発

❌ **適していない場合:**
- 小規模プロジェクト
- スタートアップのMVP
- 少人数チーム（5人以下）
- シンプルなアプリケーション

プロジェクトの規模と要件に応じて、モノリシックなアプローチから始めて、必要に応じてマイクロサービス/マイクロフロントエンドに移行することも検討してください。
