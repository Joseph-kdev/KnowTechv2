import { CanActivateFn, Router, Routes, UrlTree } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { inject } from '@angular/core';
import { AuthService } from './services/authService';
import { map, take } from 'rxjs';

const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }

      return router.createUrlTree(['login']);
    })
  );
};

const PublicAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return router.createUrlTree(['']);
      }

      return true;
    })
  );
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
        loadComponent: () => import('./features/posts/posts').then((m) => m.Posts),
      },
      {
        path: 'bookmarks',
        loadComponent: () => import('./features/bookmarks/bookmarks').then((m) => m.Bookmarks),
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
