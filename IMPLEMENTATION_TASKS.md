# 実装タスクリスト

**作成日**: 2025-10-25
**プロジェクト**: nx-test マイクロフロントエンド + マイクロサービス

---

## 📋 目次

1. [現状の実装状況](#現状の実装状況)
2. [マイクロフロントエンドの役割定義](#マイクロフロントエンドの役割定義)
3. [マイクロサービスの役割定義](#マイクロサービスの役割定義)
4. [設計との差分](#設計との差分)
5. [実装タスク](#実装タスク)

---

## 🔍 現状の実装状況

### ✅ 完了済み

**インフラ:**
- ✅ Docker 環境構築
- ✅ Docker Compose 設定
- ✅ PostgreSQL データベース (3つ)
- ✅ ネットワーク分離 (frontend/backend)

**マイクロフロントエンド:**
- ✅ shell (ホストアプリ) - ポート 4200
- ✅ feature-users (リモートアプリ) - ポート 4201
- ✅ feature-products (リモートアプリ) - ポート 4202

**マイクロサービス:**
- ✅ api-gateway - ポート 3000
- ✅ user-service - ポート 3001
- ✅ product-service - ポート 3002

**データベース:**
- ✅ postgres-users (port 5432) - users テーブル
- ✅ postgres-products (port 5433) - products テーブル
- ✅ postgres-orders (port 5434) - orders, order_items テーブル

### ⚠️ 未完了

**マイクロサービス:**
- ❌ order-service (設計では port 3003)

**共有ライブラリ:**
- ❌ Frontend 共有ライブラリ (ui, data-access, utils)
- ❌ Backend 共有ライブラリ (dto, interfaces, guards)
- ❌ ドメインライブラリ (user, product)

**機能実装:**
- ❌ 実際の CRUD 操作
- ❌ 認証・認可機能
- ❌ API Gateway のプロキシ機能
- ❌ Module Federation の統合

---

## 🎨 マイクロフロントエンドの役割定義

### 1. Shell (ホストアプリケーション)

**ポート**: 4200
**役割**: メインアプリケーションのエントリーポイント

**責務:**
- 📱 アプリケーション全体のレイアウト (ヘッダー、サイドバー、フッター)
- 🔐 認証・認可の管理
- 🧭 ルーティングの統合管理
- 🔌 リモートアプリケーションの動的ロード
- 🎨 グローバルな UI テーマの提供
- 📊 アプリケーション全体の状態管理 (ユーザー情報など)

**主要コンポーネント:**
```
shell/
├── src/
│   ├── app/
│   │   ├── layout/
│   │   │   ├── header/          # ヘッダーコンポーネント
│   │   │   ├── sidebar/         # サイドバーナビゲーション
│   │   │   └── footer/          # フッター
│   │   ├── auth/
│   │   │   ├── login/           # ログインページ
│   │   │   └── guards/          # 認証ガード
│   │   ├── dashboard/           # ダッシュボード
│   │   └── app.routes.ts        # ルーティング設定
│   └── main.ts
└── module-federation.config.ts  # MF設定
```

**実装する機能:**
1. ユーザー認証フロー (ログイン/ログアウト)
2. ナビゲーションメニュー
3. ダッシュボード画面
4. リモートアプリへのルーティング
5. グローバルエラーハンドリング

---

### 2. Feature-Users (ユーザー管理)

**ポート**: 4201
**役割**: ユーザー管理機能を提供するリモートアプリケーション

**責務:**
- 👥 ユーザー一覧の表示
- ➕ 新規ユーザーの登録
- ✏️ ユーザー情報の編集
- 🗑️ ユーザーの削除
- 🔍 ユーザー検索・フィルタリング
- 👤 ユーザー詳細情報の表示

**主要コンポーネント:**
```
feature-users/
├── src/
│   ├── app/
│   │   ├── remote-entry/        # Module Federation エントリー
│   │   ├── users/
│   │   │   ├── user-list/       # ユーザー一覧
│   │   │   ├── user-form/       # ユーザー作成/編集
│   │   │   ├── user-detail/     # ユーザー詳細
│   │   │   └── users.routes.ts  # ルーティング
│   │   ├── services/
│   │   │   └── users.service.ts # API通信サービス
│   │   └── models/
│   │       └── user.model.ts    # ユーザーモデル
│   └── main.ts
└── module-federation.config.ts
```

**実装する機能:**
1. ユーザー一覧表示 (ページネーション付き)
2. ユーザー検索 (名前、メールアドレス)
3. ユーザー作成フォーム
4. ユーザー編集フォーム
5. ユーザー削除 (確認ダイアログ付き)
6. ユーザー詳細表示

**API エンドポイント:**
- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/:id` - ユーザー詳細取得
- `POST /api/users` - ユーザー作成
- `PUT /api/users/:id` - ユーザー更新
- `DELETE /api/users/:id` - ユーザー削除

---

### 3. Feature-Products (商品管理)

**ポート**: 4202
**役割**: 商品管理機能を提供するリモートアプリケーション

**責務:**
- 📦 商品一覧の表示
- ➕ 新規商品の登録
- ✏️ 商品情報の編集
- 🗑️ 商品の削除
- 🔍 商品検索・フィルタリング
- 📊 商品詳細情報の表示
- 🏷️ カテゴリ管理
- 💰 価格・在庫管理

**主要コンポーネント:**
```
feature-products/
├── src/
│   ├── app/
│   │   ├── remote-entry/           # Module Federation エントリー
│   │   ├── products/
│   │   │   ├── product-list/       # 商品一覧
│   │   │   ├── product-card/       # 商品カード
│   │   │   ├── product-form/       # 商品作成/編集
│   │   │   ├── product-detail/     # 商品詳細
│   │   │   └── products.routes.ts  # ルーティング
│   │   ├── categories/
│   │   │   └── category-filter/    # カテゴリフィルター
│   │   ├── services/
│   │   │   └── products.service.ts # API通信サービス
│   │   └── models/
│   │       └── product.model.ts    # 商品モデル
│   └── main.ts
└── module-federation.config.ts
```

**実装する機能:**
1. 商品一覧表示 (グリッド/リスト表示)
2. 商品検索 (名前、カテゴリ、価格範囲)
3. カテゴリフィルター
4. 商品作成フォーム
5. 商品編集フォーム
6. 商品削除 (在庫確認付き)
7. 商品詳細表示 (画像、説明、在庫状況)

**API エンドポイント:**
- `GET /api/products` - 商品一覧取得
- `GET /api/products/:id` - 商品詳細取得
- `POST /api/products` - 商品作成
- `PUT /api/products/:id` - 商品更新
- `DELETE /api/products/:id` - 商品削除
- `GET /api/products/categories` - カテゴリ一覧取得

---

## 🔧 マイクロサービスの役割定義

### 1. API Gateway

**ポート**: 3000
**役割**: すべての API リクエストの単一エントリーポイント

**責務:**
- 🚪 リクエストのルーティング
- 🔐 認証・認可 (JWT トークン検証)
- 🛡️ レート制限
- 📊 ログ集約
- 🔄 リクエスト/レスポンスの変換
- ⚡ キャッシング
- 📝 API ドキュメント (Swagger)

**実装する機能:**
```typescript
// ルーティング例
GET  /api/users/*       → user-service:3001
GET  /api/products/*    → product-service:3002
GET  /api/orders/*      → order-service:3003
POST /api/auth/login    → user-service:3001/auth/login
POST /api/auth/register → user-service:3001/auth/register
```

**主要モジュール:**
```
api-gateway/
├── src/
│   ├── auth/
│   │   ├── jwt.strategy.ts      # JWT戦略
│   │   └── jwt-auth.guard.ts    # 認証ガード
│   ├── proxy/
│   │   ├── users-proxy.controller.ts
│   │   ├── products-proxy.controller.ts
│   │   └── orders-proxy.controller.ts
│   ├── rate-limit/
│   │   └── rate-limit.guard.ts
│   └── main.ts
```

**実装タスク:**
1. JWT 認証ミドルウェア
2. サービスへのプロキシ機能
3. レート制限機能
4. CORS 設定
5. Swagger API ドキュメント
6. ロギング・モニタリング

---

### 2. User Service

**ポート**: 3001
**データベース**: postgres-users (port 5432)
**役割**: ユーザー管理とユーザー認証

**責務:**
- 👤 ユーザー CRUD 操作
- 🔐 ユーザー認証 (ログイン)
- 📝 ユーザー登録
- 🔑 パスワード管理 (ハッシュ化)
- 🎫 JWT トークン発行
- 👥 ユーザープロファイル管理

**データモデル:**
```typescript
// User Entity
{
  id: number;              // 主キー
  email: string;           // メールアドレス (ユニーク)
  username: string;        // ユーザー名 (ユニーク)
  password_hash: string;   // パスワードハッシュ
  first_name: string;      // 名
  last_name: string;       // 姓
  created_at: Date;        // 作成日時
  updated_at: Date;        // 更新日時
}
```

**API エンドポイント:**
```
POST   /api/auth/login              # ログイン
POST   /api/auth/register           # ユーザー登録
GET    /api/users                   # ユーザー一覧
GET    /api/users/:id               # ユーザー詳細
POST   /api/users                   # ユーザー作成
PUT    /api/users/:id               # ユーザー更新
DELETE /api/users/:id               # ユーザー削除
GET    /api/users/profile           # 自分のプロファイル
PUT    /api/users/profile           # プロファイル更新
PUT    /api/users/password          # パスワード変更
```

**実装タスク:**
1. TypeORM エンティティ定義
2. CRUD コントローラー/サービス
3. 認証エンドポイント (login, register)
4. パスワードハッシュ化 (bcrypt)
5. JWT トークン発行
6. バリデーション (class-validator)
7. ページネーション機能

---

### 3. Product Service

**ポート**: 3002
**データベース**: postgres-products (port 5433)
**役割**: 商品管理とカテゴリ管理

**責務:**
- 📦 商品 CRUD 操作
- 🏷️ カテゴリ管理
- 💰 価格管理
- 📊 在庫管理
- 🔍 商品検索・フィルタリング

**データモデル:**
```typescript
// Product Entity
{
  id: number;              // 主キー
  name: string;            // 商品名
  description: string;     // 商品説明
  price: number;           // 価格 (decimal)
  stock_quantity: number;  // 在庫数
  category: string;        // カテゴリ
  created_at: Date;        // 作成日時
  updated_at: Date;        // 更新日時
}
```

**API エンドポイント:**
```
GET    /api/products                 # 商品一覧
GET    /api/products/:id             # 商品詳細
POST   /api/products                 # 商品作成
PUT    /api/products/:id             # 商品更新
DELETE /api/products/:id             # 商品削除
GET    /api/products/search?q=...    # 商品検索
GET    /api/products/category/:cat   # カテゴリ別商品
GET    /api/products/categories      # カテゴリ一覧
PUT    /api/products/:id/stock       # 在庫更新
```

**実装タスク:**
1. TypeORM エンティティ定義
2. CRUD コントローラー/サービス
3. 検索機能 (名前、カテゴリ、価格範囲)
4. カテゴリ管理
5. 在庫管理ロジック
6. バリデーション
7. ページネーション機能

---

### 4. Order Service (未実装)

**ポート**: 3003 (予定)
**データベース**: postgres-orders (port 5434)
**役割**: 注文管理と注文処理

**責務:**
- 🛒 注文 CRUD 操作
- 📝 注文明細管理
- 💳 注文ステータス管理
- 📊 注文履歴管理
- 🔄 在庫連携 (Product Service)

**データモデル:**
```typescript
// Order Entity
{
  id: number;              // 主キー
  user_id: number;         // ユーザーID (FK)
  total_amount: number;    // 合計金額 (decimal)
  status: string;          // ステータス (pending/confirmed/shipped/delivered)
  created_at: Date;        // 注文日時
  updated_at: Date;        // 更新日時
}

// OrderItem Entity
{
  id: number;              // 主キー
  order_id: number;        // 注文ID (FK)
  product_id: number;      // 商品ID (FK)
  quantity: number;        // 数量
  price: number;           // 単価
}
```

**API エンドポイント:**
```
GET    /api/orders                   # 注文一覧
GET    /api/orders/:id               # 注文詳細
POST   /api/orders                   # 注文作成
PUT    /api/orders/:id               # 注文更新
DELETE /api/orders/:id               # 注文削除
GET    /api/orders/user/:userId      # ユーザー別注文履歴
PUT    /api/orders/:id/status        # ステータス更新
```

---

## 📊 設計との差分

### ✅ 設計通りの部分

1. **アーキテクチャ構成**: マイクロフロントエンド + マイクロサービス
2. **ポート番号**: 設計通り (shell:4200, users:4201, products:4202, gateway:3000, user-svc:3001, product-svc:3002)
3. **データベース分離**: Database per Service パターン
4. **Docker 環境**: docker-compose による統合環境

### ❌ 設計と異なる部分

1. **Order Service**: 未実装
2. **Module Federation**: 一時的に無効化 (動作優先)
3. **共有ライブラリ**: 未作成
4. **実際の機能**: CRUD 操作が未実装
5. **認証機能**: JWT 認証が未実装
6. **Nginx リバースプロキシ**: 未設定

---

## ✅ 実装タスク

### Phase 1: 基本機能の実装 (優先度: 高)

#### Backend タスク

- [ ] **1.1 User Service - CRUD 実装**
  - [ ] ユーザーエンティティの完全実装
  - [ ] CRUD コントローラー・サービス
  - [ ] バリデーション (DTO)
  - [ ] ページネーション
  - [ ] 動作確認 (Postman/cURL)

- [ ] **1.2 User Service - 認証機能**
  - [ ] bcrypt によるパスワードハッシュ化
  - [ ] ログインエンドポイント
  - [ ] ユーザー登録エンドポイント
  - [ ] JWT トークン発行
  - [ ] 動作確認

- [ ] **1.3 Product Service - CRUD 実装**
  - [ ] 商品エンティティの完全実装
  - [ ] CRUD コントローラー・サービス
  - [ ] バリデーション (DTO)
  - [ ] ページネーション
  - [ ] カテゴリ機能
  - [ ] 動作確認

- [ ] **1.4 API Gateway - プロキシ機能**
  - [ ] User Service へのプロキシ
  - [ ] Product Service へのプロキシ
  - [ ] JWT 認証ミドルウェア
  - [ ] CORS 設定
  - [ ] 動作確認

#### Frontend タスク

- [ ] **1.5 Feature-Users - ユーザー一覧**
  - [ ] ユーザー一覧コンポーネント
  - [ ] API サービス (HttpClient)
  - [ ] テーブル表示
  - [ ] ページネーション
  - [ ] 動作確認

- [ ] **1.6 Feature-Users - ユーザー作成/編集**
  - [ ] ユーザーフォームコンポーネント
  - [ ] バリデーション (Reactive Forms)
  - [ ] API 連携 (POST/PUT)
  - [ ] 動作確認

- [ ] **1.7 Feature-Products - 商品一覧**
  - [ ] 商品一覧コンポーネント
  - [ ] API サービス
  - [ ] カード/グリッド表示
  - [ ] カテゴリフィルター
  - [ ] 動作確認

- [ ] **1.8 Feature-Products - 商品作成/編集**
  - [ ] 商品フォームコンポーネント
  - [ ] バリデーション
  - [ ] API 連携
  - [ ] 動作確認

- [ ] **1.9 Shell - 認証機能**
  - [ ] ログインページ
  - [ ] ログインフォーム
  - [ ] JWT トークン保存 (LocalStorage)
  - [ ] 認証ガード
  - [ ] 動作確認

- [ ] **1.10 Shell - ナビゲーション**
  - [ ] ヘッダーコンポーネント
  - [ ] サイドバーナビゲーション
  - [ ] ルーティング設定
  - [ ] リモートアプリへのリンク
  - [ ] 動作確認

---

### Phase 2: 共有ライブラリの作成 (優先度: 中)

#### Frontend 共有ライブラリ

- [ ] **2.1 UI ライブラリ**
  - [ ] ボタンコンポーネント
  - [ ] カードコンポーネント
  - [ ] テーブルコンポーネント
  - [ ] フォームコンポーネント
  - [ ] 共通スタイル

- [ ] **2.2 Data Access ライブラリ**
  - [ ] HTTP インターセプター (JWT 付与)
  - [ ] エラーハンドリング
  - [ ] ローディング状態管理

- [ ] **2.3 Utils ライブラリ**
  - [ ] バリデーターヘルパー
  - [ ] 日付フォーマット
  - [ ] 数値フォーマット

#### Backend 共有ライブラリ

- [ ] **2.4 DTO ライブラリ**
  - [ ] PaginationDto
  - [ ] ResponseDto
  - [ ] 共通バリデーション

- [ ] **2.5 Guards ライブラリ**
  - [ ] JwtAuthGuard
  - [ ] RolesGuard

---

### Phase 3: 高度な機能 (優先度: 低)

- [ ] **3.1 Order Service の作成**
  - [ ] サービス生成
  - [ ] エンティティ定義
  - [ ] CRUD 実装
  - [ ] User/Product Service 連携

- [ ] **3.2 Module Federation の再統合**
  - [ ] webpack 設定の修正
  - [ ] feature-users を remote として設定
  - [ ] feature-products を remote として設定
  - [ ] shell からの動的ロード

- [ ] **3.3 Swagger API ドキュメント**
  - [ ] 各サービスに Swagger 導入
  - [ ] API エンドポイントの文書化
  - [ ] DTO のドキュメント化

- [ ] **3.4 E2E テスト**
  - [ ] Cypress セットアップ
  - [ ] ユーザー管理のテスト
  - [ ] 商品管理のテスト
  - [ ] 認証フローのテスト

- [ ] **3.5 Nginx リバースプロキシ**
  - [ ] nginx 設定
  - [ ] SSL/TLS 対応
  - [ ] ロードバランシング

---

## 🎯 推奨実装順序

### Week 1: Backend 基礎
1. User Service CRUD (1.1)
2. Product Service CRUD (1.3)
3. API Gateway プロキシ (1.4)

### Week 2: 認証とFrontend基礎
4. User Service 認証 (1.2)
5. Shell 認証機能 (1.9)
6. Feature-Users 一覧 (1.5)

### Week 3: Frontend 機能拡充
7. Feature-Users 作成/編集 (1.6)
8. Feature-Products 一覧 (1.7)
9. Feature-Products 作成/編集 (1.8)
10. Shell ナビゲーション (1.10)

### Week 4: 共有ライブラリとリファクタリング
11. Frontend UI ライブラリ (2.1)
12. Backend DTO ライブラリ (2.4)
13. コードリファクタリング

---

## 📈 成功指標

- [ ] すべてのマイクロサービスが独立して動作
- [ ] すべてのマイクロフロントエンドが独立して動作
- [ ] API Gateway 経由ですべての API にアクセス可能
- [ ] JWT 認証が正常に動作
- [ ] ユーザー/商品の CRUD 操作が完全に動作
- [ ] Docker Compose で一括起動可能
- [ ] 基本的な E2E フローが動作

---

**作成者**: Claude Code
**最終更新**: 2025-10-25
