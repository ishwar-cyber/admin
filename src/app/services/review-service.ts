import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private http = inject(HttpClient);

  deleteReview(id: string) {
    return this.http.delete(`/api/reviews/${id}`);
  }
  
  searchUserReviews(userId: string) {
    return this.http.get<any[]>(`/api/reviews/user/${userId}`);
  }
}
