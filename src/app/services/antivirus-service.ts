import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AntivirusService {

 private http = inject(HttpClient);
 apiUrl = `${environment.BASE_URL}/antivirus`;

  addKeys(productId: string, keys: string[]) {
    return this.http.post(`${this.apiUrl}/add/${productId}`, { keys });
  }

  deleteKey(keyId: string) {
    return this.http.delete(`${this.apiUrl}/keys/${keyId}`);
  }

  getKeys(productId: string, page: number, limit: number, status?: string) {
    let q = `?page=${page}&limit=${limit}`;
    if (status) q += `&status=${status}`;

    return this.http.get(`/api/products/${productId}/keys${q}`);
  }
}
