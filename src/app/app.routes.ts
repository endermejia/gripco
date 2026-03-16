import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AuthComponent } from './pages/auth/auth';
import { AdminComponent } from './pages/admin/admin';
import { OrdersComponent } from './pages/orders/orders';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
