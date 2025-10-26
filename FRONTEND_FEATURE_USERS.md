# Feature-Users モジュール実装ガイド

## 概要

Feature-Usersは、ユーザー管理機能を提供するModule Federationマイクロフロントエンドアプリケーションです。

---

## 1. プロジェクト構成

```
apps/frontend/feature-users/src/app/
├── models/
│   └── user.model.ts              # ユーザー関連の型定義
├── services/
│   └── users.service.ts           # ユーザーAPI サービス
├── pages/
│   ├── user-list/
│   │   └── user-list.component.ts # ユーザー一覧コンポーネント
│   └── user-form/
│       └── user-form.component.ts # ユーザー作成/編集コンポーネント
└── remote-entry/
    └── entry.routes.ts            # ルーティング設定
```

---

## 2. データモデル

### User Model

```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}
```

---

## 3. サービス層

### UsersService

**ファイル:** `services/users.service.ts`

**機能:**
- ユーザー一覧取得（ページネーション対応）
- ユーザー詳細取得
- ユーザー作成
- ユーザー更新
- ユーザー削除

**メソッド:**

```typescript
export class UsersService {
  // ユーザー一覧取得
  getUsers(page: number = 1, limit: number = 10): Observable<UserListResponse>

  // ユーザー詳細取得
  getUser(id: number): Observable<User>

  // ユーザー作成
  createUser(user: CreateUserDto): Observable<User>

  // ユーザー更新
  updateUser(id: number, user: UpdateUserDto): Observable<User>

  // ユーザー削除
  deleteUser(id: number): Observable<void>
}
```

**API エンドポイント:**
- `GET /api/users?page=1&limit=10` - ユーザー一覧
- `GET /api/users/:id` - ユーザー詳細
- `POST /api/users` - ユーザー作成
- `PUT /api/users/:id` - ユーザー更新
- `DELETE /api/users/:id` - ユーザー削除

---

## 4. ページコンポーネント

### 4.1 ユーザー一覧 (UserListComponent)

**ファイル:** `pages/user-list/user-list.component.ts`

**機能:**
- ユーザー一覧の表示（テーブル形式）
- ページネーション
- ユーザー削除（確認ダイアログ付き）
- 新規作成ボタン
- 編集ボタン

**Signal 状態:**
```typescript
users = signal<User[]>([]);
loading = signal(false);
error = signal('');
pagination = signal({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});
```

**主要メソッド:**
```typescript
loadUsers(page: number = 1): void       // ユーザー読み込み
goToPage(page: number): void            // ページ移動
deleteUser(id: number): void            // ユーザー削除
formatDate(date: Date): string          // 日付フォーマット
```

**UI 特徴:**
- レスポンシブテーブル
- ホバーエフェクト
- ローディング表示
- エラーメッセージ表示
- ページネーションコントロール

**テーブルカラム:**
| カラム | 説明 |
|--------|------|
| ID | ユーザーID |
| ユーザー名 | username |
| メールアドレス | email |
| 名前 | firstName + lastName |
| 作成日 | createdAt (日本語フォーマット) |
| 操作 | 編集・削除ボタン |

### 4.2 ユーザー作成/編集フォーム (UserFormComponent)

**ファイル:** `pages/user-form/user-form.component.ts`

**機能:**
- 新規ユーザー作成フォーム
- 既存ユーザー編集フォーム
- リアルタイムバリデーション
- エラーメッセージ表示

**Signal 状態:**
```typescript
isEditMode = signal(false);
userId = signal<number | null>(null);
loading = signal(false);
saving = signal(false);
errorMessage = signal('');
```

**フォームフィールド:**
```typescript
userForm = this.fb.group({
  username: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  firstName: ['', Validators.required],
  lastName: ['', Validators.required],
  password: ['', [Validators.minLength(6)]]
});
```

**バリデーションルール:**

| フィールド | 新規作成 | 編集 |
|-----------|---------|------|
| username | 必須 | 必須 |
| email | 必須 + メール形式 | 必須 + メール形式 |
| firstName | 必須 | 必須 |
| lastName | 必須 | 必須 |
| password | 必須 + 6文字以上 | 任意 + 6文字以上 |

**パスワード処理の違い:**
- **新規作成:** パスワード必須
- **編集:** パスワード入力時のみ更新（空白の場合は既存パスワード維持）

**主要メソッド:**
```typescript
loadUser(id: number): void              // ユーザー情報読み込み（編集時）
onSubmit(): void                        // フォーム送信
```

**UI レイアウト:**
- 2カラムレスポンシブグリッド
- リアルタイムエラー表示
- 保存/キャンセルボタン
- ローディング状態表示

---

## 5. ルーティング設定

**ファイル:** `remote-entry/entry.routes.ts`

```typescript
export const remoteRoutes: Route[] = [
  {
    path: '',
    component: UserListComponent,     // /users
  },
  {
    path: 'create',
    component: UserFormComponent,     // /users/create
  },
  {
    path: ':id/edit',
    component: UserFormComponent,     // /users/123/edit
  },
];
```

**ルート一覧:**
| パス | コンポーネント | 用途 |
|------|--------------|------|
| `/users` | UserListComponent | ユーザー一覧 |
| `/users/create` | UserFormComponent | 新規作成 |
| `/users/:id/edit` | UserFormComponent | 編集 |

---

## 6. スタイリング

### 6.1 カラーパレット

```scss
// Primary
$primary: #4CAF50;
$primary-hover: #45a049;

// Secondary
$secondary: #6c757d;
$secondary-hover: #5a6268;

// Danger
$danger: #dc3545;
$danger-hover: #c82333;

// Background
$bg-white: #ffffff;
$bg-gray: #f5f5f5;
$bg-hover: #f9f9f9;

// Border
$border: #ddd;

// Text
$text-primary: #333;
$text-secondary: #666;
$text-muted: #999;

// Error
$error: #c33;
$error-bg: #fee;
$error-border: #fcc;
```

### 6.2 共通コンポーネントスタイル

**ボタン:**
```scss
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
```

**テーブル:**
```scss
.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.user-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.user-table tbody tr:hover {
  background-color: #f9f9f9;
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

## 7. 状態管理

### Signal ベースのリアクティブ状態

**ユーザー一覧:**
```typescript
// データ
users = signal<User[]>([]);

// UI 状態
loading = signal(false);
error = signal('');

// ページネーション
pagination = signal({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});
```

**フォーム:**
```typescript
// モード判定
isEditMode = signal(false);
userId = signal<number | null>(null);

// UI 状態
loading = signal(false);
saving = signal(false);
errorMessage = signal('');
```

**メリット:**
- 自動的なUIアップデート
- TypeScript型安全性
- シンプルなAPI
- パフォーマンス最適化

---

## 8. エラーハンドリング

### 8.1 API エラー

```typescript
this.usersService.getUsers(page, 10).subscribe({
  next: (response) => {
    // 成功処理
  },
  error: (err) => {
    this.error.set('ユーザーの読み込みに失敗しました');
    console.error('Error loading users:', err);
  }
});
```

### 8.2 ユーザーフィードバック

**読み込みエラー:**
```html
@if (error()) {
  <div class="alert alert-error">{{ error() }}</div>
}
```

**フォームエラー:**
```html
@if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
  <div class="error-message">
    @if (userForm.get('email')?.hasError('required')) {
      メールアドレスを入力してください
    } @else if (userForm.get('email')?.hasError('email')) {
      正しいメールアドレスを入力してください
    }
  </div>
}
```

### 8.3 削除確認

```typescript
deleteUser(id: number): void {
  if (!confirm('このユーザーを削除してもよろしいですか？')) {
    return;
  }
  // 削除処理
}
```

---

## 9. レスポンシブデザイン

### ブレークポイント

```scss
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr; // 2カラムから1カラムへ
  }
}
```

### テーブルスクロール

```scss
.table-container {
  overflow-x: auto; // 横スクロール対応
}
```

---

## 10. 実装されている機能

### ✅ 完了機能

1. **ユーザー一覧表示**
   - テーブル形式の表示
   - ページネーション（10件/ページ）
   - ローディング状態
   - エラーハンドリング

2. **ユーザー作成**
   - フォームバリデーション
   - 必須フィールドチェック
   - メールフォーマット検証
   - パスワード長検証（6文字以上）

3. **ユーザー編集**
   - 既存データの読み込み
   - フォーム事前入力
   - パスワード任意更新
   - バリデーション

4. **ユーザー削除**
   - 確認ダイアログ
   - 削除後の一覧更新
   - エラーハンドリング

5. **ナビゲーション**
   - 一覧 ⇔ 作成/編集
   - キャンセルボタン
   - 保存後の自動リダイレクト

---

## 11. テスト実行

### 開発サーバー起動

```bash
# Feature-Users アプリケーション
npx nx serve feature-users

# ポート: 4201（デフォルト）
```

### ビルド

```bash
# 開発ビルド
npx nx build feature-users

# 本番ビルド
npx nx build feature-users --configuration=production
```

### ユニットテスト

```bash
npx nx test feature-users
```

---

## 12. Module Federation 設定

### エクスポート設定

**ファイル:** `module-federation.config.ts`

```typescript
module.exports = {
  name: 'feature-users',
  exposes: {
    './Routes': './src/app/remote-entry/entry.routes.ts',
  },
};
```

### Shell からの利用

```typescript
// apps/frontend/shell/src/app/app.routes.ts
{
  path: 'users',
  loadChildren: () => import('feature-users/Routes').then(m => m.remoteRoutes)
}
```

---

## 13. API 連携例

### ユーザー一覧取得

**リクエスト:**
```
GET http://localhost:3000/api/users?page=1&limit=10
Authorization: Bearer <token>
```

**レスポンス:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "testuser",
      "firstName": "太郎",
      "lastName": "山田",
      "createdAt": "2025-10-26T00:00:00.000Z",
      "updatedAt": "2025-10-26T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### ユーザー作成

**リクエスト:**
```
POST http://localhost:3000/api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "new@example.com",
  "password": "password123",
  "firstName": "次郎",
  "lastName": "田中"
}
```

**レスポンス:**
```json
{
  "id": 2,
  "email": "new@example.com",
  "username": "newuser",
  "firstName": "次郎",
  "lastName": "田中",
  "createdAt": "2025-10-26T01:00:00.000Z",
  "updatedAt": "2025-10-26T01:00:00.000Z"
}
```

---

## 14. ベストプラクティス

### 14.1 コンポーネント設計

- ✅ Standalone Components を使用
- ✅ Signals で状態管理
- ✅ 型安全性の確保
- ✅ エラーハンドリングの徹底

### 14.2 フォーム設計

- ✅ Reactive Forms を使用
- ✅ リアルタイムバリデーション
- ✅ 明確なエラーメッセージ
- ✅ ローディング状態の表示

### 14.3 API 連携

- ✅ Observable の適切な処理
- ✅ エラーハンドリング
- ✅ ローディング状態管理
- ✅ ユーザーフィードバック

---

## 15. 今後の改善案

### 機能追加

- [ ] 検索機能（ユーザー名、メールアドレス）
- [ ] ソート機能（各カラム）
- [ ] フィルター機能（作成日範囲など）
- [ ] 一括操作（複数選択・削除）
- [ ] エクスポート機能（CSV, Excel）

### UX 改善

- [ ] トースト通知（成功・エラーメッセージ）
- [ ] 確認ダイアログコンポーネント化
- [ ] ローディングスピナーコンポーネント
- [ ] ページネーション改善（ページ番号選択）
- [ ] スケルトンローディング

### テスト

- [ ] ユニットテスト追加
- [ ] コンポーネントテスト
- [ ] サービステスト
- [ ] E2E テスト

---

## 16. トラブルシューティング

### 問題: ユーザー一覧が表示されない

**原因:**
- バックエンドサービスが起動していない
- CORS エラー
- 認証トークンが無効

**解決策:**
```bash
# バックエンドサービス起動確認
PORT=3000 node dist/apps/backend/api-gateway/main.js
PORT=3001 node dist/apps/backend/user-service/main.js

# ブラウザコンソールでエラー確認
# 必要に応じて再ログイン
```

### 問題: Module Federation エラー

**症状:** feature-users が読み込めない

**解決策:**
```bash
# feature-users を起動
npx nx serve feature-users

# shell も起動
npx nx serve shell
```

---

## 17. 参考リンク

- [Angular Signals](https://angular.dev/guide/signals)
- [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [Module Federation](https://module-federation.io/)
- [Nx Documentation](https://nx.dev/)
