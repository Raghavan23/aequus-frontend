import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { rootGuard } from './guards/root.guard';

export const routes: Routes = [
  // Landing Page
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootGuard],
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent)
  },
  {
    path: 'overview',
    canActivate: [rootGuard],
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent)
  },

  // Authenticated Application Shell
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
        path: 'reconciliation',
        loadComponent: () =>
          import('./pages/reconciliation/reconciliation.component').then(
            (m) => m.ReconciliationComponent
          )
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/clients/clients.component').then((m) => m.ClientsComponent)
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./pages/invoices/invoices.component').then((m) => m.InvoicesComponent)
      },
      // Backward compatibility redirects
      {
        path: 'accounts',
        redirectTo: 'clients',
        pathMatch: 'full'
      },
      {
        path: 'financial-records',
        redirectTo: 'reconciliation',
        pathMatch: 'full'
      }
    ]
  },

  // Auth Pages
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent)
  },

  // Wildcard Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
