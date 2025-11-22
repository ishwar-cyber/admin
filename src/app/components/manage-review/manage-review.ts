import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review-service';

@Component({
  selector: 'app-manage-review',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './manage-review.html',
  styleUrl: './manage-review.scss'
})
export class ManageReview implements OnInit {


  userSearch = new FormControl('');
  reviews = signal<any[]>([]);
  loading = signal(false);
  searchText = signal('')
  private readonly reviewService = inject(ReviewService)
  filteredReviews = signal<any>([]);
  currentPage = signal(1);
  pageSize = 10;

  paginatedReviews = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredReviews().slice(start, start + this.pageSize);
  });

  totalPages = signal<number>(0);

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(page: number = 1){
    const payload = {
      page: page,
      limit: 10
    }
    this.reviewService.getProductReview(payload).subscribe({
      next:(response:any)=>{
        console.log('response', response?.reviews);
        this.filteredReviews.set(response?.reviews)
        this.totalPages.set(response?.totalPages)
      }
    })
  }
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
        this.loadReviews();
        this.reviews.update(list => list.filter(r => r._id !== id));
        this.loading.set(false);
      },
      error: () => {
        alert("Failed to delete review");
        this.loading.set(false);
      }
    });
  }

  delete(id: string) {
    if (confirm("Delete this review?")) {
      this.reviewService.deleteReview(`/api/admin/reviews/${id}`).subscribe(() => this.loadReviews());
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadReviews(page)
    }
  }
}
