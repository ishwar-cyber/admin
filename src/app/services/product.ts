import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Brand } from '../components/brand/brand';
import { Category } from '../components/category/category';
import { Product } from '../components/product/product';
import { ProductQueryParams, ProductApiResponse } from '../models/product';
import { BrandM } from '../models/brand';
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
  private _brands = signal<BrandM[]>([]);
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
    if (queryParams.minPrice) {
      httpParams = httpParams.set('minPrice', queryParams.minPrice.toString());
    }
    if (queryParams.maxPrice) {
      httpParams = httpParams.set('maxPrice', queryParams.maxPrice.toString());
    }

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

  public createProduct(payload: any, image?: File[]) {
   const formData = this.createFormData(payload);
    const url = `${environment.BASE_URL}/products`;
    return this.httpClient.post(url, formData);
  }

  public updateProduct(id: string, payload: any) {
  const formData = this.createFormData(payload);
  const url = `${environment.BASE_URL}/products/${id}`;

  // ✅ Use PATCH instead of PUT
  return this.httpClient.patch(url, formData);
}

  deleteProduct(id: string){
    const url = `${environment.BASE_URL}/products/${id}`;
    return this.httpClient.delete(url);
  }

  resetState() {
    this._products.set([]);
    this._brands.set([]);
    this._categories.set([]);
    this._error.set(null);
    this._totalItems.set(0);
  }

private createFormData(payload: any): FormData {
  const formData = new FormData();

  /*---------- BASIC ---------- */
  formData.append('name', payload.name);
  formData.append('sku', payload.model);
  formData.append('status', String(payload.status));
  formData.append('price', String(payload.price));
  formData.append('stock', String(payload.stock));
  formData.append('width', String(payload.width));
  formData.append('height', String(payload.height));
  formData.append('length', String(payload.length));
  formData.append('weight', String(payload.weight || 0));
  formData.append('description', payload.description);
  formData.append('serviceCharges', String(payload.serviceCharge || 0));

  /* ---------- REQUIRED IDS (IMPORTANT) ---------- */
  formData.append('categoryId', String(payload.category));
  formData.append('subCategoryId', String(payload.subCategory));
  formData.append('brandId', String(payload.brand));

  /* ---------- SPECIFICATIONS ---------- */
  payload.specifications?.forEach((spec: any, i: number) => {
    formData.append(`specifications[${i}][name]`, spec.name);
    formData.append(`specifications[${i}][value]`, spec.value);
  });

  /* ---------- OFFER PRICES ---------- */
  payload.offerPrice?.forEach((item: any, i: number) => {
    formData.append(`offerPrices[${i}][quantity]`, String(item.quantity));
    formData.append(`offerPrices[${i}][price]`, String(item.price));
  });

  /* ---------- WARRANTIES (ARRAY, NOT OBJECT) ---------- */
  if (payload.warranty) {
    formData.append(`warranties[0][period]`, String(payload.warranty.period));
    formData.append(`warranties[0][type]`, payload.warranty.type);
  }

  /* ---------- PRODUCT IMAGES ---------- */
  payload.productImages?.forEach((img: any, i: number) => {
    console.log('product imahge', img);
    
    formData.append(`images[${i}][url]`, img.url);
    formData.append(`images[${i}][publicId]`, img.public_id ? img.public_id : img.publicId);
  });

  /* ---------- VARIANTS ---------- */
  payload.variants?.forEach((variant: any, i: number) => {
    formData.append(`variants[${i}][name]`, variant.name);
    formData.append(`variants[${i}][sku]`, variant.sku);
    formData.append(`variants[${i}][price]`, variant.price);
    formData.append(`variants[${i}][stock]`, variant.stock);

    variant.images?.forEach((img: any, j: number) => {
      formData.append(`variants[${i}][images][${j}][url]`, img.url);
      formData.append(`variants[${i}][images][${j}][publicId]`, img.public_id ? img.public_id : img.publicId);
    });
  });

  return formData;
}


  uploadImage(files: File[]) {
    const formData = new FormData();
      if (files.length > 1 && Array.isArray(files)) {
        files.forEach((file, index) => {
          formData.append('image', file);
        });
      } else {
          formData.append('image', files[0]);
      }
    const url = `${environment.BASE_URL}/upload/images`;
    return this.httpClient.post(url, formData);
  }

  searchProducts(term: string): Observable<Product[]> {
    const params = new HttpParams().set('products', term.trim());
    return this.http.get<Product[]>(`${environment.BASE_URL}/products/search`, { params });
  }
}
