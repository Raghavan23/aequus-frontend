import { Injectable } from '@angular/core';

const TOKEN_KEY = 'finz_token';
const USER_KEY = 'finz_user';

/**
 * Thin wrapper around localStorage so components/services never touch the
 * browser storage API directly.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getUserRaw(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  setUserRaw(userJson: string): void {
    localStorage.setItem(USER_KEY, userJson);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
