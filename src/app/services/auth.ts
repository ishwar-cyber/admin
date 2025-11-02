import { inject, Injectable, signal } from '@angular/core';
import { Login, LoginResponse, User } from '../models/login';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageHandler } from './storage-handler';
import { CookiesKeys, StorageKeys } from '../common/commonConstant';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  currentUser = signal<User>({});
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private storageHandler = inject(StorageHandler)

  constructor() {
    this.loadUser();
  }

  private loadUser() {
    // Try to read current user from session sto      rage (set at login)
    const storedUser: any = this.storageHandler.getSessionStorage(StorageKeys.currentUser);
    // storedUser may already be an object or a JSON string depending on StorageHandler implementation
    if (storedUser) {
      this.currentUser.set(storedUser as User);
    }
  }

  isAuthenticated(): boolean {
    this.loadUser();
    return !!this.currentUser();
  }

  /**
   * Return the current user object (or null)
   */
  public getCurrentUser(): User | null {
    // ensure we have latest from session
    this.loadUser();
    return this.currentUser() || null;
  }

  public login(payload: Login) {
    return this.httpClient.post<LoginResponse>(`${environment.BASE_URL}/auth/sign-in`, payload);
  }

  logout(): void {
    this.storageHandler.removeSessionStorage('currentUser');
    this.storageHandler.deleteCookie(CookiesKeys.authToken);
    this.router.navigate(['/login']);
  }
}
