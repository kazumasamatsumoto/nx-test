import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="layout">
      <app-header />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      background-color: #f5f5f5;
      padding: 20px;
    }
  `]
})
export class MainLayoutComponent {}
