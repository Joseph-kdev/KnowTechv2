import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { inject } from '@angular/core';
import { AuthService } from './services/authService';

const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login'])
}

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
        loadComponent: () => import('./features/posts/posts').then((m) => m.Posts),
      },

      {
        path: 'bookmarks',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
    ],
  },

  {
    path: 'login',
    component: AuthLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
    ],
  },
];
