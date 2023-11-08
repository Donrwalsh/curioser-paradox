import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

export interface User {
  username: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  tryItOut() {
    return this.http
      .get(`${environment.apiHost}/comics/admin/all`)
      .pipe(map((res) => res));
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResult>(`${environment.apiHost}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((data: AuthResult) => this.setSession(data)),
        shareReplay()
      );
  }

  refresh(token: string) {
    return this.http
      .post<AuthResult>(`${environment.apiHost}/auth/refresh`, {
        refreshToken: token,
      })
      .pipe(tap((data: AuthResult) => this.setSession(data)));
  }

  setSession(authResult: AuthResult) {
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('refresh_token', authResult.refreshToken);
  }

  logout() {
    return this.http.get<any>(`${environment.apiHost}/auth/logout`, {});
  }
}
