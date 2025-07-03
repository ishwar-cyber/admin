import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageHandler {

   setSessionStorage(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getSessionStorage<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeSessionStorage(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Cookies
  setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, val] = cookie.split('=');
      if (key === name) {
        return val;
      }
    }
    return null;
  }

  deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }
}
