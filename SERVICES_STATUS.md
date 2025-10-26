# Docker Services Status Report

**更新日時**: 2025-10-25 14:40
**プロジェクト**: nx-test

---

## 🎯 稼働中のサービス一覧

### マイクロフロントエンド（3サービス）

| サービス名 | ポート | ステータス | URL |
|-----------|--------|-----------|-----|
| **shell** | 4200 | ✅ Running | http://localhost:4200 |
| **feature-users** | 4201 | ✅ Running | http://localhost:4201 |
| **feature-products** | 4202 | ✅ Running | http://localhost:4202 |

### マイクロサービス（3サービス）

| サービス名 | ポート | ステータス | エンドポイント |
|-----------|--------|-----------|---------------|
| **api-gateway** | 3000 | ✅ Running | http://localhost:3000/api |
| **user-service** | 3001 | ✅ Running | http://localhost:3001/api |
| **product-service** | 3002 | ✅ Running | http://localhost:3002/api |

### データベース（3サービス）

| データベース名 | ポート | ステータス | ヘルスチェック |
|--------------|--------|-----------|---------------|
| **postgres-users** | 5432 | ✅ Running | Healthy |
| **postgres-products** | 5433 | ✅ Running | Healthy |
| **postgres-orders** | 5434 | ✅ Running | Healthy |

---

## 📊 サービス統計

- **総サービス数**: 9
- **稼働中**: 9
- **停止中**: 0
- **稼働率**: 100%

---

## 🆕 最新の追加

### feature-products (ポート 4202)
- **作成日**: 2025-10-25 14:39
- **フレームワーク**: Angular (Standalone Components)
- **ビルドツール**: Vite
- **開発モード**: Hot Reload 対応
- **初期ビルドサイズ**: 77.04 kB
- **ステータス**: ✅ 正常稼働

**アクセス方法**:
```bash
# ブラウザで開く
open http://localhost:4202

# cURLでテスト
curl http://localhost:4202
```

---

## 🔧 アーキテクチャ構成

```
┌─────────────────────────────────────────────────────┐
│              マイクロフロントエンド層                 │
├─────────────────────────────────────────────────────┤
│  Shell (4200)  │  Feature-Users (4201)  │  Feature-Products (4202)  │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│                 マイクロサービス層                    │
├─────────────────────────────────────────────────────┤
│  API Gateway (3000)  │  User Service (3001)  │  Product Service (3002)  │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│                   データベース層                      │
├─────────────────────────────────────────────────────┤
│  Users DB (5432)  │  Products DB (5433)  │  Orders DB (5434)  │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### すべてのサービスを起動
```bash
docker compose up -d
```

### 特定のサービスを起動
```bash
# フロントエンドのみ
docker compose up -d shell feature-users feature-products

# バックエンドのみ
docker compose up -d api-gateway user-service product-service

# データベースのみ
docker compose up -d postgres-users postgres-products postgres-orders
```

### サービスのログを確認
```bash
# すべてのログ
docker compose logs -f

# 特定のサービス
docker compose logs -f feature-products
```

### サービスを停止
```bash
# すべて停止
docker compose down

# 特定のサービス
docker compose stop feature-products
```

---

## ✅ ヘルスチェック

すべてのサービスが正常に稼働していることを確認：

```bash
# フロントエンド
curl -I http://localhost:4200  # Shell
curl -I http://localhost:4201  # Feature-Users
curl -I http://localhost:4202  # Feature-Products

# バックエンド
curl http://localhost:3000/api  # API Gateway
curl http://localhost:3001/api  # User Service
curl http://localhost:3002/api  # Product Service

# データベース
docker exec nx-test-postgres-users-1 pg_isready -U user
docker exec nx-test-postgres-products-1 pg_isready -U user
docker exec nx-test-postgres-orders-1 pg_isready -U user
```

---

## 📝 次のステップ

1. **機能開発**: 各マイクロフロントエンドに実際の機能を実装
2. **API統合**: フロントエンドとバックエンドの連携
3. **認証**: ユーザー認証機能の追加
4. **Module Federation**: マイクロフロントエンド間の動的統合
5. **テスト**: E2Eテストの追加

---

**最終更新**: 2025-10-25 14:40:00
**更新者**: Claude Code
