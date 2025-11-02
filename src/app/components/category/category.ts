import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { TruncatePipe } from '../../common/truncate-pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryForm } from './category-form/category-form';
import { CategoryS } from '../../services/category';
import { CategoryM } from '../../models/category';

@Component({
  selector: 'app-category',
  imports: [CommonModule, ReactiveFormsModule, TruncatePipe],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category implements OnInit{
  // Sample data - in a real app you would fetch this from a service

  private modalService = inject(NgbModal);
  private categoryService = inject(CategoryS)
  private categories = signal<any[]>([]);

  // Search control with debounce
  searchControl = new FormControl('');
  
  // Filtered categories based on search
  filteredCategories = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    return this.categories().filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      category.status.toLowerCase().includes(searchTerm) ||
      category._id.includes(searchTerm)
    );
  });

  constructor() {
    // Set up debounce for search input
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(() => this.categoryService.searchCategories(this.searchControl.value || ''))
      )
      .subscribe({
        next: (response: any) => {
          this.categories.set(response.data);
        }
      });
  }

  ngOnInit(): void {
      this.loadCategories();
       this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value) => {
          const query = value?.trim() || '';
          if (!query) {
            this.categories.set([]);
            return of({ data: [] });
          }
          return this.categoryService.searchCategories(query).pipe(
            catchError(err => {
              console.error('Search failed:', err);
              return of({ data: [] });
            })
          );
        })
      )
      .subscribe((response: any) => {
        this.categories.set(response.data || []);
      });
  } 
  openModal(item?: CategoryM): void {
    const modalRef = this.modalService.open(CategoryForm, { size: 'lg', backdrop: false });
    if (modalRef && modalRef.componentInstance) {
      modalRef.componentInstance.item = item ? { ...item } : null;
      if (modalRef.result) {
        modalRef.result.then((result: any) => {
          if (result) {
            this.loadCategories();
          }
        }).catch(() => {});
      }
    }
  }

  public loadCategories(){
    this.categoryService.getCategories().subscribe({
      next: (response: any) =>{
        this.categories.set(response.data);
      },
    })
  }

  deleteCategory(id: string): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: (res) =>{
        this.loadCategories();
      }
    });
  }

  // Additional helper methods
  get totalCategories(): number {
    return this.categories().length;
  }

  get activeCategories(): number {
    return this.categories().filter(c => c.isActive === true).length;
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
  
  this.categories.update(cats => {
    return [...cats].sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      // Handle dates
      if (field === 'createdAt') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      // Handle string comparison
      if (typeof valueA === 'string') {
        return this.sortDirection() === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // Handle numeric comparison
      return this.sortDirection() === 'asc' 
        ? (valueA || 0) - (valueB || 0)
        : (valueB || 0) - (valueA || 0);
    });
  });
}
  
}
