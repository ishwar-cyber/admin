import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private http = inject(HttpClient);

  baseApi = `${environment.BASE_URL}/reviews`;

  deleteReview(id: string) {
    return this.http.delete(`${this.baseApi}/delete/${id}`);
  }

  getProductReview(payload:any){
      return this.http.get(`${this.baseApi}/all`);
      // /api/admin/reviews?page=1&limit=10&rating=5&status=approved
  }
  
  searchUserReviews(userId: string) {
    return this.http.get<any[]>(`/api/vi/reviews/user/${userId}`);
  }
}
