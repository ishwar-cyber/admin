import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductS } from '../../services/product';
import { ProductM } from '../../models/product';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ProductForm } from '../product/product-form/product-form';

@Component({
  selector: 'app-inventroy',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventroy.html',
  styleUrl: './inventroy.scss'
})
export class Inventroy implements OnInit{

  // Remove inventoryService, use ProductS instead
  private productService = inject(ProductS);
  private modalService = inject(NgbModal);
  searchTerm = signal('');
  sortField = signal<'name' | 'category' | 'price' | 'stock' | 'brand'>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // State for products
  products = signal<ProductM[]>([]);
  peginations = signal<any>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading.set(true);
    this.productService.getProducts({
      page: 1,
      limit: 10,
      sortBy: this.sortField(),
      sortOrder: this.sortDirection(),
      search: this.searchTerm()
    }).subscribe({
      next: (res:any) => {
        this.products.set(res?.data);
        this.peginations.set(res.pagination)
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
      }
    });
  }

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const items = this.products();
    if (!term) return this.sortItems([...items]);
    return this.sortItems(
      items.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.sku?.toLowerCase().includes(term)) ||
        (Array.isArray(item.category) && item.category.join(',').toLowerCase().includes(term))
      )
    );
  });

  lowStockItems = computed(() =>
    this.products().filter(item => item.stock <= 5) // Example: low stock if <= 5
  );

  private sortItems(items: ProductM[]) {
    const field = this.sortField();
    const direction = this.sortDirection();
    return [...items].sort((a, b) => {
      const valueA = a[field as keyof ProductM];
      const valueB = b[field as keyof ProductM];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
      return 0;
    });
  }

  updateSort(field: 'name' | 'category' | 'price' | 'stock' | 'brand') {
    if (this.sortField() === field) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.fetchProducts();
  }

  deleteItem(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: (success) => {
          if (success) {
            this.products.set(this.products().filter(item => item.id !== id));
          } else {
            alert('Failed to delete product.');
          }
        },
        error: () => alert('Failed to delete product.')
      });
    }
  }

  addItem() {
    const modalRef = this.modalService.open(ProductForm, { size: 'lg', backdrop: false });
    if (modalRef && modalRef.componentInstance) {
      // modalRef.componentInstance.item = item ? { ...item } : null;
      if (modalRef.result) {
        modalRef.result.then((result: any) => {
          if (result) {
            // this.loadProduct();
          }
        }).catch(() => {});
      }
    }
  }

  showHelp() {
    alert('Inventory Management helps you track and manage your stock. Use search, sort, and add new items as needed.');
  }

  // Helper for template to join category array
  joinCategory(category: any): string {
    console.log('categpry array', category);
    
    return Array.isArray([...category]) ? category.join(', ') : String(category);
  }

  // Add these properties
page = signal(1);
pageSize = signal(10);

get pagedItems() {
  const start = (this.page() - 1) * this.pageSize();
  return this.filteredItems().slice(start, start + this.pageSize());
}

get totalPages() {
  return Math.ceil(this.filteredItems().length / this.pageSize());
}

goToPage(pageNum: number) {
  if (pageNum >= 1 && pageNum <= this.totalPages) {
    this.page.set(pageNum);
  }
}
}
