import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryS } from '../../services/category';
import { Category } from '../category/category';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../common/truncate-pipe';
import { SubCategoryS } from '../../services/sub-category';
import { SubCategoryForm } from './sub-category-form/sub-category-form';

@Component({
  selector: 'app-sub-category',
  imports: [CommonModule, ReactiveFormsModule, TruncatePipe],
  templateUrl: './sub-category.html',
  styleUrl: './sub-category.scss'
})
export class SubCategory {
 private modalService = inject(NgbModal);
  private subCategoryService = inject(SubCategoryS)
  private categoryService = inject(CategoryS)
  private subCategories = signal<any[]>([]);
  public category = signal<any[]>([]);
  // Search control with debounce
  searchControl = new FormControl('');
  pagination = signal<any>(null);
  pageSize = signal(10);
  currentPage = signal(1);

  // total pages computed from server pagination when available
  totalPages = computed(() => {
    const total = this.pagination()?.total ?? this.subCategories().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  // server returns paginated items, so use subCategories directly
  paginatedCategories = computed(() => this.subCategories());

  // when server-side search is used we just display subCategories
  filteredCategories = computed(() => this.subCategories());

  constructor() {
    // Set up debounce for search input
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPage();
        this.loadSubCategories();
      });
  }

  ngOnInit(): void {
      this.loadSubCategories();
  } 
  openModal(item?: Category): void {
    const modalRef = this.modalService.open(SubCategoryForm, { size: 'lg', backdrop: false,
      keyboard: true });
    if (modalRef && modalRef.componentInstance) {
      modalRef.componentInstance.item = item ? { ...item } : null;
      if (modalRef.result) {
        modalRef.result.then((result: any) => {
          if (result) {
            this.loadSubCategories();
          }
        }).catch(() => {});
      }
    }
  }

  public loadSubCategories(){
    const params = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchControl.value || undefined,
      sortField: this.sortField(),
      sortDir: this.sortDirection()
    };
    this.subCategoryService.getSubCategories(params).subscribe({
      next: (response: any) =>{
        // expected backend shape: { data: [], pagination: { total, pages, page } }
        this.pagination.set(response.pagination ?? null);
        const items = response.data ?? response.items ?? response;
        this.subCategories.set(Array.isArray(items) ? items : []);
      },
      error: (err: any) => {
        console.error('Failed loading sub-categories', err);
        this.subCategories.set([]);
        this.pagination.set(null);
      }
    })
  }
  deleteCategory(id: string): void {
   this.subCategoryService.deleteSubCategory(id).subscribe({
      next: () => {
       this.loadSubCategories();
      //  this.loadCategory();
      },
      error: (error) => { 
        console.error('Error deleting sub-category:', error);
      }
    });
  }

  // Additional helper methods
  get totalSubCategories(): number {
    return this.pagination()?.total ?? this.subCategories().length;
  }

  get activeSubCategories(): number {
    return this.subCategories().filter(c => c.isActive === true).length;
  }

  // Add to the CategoriesComponent class
  sortField = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortBy(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    
    // request sorted page from server
    this.resetPage();
    this.loadSubCategories();
  }

  // change page
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadSubCategories();
  }

  // reset page when search/sort changes
  resetPage() {
    this.currentPage.set(1);
  }   

  onPageSizeChange(value: any) {
    this.pageSize.set(+value);
    this.resetPage();
    this.loadSubCategories();
  }
}
