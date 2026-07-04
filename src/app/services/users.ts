import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { AuthService } from './authService';

@Service()
export class Users {
  private readonly serverUrl = "http://localhost:8000/api/"
  readonly http = inject(HttpClient)
  readonly auth = inject(AuthService)

  createUser() {
    let user = this.auth._user()
    if (!user) {
      throw new Error("User was undefined")
    }

    return this.http.post(`${this.serverUrl}users`, {
      email: user.email,
    })
  }
}
