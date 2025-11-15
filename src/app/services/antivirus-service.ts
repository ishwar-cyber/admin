import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AntivirusService {

 private http = inject(HttpClient);

  addKeys(productId: string, keys: string[]) {
    return this.http.post(`/api/products/${productId}/keys/add`, { keys });
  }

  deleteKey(keyId: string) {
    return this.http.delete(`/api/keys/${keyId}`);
  }

  getKeys(productId: string, page: number, limit: number, status?: string) {
    let q = `?page=${page}&limit=${limit}`;
    if (status) q += `&status=${status}`;

    return this.http.get(`/api/products/${productId}/keys${q}`);
  }
}
