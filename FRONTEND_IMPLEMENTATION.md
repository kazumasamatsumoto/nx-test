# フロントエンド実装ガイド

## 2025-10-26: Angular Shell アプリケーション実装

### 概要

このドキュメントでは、Nx Monorepo内のAngularフロントエンドアプリケーションの実装内容を説明します。

- **Shell**: メインアプリケーション（認証、ナビゲーション）
- **Feature-Users**: ユーザー管理機能（Module Federation）
- **Feature-Products**: 商品管理機能（Module Federation）

---

## 1. Shell アプリケーション

### 1.1 プロジェクト構成

```
apps/frontend/shell/src/app/
├── core/
│   ├── models/
│   │   └── user.model.ts           # ユーザー関連の型定義
│   ├── services/
│   │   └── auth.service.ts         # 認証サービス
│   ├── interceptors/
│   │   └── auth.interceptor.ts     # JWT トークンインターセプター
│   └── guards/
│       └── auth.guard.ts            # 認証ガード
├── features/
│   └── auth/
│       └── login/
│           └── login.component.ts   # ログインコンポーネント
├── shared/
│   ├── components/
│   │   └── header/
│   │       └── header.component.ts  # ヘッダーコンポーネント
│   └── layouts/
│       └── main-layout/
│           └── main-layout.component.ts  # メインレイアウト
├── app.routes.ts                    # ルーティング設定
└── app.config.ts                    # アプリケーション設定
```

---

### 1.2 コア機能

#### 1.2.1 認証サービス (`auth.service.ts`)

**機能:**
- ログイン/ログアウト処理
- JWT トークン管理
- ユーザー状態管理（Signal ベース）

**主要メソッド:**
```typescript
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  login(credentials: LoginRequest): Observable<AuthResponse>
  logout(): void
  getToken(): string | null
}
```

**特徴:**
- Angular 19の Signals を使用した状態管理
- LocalStorage によるトークン永続化
- 起動時の自動認証復元

**API エンドポイント:**
- POST `/api/auth/login` - ログイン
- POST `/api/auth/register` - ユーザー登録

#### 1.2.2 認証インターセプター (`auth.interceptor.ts`)

**機能:**
- 全HTTPリクエストに JWT トークンを自動付与

**実装:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
```

**特徴:**
- Functional Interceptor（Angular 15+の新しいスタイル）
- inject() を使用したサービス注入

#### 1.2.3 認証ガード (`auth.guard.ts`)

**提供するガード:**

1. **authGuard** - 認証済みユーザーのみアクセス可能
   ```typescript
   export const authGuard: CanActivateFn = () => {
     const authService = inject(AuthService);
     const router = inject(Router);

     if (authService.isAuthenticated()) {
       return true;
     }

     router.navigate(['/login']);
     return false;
   };
   ```

2. **guestGuard** - 未認証ユーザーのみアクセス可能（ログインページ用）
   ```typescript
   export const guestGuard: CanActivateFn = () => {
     const authService = inject(AuthService);
     const router = inject(Router);

     if (!authService.isAuthenticated()) {
       return true;
     }

     router.navigate(['/']);
     return false;
   };
   ```

**特徴:**
- Functional Guard（Angular 15+の新しいスタイル）
- 認証状態に応じた自動リダイレクト

---

### 1.3 UI コンポーネント

#### 1.3.1 ログインコンポーネント (`login.component.ts`)

**機能:**
- ユーザー名/パスワードによるログインフォーム
- フォームバリデーション
- エラーメッセージ表示
- ローディング状態管理

**フォーム構成:**
```typescript
loginForm = this.fb.group({
  username: ['', Validators.required],
  password: ['', Validators.required]
});
```

**UI 特徴:**
- レスポンシブデザイン
- リアルタイムバリデーション表示
- ローディング中のボタン無効化
- 登録ページへのリンク

**スタイル:**
- 中央配置のカード型レイアウト
- グリーンをメインカラーとしたデザイン
- エラーメッセージの視覚的フィードバック

#### 1.3.2 ヘッダーコンポーネント (`header.component.ts`)

**機能:**
- アプリケーションロゴ
- ナビゲーションメニュー（認証後のみ表示）
- ユーザー名表示
- ログアウトボタン

**ナビゲーション項目:**
- ユーザー管理 (`/users`)
- 商品管理 (`/products`)

**UI 特徴:**
- ダークグレーの背景色
- アクティブルートのハイライト表示
- ホバーエフェクト

#### 1.3.3 メインレイアウトコンポーネント (`main-layout.component.ts`)

**機能:**
- ヘッダーとメインコンテンツエリアの配置
- 子ルートのレンダリング

**レイアウト構造:**
```
┌─────────────────────────────┐
│  Header                     │
├─────────────────────────────┤
│                             │
│  Main Content               │
│  (router-outlet)            │
│                             │
└─────────────────────────────┘
```

---

### 1.4 ルーティング設定

#### ルート構成 (`app.routes.ts`)

```typescript
export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]  // 未認証のみアクセス可
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],   // 認証必須
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadChildren: () => import('feature-users/Routes').then(m => m.remoteRoutes)
      },
      {
        path: 'products',
        loadChildren: () => import('feature-products/Routes').then(m => m.remoteRoutes)
      }
    ]
  }
];
```

**特徴:**
- 遅延ローディング（Module Federation）
- ガードによるアクセス制御
- デフォルトルートの設定

---

### 1.5 アプリケーション設定

#### App Config (`app.config.ts`)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ],
};
```

**提供する機能:**
- グローバルエラーリスナー
- Zone.js の最適化
- ルーター設定
- HTTP クライアント + 認証インターセプター

---

## 2. データモデル

### User Model (`user.model.ts`)

```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
```

---

## 3. セキュリティ実装

### 3.1 JWT トークン管理

**保存場所:** LocalStorage

**キー:**
- `auth_token` - JWT トークン
- `current_user` - ユーザー情報（JSON）

**セキュリティ考慮事項:**
- トークンは全HTTPリクエストに自動付与
- ログアウト時に LocalStorage をクリア
- 不正なトークンの場合は認証状態をクリア

### 3.2 ルートガード

**認証フロー:**

1. ユーザーが保護されたルートにアクセス
2. `authGuard` が認証状態をチェック
3. 未認証の場合 → `/login` にリダイレクト
4. 認証済みの場合 → アクセス許可

**ゲストフロー:**

1. 認証済みユーザーが `/login` にアクセス
2. `guestGuard` が認証状態をチェック
3. 認証済みの場合 → `/` にリダイレクト
4. 未認証の場合 → アクセス許可

---

## 4. 状態管理

### Signal ベースの状態管理

**使用している Signal:**

```typescript
// AuthService 内
currentUser = signal<User | null>(null);
isAuthenticated = signal<boolean>(false);

// LoginComponent 内
loading = signal(false);
errorMessage = signal('');
```

**メリット:**
- リアクティブな更新
- 型安全性
- 軽量（RxJSよりシンプル）
- Change Detection の最適化

---

## 5. API 連携

### エンドポイント設定

**ベース URL:** `http://localhost:3000/api`

### 認証 API

| メソッド | エンドポイント | 説明 | リクエストボディ | レスポンス |
|---------|---------------|------|----------------|----------|
| POST | `/auth/login` | ログイン | `LoginRequest` | `AuthResponse` |
| POST | `/auth/register` | ユーザー登録 | `RegisterRequest` | `AuthResponse` |

**リクエスト例 (Login):**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**レスポンス例:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

---

## 6. スタイルガイド

### 6.1 カラーパレット

```scss
// Primary Colors
$primary-color: #4CAF50;      // グリーン
$primary-dark: #45a049;
$primary-light: #66BB6A;

// Background
$bg-primary: #ffffff;
$bg-secondary: #f5f5f5;
$bg-dark: #2c3e50;

// Text
$text-primary: #333;
$text-secondary: #666;
$text-light: #999;

// Status Colors
$error-color: #c33;
$error-bg: #fee;
$error-border: #fcc;
```

### 6.2 コンポーネントスタイル

**ボタン:**
```scss
.btn {
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

**フォーム:**
```scss
.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-control.error {
  border-color: #c33;
}
```

---

## 7. 今後の実装予定

### 7.1 Feature-Users モジュール

**実装内容:**
- [ ] ユーザー一覧表示（ページネーション）
- [ ] ユーザー検索機能
- [ ] ユーザー作成フォーム
- [ ] ユーザー編集フォーム
- [ ] ユーザー削除機能

**API エンドポイント:**
- GET `/api/users?page=1&limit=10` - ユーザー一覧
- GET `/api/users/:id` - ユーザー詳細
- POST `/api/users` - ユーザー作成
- PUT `/api/users/:id` - ユーザー更新
- DELETE `/api/users/:id` - ユーザー削除

### 7.2 Feature-Products モジュール

**実装内容:**
- [ ] 商品一覧表示（ページネーション）
- [ ] 商品検索機能
- [ ] 商品作成フォーム
- [ ] 商品編集フォーム
- [ ] 商品削除機能

**API エンドポイント:**
- GET `/api/products?page=1&limit=10` - 商品一覧
- GET `/api/products/:id` - 商品詳細
- POST `/api/products` - 商品作成
- PUT `/api/products/:id` - 商品更新
- DELETE `/api/products/:id` - 商品削除

### 7.3 追加機能

**Shell:**
- [ ] 登録（Register）コンポーネント
- [ ] パスワード変更機能
- [ ] プロフィール編集機能
- [ ] ダークモード対応
- [ ] 多言語対応（i18n）

**共通:**
- [ ] エラーハンドリングの強化
- [ ] ローディングスピナーコンポーネント
- [ ] 確認ダイアログコンポーネント
- [ ] トースト通知機能
- [ ] ユニットテスト

---

## 8. 開発・実行コマンド

### 開発サーバー起動

```bash
# Shell アプリケーション
npx nx serve shell

# Feature-Users（Module Federation）
npx nx serve feature-users

# Feature-Products（Module Federation）
npx nx serve feature-products
```

### ビルド

```bash
# Shell アプリケーション
npx nx build shell

# 本番ビルド
npx nx build shell --configuration=production
```

### テスト

```bash
# ユニットテスト
npx nx test shell

# カバレッジ付き
npx nx test shell --coverage
```

### リント

```bash
npx nx lint shell
```

---

## 9. トラブルシューティング

### 9.1 ログインできない

**確認事項:**
1. バックエンドサービスが起動しているか
   ```bash
   # API Gateway
   PORT=3000 node dist/apps/backend/api-gateway/main.js

   # User Service
   PORT=3001 node dist/apps/backend/user-service/main.js
   ```

2. CORS 設定が正しいか
3. API エンドポイントが正しいか（`http://localhost:3000/api`）

### 9.2 Module Federation エラー

**症状:** `feature-users` または `feature-products` が読み込めない

**解決策:**
1. 両方のアプリケーションを起動する
   ```bash
   npx nx serve feature-users
   npx nx serve feature-products
   ```

2. `module-federation.config.ts` を確認

### 9.3 認証トークンが無効

**症状:** 401 Unauthorized エラー

**解決策:**
1. LocalStorage をクリア
   ```javascript
   localStorage.clear()
   ```

2. 再ログイン

---

## 10. ベストプラクティス

### 10.1 コンポーネント設計

- **Standalone Components** を使用
- **Signals** で状態管理
- **Functional Guards/Interceptors** を優先
- **OnPush Change Detection** で最適化

### 10.2 フォルダ構成

```
app/
├── core/          # シングルトンサービス、ガード、インターセプター
├── features/      # 機能モジュール
├── shared/        # 共有コンポーネント、ユーティリティ
└── app.*.ts       # アプリケーション設定ファイル
```

### 10.3 命名規則

- **コンポーネント:** `*.component.ts`
- **サービス:** `*.service.ts`
- **ガード:** `*.guard.ts`
- **インターセプター:** `*.interceptor.ts`
- **モデル:** `*.model.ts`

---

## 11. 参考リンク

- [Angular Documentation](https://angular.dev/)
- [Nx Documentation](https://nx.dev/)
- [Angular Signals](https://angular.dev/guide/signals)
- [Module Federation](https://module-federation.io/)
- [Angular Standalone Components](https://angular.dev/guide/components/importing)
