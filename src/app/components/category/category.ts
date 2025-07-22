import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TruncatePipe } from '../../common/truncate-pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryForm } from './category-form/category-form';
import { CategoryS } from '../../services/category';

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
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        // The computed signal will automatically update
      });
  }

  ngOnInit(): void {
      this.loadCategories();
  } 
  openModal(item?: Category): void {
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
    this.categories.update(cats => cats.filter(c => c._id !== id));
  }

  // Additional helper methods
  get totalCategories(): number {
    return this.categories().length;
  }

  get activeCategories(): number {
    return this.categories().filter(c => c.status === true).length;
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
