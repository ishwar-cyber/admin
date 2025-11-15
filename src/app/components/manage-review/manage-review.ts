import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review-service';

@Component({
  selector: 'app-manage-review',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './manage-review.html',
  styleUrl: './manage-review.scss'
})
export class ManageReview {

   userSearch = new FormControl('');
  reviews = signal<any[]>([]);
  loading = signal(false);

  constructor(private reviewService: ReviewService) {}

  onSearch() {
    const userName = this.userSearch.value?.trim();
    if (!userName) return;

    this.loading.set(true);

    this.reviewService.searchUserReviews(userName).subscribe({
      next: (res) => {
        this.reviews.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert("User not found or no reviews available");
      }
    });
  }

  deleteReview(id: string) {
    if (!confirm("Are you sure want to delete this review?")) return;

    this.loading.set(true);

    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.reviews.update(list => list.filter(r => r._id !== id));
        this.loading.set(false);
      },
      error: () => {
        alert("Failed to delete review");
        this.loading.set(false);
      }
    });
  }
}
