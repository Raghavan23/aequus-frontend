import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** Reactive signal so the layout/header can react to the logged-in user. */
  readonly currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private storage: StorageService) {
    this.currentUser.set(this.readStoredUser());
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((response) => this.persistSession(response)));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout(): void {
    this.storage.clear();
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.storage.getToken();
  }

  private persistSession(response: AuthResponse): void {
    this.storage.setToken(response.token);
    this.storage.setUserRaw(JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private readStoredUser(): User | null {
    const raw = this.storage.getUserRaw();
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
