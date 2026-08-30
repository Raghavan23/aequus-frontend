import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'financial-records',
        loadComponent: () =>
          import('./pages/financial-records/financial-records.component').then(
            (m) => m.FinancialRecordsComponent
          )
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent)
  },
  { path: '**', redirectTo: 'home' }
];
