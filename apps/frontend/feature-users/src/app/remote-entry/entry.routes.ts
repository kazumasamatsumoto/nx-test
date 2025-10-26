import { Route } from '@angular/router';
import { UserListComponent } from '../pages/user-list/user-list.component';
import { UserFormComponent } from '../pages/user-form/user-form.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: UserListComponent,
  },
  {
    path: 'create',
    component: UserFormComponent,
  },
  {
    path: ':id/edit',
    component: UserFormComponent,
  },
];
