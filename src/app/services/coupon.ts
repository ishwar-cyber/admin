import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class Coupon {

  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/coupons`;

  // Create a new coupon
  createCoupon(coupon: Coupon): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(this.apiUrl, coupon)
  }

  // Get all coupons
  getAllCoupons(): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(this.apiUrl)

  }

  // Get coupon by ID
  getCouponById(id: string): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(`${this.apiUrl}/${id}`)
    
  }

  // Update coupon
  updateCoupon(id: string, coupon: Partial<Coupon>): Observable<ApiResponse> {
    return this.httpClient.patch<ApiResponse>(`${this.apiUrl}/${id}`, coupon)
   
  }

  // Delete coupon
  deleteCoupon(id: string): Observable<ApiResponse> {
    return this.httpClient.delete<ApiResponse>(`${this.apiUrl}/${id}`)

  }

  // Validate coupon code
  validateCoupon(code: string): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(`${this.apiUrl}/validate/${code}`)
    
  }

}
