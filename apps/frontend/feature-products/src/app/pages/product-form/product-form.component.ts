import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-card">
        <div class="form-header">
          <h1>{{ isEditMode() ? '商品編集' : '新規商品登録' }}</h1>
          <button class="btn btn-secondary" routerLink="/products">
            戻る
          </button>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">
            {{ errorMessage() }}
          </div>
        }

        @if (loading()) {
          <div class="loading">読み込み中...</div>
        } @else {
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">商品名 *</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="form-control"
                [class.error]="productForm.get('name')?.invalid && productForm.get('name')?.touched"
              />
              @if (productForm.get('name')?.invalid && productForm.get('name')?.touched) {
                <div class="error-message">商品名を入力してください</div>
              }
            </div>

            <div class="form-group">
              <label for="description">説明 *</label>
              <textarea
                id="description"
                formControlName="description"
                class="form-control"
                rows="4"
                [class.error]="productForm.get('description')?.invalid && productForm.get('description')?.touched"
              ></textarea>
              @if (productForm.get('description')?.invalid && productForm.get('description')?.touched) {
                <div class="error-message">説明を入力してください</div>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="price">価格 (円) *</label>
                <input
                  id="price"
                  type="number"
                  formControlName="price"
                  class="form-control"
                  min="0"
                  step="1"
                  [class.error]="productForm.get('price')?.invalid && productForm.get('price')?.touched"
                />
                @if (productForm.get('price')?.invalid && productForm.get('price')?.touched) {
                  <div class="error-message">
                    @if (productForm.get('price')?.hasError('required')) {
                      価格を入力してください
                    } @else if (productForm.get('price')?.hasError('min')) {
                      価格は0以上で入力してください
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="stock">在庫数 *</label>
                <input
                  id="stock"
                  type="number"
                  formControlName="stock"
                  class="form-control"
                  min="0"
                  step="1"
                  [class.error]="productForm.get('stock')?.invalid && productForm.get('stock')?.touched"
                />
                @if (productForm.get('stock')?.invalid && productForm.get('stock')?.touched) {
                  <div class="error-message">
                    @if (productForm.get('stock')?.hasError('required')) {
                      在庫数を入力してください
                    } @else if (productForm.get('stock')?.hasError('min')) {
                      在庫数は0以上で入力してください
                    }
                  </div>
                }
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                routerLink="/products"
              >
                キャンセル
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="productForm.invalid || saving()"
              >
                @if (saving()) {
                  <span>保存中...</span>
                } @else {
                  <span>{{ isEditMode() ? '更新' : '登録' }}</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .form-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-header {
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-control:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .form-control.error {
      border-color: #c33;
    }

    .error-message {
      color: #c33;
      font-size: 12px;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }

    .btn {
      padding: 10px 24px;
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

    .btn-primary:hover:not(:disabled) {
      background-color: #45a049;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEditMode = signal(false);
  productId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(+id);
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('商品の読み込みに失敗しました');
        this.loading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const formValue = this.productForm.value;
    const productData: any = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      stock: formValue.stock
    };

    const request = this.isEditMode()
      ? this.productsService.updateProduct(this.productId()!, productData)
      : this.productsService.createProduct(productData);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.error?.message ||
          `商品の${this.isEditMode() ? '更新' : '登録'}に失敗しました`
        );
        console.error('Error saving product:', err);
      }
    });
  }
}
