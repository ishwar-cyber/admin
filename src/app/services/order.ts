import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Order, OrderApiResponse, OrderQueryParams } from '../models/order';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.BASE_URL}/order`;

  // State with Signals
  private _orders = signal<Order[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _totalItems = signal(0);

  // Public signals (readonly)
  orders = this._orders.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  totalItems = this._totalItems.asReadonly();

  // Delivery status options
  deliveryStatusOptions = signal([
    { value: 'pending', label: 'Pending', icon: 'clock', color: 'warning' },
    { value: 'in_transit', label: 'In Transit', icon: 'truck', color: 'info' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: 'box-seam', color: 'primary' },
    { value: 'delivered', label: 'Delivered', icon: 'check-circle', color: 'success' },
    { value: 'failed', label: 'Failed', icon: 'x-circle', color: 'danger' }
  ]);

  // Order status options
  orderStatusOptions = signal([
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'processing', label: 'Processing', color: 'primary' },
    { value: 'shipped', label: 'Shipped', color: 'info' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'danger' }
  ]);

  // Payment status options
  paymentStatusOptions = signal([
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'paid', label: 'Paid', color: 'success' },
    { value: 'failed', label: 'Failed', color: 'danger' },
    { value: 'refunded', label: 'Refunded', color: 'secondary' }
  ]);

  /**
   * Get all orders with optional filtering
   */
  getOrders(params?: OrderQueryParams): Observable<OrderApiResponse> {
    this._loading.set(true);
    this._error.set(null);

    let httpParams = new HttpParams()
      .set('page', params?.page?.toString() || '1')
      .set('limit', params?.limit?.toString() || '10')
      .set('sortBy', params?.sortBy || 'createdAt')
      .set('sortOrder', params?.sortOrder || 'desc');

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.deliveryStatus) {
      httpParams = httpParams.set('deliveryStatus', params.deliveryStatus);
    }
    if (params?.paymentStatus) {
      httpParams = httpParams.set('paymentStatus', params.paymentStatus);
    }
    if (params?.dateFrom) {
      httpParams = httpParams.set('dateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      httpParams = httpParams.set('dateTo', params.dateTo);
    }
    return this.httpClient.get<OrderApiResponse>(`${environment.BASE_URL}/order`, { params: httpParams });
  }

  /**
   * Update order status
  */
updateOrderStatus(id: string, status: string): Observable<ApiResponse> {
  const params = new HttpParams().set('status', status);

  return this.httpClient.put<ApiResponse>(
    `${this.baseUrl}/${id}`,
    {}, // empty body
    { params }
  );
}
/**
 * Create a new order
 */
createOrder(orderData: any): Observable<OrderApiResponse> {
  this._loading.set(true);
  this._error.set(null);

  // Validate required fields
  if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
    this._loading.set(false);
    this._error.set('Customer ID and at least one order item are required');
    return throwError(() => new Error('Validation failed'));
  }

  // Calculate totals if not provided
  if (!orderData.subTotal || !orderData.taxAmount || !orderData.totalAmount) {
    orderData.subTotal = orderData.items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0);
    orderData.taxAmount = orderData.subTotal * 0.18; // Assuming 18% tax
    orderData.totalAmount = orderData.subTotal + orderData.taxAmount;
  }

  // Set default status if not provided
  if (!orderData.status) {
    orderData.status = 'pending';
  }

  return this.httpClient.post<OrderApiResponse>(`${this.baseUrl}`, orderData).pipe(
    tap((response: any) => {
      // Update local state with the new order
      if (response.success && response.data) {
        this._orders.update(orders => [response.data!, ...orders]);
        this._totalItems.update(count => count + 1);
      }
      this._loading.set(false);
    }),
    catchError(error => {
      this._loading.set(false);
      this._error.set(error.message || 'Failed to create order');
      return throwError(() => error);
    })
  );
}
  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(`${environment.BASE_URL}/order/${id}`);
  }


  /**
   * Update delivery status
   */
  updateDeliveryStatus(id: string, deliveryStatus: string, trackingNumber?: string): Observable<ApiResponse> {
    let payload: any;
    if (trackingNumber) {
      payload.trackingNumber = trackingNumber;
    }
    return this.httpClient.patch<ApiResponse>(`${this.baseUrl}/${id}/status=${deliveryStatus}`, payload);
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(id: string, paymentStatus: string): Observable<ApiResponse> {
    return this.httpClient.patch<ApiResponse>(`${this.baseUrl}/${id}/payment`, { paymentStatus });
  }

  /**
   * Delete order
   */
  deleteOrder(id: string): Observable<ApiResponse> {
    return this.httpClient.delete<ApiResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get order statistics
   */
  getOrderStats(): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(`${this.baseUrl}/stats`);
  }

  /**
   * Reset state
   */
  resetState() {
    this._orders.set([]);
    this._error.set(null);
    this._totalItems.set(0);
  }
}
