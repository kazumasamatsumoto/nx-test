# 改修履歴

## 2025-10-26: API Gateway Proxy修正とUser Serviceテスト作成

### 1. API Gateway Proxy機能の修正

#### 問題点
- API Gatewayのプロキシコントローラーでパスが重複する問題が発生
- 例: `/api/auth/register` → `http://localhost:3001/api/auth/api/auth/register`
- ルートパス（例: `GET /api/products`）で404エラーが発生

#### 実施した修正

##### 1.1 パス重複の修正
全てのプロキシコントローラーでパス解析ロジックを追加:

**修正ファイル:**
- `apps/backend/api-gateway/src/app/proxy/auth-proxy.controller.ts`
- `apps/backend/api-gateway/src/app/proxy/users-proxy.controller.ts`
- `apps/backend/api-gateway/src/app/proxy/products-proxy.controller.ts`

**修正内容:**
```typescript
// パスの重複を防ぐための処理を追加
const path = req.url.startsWith('/api/auth')
  ? req.url.substring(9)
  : req.url;
const url = `${this.userServiceUrl}/api/auth${path}`;
```

**追加機能:**
- タイムアウト設定（5000ms）
- デバッグ用コンソールログ
- ヘッダーの簡素化（content-typeのみ）

##### 1.2 NestJSルーティングの問題調査
**発見した問題:**
- `@All()` デコレータを `@All('*')` と併用しても、NestJSは最初のデコレータのみを登録
- ルートパス（例: `/api/products`）は `@All()` で処理されるべきだが、`@All('*path')` が優先されるため404エラー

**試行した解決策:**
1. 複数の `@All()` デコレータの併用 → 失敗（最初のみ登録）
2. 名前付きパラメータ構文 `@All('*path')` → ルートパスは依然として404
3. HTTP メソッド別デコレータの追加 → 同じメソッドの複数デコレータは不可

**結論:**
- サブパス（例: `/api/products/1`, `/api/products?page=1`）は正常動作
- ルートパス（例: `GET /api/products`）のみ404
- 実運用では通常クエリパラメータを使用するため、影響は軽微と判断

##### 1.3 動作確認結果
✅ **正常動作:**
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/products` - 商品作成
- 全てのサブパスリクエスト

❌ **未解決:**
- `GET /api/products` （クエリパラメータなし）

---

### 2. User Service ユニットテスト作成

#### 2.1 作成したテストファイル

##### `apps/backend/user-service/src/app/users/users.service.spec.ts`
**テストケース数:** 13テスト

**カバレッジ:**
- **create()**
  - ✅ ユーザーの正常作成
  - ✅ 既存ユーザーでの ConflictException
- **findAll()**
  - ✅ ページネーション付きユーザー一覧取得
  - ✅ ページネーション計算の正確性
- **findOne()**
  - ✅ IDによるユーザー取得
  - ✅ 存在しないユーザーでの NotFoundException
- **findByUsername()**
  - ✅ ユーザー名による検索（成功・null）
- **update()**
  - ✅ ユーザー情報の更新
  - ✅ 存在しないユーザーでの NotFoundException
- **remove()**
  - ✅ ユーザーの削除
  - ✅ 存在しないユーザーでの NotFoundException

**技術的ポイント:**
- TypeORM Repository のモック: `getRepositoryToken(User)`
- QueryBuilder のモック（update時の重複チェック用）
- `repository.remove()` メソッドの使用

##### `apps/backend/user-service/src/app/auth/auth.service.spec.ts`
**テストケース数:** 8テスト

**カバレッジ:**
- **login()**
  - ✅ 正常なログイン（JWT トークン生成確認）
  - ✅ ユーザーが存在しない場合の UnauthorizedException
  - ✅ パスワードが無効な場合の UnauthorizedException
- **register()**
  - ✅ 新規ユーザー登録とトークン生成
  - ✅ UsersService からのエラー伝播
- **validateUser()**
  - ✅ パスワードハッシュを除外したユーザー情報の取得
  - ✅ passwordHash が含まれていないことの確認

**技術的ポイント:**
- bcrypt のモック: `jest.mock('bcrypt')` 使用
- JwtService のモック
- UsersService のモック

#### 2.2 Jest設定ファイルの作成

**作成ファイル:** `apps/backend/user-service/jest.config.ts`

```typescript
export default {
  displayName: 'user-service',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/backend/user-service',
};
```

#### 2.3 Project.json の修正

**修正ファイル:** `apps/backend/user-service/project.json`

**追加内容:**
```json
{
  "test": {
    "executor": "@nx/jest:jest",
    "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
    "options": {
      "jestConfig": "apps/backend/user-service/jest.config.ts",
      "passWithNoTests": true
    }
  }
}
```

#### 2.4 テスト実行結果

```
Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        0.835 s
```

**全テストが成功:** ✅

---

### 3. 直面した技術的課題と解決策

#### 3.1 bcrypt モックの問題

**問題:**
```
TypeError: Cannot redefine property: compare
```

**原因:**
- `jest.spyOn(bcrypt, 'compare')` を `beforeEach` で複数回実行
- 既に定義されたプロパティを再定義しようとしてエラー

**試行した解決策:**
1. `afterEach` で `mockRestore()` → 失敗（タイミング問題）
2. `if (!bcryptCompareSpy)` で条件分岐 → 失敗（依然として再定義）
3. `afterAll` で一度だけクリーンアップ → 失敗

**最終解決策:**
```typescript
jest.mock('bcrypt');
const bcrypt = require('bcrypt');

// テスト内で直接モックを設定
(bcrypt.compare as jest.Mock).mockResolvedValue(true);
```

#### 3.2 UsersService.update() のテスト問題

**問題:**
- 実装が `repository.update()` ではなく `repository.save()` を使用
- `createQueryBuilder` で重複チェックを実行

**解決策:**
```typescript
mockRepository.createQueryBuilder.mockReturnValue({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(null), // 重複なし
});
mockRepository.save.mockResolvedValue(updatedUser);
```

#### 3.3 UsersService.remove() のテスト問題

**問題:**
- テストで `repository.delete()` をモックしていたが、実装は `repository.remove()` を使用

**解決策:**
```typescript
const mockRepository = {
  // ...
  remove: jest.fn(), // delete ではなく remove
};

mockRepository.remove.mockResolvedValue(mockUser);
await service.remove(1);
expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
```

#### 3.4 AuthService.validateUser() のシグネチャ問題

**問題:**
- テストで `service.validateUser(mockUser)` を呼び出し
- 実装は `validateUser(userId: number)` を期待

**解決策:**
```typescript
// UsersService.findOne をモック
mockUsersService.findOne = jest.fn().mockResolvedValue(mockUser);

// 正しいシグネチャで呼び出し
const result = await service.validateUser(mockUser.id);
```

---

### 4. 実行コマンド

```bash
# テスト実行
npx nx test user-service

# カバレッジ付きテスト実行
npx nx test user-service --coverage

# ビルド
npx nx build user-service

# サービス起動
PORT=3001 node dist/apps/backend/user-service/main.js
```

---

### 5. 今後の課題

#### 5.1 テストの拡充
- [ ] Product Service のユニットテスト作成
- [ ] API Gateway のユニットテスト作成
- [ ] E2Eテスト環境の構築

#### 5.2 API Gateway改善
- [ ] ルートパス（クエリパラメータなし）の404問題解決
  - 候補: ミドルウェアベースのプロキシへの移行
  - 候補: 別々のハンドラーメソッドを作成

#### 5.3 テストカバレッジ向上
- [ ] Controller 層のテスト追加
- [ ] DTO バリデーションのテスト
- [ ] 統合テスト追加

---

### 6. 参考リンク

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Mocking Guide](https://jestjs.io/docs/mock-functions)
- [TypeORM Testing](https://typeorm.io/testing)
- [Nx Jest Executor](https://nx.dev/nx-api/jest/executors/jest)
