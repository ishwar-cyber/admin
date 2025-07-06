import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PincodeS {

  private httpClient =inject(HttpClient);
  
  public addPincode(payload: any){
    const url = `${environment.BASE_URL}/pincode`;
    return this.httpClient.post(url, payload)
  }
  public getPincode(){
    return this.httpClient.get(`${environment.BASE_URL}/pincode`);
  }
}
