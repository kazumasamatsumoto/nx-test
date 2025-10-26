# 共有ライブラリ実装ドキュメント

## 概要

Nx Monorepo の共有ライブラリとして、DTOライブラリとUIコンポーネントライブラリを実装しました。これらはフロントエンド・バックエンド間でコードを共有し、一貫性を保つために使用されます。

## 1. DTOライブラリ (@nx-test/shared/dto)

### 目的

- フロントエンドとバックエンド間でデータ型を共有
- 型安全性の向上
- APIインターフェースの一元管理

### プロジェクト構成

```
libs/shared/dto/
├── src/
│   ├── index.ts                        # メインエクスポート
│   └── lib/
│       ├── user/
│       │   ├── user.dto.ts            # ユーザー関連DTO
│       │   └── index.ts
│       ├── product/
│       │   ├── product.dto.ts         # 商品関連DTO
│       │   └── index.ts
│       ├── auth/
│       │   ├── auth.dto.ts            # 認証関連DTO
│       │   └── index.ts
│       └── common/
│           ├── pagination.dto.ts      # 共通DTO
│           └── index.ts
├── project.json
├── tsconfig.json
└── README.md
```

### DTO定義

#### User DTOs

**user.dto.ts**

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

#### Product DTOs

**product.dto.ts**

```typescript
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}
```

#### Auth DTOs

**auth.dto.ts**

```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}
```

#### Common DTOs

**pagination.dto.ts**

```typescript
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
```

### 使用方法

#### インストール

DTOライブラリは `tsconfig.base.json` に以下のパスマッピングが追加されています：

```json
{
  "paths": {
    "@nx-test/shared/dto": ["libs/shared/dto/src/index.ts"]
  }
}
```

#### インポート例

```typescript
// フロントエンド (Angular)
import { User, CreateUserDto, UpdateUserDto } from '@nx-test/shared/dto';

// バックエンド (NestJS)
import { Product, CreateProductDto } from '@nx-test/shared/dto';

// 共通DTOの使用
import { PaginatedResponse, PaginationParams } from '@nx-test/shared/dto';
```

## 2. UIコンポーネントライブラリ (@nx-test/shared/ui-components)

### 目的

- フロントエンドアプリケーション間でUIコンポーネントを共有
- 一貫したデザインシステムの提供
- 開発効率の向上

### プロジェクト構成

```
libs/shared/ui-components/
├── src/
│   ├── index.ts                        # メインエクスポート
│   └── lib/
│       ├── button/
│       │   └── button.component.ts    # ボタンコンポーネント
│       ├── card/
│       │   └── card.component.ts      # カードコンポーネント
│       ├── loading/
│       │   └── loading.component.ts   # ローディングコンポーネント
│       └── table/
│           └── table.component.ts     # テーブルコンポーネント
├── project.json
├── tsconfig.json
└── README.md
```

### コンポーネント

#### 1. ButtonComponent

**特徴**:
- 4つのバリアント: primary, secondary, danger, success
- 3つのサイズ: sm, md, lg
- ローディング状態のサポート
- disabled状態のサポート

**使用例**:

```typescript
import { ButtonComponent } from '@nx-test/shared/ui-components';

@Component({
  imports: [ButtonComponent],
  template: `
    <ui-button
      variant="primary"
      size="md"
      [loading]="isLoading"
      (clicked)="handleClick()"
    >
      保存
    </ui-button>
  `
})
```

**プロパティ**:
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' (デフォルト: 'primary')
- `size`: 'sm' | 'md' | 'lg' (デフォルト: 'md')
- `type`: 'button' | 'submit' | 'reset' (デフォルト: 'button')
- `disabled`: boolean (デフォルト: false)
- `loading`: boolean (デフォルト: false)

**イベント**:
- `clicked`: MouseEvent

#### 2. CardComponent

**特徴**:
- タイトル・サブタイトルのサポート
- ヘッダー・ボディ・フッターの構造
- コンテンツプロジェクション

**使用例**:

```typescript
import { CardComponent } from '@nx-test/shared/ui-components';

@Component({
  imports: [CardComponent],
  template: `
    <ui-card
      title="ユーザー情報"
      subtitle="詳細情報を確認"
      [hasFooter]="true"
    >
      <!-- カードの内容 -->
      <p>カード本文</p>

      <!-- フッター -->
      <div footer>
        <button>閉じる</button>
      </div>
    </ui-card>
  `
})
```

**プロパティ**:
- `title`: string (デフォルト: '')
- `subtitle`: string (デフォルト: '')
- `hasFooter`: boolean (デフォルト: false)

#### 3. LoadingComponent

**特徴**:
- 3つのサイズ: sm, md, lg
- メッセージ表示のサポート
- アニメーション付きスピナー

**使用例**:

```typescript
import { LoadingComponent } from '@nx-test/shared/ui-components';

@Component({
  imports: [LoadingComponent],
  template: `
    <ui-loading
      size="md"
      message="読み込み中..."
    />
  `
})
```

**プロパティ**:
- `size`: 'sm' | 'md' | 'lg' (デフォルト: 'md')
- `message`: string (デフォルト: '')

#### 4. TableComponent

**特徴**:
- カラム設定（ソート可能）
- アクション列のサポート
- 空データメッセージ
- ジェネリック型対応

**使用例**:

```typescript
import { TableComponent, TableColumn, TableAction } from '@nx-test/shared/ui-components';

@Component({
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns"
      [data]="users"
      [actions]="actions"
      [sortKey]="sortKey"
      [sortDirection]="sortDirection"
      (sorted)="handleSort($event)"
      emptyMessage="ユーザーが見つかりませんでした"
    />
  `
})
export class MyComponent {
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'username', label: 'ユーザー名', sortable: true },
    { key: 'email', label: 'メール', sortable: false }
  ];

  actions: TableAction<User>[] = [
    {
      label: '編集',
      variant: 'secondary',
      handler: (user) => this.editUser(user)
    },
    {
      label: '削除',
      variant: 'danger',
      handler: (user) => this.deleteUser(user)
    }
  ];

  sortKey = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  handleSort(event: { key: string; direction: 'asc' | 'desc' }) {
    this.sortKey = event.key;
    this.sortDirection = event.direction;
    // ソート処理
  }
}
```

**プロパティ**:
- `columns`: TableColumn[] (必須)
- `data`: T[] (必須)
- `actions`: TableAction<T>[]
- `emptyMessage`: string (デフォルト: 'データが見つかりませんでした')
- `sortKey`: string (デフォルト: '')
- `sortDirection`: 'asc' | 'desc' (デフォルト: 'asc')

**イベント**:
- `sorted`: { key: string; direction: 'asc' | 'desc' }

**型定義**:

```typescript
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface TableAction<T = any> {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  handler: (row: T) => void;
}
```

### デザインシステム

#### カラーパレット

```scss
$primary: #4CAF50;    // 緑
$secondary: #6c757d;  // グレー
$danger: #dc3545;     // 赤
$success: #28a745;    // 濃い緑
```

#### サイズ

**ボタン**:
- sm: padding: 6px 12px, font-size: 12px
- md: padding: 8px 16px, font-size: 14px
- lg: padding: 10px 24px, font-size: 16px

**ローディング**:
- sm: 20px × 20px
- md: 40px × 40px
- lg: 60px × 60px

### 使用方法

#### インストール

UIコンポーネントライブラリは `tsconfig.base.json` に以下のパスマッピングが追加されています：

```json
{
  "paths": {
    "@nx-test/shared/ui-components": ["libs/shared/ui-components/src/index.ts"]
  }
}
```

#### インポート例

```typescript
import {
  ButtonComponent,
  CardComponent,
  LoadingComponent,
  TableComponent,
  TableColumn,
  TableAction
} from '@nx-test/shared/ui-components';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CardComponent,
    LoadingComponent,
    TableComponent
  ],
  // ...
})
export class ExampleComponent {
  // ...
}
```

## ベストプラクティス

### DTO使用時の注意点

1. **型の一貫性**: フロントエンド・バックエンドで同じDTOを使用
2. **バージョン管理**: DTOの変更は Breaking Change として扱う
3. **ドキュメント**: 各DTOの用途をコメントで記載

### UIコンポーネント使用時の注意点

1. **スタンドアローン**: すべてのコンポーネントはスタンドアロン
2. **Angular 19 Signals**: input() と output() を使用
3. **アクセシビリティ**: 適切なラベルとARIA属性を追加
4. **レスポンシブ**: モバイル対応を考慮

## ビルド

### DTOライブラリ

```bash
npx nx build dto
```

### UIコンポーネントライブラリ

```bash
npx nx build ui-components
```

### すべての共有ライブラリ

```bash
npx nx run-many -t build -p dto ui-components
```

## テスト

### DTOライブラリ

```bash
npx nx test dto
```

### UIコンポーネントライブラリ

```bash
npx nx test ui-components
```

## 今後の拡張案

### DTOライブラリ

1. **バリデーション**: class-validator デコレーターの追加
2. **変換**: class-transformer デコレーターの追加
3. **ドキュメント生成**: TypeDoc による自動ドキュメント生成

### UIコンポーネントライブラリ

1. **追加コンポーネント**:
   - Modal (モーダルダイアログ)
   - Alert (アラート・通知)
   - Form Controls (入力コンポーネント)
   - Pagination (ページネーション)
   - Breadcrumb (パンくずリスト)

2. **テーマサポート**: ダークモード対応
3. **アニメーション**: Angular Animations の統合
4. **Storybook**: コンポーネントカタログ

## 関連ドキュメント

- [FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md) - Shell実装
- [FRONTEND_FEATURE_USERS.md](./FRONTEND_FEATURE_USERS.md) - Feature-Users実装
- [FRONTEND_FEATURE_PRODUCTS.md](./FRONTEND_FEATURE_PRODUCTS.md) - Feature-Products実装
- [CHANGELOG.md](./CHANGELOG.md) - バックエンド変更履歴
