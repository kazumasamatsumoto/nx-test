# Frontend Feature-Products 実装ドキュメント

## 概要

Feature-Products は商品管理機能を提供するマイクロフロントエンドモジュールです。Module Federation を使用して Shell アプリケーションから遅延ロードされます。

## プロジェクト構成

```
apps/frontend/feature-products/
├── src/
│   └── app/
│       ├── models/
│       │   └── product.model.ts          # 商品データモデル
│       ├── services/
│       │   └── products.service.ts       # API通信サービス
│       ├── pages/
│       │   ├── product-list/
│       │   │   └── product-list.component.ts    # 商品一覧
│       │   └── product-form/
│       │       └── product-form.component.ts    # 商品作成・編集
│       └── remote-entry/
│           └── entry.routes.ts           # Module Federation ルート
```

## データモデル

### Product インターフェース

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
```

### ProductListResponse インターフェース

```typescript
export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### CreateProductDto

```typescript
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
}
```

### UpdateProductDto

```typescript
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}
```

## サービス層

### ProductsService

**ファイル**: `services/products.service.ts`

#### メソッド一覧

| メソッド | 説明 | パラメータ | 戻り値 |
|---------|------|----------|--------|
| `getProducts()` | 商品一覧取得（ページネーション） | page, limit | Observable<ProductListResponse> |
| `getProduct()` | 単一商品取得 | id | Observable<Product> |
| `createProduct()` | 商品新規作成 | CreateProductDto | Observable<Product> |
| `updateProduct()` | 商品更新 | id, UpdateProductDto | Observable<Product> |
| `deleteProduct()` | 商品削除 | id | Observable<void> |

#### API エンドポイント

```typescript
private readonly API_URL = 'http://localhost:3000/api/products';
```

## コンポーネント

### 1. ProductListComponent

**ファイル**: `pages/product-list/product-list.component.ts`

#### 機能
- 商品一覧のテーブル表示
- ページネーション（10件/ページ）
- 商品の削除（確認ダイアログ付き）
- 新規作成・編集へのナビゲーション
- 在庫数の警告表示（10未満で赤字）

#### 状態管理（Signals）

```typescript
products = signal<Product[]>([]);
loading = signal(false);
error = signal('');
pagination = signal({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});
```

#### 主要メソッド

- **`loadProducts(page: number)`**: 指定ページの商品一覧を取得
- **`deleteProduct(id: number)`**: 商品削除（確認ダイアログ表示）
- **`goToPage(page: number)`**: ページ遷移
- **`formatDate(date: Date)`**: 日付を日本語形式でフォーマット
- **`formatNumber(num: number)`**: 数値を3桁区切りでフォーマット

#### UI 機能
- 在庫数が10未満の場合、赤字で表示
- 商品説明が長い場合は省略表示
- レスポンシブ対応のテーブル

### 2. ProductFormComponent

**ファイル**: `pages/product-form/product-form.component.ts`

#### 機能
- 商品の新規作成
- 既存商品の編集
- リアルタイムバリデーション
- フォーム送信時のローディング状態表示

#### 状態管理（Signals）

```typescript
isEditMode = signal(false);
productId = signal<number | null>(null);
loading = signal(false);
saving = signal(false);
errorMessage = signal('');
```

#### フォーム定義

```typescript
productForm = this.fb.group({
  name: ['', Validators.required],
  description: ['', Validators.required],
  price: [0, [Validators.required, Validators.min(0)]],
  stock: [0, [Validators.required, Validators.min(0)]]
});
```

#### バリデーション

| フィールド | バリデーション |
|-----------|--------------|
| name | 必須 |
| description | 必須 |
| price | 必須、0以上 |
| stock | 必須、0以上 |

#### 主要メソッド

- **`ngOnInit()`**: ルートパラメータから商品IDを取得し、編集モードか判断
- **`loadProduct(id: number)`**: 編集対象の商品データを取得してフォームに設定
- **`onSubmit()`**: フォーム送信処理（作成/更新を判断）

#### UI レイアウト
- 商品名: テキスト入力
- 説明: テキストエリア（4行、リサイズ可能）
- 価格・在庫数: 2カラムレイアウト（レスポンシブ対応）
- 数値入力フィールドは最小値0を設定

## ルーティング

### Entry Routes

**ファイル**: `remote-entry/entry.routes.ts`

```typescript
export const remoteRoutes: Route[] = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: 'create',
    component: ProductFormComponent,
  },
  {
    path: ':id/edit',
    component: ProductFormComponent,
  },
];
```

### URL パターン

| パス | コンポーネント | 説明 |
|-----|--------------|------|
| `/products` | ProductListComponent | 商品一覧 |
| `/products/create` | ProductFormComponent | 新規作成 |
| `/products/:id/edit` | ProductFormComponent | 編集 |

## スタイリング

### デザインシステム

#### カラーパレット
- **Primary**: `#4CAF50` (緑) - メインアクション
- **Secondary**: `#6c757d` (グレー) - 戻る/キャンセル
- **Danger**: `#dc3545` (赤) - 削除
- **Success**: `#2c7a2c` (濃い緑) - 価格表示
- **Warning**: `#dc3545` (赤) - 在庫警告

#### ボタンスタイル
```scss
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
```

#### レスポンシブ対応
```scss
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

### テーブルスタイル
- ホバー時に背景色変更
- 固定ヘッダー
- 説明文の省略表示（max-width: 300px）
- 在庫数の中央揃え

## 状態管理

### Angular Signals の使用

Feature-Products では Angular 19 の Signals を使用して状態管理を実装しています。

#### Signals の利点
1. **自動変更検知**: Signal の値が変更されると UI が自動更新
2. **シンプルな API**: `.set()`, `.update()` で値を更新
3. **TypeScript サポート**: 型推論が効く

#### 使用例

```typescript
// 定義
products = signal<Product[]>([]);

// 読み取り
@for (product of products(); track product.id) {
  // テンプレートで使用
}

// 更新
this.products.set(response.data);
```

## エラーハンドリング

### API エラー処理

```typescript
this.productsService.getProducts(page, 10).subscribe({
  next: (response) => {
    // 成功処理
  },
  error: (err) => {
    this.error.set('商品の読み込みに失敗しました');
    console.error('Error loading products:', err);
  }
});
```

### バリデーションエラー表示

```html
@if (productForm.get('price')?.invalid && productForm.get('price')?.touched) {
  <div class="error-message">
    @if (productForm.get('price')?.hasError('required')) {
      価格を入力してください
    } @else if (productForm.get('price')?.hasError('min')) {
      価格は0以上で入力してください
    }
  </div>
}
```

## API 連携

### リクエスト例

#### 商品一覧取得
```typescript
GET http://localhost:3000/api/products?page=1&limit=10
```

#### 商品作成
```typescript
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "サンプル商品",
  "description": "商品の説明",
  "price": 1000,
  "stock": 50
}
```

#### 商品更新
```typescript
PUT http://localhost:3000/api/products/1
Content-Type: application/json

{
  "name": "更新された商品名",
  "price": 1500,
  "stock": 30
}
```

#### 商品削除
```typescript
DELETE http://localhost:3000/api/products/1
```

### 認証

すべてのリクエストには Shell の `authInterceptor` により JWT トークンが自動的に付与されます。

```typescript
Authorization: Bearer <token>
```

## ベストプラクティス

### 1. Signals の活用
- コンポーネント状態には Signals を使用
- RxJS の Observable は HTTP 通信のみに使用

### 2. フォームバリデーション
- リアクティブフォームを使用
- バリデーションルールはコンポーネント初期化時に定義
- タッチ状態を考慮してエラー表示

### 3. ユーザー体験
- ローディング状態を明示的に表示
- エラーメッセージは日本語で分かりやすく
- 削除前に確認ダイアログを表示

### 4. パフォーマンス
- ページネーションで大量データを効率的に表示
- 不要な再レンダリングを避ける（track 関数の使用）

### 5. スタイリング
- コンポーネント内にスタイルをカプセル化
- Feature-Users と一貫性のあるデザイン
- レスポンシブデザイン対応

## トラブルシューティング

### 問題: 商品一覧が表示されない
**解決策**:
1. バックエンド API が起動しているか確認
2. ブラウザのコンソールでエラーを確認
3. JWT トークンが正しく設定されているか確認

### 問題: フォーム送信が失敗する
**解決策**:
1. バリデーションエラーがないか確認
2. API エンドポイントが正しいか確認
3. リクエストボディの形式を確認

### 問題: ページネーションが動作しない
**解決策**:
1. バックエンドが正しいレスポンスを返しているか確認
2. `totalPages` の計算が正しいか確認

## 今後の拡張案

1. **検索機能**: 商品名・説明で検索
2. **ソート機能**: 価格・在庫数でソート
3. **フィルター**: 在庫切れ・低在庫商品の絞り込み
4. **画像アップロード**: 商品画像の登録・表示
5. **カテゴリ管理**: 商品カテゴリの追加
6. **在庫アラート**: 在庫が少なくなった時の通知
7. **CSV エクスポート**: 商品データの一括ダウンロード

## 開発コマンド

```bash
# 開発サーバー起動
npx nx serve feature-products

# ビルド
npx nx build feature-products

# テスト
npx nx test feature-products

# Lint
npx nx lint feature-products
```

## 関連ドキュメント

- [FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md) - Shell アプリケーション実装
- [FRONTEND_FEATURE_USERS.md](./FRONTEND_FEATURE_USERS.md) - Feature-Users モジュール実装
- [CHANGELOG.md](./CHANGELOG.md) - バックエンド実装の変更履歴
