import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-card">
        <div class="form-header">
          <h1>{{ isEditMode() ? 'ユーザー編集' : '新規ユーザー作成' }}</h1>
          <button class="btn btn-secondary" routerLink="/users">
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
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="username">ユーザー名 *</label>
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  class="form-control"
                  [class.error]="userForm.get('username')?.invalid && userForm.get('username')?.touched"
                />
                @if (userForm.get('username')?.invalid && userForm.get('username')?.touched) {
                  <div class="error-message">ユーザー名を入力してください</div>
                }
              </div>

              <div class="form-group">
                <label for="email">メールアドレス *</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-control"
                  [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                />
                @if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
                  <div class="error-message">
                    @if (userForm.get('email')?.hasError('required')) {
                      メールアドレスを入力してください
                    } @else if (userForm.get('email')?.hasError('email')) {
                      正しいメールアドレスを入力してください
                    }
                  </div>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="firstName">名 *</label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="form-control"
                  [class.error]="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched"
                />
                @if (userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched) {
                  <div class="error-message">名を入力してください</div>
                }
              </div>

              <div class="form-group">
                <label for="lastName">姓 *</label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="form-control"
                  [class.error]="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched"
                />
                @if (userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched) {
                  <div class="error-message">姓を入力してください</div>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="password">
                パスワード {{ isEditMode() ? '(変更する場合のみ入力)' : '*' }}
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="form-control"
                [class.error]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
              />
              @if (userForm.get('password')?.invalid && userForm.get('password')?.touched) {
                <div class="error-message">
                  @if (userForm.get('password')?.hasError('required')) {
                    パスワードを入力してください
                  } @else if (userForm.get('password')?.hasError('minlength')) {
                    パスワードは6文字以上で入力してください
                  }
                </div>
              }
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                routerLink="/users"
              >
                キャンセル
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="userForm.invalid || saving()"
              >
                @if (saving()) {
                  <span>保存中...</span>
                } @else {
                  <span>{{ isEditMode() ? '更新' : '作成' }}</span>
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
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEditMode = signal(false);
  userId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  userForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    password: ['', [Validators.minLength(6)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(+id);
      this.loadUser(+id);
      // 編集モードではパスワードは任意
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      // 新規作成モードではパスワードは必須
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(id: number): void {
    this.loading.set(true);
    this.usersService.getUser(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('ユーザーの読み込みに失敗しました');
        this.loading.set(false);
        console.error('Error loading user:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const formValue = this.userForm.value;
    const userData: any = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName
    };

    // パスワードが入力されている場合のみ含める
    if (formValue.password) {
      userData.password = formValue.password;
    }

    const request = this.isEditMode()
      ? this.usersService.updateUser(this.userId()!, userData)
      : this.usersService.createUser(userData);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.error?.message ||
          `ユーザーの${this.isEditMode() ? '更新' : '作成'}に失敗しました`
        );
        console.error('Error saving user:', err);
      }
    });
  }
}
