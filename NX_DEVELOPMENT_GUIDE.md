# Nx 開発ガイド - アプリケーションとライブラリの作成方法

このガイドでは、Nxモノレポでのアプリケーションとライブラリの作成方法について説明します。

## 目次
1. [Nxとは](#nxとは)
2. [CLIの違い](#cliの違い)
3. [フロントエンド（Angular）の作成](#フロントエンドangularの作成)
4. [バックエンド（NestJS）の作成](#バックエンドnestjsの作成)
5. [ライブラリの作成](#ライブラリの作成)
6. [便利なNxコマンド](#便利なnxコマンド)

---

## Nxとは

**Nx**は、モノレポ（複数のプロジェクトを1つのリポジトリで管理する手法）を効率的に管理するためのツールです。

### Nxの主な機能

- ✅ **依存関係グラフ** - プロジェクト間の依存関係を自動追跡
- ✅ **計算キャッシング** - ビルド・テスト結果をキャッシュして高速化
- ✅ **並行実行** - 複数のタスクを並行実行
- ✅ **影響分析** - 変更があったプロジェクトだけをビルド/テスト
- ✅ **コード生成** - 一貫した構造でコードを自動生成

---

## CLIの違い

### スタンドアロンプロジェクト vs Nxモノレポ

| 項目 | Angular CLI / Nest CLI | Nx モノレポ |
|------|----------------------|------------|
| **使用するCLI** | `ng` / `nest` | `nx` |
| **ワークスペース** | 単一アプリケーション | 複数のアプリ・ライブラリ |
| **アプリ作成** | `ng new app-name` | `nx g @nx/angular:app app-name` |
| **コンポーネント生成** | `ng g component` | `nx g @nx/angular:component` |
| **ビルド** | `ng build` | `nx build` |
| **並行実行** | ❌ | ✅ `nx run-many` |
| **キャッシング** | ❌ | ✅ 自動 |
| **依存関係グラフ** | ❌ | ✅ `nx graph` |

### なぜNx経由で使うのか？

**❌ 直接Angular CLI / Nest CLIを使わない**
```bash
# Nxワークスペース内では使わない
ng generate application my-app
nest generate application my-app
ng generate component my-component
```

**✅ Nx経由で使用する**
```bash
# Nxのジェネレーターを使用
nx g @nx/angular:application my-app
nx g @nx/nest:application my-app
nx g @nx/angular:component my-component --project=my-app
```

**理由:**
1. Nxの依存関係グラフに反映される
2. ビルドキャッシュが効く
3. モノレポの一貫性が保たれる
4. 影響分析（affected）が正しく動作する

---

## フロントエンド（Angular）の作成

### 1. 通常のAngularアプリケーション

```bash
# 基本的な作成
nx g @nx/angular:application my-app \
  --directory=apps/frontend/my-app \
  --standalone \
  --routing \
  --style=scss \
  --skipTests=false \
  --e2eTestRunner=none

# オプション説明:
# --directory: アプリケーションの配置場所
# --standalone: スタンドアロンコンポーネントを使用
# --routing: ルーティングを有効化
# --style: スタイルシート形式（scss, css, less, sass）
# --skipTests: テストファイルをスキップ
# --e2eTestRunner: E2Eテストランナー（none, cypress, playwright）
```

### 2. Module Federation（マイクロフロントエンド）

#### Host アプリケーション（メインアプリ）

```bash
# 1. Angularアプリを作成
nx g @nx/angular:application shell \
  --directory=apps/frontend/shell \
  --standalone \
  --routing \
  --style=scss

# 2. Module Federation Hostとして設定
nx g @nx/angular:setup-mf shell \
  --mfType=host \
  --port=4200 \
  --routing=true
```

#### Remote アプリケーション（機能モジュール）

```bash
# 1. Angularアプリを作成
nx g @nx/angular:application feature-users \
  --directory=apps/frontend/feature-users \
  --standalone \
  --routing \
  --style=scss

# 2. Module Federation Remoteとして設定
nx g @nx/angular:setup-mf feature-users \
  --mfType=remote \
  --host=shell \
  --port=4201 \
  --routing=true

# 他のリモートアプリも同様に作成
nx g @nx/angular:application feature-products \
  --directory=apps/frontend/feature-products \
  --standalone \
  --routing \
  --style=scss

nx g @nx/angular:setup-mf feature-products \
  --mfType=remote \
  --host=shell \
  --port=4202 \
  --routing=true
```

### 3. Angularコンポーネント・サービスの生成

```bash
# コンポーネント
nx g @nx/angular:component user-list \
  --project=feature-users \
  --standalone \
  --style=scss \
  --export=true

# サービス
nx g @nx/angular:service user \
  --project=feature-users

# パイプ
nx g @nx/angular:pipe date-format \
  --project=feature-users \
  --standalone

# ディレクティブ
nx g @nx/angular:directive highlight \
  --project=feature-users \
  --standalone

# ガード
nx g @nx/angular:guard auth \
  --project=feature-users

# インターセプター
nx g @nx/angular:interceptor auth \
  --project=feature-users
```

### 4. Angularアプリの起動とビルド

```bash
# 開発サーバー起動
nx serve shell
nx serve feature-users

# ビルド
nx build shell
nx build shell --configuration=production

# テスト
nx test shell

# リント
nx lint shell
```

---

## バックエンド（NestJS）の作成

### 1. NestJSアプリケーション

```bash
# 基本的な作成
nx g @nx/nest:application api-gateway \
  --directory=apps/backend/api-gateway \
  --skipFormat=true \
  --e2eTestRunner=none

# マイクロサービス作成例
nx g @nx/nest:application user-service \
  --directory=apps/backend/user-service \
  --e2eTestRunner=none

nx g @nx/nest:application product-service \
  --directory=apps/backend/product-service \
  --e2eTestRunner=none

nx g @nx/nest:application order-service \
  --directory=apps/backend/order-service \
  --e2eTestRunner=none
```

### 2. NestJSリソースの生成

#### RESTful APIリソース（CRUD自動生成）

```bash
# 完全なCRUD APIを生成
nx g @nx/nest:resource users \
  --project=user-service \
  --crud \
  --type=rest

# オプション説明:
# --crud: CRUD操作を自動生成
# --type: APIタイプ（rest, graphql-code-first, graphql-schema-first, microservice, ws）
```

これにより以下が自動生成されます：
- Controller（users.controller.ts）
- Service（users.service.ts）
- Module（users.module.ts）
- DTO（create-user.dto.ts, update-user.dto.ts）
- Entity（user.entity.ts）
- 各種テストファイル

#### 個別のコンポーネント生成

```bash
# コントローラー
nx g @nx/nest:controller users \
  --project=user-service

# サービス
nx g @nx/nest:service users \
  --project=user-service

# モジュール
nx g @nx/nest:module users \
  --project=user-service

# ガード
nx g @nx/nest:guard auth \
  --project=user-service

# インターセプター
nx g @nx/nest:interceptor logging \
  --project=user-service

# ミドルウェア
nx g @nx/nest:middleware logger \
  --project=user-service

# パイプ
nx g @nx/nest:pipe validation \
  --project=user-service

# フィルター
nx g @nx/nest:filter http-exception \
  --project=user-service

# デコレーター
nx g @nx/nest:decorator current-user \
  --project=user-service
```

### 3. NestJSアプリの起動とビルド

```bash
# 開発サーバー起動
nx serve api-gateway
nx serve user-service

# ビルド
nx build api-gateway
nx build api-gateway --configuration=production

# テスト
nx test user-service

# リント
nx lint user-service
```

---

## ライブラリの作成

ライブラリは、複数のアプリケーション間で共有するコードを格納します。

### 1. Angularライブラリ

#### UIコンポーネントライブラリ

```bash
# 共通UIコンポーネント
nx g @nx/angular:library ui \
  --directory=libs/frontend/shared/ui \
  --standalone \
  --publishable \
  --importPath=@nx-test/shared/ui

# UIコンポーネントの追加
nx g @nx/angular:component button \
  --project=ui \
  --standalone \
  --export=true

nx g @nx/angular:component card \
  --project=ui \
  --standalone \
  --export=true
```

#### データアクセスライブラリ

```bash
# データアクセス層
nx g @nx/angular:library data-access \
  --directory=libs/frontend/shared/data-access \
  --standalone

# サービスの追加
nx g @nx/angular:service api \
  --project=data-access

nx g @nx/angular:interceptor auth \
  --project=data-access
```

#### ユーティリティライブラリ

```bash
# ユーティリティ関数
nx g @nx/angular:library utils \
  --directory=libs/frontend/shared/utils \
  --standalone

# パイプやヘルパー関数を追加
nx g @nx/angular:pipe format-date \
  --project=utils \
  --standalone
```

#### ドメインライブラリ

```bash
# ユーザードメインモデル
nx g @nx/angular:library user \
  --directory=libs/frontend/domain/user \
  --standalone

# 商品ドメインモデル
nx g @nx/angular:library product \
  --directory=libs/frontend/domain/product \
  --standalone
```

### 2. NestJSライブラリ

#### DTOライブラリ

```bash
# 共通DTO
nx g @nx/node:library dto \
  --directory=libs/backend/shared/dto

# DTOクラスの追加（手動でファイル作成）
# libs/backend/shared/dto/src/lib/pagination.dto.ts
# libs/backend/shared/dto/src/lib/response.dto.ts
```

#### インターフェースライブラリ

```bash
# 共通インターフェース
nx g @nx/node:library interfaces \
  --directory=libs/backend/shared/interfaces
```

#### ガード・デコレーターライブラリ

```bash
# 共通ガード
nx g @nx/node:library guards \
  --directory=libs/backend/shared/guards

# 共通デコレーター
nx g @nx/node:library decorators \
  --directory=libs/backend/shared/decorators
```

#### データベースライブラリ

```bash
# PostgreSQL設定ライブラリ
nx g @nx/node:library postgres \
  --directory=libs/backend/database/postgres
```

### 3. ライブラリの使用

ライブラリを作成すると、`tsconfig.base.json`に自動でパスマッピングが追加されます。

```typescript
// フロントエンドでの使用例
import { ButtonComponent } from '@nx-test/shared/ui';
import { ApiService } from '@nx-test/shared/data-access';
import { User } from '@nx-test/domain/user';

// バックエンドでの使用例
import { PaginationDto } from '@nx-test/shared/dto';
import { JwtAuthGuard } from '@nx-test/shared/guards';
```

---

## 便利なNxコマンド

### 1. プロジェクト一覧

```bash
# すべてのプロジェクトを表示
nx show projects

# 特定プロジェクトの詳細
nx show project shell
```

### 2. ビルド・テスト

```bash
# すべてをビルド
nx run-many --target=build --all

# すべてを並行ビルド
nx run-many --target=build --all --parallel=3

# 特定のプロジェクトのみ
nx run-many --target=build --projects=shell,feature-users

# すべてテスト
nx run-many --target=test --all

# すべてリント
nx run-many --target=lint --all
```

### 3. 影響分析（Affected）

変更があったプロジェクトとその依存関係のみを対象にします。

```bash
# 影響を受けるプロジェクトをビルド
nx affected:build

# 影響を受けるプロジェクトをテスト
nx affected:test

# 影響を受けるプロジェクトをリント
nx affected:lint

# 影響を受けるプロジェクトを表示
nx affected:graph
```

### 4. 依存関係グラフ

```bash
# 依存関係グラフをブラウザで表示
nx graph

# 特定プロジェクトに焦点を当てる
nx graph --focus=shell

# 影響を受けるプロジェクトのグラフ
nx affected:graph
```

### 5. キャッシュ管理

```bash
# キャッシュをクリア
nx reset

# キャッシュ情報の表示
nx show project shell --web
```

### 6. 依存関係の追加

```bash
# npmパッケージを追加
npm install package-name

# 開発依存関係として追加
npm install -D package-name

# プロジェクト間の依存関係は自動で管理される
```

### 7. マイグレーション

```bash
# Nxを最新バージョンにアップデート
nx migrate latest

# マイグレーションを実行
nx migrate --run-migrations
```

### 8. デバッグ・トラブルシューティング

```bash
# 詳細ログ出力
nx build shell --verbose

# ビルド結果のキャッシュをスキップ
nx build shell --skip-nx-cache

# プロジェクト設定の確認
nx show project shell

# ワークスペース全体の構成確認
nx show projects --with-target=build
```

---

## ベストプラクティス

### 1. プロジェクト命名規則

```
apps/
  frontend/
    shell/              # Host app
    feature-users/      # Feature app
    feature-products/   # Feature app
  backend/
    api-gateway/        # Gateway service
    user-service/       # Microservice
    product-service/    # Microservice

libs/
  frontend/
    shared/
      ui/               # Shared UI components
      data-access/      # Shared services
      utils/            # Shared utilities
    domain/
      user/             # User domain models
      product/          # Product domain models
  backend/
    shared/
      dto/              # Shared DTOs
      interfaces/       # Shared interfaces
      guards/           # Shared guards
    database/
      postgres/         # Database config
```

### 2. ライブラリの分類

- **UI** - 再利用可能なUIコンポーネント
- **Data Access** - API呼び出し、状態管理
- **Utils** - ユーティリティ関数、ヘルパー
- **Domain** - ドメインモデル、ビジネスロジック
- **Feature** - 特定機能に特化したコード

### 3. タグによる依存関係の制御

`nx.json`や`project.json`でタグを設定し、依存関係のルールを定義できます。

```json
{
  "tags": ["scope:frontend", "type:ui"]
}
```

### 4. 共有コードは必ずライブラリに

複数のアプリケーションで使用するコードは、必ずライブラリとして分離します。

---

## まとめ

| タスク | コマンド |
|--------|---------|
| Angularアプリ作成 | `nx g @nx/angular:application <name>` |
| NestJSアプリ作成 | `nx g @nx/nest:application <name>` |
| Angularライブラリ作成 | `nx g @nx/angular:library <name>` |
| Nodeライブラリ作成 | `nx g @nx/node:library <name>` |
| コンポーネント生成 | `nx g @nx/angular:component <name> --project=<project>` |
| サービス生成 | `nx g @nx/angular:service <name> --project=<project>` |
| NestJS REST API生成 | `nx g @nx/nest:resource <name> --project=<project> --crud` |
| ビルド | `nx build <project>` |
| サーブ | `nx serve <project>` |
| テスト | `nx test <project>` |
| 依存関係グラフ | `nx graph` |
| 影響分析 | `nx affected:build` |

### 重要なポイント

1. ✅ **Nx経由でジェネレーターを使用する** - `nx g @nx/angular:...` / `nx g @nx/nest:...`
2. ✅ **直接Angular CLI / Nest CLIを使わない** - Nxの管理下に置く
3. ✅ **共有コードはライブラリに分離** - アプリ間の重複を避ける
4. ✅ **依存関係グラフを活用** - プロジェクト間の関係を可視化
5. ✅ **キャッシュを活用** - ビルド時間を短縮

---

## 参考リソース

- [Nx Documentation](https://nx.dev)
- [Nx Angular Plugin](https://nx.dev/nx-api/angular)
- [Nx Nest Plugin](https://nx.dev/nx-api/nest)
- [Nx Generators](https://nx.dev/features/generate-code)
- [Module Federation](https://nx.dev/concepts/module-federation)
