import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Brand } from '../components/brand/brand';
import { Category } from '../components/category/category';
import { Product } from '../components/product/product';
import { ProductQueryParams, ProductApiResponse } from '../models/product';
import { Brands } from '../models/brand';
import { CategoryM } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class ProductS {

   private httpClient = inject(HttpClient);
  constructor() { }
  public getProductList(page: number, pageSize: number) {
    const url = `${environment.BASE_URL}/products?page=${page}&pageSize=${pageSize}`;
    return this.httpClient.get(url);
  }
  

  private http = inject(HttpClient);
  // State with Signals
  private _products = signal<Product[]>([]);
  private _brands = signal<Brands[]>([]);
  private _categories = signal<CategoryM[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _totalItems = signal(0);

  // Public signals (readonly)
  products = this._products.asReadonly();
  brands = this._brands.asReadonly();
  categories = this._categories.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  totalItems = this._totalItems.asReadonly();

  // Cache frequently accessed data
  private brandsCache = new Map<string, Brand>();
  private categoriesCache = new Map<string, Category>();

  /**
   * Fetch products with optional query parameters
   */
getProducts(params?: ProductQueryParams): Observable<ProductApiResponse> {
    this._loading.set(true);
    this._error.set(null);

    // Set default values if not provided
    const queryParams: ProductQueryParams = {
      page: params?.page ,
      limit: params?.limit,
      sortBy: params?.sortBy ,
      sortOrder: params?.sortOrder,
      ...params
    };

    // Build HTTP params dynamically
    let httpParams = new HttpParams()
      .set('page',queryParams.page || '')
      .set('limit', queryParams.limit || 10)
      .set('sortBy', queryParams.sortBy || 'createdAt')
      .set('sortOrder', queryParams.sortOrder  || 'desc');

    // Add optional parameters if they exist
    if (queryParams.search) {
      httpParams = httpParams.set('search', queryParams.search);
    }
    if (queryParams.category) {
      httpParams = httpParams.set('category', queryParams.category);
    }
    if (queryParams.brand) {
      httpParams = httpParams.set('brand', queryParams.brand);
    }
    if (queryParams.status) {
      httpParams = httpParams.set('status', queryParams.status);
    }
    // if (queryParams.minPrice) {
    //   httpParams = httpParams.set('minPrice', queryParams.minPrice.toString());
    // }
    // if (queryParams.maxPrice) {
    //   httpParams = httpParams.set('maxPrice', queryParams.maxPrice.toString());
    // }

    return this.http.get<ProductApiResponse>(`${environment.BASE_URL}/products`, { params: httpParams });
  }

  /**
   * Reset all filters and reload products with default parameters
   */
  resetFilters(): void {
    this.getProducts({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }).subscribe();
  }

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Observable<Product | null> {
    this._loading.set(true);
    return this.http.get<Product>(`${environment.BASE_URL}/products/${id}`).pipe(
      tap(() => this._loading.set(false)),
      catchError(error => {
        this._error.set(`Failed to load product ${id}`);
        this._loading.set(false);
        return of(null);
      })
    );
  }

  public createProduct(payload: any, thumbnail?: File[], variantsImages?: File[]) {
   const formData = this.createFormData(payload, thumbnail, variantsImages);
    const url = `${environment.BASE_URL}/products`;
    return this.httpClient.post(url, formData);
  }

  public updateProduct(id: string, payload: any, thumbnail?: File, variantsImages?: File[]) {
    const formData = this.createFormData(payload, thumbnail ? [thumbnail] : undefined, variantsImages);
    const url = `${environment.BASE_URL}/products/${id}`;
    return this.httpClient.put(url, formData);
  }
  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${environment.BASE_URL}/products/${id}`).pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  resetState() {
    this._products.set([]);
    this._brands.set([]);
    this._categories.set([]);
    this._error.set(null);
    this._totalItems.set(0);
  }

  private createFormData(payload: any, thumbnail?: File[], variantsImages?: File[] ): FormData {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('model', payload.model);
    formData.append('status', payload.status);
    formData.append('brand', payload.brand);
    formData.append('subCategory', payload.subCategory);
    formData.append('description', payload.description);
    formData.append('price', payload.price);
    formData.append('stock', payload.stock);
    formData.append('width', payload.width);
    formData.append('height', payload.height);
    formData.append('length', payload.length);
    formData.append('weight', payload.weight || null);
    
    if (payload.discount) {
      formData.append('discount', payload.discount.toString());
    }

    if (thumbnail && Array.isArray(thumbnail)) {
      thumbnail.forEach((file, index) => {
        formData.append('thumbnail', file);
      });
    }
     // Handle optional discount field
     if (payload.discount) {
      formData.append('discount', payload.discount.toString());
    }

    if(payload.category) {
      payload.category.forEach((category: any, index: number) => {
        formData.append(`category[${index}]`, category || '');
      });
    }
    if(payload.pincode){
       payload.pincode.forEach((pincode: any, index: number) => {
        formData.append(`pincode[${index}]`, pincode || '');
      });
    }
    // Handle specifications array
    if (payload.specifications && payload.specifications.length > 0) {
      // Append each specification as separate form data entries
      payload.specifications.forEach((spec: any, index: number) => {
        formData.append(`specifications[${index}][name]`, spec.name);
        formData.append(`specifications[${index}][value]`, spec.value);
      });
    }
       // Handle specifications array
    if (payload.offerPrice && payload.offerPrice.length > 0) {
      // Append each specification as separate form data entries
      payload.offerPrice.forEach((item: any, index: number) => {
        formData.append(`offerPrice[${index}][quantity]`, item.quantity);
        formData.append(`offerPrice[${index}][price]`, item.price);
      });
    }

    // Handle warranty object
    if (payload.warranty) {
      formData.append('warranty[period]', payload.warranty.period?.toString() || '');
      formData.append('warranty[type]', payload.warranty.type || '');
      formData.append('warranty[details]', payload.warranty.details || '');
    }

    // Handle variants array if exists
    if (payload.variants && payload.variants.length > 0) {
      payload.variants.forEach((variant: any, index: number) => {
        formData.append(`variants[${index}][variantName]`, variant.variantName || '');
        formData.append(`variants[${index}][sku]`, variant.sku || '');
        formData.append(`variants[${index}][price]`, variant.price?.toString() || '');
        formData.append(`variants[${index}][stock]`, variant.stock?.toString() || '');
        // Handle variant image if exists
        if (variantsImages && variantsImages[index]) {
          formData.append(`variants[${index}][variantImage]`, variantsImages[index]);
        }
      });
    }
    return formData;
  }

}
