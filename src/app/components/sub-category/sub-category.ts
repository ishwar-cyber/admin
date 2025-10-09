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
  
  // Filtered categories based on search
  filteredCategories = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    return this.subCategories().filter(category => 
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
    this.subCategoryService.getSubCategories().subscribe({
      next: (response: any) =>{
        this.subCategories.set(response.data);
      },
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
    return this.subCategories().length;
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
  
  this.subCategories.update(subCat => {
    return [...subCat].sort((a, b) => {
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
