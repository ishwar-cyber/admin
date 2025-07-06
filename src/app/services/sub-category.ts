import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryS {

  private httpClient = inject(HttpClient);
  url  = `${environment.BASE_URL}/subcategory`;
  constructor() { }

  getSubCategories() {
    return this.httpClient.get(this.url);
  }
  getSubCategoryById(id: number) {
    return this.httpClient.get(`${this.url}/${id}`);
  }
  addSubCategory(payload: any, file: any) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('category', payload.category);
    formData.append('status', payload.status);

    return this.httpClient.post(this.url, formData);
  }
  updateSubCategory(id: number, payload: any) {
    return this.httpClient.put(`${this.url}/${id}`, payload);
  }
  deleteSubCategory(id: number) {
    return this.httpClient.delete(`${this.url}/${id}`);
  }
  getSubCategoryByCategoryId(id: number) {
    return this.httpClient.get(`${this.url}/category/${id}`);
  }
}
