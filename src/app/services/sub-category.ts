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
    const formData = this.createPayload(payload, file);
    return this.httpClient.post(this.url, formData);
  }
  updateSubCategory(id: number, payload: any, file: File[]) {
    const formData = this.createPayload(payload, file);
    return this.httpClient.put(`${this.url}/${id}`, formData);
  }
  deleteSubCategory(id: string) {
    return this.httpClient.delete(`${this.url}/${id}`);
  }
  getSubCategoryByCategoryId(id: number) {
    return this.httpClient.get(`${this.url}/category/${id}`);
  }

  createPayload(payload: any, selectedFile: File[]): FormData {
    console.log('Creating payload with:', payload, selectedFile);
    
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('category', payload.category);
    formData.append('serviceCharges', payload.serviceCharges);
    formData.append('isActive', payload.isActive);
    if (selectedFile) {
      formData.append('image', selectedFile[0]);
    }
    return formData;
  }
}
