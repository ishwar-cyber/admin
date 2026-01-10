import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryS {

  private httpClient = inject(HttpClient);
  url  = `${environment.BASE_URL}/subcategory`;
  constructor() { }

  getSubCategories(options?: { page?: number; pageSize?: number; search?: string; sortField?: string; sortDir?: string }) {
    let params = new HttpParams();
    if (options) {
      if (options.page != null) params = params.set('page', String(options.page));
      if (options.pageSize != null) params = params.set('pageSize', String(options.pageSize));
      if (options.search) params = params.set('search', options.search);
      if (options.sortField) params = params.set('sortField', options.sortField);
      if (options.sortDir) params = params.set('sortDir', options.sortDir);
    }
    return this.httpClient.get(this.url, { params });
  }
  getSubCategoryById(id: number) {
    return this.httpClient.get(`${this.url}/${id}`);
  }
  addSubCategory(payload: any) {
    const formData = this.createPayload(payload);
    return this.httpClient.post(this.url, formData);
  }
  updateSubCategory(id: number, payload: any) {
    const formData = this.createPayload(payload);
    return this.httpClient.put(`${this.url}/${id}`, formData);
  }
  deleteSubCategory(id: string) {
    return this.httpClient.delete(`${this.url}/${id}`);
  }
  getSubCategoryByCategoryId(id: number) {
    return this.httpClient.get(`${this.url}/category/${id}`);
  }

  createPayload(payload: any): FormData {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('category', payload.category);
    formData.append('serviceCharges', payload.serviceCharges);
    formData.append('isActive', payload.isActive);
    return formData;
  }

  getSubcategoryByCategory(id:string){
     return this.httpClient.get(`${this.url}/by-category/${id}`);
  }
}
