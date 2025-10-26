import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-loading',
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class]="'loading-' + size()">
      <div class="spinner"></div>
      @if (message()) {
        <p class="loading-message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 20px;
    }

    .spinner {
      border-radius: 50%;
      border-style: solid;
      border-color: #4CAF50;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }

    .loading-sm .spinner {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .loading-md .spinner {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }

    .loading-lg .spinner {
      width: 60px;
      height: 60px;
      border-width: 4px;
    }

    .loading-message {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
  size = input<LoadingSize>('md');
  message = input<string>('');
}
