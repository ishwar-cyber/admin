import { CommonModule } from '@angular/common';
import { Component, computed, inject, Pipe, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, merge, of, switchMap, tap } from 'rxjs';
import { ProductS } from '../../services/product';
import { BrandService } from '../../services/brand';
import { CategoryS } from '../../services/category';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductForm } from './product-form/product-form';


@Component({
  selector: 'app-product',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class Product {
  public productService = inject(ProductS);
  public brandService = inject(BrandService);
  public categoryService = inject(CategoryS);
  private modalService = inject(NgbModal);
  // Filter controls
  searchControl = new FormControl('');
  // Filter controls
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');
  selectedStatus = signal<string>('');
  searchTerm = signal<string>('');
  // Pagination
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  totalItems = signal(0);
  categories =signal<any[]>([]);
  brands = signal<any[]>([]);
  productList = signal<any[]>([]);
  // Computed values
  totalPages = computed(() => Math.ceil(this.productService.totalItems() / this.itemsPerPage()));
  
  pages = computed(() => {
    const pages = [];
    const total = this.totalPages();
    const current = this.currentPage();
    const range = 2;
    
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - range && i <= current + range)) {
        pages.push(i);
      } else if (i === current - range - 1 || i === current + range + 1) {
        pages.push(-1);
      }
    }
    
    return pages;
  });

  constructor() {
    // Initial data load
    this.loadProducts();

  
    this.loadProduct();
    // Load brands and categories
    this.brandService.getBrands().subscribe({
      next: (res: any) =>{
       this.brands.set(res.data)
      }
    });
    this.categoryService.getCategories().subscribe({
      next: (res: any) =>{
       this.categories.set(res.data)
      } 
    });

    // Setup search debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.loadProducts())
    ).subscribe();
  }

  public filterProducts(){}
  private loadProducts() {
    return this.productService.getProducts({
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      search: this.searchControl.value || '',
      // Add other filters as needed
    });
  }

  loadProduct(){
      this.productService.getProducts().subscribe({
      next : (res: any) =>{
       this.productList.set(res.data);
        
      }
    })
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts().subscribe();
    }
  }
  openAddProductModal(item?: any){
    const modalRef = this.modalService.open(ProductForm, { size: 'lg' });
        if (modalRef && modalRef.componentInstance) {
          modalRef.componentInstance.item = item ? { ...item } : null;
          if (modalRef.result) {
            modalRef.result.then((result: any) => {
              if (result) {
                this.loadProduct();
              }
            }).catch(() => {});
          }
        }
  }
  resetFilters(){}
   // Product actions
  viewProduct(id: string) {
    // Implementation for viewing product
    console.log('View product:', id);
  }

  updateProduct(id: string) {
    // Implementation for updating product
    console.log('Update product:', id);
  }

  duplicateProduct(id: string) {
    // Implementation for duplicating product
    console.log('Duplicate product:', id);
  }
    confirmDelete(id: string) {
    // Implementation for delete confirmation
    console.log('Delete product:', id);
  }


  getBrandName(brandId: string): string {
    const brand = this.brands().find((b: any) => b.id === brandId);
    return brand?.name || '';
  }


  getCategoryName(categoryId: string): string {
    const category = this.categories().find((c: any) => c.id === categoryId);
    return category?.name || '';
  }
}
