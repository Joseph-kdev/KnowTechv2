import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from './authService';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getIdToken']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });
  });

  it('adds the authorization header when a token is available', () => {
    authService.getIdToken.and.returnValue(Promise.resolve('token-123'));

    const req = new HttpRequest('GET', 'https://example.com/data');
    const next: HttpHandlerFn = (request) => {
      expect(request.headers.get('Authorization')).toBe('Bearer token-123');
      return of(new HttpResponse({ status: 200, body: { ok: true } }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe();
    });
  });
});
