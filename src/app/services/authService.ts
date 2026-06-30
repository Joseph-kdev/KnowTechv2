import { computed, inject, Service, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';
import { from } from 'rxjs';

@Service()
export class AuthService {
  private readonly auth = inject(Auth);

  readonly _user = toSignal(authState(this.auth), {
    initialValue: null,
  });

  readonly isAuthenticated = computed(() => this._user() !== null);

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    return from(signOut(this.auth));
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;

    if (!user) {
      return null;
    }

    return user.getIdToken();
  }
}
