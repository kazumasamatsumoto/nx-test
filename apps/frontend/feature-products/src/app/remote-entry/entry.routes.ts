import { Route } from '@angular/router';
import { ProductListComponent } from '../pages/product-list/product-list.component';
import { ProductFormComponent } from '../pages/product-form/product-form.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: 'create',
    component: ProductFormComponent,
  },
  {
    path: ':id/edit',
    component: ProductFormComponent,
  },
];
