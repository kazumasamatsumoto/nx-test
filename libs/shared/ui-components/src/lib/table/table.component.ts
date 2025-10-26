import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface TableAction<T = any> {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  handler: (row: T) => void;
}

@Component({
  selector: 'ui-table',
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th [style.width]="column.width || 'auto'">
                @if (column.sortable) {
                  <button
                    class="sort-button"
                    (click)="handleSort(column.key)"
                  >
                    {{ column.label }}
                    @if (sortKey() === column.key) {
                      <span class="sort-icon">
                        {{ sortDirection() === 'asc' ? '↑' : '↓' }}
                      </span>
                    }
                  </button>
                } @else {
                  {{ column.label }}
                }
              </th>
            }
            @if (actions() && actions()!.length > 0) {
              <th class="actions-column">操作</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data(); track trackBy(row)) {
            <tr>
              @for (column of columns(); track column.key) {
                <td>{{ getColumnValue(row, column.key) }}</td>
              }
              @if (actions() && actions()!.length > 0) {
                <td class="actions-cell">
                  @for (action of actions(); track action.label) {
                    <button
                      class="action-btn"
                      [class.btn-primary]="action.variant === 'primary'"
                      [class.btn-secondary]="action.variant === 'secondary' || !action.variant"
                      [class.btn-danger]="action.variant === 'danger'"
                      (click)="action.handler(row)"
                    >
                      {{ action.label }}
                    </button>
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length + (actions()?.length ? 1 : 0)" class="empty-message">
                {{ emptyMessage() }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th,
    .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #555;
    }

    .table tbody tr:hover {
      background-color: #f9f9f9;
    }

    .sort-button {
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      color: #555;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0;
    }

    .sort-button:hover {
      color: #333;
    }

    .sort-icon {
      font-size: 12px;
    }

    .actions-column {
      width: 150px;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s;
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

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .empty-message {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  `]
})
export class TableComponent<T = any> {
  columns = input.required<TableColumn[]>();
  data = input.required<T[]>();
  actions = input<TableAction<T>[]>();
  emptyMessage = input<string>('データが見つかりませんでした');
  sortKey = input<string>('');
  sortDirection = input<'asc' | 'desc'>('asc');

  sorted = output<{ key: string; direction: 'asc' | 'desc' }>();

  handleSort(key: string) {
    const newDirection =
      this.sortKey() === key && this.sortDirection() === 'asc'
        ? 'desc'
        : 'asc';
    this.sorted.emit({ key, direction: newDirection });
  }

  getColumnValue(row: T, key: string): any {
    return (row as any)[key];
  }

  trackBy(row: T): any {
    return (row as any)['id'] || row;
  }
}
