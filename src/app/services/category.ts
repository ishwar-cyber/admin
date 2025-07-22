import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class CategoryS {

  private readonly httpClient = inject(HttpClient);
    private readonly baseUrl = `${environment.BASE_URL}/category`;
  
    /**
     * Get all categories
     * @returns Observable of Category array
     */
    public getCategories(): Observable<ApiResponse[]> {
      return this.httpClient.get<ApiResponse[]>(this.baseUrl);
    }
  
    /**
     * Get a single category by ID
     * @param id Category ID
     * @returns Observable of Category
     */
    public getCategoryById(id: string, payload: any, selectedFile: any): Observable<Response> {
      console.log('payload', payload);
      console.log('selectedFile', selectedFile);
      
      const formData = this.createPayload(payload, selectedFile);
      return this.httpClient.put<Response>(`${this.baseUrl}/${id}`, formData);
    }
  
    /**
     * Create a new category
     * @param payload Category data
     * @returns Observable of created Category
     */
    public createCategory(payload: any, selectedFile: any): Observable<Response> {   
      const formData = this.createPayload(payload, selectedFile);
      return this.httpClient.post<Response>(this.baseUrl, formData);
    }
  
    public createPayload(payload: any, selectedFile: any): FormData {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('serviceCharges', payload.serviceCharges);
      formData.append('status', payload.status);
      if (selectedFile) {
        formData.append('image', selectedFile[0]);
      }
      return formData;
    } 
    /**
     * Update an existing category
     * @param id Category ID
     * @param payload Updated category data
     * @returns Observable of updated Category
     */
    public updateCategory(id: string, payload: Partial<Response>): Observable<Response> {
      return this.httpClient.put<Response>(`${this.baseUrl}/${id}`, payload);
    }
  
    /**
     * Delete a category
     * @param id Category ID
     * @returns Observable of deletion result
     */
    public deleteCategory(id: string): Observable<void> {
      return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
  
    /**
     * Search categories by name
     * @param query Search query
     * @returns Observable of matching Categories
     */
    public searchCategories(query: string): Observable<Response[]> {
      return this.httpClient.get<Response[]>(`${this.baseUrl}/search`, {
        params: { q: query }
      });
    }
}
