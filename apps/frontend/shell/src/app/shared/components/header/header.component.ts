import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo">
          <a routerLink="/">Nx Microservices</a>
        </div>

        @if (authService.isAuthenticated()) {
          <nav class="nav">
            <a routerLink="/users" routerLinkActive="active">ユーザー管理</a>
            <a routerLink="/products" routerLinkActive="active">商品管理</a>
          </nav>

          <div class="user-menu">
            <span class="user-name">{{ authService.currentUser()?.username }}</span>
            <button class="btn-logout" (click)="logout()">ログアウト</button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }

    .logo a {
      font-size: 20px;
      font-weight: bold;
      color: white;
      text-decoration: none;
    }

    .nav {
      display: flex;
      gap: 20px;
      flex: 1;
      justify-content: center;
    }

    .nav a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .nav a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-name {
      font-size: 14px;
    }

    .btn-logout {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .btn-logout:hover {
      background-color: #c0392b;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
