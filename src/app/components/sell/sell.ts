import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { ProductM } from '../../models/product';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer';
import { ProductS } from '../../services/product';


// import html2pdf from 'html2pdf.js';
interface Product {
  category?: any;
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Customer {
  _id: string;
  username: string;
  email: string;
}

@Component({
  selector: 'app-sell',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell.html',
  styleUrl: './sell.scss',
  providers: [DecimalPipe]
})
export class Sell implements OnInit{

  orderForm!: FormGroup;
  
  // Signals for reactive state management
  customers = signal<any[]>([]);
  
  products = signal<ProductM[]>([]);
  
    // Search states
  customerSearchTerm = signal<string>('');
  productSearchTerms = signal<{[key: number]: string}>({});
  showCustomerDropdown = signal<boolean>(false);
  showProductDropdowns = signal<{[key: number]: boolean}>({});
  selectedCustomerName = signal<string>('');
  showProductList = signal<boolean>(false);
  showCustomerList = signal<boolean>(false);
  // Calculation trigger
  calculationTrigger = signal<number>(0);
  activeDropdownIndex: number | null = null;
  submissionError = signal<string>('');
  isSubmitting = signal<boolean>(false);
  
  private customerService = inject(CustomerService);
  private productService = inject(ProductS);
  // Filtered data
  filteredCustomers = computed(() => {
    const term = this.customerSearchTerm().toLowerCase();
    if (!term) return this.customers();
    return this.customers().filter(customer => 
      customer.name.toLowerCase().includes(term) || 
      customer.email.toLowerCase().includes(term)
    );
  });
  
  // Computed values for order calculations
  currentSubTotal = computed(() => {
    // Trigger recalculation when calculationTrigger changes
    this.calculationTrigger();
    
    if (!this.orderForm) return 0;
    
    const items = this.items.controls;
    let total = 0;
    
    items.forEach(item => {
      const quantity = Number(item.get('quantity')?.value) || 0;
      const unitPrice = Number(item.get('unitPrice')?.value) || 0;
      total += quantity * unitPrice;
    });
    
    return total;
  });
  
  currentTaxAmount = computed(() => {
    return this.currentSubTotal() * 0.18; // 18% tax
  });
  
  currentTotalAmount = computed(() => {
    return this.currentSubTotal() + this.currentTaxAmount();
  });

  constructor(private fb: FormBuilder) {
    this.initializeForm();
    
    // Set up effect to watch form changes and trigger recalculation
    effect(() => {
      if (this.orderForm) {
        this.orderForm.valueChanges.subscribe(() => {
          this.triggerCalculation();
        });
      }
    });
  }

  ngOnInit() {
    // Set default dates
    
    this.loadCustomers();
    this.loadProducts();
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7);
    
    this.orderForm.patchValue({
      orderDate: today.toISOString().split('T')[0],
      deliveryDate: deliveryDate.toISOString().split('T')[0]
    });

    
  }

  private initializeForm() {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      orderDate: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      paymentMethod: ['credit_card'],
      notes: [''],
      items: this.fb.array([this.createOrderItem()])
    });
  }

  private createOrderItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0]
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.orderForm.controls;
  }

  // Customer search methods
  onCustomerSearch(event: any) {
    const term = event.target.value;
    this.customerService.getCustomers().subscribe({
      next: (customers:any) => {
        this.customers.set(customers.data);
        this.customers().length > 0 ? this.showCustomerList.set(true) : this.showCustomerList.set(false);
      },
      error: (err) => {
        this.submissionError.set('Failed to load customers');
      }
    });
  }

  selectCustomer(customer: Customer) {
    console.log('customereee', customer);
    
    this.selectedCustomerName.set(customer.username);
    this.orderForm.patchValue({ customerId: customer._id });
    console.log('selected name', this.selectedCustomerName());
    
    this.showCustomerList.set(false);
    this.customerSearchTerm.set('');
  }

  // Product search methods
  onProductSearch(event: any, index: number) {
    const term = event.target.value;
    this.activeDropdownIndex = index;
    this.productService.searchProducts(term).subscribe({
      next: (products:any) => {
        this.products.set(products.data);
        this.products().length > 0 ? this.showProductList.set(true) : this.showProductList.set(false);
        console.log('searched products', products);
        
      },
      error: (err) => {
        this.submissionError.set('Failed to load products');
      }
    });
  }

  getFilteredProducts(index: number): ProductM[] {
    const term = this.productSearchTerms()[index]?.toLowerCase() || '';
    if (!term) return this.products();
    return this.products().filter(product =>
      product.name.toLowerCase().includes(term)
    );
  }

  selectProduct(product: ProductM, index: number) {
    this.showProductList.set(false);
    const item = this.items.at(index);
    item.patchValue({
      productId: product.id,
      unitPrice: product.price
    });
    
    // Update display
    const currentTerms = this.productSearchTerms();
    currentTerms[index] = '';
    this.productSearchTerms.set({...currentTerms});
    
    const currentDropdowns = this.showProductDropdowns();
    currentDropdowns[index] = false;
    this.showProductDropdowns.set({...currentDropdowns});
    
    this.triggerCalculation();
  }

  getSelectedProductName(index: number): string {
    const item = this.items.at(index);
    const productId = item.get('productId')?.value;
    if (productId) {
      const product = this.products().find(p => p.id === productId);
      return product ? product.name : '';
    }
    return this.productSearchTerms()[index] || '';
  }

  showProductDropdown(index: number): boolean {
    return this.showProductDropdowns()[index] || false;
  }

  addOrderItem() {
    this.items.push(this.createOrderItem());
  }

  removeOrderItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.triggerCalculation();
    }
  }

  onQuantityChange() {
    this.triggerCalculation();
  }

  private triggerCalculation() {
    // Update the calculation trigger to force recomputation
    this.calculationTrigger.set(this.calculationTrigger() + 1);
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.isSubmitting.set(true);
      this.submissionError.set('');
      
      const orderData = {
        ...this.orderForm.value,
        subtotal: this.currentSubTotal(),
        tax: this.currentTaxAmount(),
        total: this.currentTotalAmount()
      };
      
      setTimeout(() => {
        console.log('Order submitted:', orderData);
        this.isSubmitting.set(false);
        alert(`Order created successfully! Total: ₹${this.currentTotalAmount()}`);
      }, 2000);
    } else {
      this.submissionError.set('Please fill in all required fields correctly.');
      this.markFormGroupTouched();
    }

  }

  private markFormGroupTouched() {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
    
    this.items.controls.forEach(item => {
      const group = item as FormGroup;
      Object.keys(group.controls).forEach(controlKey => {
        group.get(controlKey)?.markAsTouched();
      });
    });
  }
  loadCustomers(): void {
    
  }

  loadProducts(search?:string): void {
   
  }
    
  // private fb = inject(FormBuilder);
  // private orderService = inject(OrderService);
  // private customerService = inject(CustomerService);
  // private productService = inject(ProductS);
  // private router = inject(Router);

  // // Signals for state management
  // isLoading = signal(false);
  // isSubmitting = signal(false);
  // submissionError = signal<string | null>(null);
  // customers = signal<any[]>([]);
  // products = signal<ProductM[]>([]);
  // filteredProducts = signal<ProductM[]>([]);

  // // Reactive Form
  // orderForm: FormGroup = this.fb.group({
  //   customerId: ['', Validators.required],
  //   orderDate: [new Date().toISOString().substring(0, 10), Validators.required],
  //   deliveryDate: ['', Validators.required],
  //   paymentMethod: ['credit_card', Validators.required],
  //   items: this.fb.array([this.createOrderItem()], Validators.required),
  //   notes: ['']
  // });

  // // Computed properties
  // disableSubmit = computed(() => 
  //   this.orderForm.invalid || this.isSubmitting()
  // );

  // subTotal = computed(() => {
  //   return this.items.controls.reduce((sum: number, item: AbstractControl) => {
  //     return sum + (item.get('totalPrice')?.value || 0);
  //   }, 0);
  // });
  
  // taxAmount = computed(() => {
  //   return this.subTotal() * 0.18; // Assuming 18% tax
  // });
  
  // totalAmount = computed(() => {
  //   return this.subTotal() + this.taxAmount();
  // });

  // ngOnInit(): void {
  //   this.loadCustomers();
  //   this.loadProducts();
  // }

  // // Convenience getters
  // get items(): FormArray<any> {
  //   return this.orderForm.get('items') as FormArray ;
  // }

  // get f() { return this.orderForm.controls; }

 

  // // Initialize a new order item
  // createOrderItem(): FormGroup {
  //   return this.fb.group({
  //     productId: ['', Validators.required],
  //     productName: [''],
  //     quantity: [1, [Validators.required, Validators.min(1)]],
  //     unitPrice: [0, [Validators.required, Validators.min(0.01)]],
  //     totalPrice: [0]
  //   });
  // }

  // addOrderItem(): void {
  //   this.items.push(this.createOrderItem());
  // }

  // removeOrderItem(index: number): void {
  //   if (this.items.length > 1) {
  //     this.items.removeAt(index);
  //   }
  // }

  // onProductSelect(index: number): void {
  //   const productId = this.items.at(index).get('productId')?.value;
  //   const selectedProduct = this.products().find(p => p.id === productId);
    
  //   if (selectedProduct) {
  //       this.items.at(index).patchValue({
  //         productName: selectedProduct.name,
  //         unitPrice: selectedProduct.price,
  //         quantity: 1, // Reset quantity to 1 when product changes
  //         totalPrice: selectedProduct.price * 1 // Initial total
  //       });
  //   }
  // }

  // onSubmit(): void {
  //   if (this.orderForm.invalid) return;
  //   this.isSubmitting.set(true);
  //   this.submissionError.set(null);

  //   const orderData = {
  //     ...this.orderForm.value,
  //     subTotal: this.subTotal(),
  //     taxAmount: this.taxAmount(),
  //     totalAmount: this.totalAmount(),
  //     status: 'pending'
  //   };

  //   this.orderService.createOrder(orderData).subscribe({
  //     next: (order: any) => {
  //       this.router.navigate(['/orders', order.id], {
  //         state: { successMessage: 'Order created successfully!' }
  //       });
  //     },
  //     error: (err) => {
  //       this.submissionError.set(err.message || 'Failed to create order');
  //       this.isSubmitting.set(false);
  //     }
  //   });
  // }

  
}

