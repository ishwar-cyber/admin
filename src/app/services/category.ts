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
      const formData = this.createPayload(payload);
      return this.httpClient.put<Response>(`${this.baseUrl}/${id}`, formData);
    }
  
    /**
     * Create a new category
     * @param payload Category data
     * @returns Observable of created Category
     */
    public createCategory(payload: any): Observable<Response> {   
      const formData = this.createPayload(payload);
      return this.httpClient.post<Response>(this.baseUrl, formData);
    }
  
    public createPayload(payload: any): FormData {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('isActive', payload.isActive);
      console.log('payload', payload);
      
      if (payload.image) {
        formData.append('images[0][url]',  payload.image[0]?.url ?? payload.image);
        formData.append('images[0][public_id]',  payload.image[0]?.public_id ?? payload.image[0]?.publicId);
      }
      return formData;
    } 
    /**
     * Update an existing category
     * @param id Category ID
     * @param payload Updated category data
     * @returns Observable of updated Category
     */
    public updateCategory(id: string, payload: any): Observable<Response> {
      const formData = this.createPayload(payload);
      return this.httpClient.put<Response>(`${environment.BASE_URL}/category/${id}`, formData);
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
        params: { query: query }
      });
    }
}
