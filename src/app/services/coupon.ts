import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/response';
import { CouponseM } from '../models/couponse';

@Injectable({
  providedIn: 'root'
})
export class Coupon {

  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/coupons`;
  public applyToOptions = signal([
    { id: 'all', name: 'All Products' },
    { id: 'products', name: 'Specific Product' },
    { id: 'cartegories', name: 'Specific Category'}
  ]);

  public dicountTypeOptions = signal([
    { id: 'percentage', name: 'Percentage', icon: 'currency-rupee' },
    { id: 'rupees', name: 'Rupees', icon: 'percent' },
    { id: 'freeShipping', name: 'Free Shipping', icon:'gift' },
    { id: 'buyOneGetOne', name: 'Buy One Get One', icon:'truck' }
  ]);
  // Create a new coupon
  createCoupon(coupon: CouponseM): Observable<ApiResponse> {
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
    return this.httpClient.delete<ApiResponse>(`${this.apiUrl}/delete/${id}`);
  }

  // Validate coupon code
  validateCoupon(code: string): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(`${this.apiUrl}/validate/${code}`)
    
  }

}
