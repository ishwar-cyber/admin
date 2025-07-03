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
    const storedUser:any = this.storageHandler.getCookie(StorageKeys.currentUser);
    if (storedUser) {
      this.currentUser.set(storedUser);
    }
  }

  isAuthenticated(): boolean {
    this.loadUser();
    return !!this.currentUser();
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
