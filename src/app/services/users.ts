import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { switchMap, filter, first } from 'rxjs';
import { AuthService } from './authService';
import { serverUrl } from '../utils/utils';

@Service()
export class Users {
  readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);

  createUser() {
    return this.auth.user$.pipe(
      filter((user): user is Exclude<typeof user, null> => user !== null),
      first(),
      switchMap((user) => {
        const email = user.email;
        if (!email) {
          throw new Error('Authenticated user has no email');
        }
        const user_id = user.uid
        return this.http.post(`${serverUrl}users`, {
          user_id,
          email,
        });
      }),
    );
  }
}
