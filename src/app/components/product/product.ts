import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductS } from '../../services/product';
import { BrandService } from '../../services/brand';
import { CategoryS } from '../../services/category';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductForm } from './product-form/product-form';
import { AntiVirus } from './anti-virus/anti-virus';
@Component({
  selector: 'app-product',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class Product implements OnInit {
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
  totalPages = signal<number>(0);
  pages = signal<any[]>([]);  
  queryParams: any;

  constructor() {
    this.loadProduct();

    this.categoryService.getCategories().subscribe({
      next: (category: any)=>{
        this.categories.set(category.data);
      }
    })
  }
  ngOnInit(): void {
   
  }

  isNumeric(value: any): boolean {
  return !isNaN(Number(value));
}

  loadProduct(){
    const queryParams = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.productService.getProducts(queryParams).subscribe({
      next : (res: any) =>{
        let pegination = res?.pagination;
        this.productList.set(res?.data);
        this.currentPage.set(pegination?.page);
        this.totalItems.set(pegination?.total);
        this.totalPages.set(pegination?.pages);
      }
    })
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProduct();
    }
  }

  applyFilter(){
    this.loadProduct();
  }
  openAddProductModal(item?: any){
    const modalRef = this.modalService.open(ProductForm, { size: 'lg', backdrop: false, keyboard: true });
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
  openAddAntivirusModal(){
    const modalRef = this.modalService.open(AntiVirus, { size: 'lg', backdrop: false, keyboard: true });
  }
  resetFilters() {
    this.selectedCategory.set('');
    this.selectedBrand.set('');
    this.selectedStatus.set('');
    this.searchTerm.set('');
    this.loadProduct();
  }
  viewProduct(id: string) {
    console.log('View product:', id);
  }

  updateProduct(id: string) {
    this.openAddProductModal(id);
  }
  confirmDelete(id: string) {
    this.productService.deleteProduct(id).subscribe({
      next: (res: any) => {
        this.loadProduct();
      },
      error: (err: any) => {
        console.error('Error deleting product:', err);
      }
    });
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
