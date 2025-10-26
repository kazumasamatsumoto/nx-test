import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  imports: [CommonModule],
  template: `
    <div class="card" [class.has-header]="title()">
      @if (title()) {
        <div class="card-header">
          <h3 class="card-title">{{ title() }}</h3>
          @if (subtitle()) {
            <p class="card-subtitle">{{ subtitle() }}</p>
          }
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (hasFooter) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .card-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .card-subtitle {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #666;
    }

    .card-body {
      padding: 20px;
    }

    .card.has-header .card-body {
      padding-top: 16px;
    }

    .card-footer {
      padding: 16px 20px;
      border-top: 1px solid #eee;
      background-color: #f9f9f9;
    }
  `]
})
export class CardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  hasFooter = input<boolean>(false);
}
