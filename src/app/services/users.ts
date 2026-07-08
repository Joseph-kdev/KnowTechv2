import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { switchMap, filter, first } from 'rxjs';
import { AuthService } from './authService';

@Service()
export class Users {
  private readonly serverUrl = "http://localhost:8000/api/";
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
        return this.http.post(`${this.serverUrl}users`, {
          user_id,
          email,
        });
      }),
    );
  }
}
