import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Customer } from '../models/order';
import { ApiResponse } from '../models/response';
import { CustomerApiResponse, CustomerQueryParams } from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.BASE_URL}/customers`;

  // State with Signals
  private _customers = signal<Customer[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _totalItems = signal(0);

  // Public signals (readonly)
  customers = this._customers.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  totalItems = this._totalItems.asReadonly();

  /**
   * Get all customers with optional filtering
   */
  getCustomers(params?: CustomerQueryParams): Observable<CustomerApiResponse> {
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
    if (params?.dateFrom) {
      httpParams = httpParams.set('dateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      httpParams = httpParams.set('dateTo', params.dateTo);
    }

    return this.httpClient.get<CustomerApiResponse>(this.baseUrl, { params: httpParams }).pipe(
      tap((response: any) => {
        this._customers.set(response.data);
        this._totalItems.set(response.total);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set(error.message || 'Failed to load customers');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    return this.httpClient.get(`${this.baseUrl}/${id}`).pipe(
      tap(() => this._loading.set(false)),
      catchError(error => {
        this._loading.set(false);
        this._error.set(error.message || 'Failed to load customer');
        return throwError(() => error);
      })
    );
  }

  /**
   * Reset state
   */
  resetState() {
    this._customers.set([]);
    this._error.set(null);
    this._totalItems.set(0);
  }
}
