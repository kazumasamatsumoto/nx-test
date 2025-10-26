import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>ログイン</h1>

        @if (errorMessage()) {
          <div class="alert alert-error">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="form-control"
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
            />
            @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
              <div class="error-message">ユーザー名を入力してください</div>
            }
          </div>

          <div class="form-group">
            <label for="password">パスワード</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-control"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <div class="error-message">パスワードを入力してください</div>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="loginForm.invalid || loading()"
          >
            @if (loading()) {
              <span>ログイン中...</span>
            } @else {
              <span>ログイン</span>
            }
          </button>
        </form>

        <div class="register-link">
          <p>アカウントをお持ちでない方は <a routerLink="/register">こちら</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
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

    .btn {
      width: 100%;
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

    .btn-primary:hover:not(:disabled) {
      background-color: #45a049;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .register-link {
      margin-top: 20px;
      text-align: center;
    }

    .register-link p {
      color: #666;
      font-size: 14px;
    }

    .register-link a {
      color: #4CAF50;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'ログインに失敗しました');
      }
    });
  }
}
