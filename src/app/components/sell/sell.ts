import { Component, signal, computed, inject } from '@angular/core';
import { ProductM } from '../../models/product';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { Customer } from '../customer/customer';
import { Product } from '../product/product';
import { CustomerService } from '../../services/customer';
import { ProductS } from '../../services/product';


// import html2pdf from 'html2pdf.js';
interface CartItem {
  product: ProductM;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-sell',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell.html',
  styleUrl: './sell.scss',
  providers: [DecimalPipe]
})
export class Sell {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductS);
  private router = inject(Router);

  // Signals for state management
  isLoading = signal(false);
  isSubmitting = signal(false);
  submissionError = signal<string | null>(null);
  customers = signal<any[]>([]);
  products = signal<ProductM[]>([]);
  filteredProducts = signal<ProductM[]>([]);

  // Reactive Form
  orderForm: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    orderDate: [new Date().toISOString().substring(0, 10), Validators.required],
    deliveryDate: ['', Validators.required],
    paymentMethod: ['credit_card', Validators.required],
    items: this.fb.array([this.createOrderItem()], Validators.required),
    notes: ['']
  });

  // Computed properties
  disableSubmit = computed(() => 
    this.orderForm.invalid || this.isSubmitting()
  );

  subTotal = computed(() => {
    return this.items.controls.reduce((sum: number, item: AbstractControl) => {
      return sum + ((item.get('quantity')?.value || 0) * (item.get('unitPrice')?.value || 0));
    }, 0);
  });

  taxAmount = computed(() => {
    return this.subTotal() * 0.18; // Assuming 18% tax
  });

  totalAmount = computed(() => {
    return this.subTotal() + this.taxAmount();
  });

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
  }

  // Convenience getters
  get items(): FormArray<any> {
    return this.orderForm.get('items') as FormArray ;
  }

  get f() { return this.orderForm.controls; }

  private loadCustomers(): void {
    this.isLoading.set(true);
    this.customerService.getCustomers().subscribe({
      next: (customers:any) => {
        this.customers.set(customers.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.submissionError.set('Failed to load customers');
        this.isLoading.set(false);
      }
    });
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products:any) => {
        this.products.set(products.data);
        this.filteredProducts.set(products.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.submissionError.set('Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  // Initialize a new order item
  createOrderItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      productName: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      totalPrice: [0]
    });
  }

  addOrderItem(): void {
    this.items.push(this.createOrderItem());
  }

  removeOrderItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onProductSelect(index: number): void {
    const productId = this.items.at(index).get('productId')?.value;
    const selectedProduct = this.products().find(p => p.id === productId);
    
    if (selectedProduct) {
        this.items.at(index).patchValue({
          productName: selectedProduct.name,
          unitPrice: selectedProduct.price,
          quantity: 1, // Reset quantity to 1 when product changes
          totalPrice: selectedProduct.price * 1 // Initial total
        });
    }
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return;

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    const orderData = {
      ...this.orderForm.value,
      subTotal: this.subTotal(),
      taxAmount: this.taxAmount(),
      totalAmount: this.totalAmount(),
      status: 'pending'
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order: any) => {
        this.router.navigate(['/orders', order.id], {
          state: { successMessage: 'Order created successfully!' }
        });
      },
      error: (err) => {
        this.submissionError.set(err.message || 'Failed to create order');
        this.isSubmitting.set(false);
      }
    });
  }

  
}

