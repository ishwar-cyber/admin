import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Product {

   private httpClient = inject(HttpClient);
  constructor() { }

  public getBrand() {
    return this.httpClient.get(`${environment.BASE_URL}/brands`);
  }
  public getCategory() {
    return this.httpClient.get(`${environment.BASE_URL}/category`);
  }
  public createProduct(payload: any, thumbnail?: File, variantsImages?: File[]) {
   const formData = this.createFormData(payload, thumbnail, variantsImages);
    const url = `${environment.BASE_URL}/products`;
    return this.httpClient.post(url, formData);
  }

  public getProductById(id: string) {
    const url = `${environment.BASE_URL}/products/${id}`;
    return this.httpClient.get(url);
  }
  public getProductList(page: number, pageSize: number) {
    const url = `${environment.BASE_URL}/products?page=${page}&pageSize=${pageSize}`;
    return this.httpClient.get(url);
  }
  
  public updateProduct(id: string, payload: any, thumbnail?: File, variantsImages?: File[]) {
    const formData = this.createFormData(payload, thumbnail, variantsImages);
    const url = `${environment.BASE_URL}/products/${id}`;
    return this.httpClient.put(url, formData);
  }

  public getProducts(): Observable<Response> {
    return this.httpClient.get<Response>(`${environment.BASE_URL}/products`);
  }

  private createFormData(payload: any, thumbnail?: File, variantsImages?: File[] ): FormData {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('model', payload.model);
    formData.append('status', payload.status);
    formData.append('brand', payload.brand);
    formData.append('subCategory', payload.subCategory);
    formData.append('description', payload.description);
    formData.append('price', payload.price.toString());
    formData.append('stock', payload.stock.toString());
    formData.append('productWeight', payload.productWeight.toString() || null);
    
    if (payload.discount) {
      formData.append('discount', payload.discount.toString());
    }

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    if (payload.specifications && payload.specifications.length > 0) {
    }
     // Handle optional discount field
     if (payload.discount) {
      formData.append('discount', payload.discount.toString());
    }

    if(payload.category) {
      payload.category.forEach((category: any, index: number) => {
        formData.append(`category[${index}]`, category._id || '');
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

  public addPincode(payload: any){
    const url = `${environment.BASE_URL}/pincode`;
    return this.httpClient.post(url, payload)
  }
  public getPincode(){
    return this.httpClient.get(`${environment.BASE_URL}/pincode`);
  }
}
