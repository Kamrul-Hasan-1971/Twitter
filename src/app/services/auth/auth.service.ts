// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'jwtToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private router: Router){}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const tokenExpirationDate = this.getTokenExpirationDate(token);
    if (!tokenExpirationDate) {
      return false;
    }

    return tokenExpirationDate <= new Date();
  }

  private getTokenExpirationDate(token: string): Date | null {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      if (decodedToken && decodedToken.exp) {
        return new Date(decodedToken.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['auth/login']);
  }
}
