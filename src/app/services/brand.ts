import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

   private httpClient = inject(HttpClient);

  public getBrands(){
    return this.httpClient.get(`${environment.BASE_URL}/brands`);
  }

  public deleteBrandById(id: String){
    return this.httpClient.delete(`${environment.BASE_URL}/brands/${id}`)
  }
  public createBrand(payload: any, file: any): Observable<any> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('isActive', payload.isActive);
    formData.append('image', file[0]);

    return this.httpClient.post(`${environment.BASE_URL}/brands`, formData);
  }
  public updateItem(payload: any, file: any): Observable<any>{
    return this.httpClient.post(`${environment.BASE_URL}/brands`, payload);

  }
}
