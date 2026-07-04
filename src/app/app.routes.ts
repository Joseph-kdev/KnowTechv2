import { CanActivateFn, Router, Routes, UrlTree } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { inject } from '@angular/core';
import { AuthService } from './services/authService';

const AuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = auth.isAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['login']);
};

const PublicAuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = auth.isAuthenticated();

  if (isAuthenticated) {
    return router.createUrlTree(['']);
  }

  return true;
};

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },

      {
        path: 'posts',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'bookmarks',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'add',
        loadComponent: () => import('./features/addfeeds/addfeeds').then((m) => m.Addfeeds),
      },
    ],
  },

  {
    path: 'login',
    component: AuthLayout,
    canActivate: [PublicAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
    ],
  },
  {
    path: 'register',
    component: AuthLayout,
    canActivate: [PublicAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
      },
    ],
  },
];
