# デプロイメントガイド

## 概要

このドキュメントでは、Nx Monorepo マイクロサービスアプリケーションのデプロイメント方法を説明します。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx (Port 80)                      │
│                    Reverse Proxy & Load Balancer             │
└───┬────────────────┬──────────────────┬──────────────────────┘
    │                │                  │
    ▼                ▼                  ▼
┌─────────┐    ┌──────────┐      ┌─────────────┐
│ Shell   │    │  Users   │      │  Products   │
│ (4200)  │    │  (4201)  │      │  (4202)     │
└─────────┘    └──────────┘      └─────────────┘

                 ▼ (API calls)

┌──────────────────────────────────────────────────────────────┐
│                 API Gateway (Port 3000)                       │
└───┬──────────────────────────────────────┬───────────────────┘
    │                                      │
    ▼                                      ▼
┌─────────────────┐              ┌──────────────────┐
│  User Service   │              │ Product Service  │
│    (3001)       │              │     (3002)       │
└────────┬────────┘              └────────┬─────────┘
         │                                │
         └────────────┬───────────────────┘
                      ▼
              ┌──────────────┐
              │  PostgreSQL  │
              │    (5432)    │
              └──────────────┘
```

## Module Federation 設定

> **⚠️ 注意**: Angular 19 + Nx でのModule Federationは現在設定中です。Native Federation への移行が必要な可能性があります。

### 現在の設定状況

#### Shell (Host Application)

**ファイル**: `apps/frontend/shell/module-federation.config.ts`

```typescript
const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: [
    ['feature-users', 'http://localhost:4201'],
    ['feature-products', 'http://localhost:4202']
  ]
};
```

#### Feature-Users (Remote Application)

**ファイル**: `apps/frontend/feature-users/module-federation.config.ts`

```typescript
const config: ModuleFederationConfig = {
  name: 'feature-users',
  exposes: {
    './Routes': 'apps/frontend/feature-users/src/app/remote-entry/entry.routes.ts',
  },
};
```

#### Feature-Products (Remote Application)

**ファイル**: `apps/frontend/feature-products/module-federation.config.ts`

```typescript
const config: ModuleFederationConfig = {
  name: 'feature-products',
  exposes: {
    './Routes': 'apps/frontend/feature-products/src/app/remote-entry/entry.routes.ts',
  },
};
```

### 既知の問題

1. **remoteEntry.js が生成されない**
   - Angular 19 は Native Federation を使用する可能性がある
   - 従来の Webpack Module Federation とは異なる設定が必要

2. **代替アプローチ**
   - 現在は各アプリケーションを個別に起動可能
   - Shell内に直接ルーティングを実装することも可能

## Nginx リバースプロキシ設定

**ファイル**: `nginx.conf`

### 主要な機能

1. **フロントエンドルーティング**:
   - `/` → Shell アプリケーション (4200)
   - `/feature-users/` → Users モジュール (4201)
   - `/feature-products/` → Products モジュール (4202)

2. **バックエンドルーティング**:
   - `/api/` → API Gateway (3000)

3. **ヘルスチェック**:
   - `/health` → ヘルスチェックエンドポイント

### Upstream 設定

```nginx
upstream api_gateway {
    server localhost:3000;
}

upstream user_service {
    server localhost:3001;
}

upstream product_service {
    server localhost:3002;
}

upstream frontend_shell {
    server localhost:4200;
}

upstream frontend_users {
    server localhost:4201;
}

upstream frontend_products {
    server localhost:4202;
}
```

### Location ブロック

```nginx
# Frontend - Shell
location / {
    proxy_pass http://frontend_shell;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Backend API
location /api/ {
    proxy_pass http://api_gateway;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## ローカル開発環境

### 1. データベース起動

```bash
# PostgreSQL起動 (Docker使用)
docker run -d \
  --name nx-test-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nx_test \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. バックエンドサービス起動

```bash
# ビルド
npx nx run-many -t build -p api-gateway user-service product-service

# 各サービス起動 (別々のターミナルまたはバックグラウンドで)
PORT=3001 node dist/apps/backend/user-service/main.js &
PORT=3002 node dist/apps/backend/product-service/main.js &
sleep 2 && PORT=3000 node dist/apps/backend/api-gateway/main.js &
```

**確認:**
```bash
# API Gateway動作確認
curl http://localhost:3000/api
# 期待される出力: {"message":"Hello API"}
```

### 3. フロントエンド起動

```bash
# 各アプリケーションを別々のターミナルまたはバックグラウンドで起動
npx nx serve feature-users --port=4201 &
npx nx serve feature-products --port=4202 &
npx nx serve shell --port=4200 &
```

**アクセス:**
- Shell: http://localhost:4200
- Feature-Users: http://localhost:4201
- Feature-Products: http://localhost:4202

> **注意**: Module Federationは現在設定中のため、Shell から他のモジュールへのルーティングは動作しない可能性があります。各アプリケーションに直接アクセスしてテストしてください。

### 4. Nginx 起動 (オプション)

```bash
# Nginx設定テスト
nginx -t -c $(pwd)/nginx.conf

# Nginx起動
nginx -c $(pwd)/nginx.conf
```

### 現在の動作状況

#### ✅ 動作中
- バックエンドサービス (User Service, Product Service, API Gateway)
- PostgreSQL データベース
- 各フロントエンドアプリケーション (個別起動)

#### ⚠️ 設定中
- Module Federation (Shell → feature-users/feature-products へのルーティング)
- Nginx リバースプロキシ統合

## Docker Compose デプロイメント

### docker-compose.ymlの構成

**サービス一覧**:
- `postgres`: PostgreSQL データベース
- `nginx`: リバースプロキシ
- `api-gateway`: API Gateway (3000)
- `user-service`: User Service (3001)
- `product-service`: Product Service (3002)
- `frontend-shell`: Shell App
- `frontend-users`: Users Feature Module
- `frontend-products`: Products Feature Module

### デプロイメント手順

```bash
# すべてのサービスをビルド & 起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f api-gateway

# サービス停止
docker-compose down

# ボリュームも削除
docker-compose down -v
```

### ヘルスチェック

```bash
# Nginx ヘルスチェック
curl http://localhost/health

# API Gateway ヘルスチェック
curl http://localhost/api/health

# PostgreSQL 接続確認
docker exec nx-test-postgres pg_isready -U postgres
```

## 本番環境デプロイメント

### 環境変数

#### Backend Services

```bash
# User Service
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=<strong-password>
DATABASE_NAME=nx_test
JWT_SECRET=<strong-secret-key>
PORT=3001

# Product Service
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=<strong-password>
DATABASE_NAME=nx_test
PORT=3002

# API Gateway
USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
PORT=3000
```

#### Frontend Applications

```bash
API_URL=https://your-domain.com/api
```

### SSL/TLS 設定 (HTTPS)

**nginx.conf** に以下を追加:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 同じlocationブロックを使用
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### データベースマイグレーション

```bash
# User Service マイグレーション実行
docker exec nx-test-user-service npm run migration:run

# Product Service マイグレーション実行
docker exec nx-test-product-service npm run migration:run
```

## モニタリング & ロギング

### Nginx アクセスログ

```bash
# アクセスログ確認
docker exec nx-test-nginx tail -f /var/log/nginx/access.log

# エラーログ確認
docker exec nx-test-nginx tail -f /var/log/nginx/error.log
```

### アプリケーションログ

```bash
# すべてのサービスのログ
docker-compose logs -f

# 特定のサービス
docker-compose logs -f user-service
docker-compose logs -f product-service
docker-compose logs -f api-gateway
```

### リソース使用状況

```bash
# Docker stats
docker stats

# PostgreSQL 接続数
docker exec nx-test-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

## トラブルシューティング

### 問題: Module Federation でリモートモジュールが読み込めない

**現在の状況**:
- Angular 19 + Nx では従来の Webpack Module Federation と異なる実装が必要
- `remoteEntry.js` が生成されない問題が確認されています

**解決策**:
1. 各フロントエンドアプリが正しいポートで起動しているか確認
   ```bash
   # feature-users が 4201 で起動しているか確認
   curl http://localhost:4201

   # feature-products が 4202 で起動しているか確認
   curl http://localhost:4202

   # shell が 4200 で起動しているか確認
   curl http://localhost:4200
   ```

2. `module-federation.config.ts` の設定を確認
   - Shell: remotes に URL とポート番号が正しく設定されているか
   - Remote アプリ: exposes 設定が正しいか

3. ブラウザのコンソールでネットワークエラーを確認
   - `Failed to resolve import "feature-users/Routes"` エラーが出る場合は Module Federation の設定が必要

4. **暫定的な回避策**:
   - 各アプリケーションに直接アクセスして機能をテスト
   - Shell 内に直接ルーティングを実装する (Module Federation を使わない)

**参考情報**:
- Angular 19 は Native Federation への移行を推奨
- 詳細: https://www.npmjs.com/package/@angular-architects/native-federation

### 問題: API Gatewayがマイクロサービスに接続できない

**解決策**:
1. 各サービスが起動しているか確認: `docker ps`
2. ネットワーク設定を確認: `docker network inspect nx-test_default`
3. 環境変数が正しく設定されているか確認

### 問題: データベース接続エラー

**解決策**:
1. PostgreSQLが起動しているか確認
2. ヘルスチェック確認: `docker exec nx-test-postgres pg_isready`
3. 接続情報を確認 (host, port, user, password)

### 問題: Nginx が 502 Bad Gateway を返す

**解決策**:
1. バックエンドサービスが起動しているか確認
2. upstream設定のポート番号を確認
3. Nginxログを確認: `docker logs nx-test-nginx`

## パフォーマンス最適化

### Nginx キャッシュ設定

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;

location /api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    # 他の設定...
}
```

### PostgreSQL チューニング

```sql
-- 接続プーリング設定
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### フロントエンド最適化

```bash
# Production ビルド (最適化済み)
npx nx build shell --configuration=production
npx nx build feature-users --configuration=production
npx nx build feature-products --configuration=production
```

## セキュリティ

### 本番環境チェックリスト

- [ ] 環境変数にシークレット情報を設定 (.env使用、コミットしない)
- [ ] JWT_SECRET を強力なランダム文字列に設定
- [ ] データベースパスワードを強力なものに変更
- [ ] HTTPS/SSL を有効化
- [ ] CORS設定を本番ドメインに制限
- [ ] Rate Limiting を設定
- [ ] セキュリティヘッダーを追加

### Nginxセキュリティヘッダー

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## スケーリング

### 水平スケーリング

```yaml
# docker-compose.yml
services:
  user-service:
    deploy:
      replicas: 3
    # 設定...

  product-service:
    deploy:
      replicas: 3
    # 設定...
```

### ロードバランシング

```nginx
upstream user_service {
    least_conn;
    server user-service-1:3001;
    server user-service-2:3001;
    server user-service-3:3001;
}
```

## 関連ドキュメント

- [CHANGELOG.md](./CHANGELOG.md) - バックエンド変更履歴
- [FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md) - フロントエンド実装
- [SHARED_LIBRARIES.md](./SHARED_LIBRARIES.md) - 共有ライブラリ
- [FRONTEND_FEATURE_USERS.md](./FRONTEND_FEATURE_USERS.md) - Users モジュール
- [FRONTEND_FEATURE_PRODUCTS.md](./FRONTEND_FEATURE_PRODUCTS.md) - Products モジュール
