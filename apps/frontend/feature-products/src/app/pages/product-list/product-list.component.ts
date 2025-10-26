import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-list-container">
      <div class="header">
        <h1>商品管理</h1>
        <button class="btn btn-primary" routerLink="/products/create">
          + 新規商品登録
        </button>
      </div>

      @if (loading()) {
        <div class="loading">読み込み中...</div>
      } @else if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      } @else {
        <div class="table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>商品名</th>
                <th>説明</th>
                <th>価格</th>
                <th>在庫数</th>
                <th>登録日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr>
                  <td>{{ product.id }}</td>
                  <td>{{ product.name }}</td>
                  <td class="description">{{ product.description }}</td>
                  <td class="price">¥{{ formatNumber(product.price) }}</td>
                  <td class="stock" [class.low-stock]="product.stock < 10">
                    {{ product.stock }}
                  </td>
                  <td>{{ formatDate(product.createdAt) }}</td>
                  <td class="actions">
                    <button
                      class="btn btn-sm btn-secondary"
                      [routerLink]="['/products', product.id, 'edit']"
                    >
                      編集
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      (click)="deleteProduct(product.id)"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-message">
                    商品が見つかりませんでした
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (pagination().totalPages > 1) {
          <div class="pagination">
            <button
              class="btn btn-secondary"
              [disabled]="pagination().page === 1"
              (click)="goToPage(pagination().page - 1)"
            >
              前へ
            </button>

            <span class="page-info">
              {{ pagination().page }} / {{ pagination().totalPages }} ページ
              (全 {{ pagination().total }} 件)
            </span>

            <button
              class="btn btn-secondary"
              [disabled]="pagination().page === pagination().totalPages"
              (click)="goToPage(pagination().page + 1)"
            >
              次へ
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .product-list-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .alert {
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .alert-error {
      background-color: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .table-container {
      overflow-x: auto;
    }

    .product-table {
      width: 100%;
      border-collapse: collapse;
    }

    .product-table th,
    .product-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .product-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #555;
    }

    .product-table tbody tr:hover {
      background-color: #f9f9f9;
    }

    .description {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price {
      font-weight: 600;
      color: #2c7a2c;
    }

    .stock {
      text-align: center;
    }

    .stock.low-stock {
      color: #dc3545;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .empty-message {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 30px;
    }

    .page-info {
      color: #666;
      font-size: 14px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background-color: #4CAF50;
      color: white;
    }

    .btn-primary:hover {
      background-color: #45a049;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #5a6268;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal('');
  pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.loading.set(true);
    this.error.set('');

    this.productsService.getProducts(page, 10).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.pagination.set({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('商品の読み込みに失敗しました');
        this.loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  goToPage(page: number): void {
    this.loadProducts(page);
  }

  deleteProduct(id: number): void {
    if (!confirm('この商品を削除してもよろしいですか？')) {
      return;
    }

    this.productsService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts(this.pagination().page);
      },
      error: (err) => {
        this.error.set('商品の削除に失敗しました');
        console.error('Error deleting product:', err);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ja-JP');
  }

  formatNumber(num: number): string {
    return num.toLocaleString('ja-JP');
  }
}
