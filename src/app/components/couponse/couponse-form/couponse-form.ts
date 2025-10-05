import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Coupon } from '../../../services/coupon';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CouponseM } from '../../../models/couponse';
import { ProductS } from '../../../services/product';
import { MultipleSelect } from "../../../shareds/multiple-select/multiple-select";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-couponse-form',
  imports: [CommonModule, ReactiveFormsModule, MultipleSelect],
  templateUrl: './couponse-form.html',
  styleUrl: './couponse-form.scss'
})
export class CouponseForm implements OnInit{

  couponForm!: FormGroup;
  isLoading = signal(false);
  public couponseService = inject(Coupon);
  public productService = inject(ProductS);
  private formBuilder =inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);
  coupons = signal<CouponseM[] | any>([]);
  products = signal([]);
  currentDate: string = '';
  minDate: string = '';

  ngOnInit(): void {
    this.buildForm();
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
    this.minDate = this.currentDate;
  }

  createCoupon(){
     this.couponseService.createCoupon(this.createPayload()).subscribe({
      next: (response) => {
        this.activeModal.close(true);
      },
      error: (error) => this.activeModal.close(true),
    }); 
  }

  createPayload(){
      let product:any = [];
      let productValue = this.couponForm.value.product;
      if(productValue) {
        productValue.forEach((item: any)=>{
        product.push(item._id);
      });
      }
    
      const payload: CouponseM = {
        code: this.couponForm.value.couponCode,
        discount: this.couponForm.value.discount || 0,
        applyTo: this.couponForm.value.applyTo,
        product: product || null,
        discountType: this.couponForm.value.discountType,
        noExpiry: this.couponForm.value.noExpiry || false,
        startDate: new Date(this.couponForm.value.validFrom),
        expiryDate: new Date(this.couponForm.value.validTo)
      };
      return payload;
  }

  buildForm(){
     this.couponForm = this.formBuilder.group({
        couponCode: ['', Validators.required],
        applyTo: ['', Validators.required], // 'all' or specific product ID
        product: [],
        noExpiry: [],
        discount: [''],
        discountType: ['', Validators.required],
        validFrom: [this.currentDate, [Validators.required, this.dateValidator()]],
        validTo: [this.currentDate, this.dateRangeValidator()],
    }, { validators: this.dateComparisonValidator });

  }
  private dateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today ? { pastDate: true } : null;
    };
  }

  private dateRangeValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const startDate = this.couponForm?.get('validFrom')?.value;
      const endDate = control.value;
      
      if (startDate && new Date(endDate) <= new Date(startDate)) {
        return { invalidRange: true };
      }
      return null;
    };
  }

  private dateComparisonValidator(group: FormGroup): ValidationErrors | null {
    const startDate = group.get('validFrom')?.value;
    const endDate = group.get('validTo')?.value;
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      group.get('validTo')?.setErrors({ invalidRange: true });
      return { dateRange: true };
    }
    return null;
  }

  loadProduct(){
    this.productService.getProducts().subscribe({
        next: (response: any) => {
            this.products.set(response.data);
        },
        error: (err) => {
            console.error('Error fetching products:', err);
        }
    });

    // Subscribe to noExpiry changes
    this.couponForm.get('noExpiry')?.valueChanges.subscribe(noExpiry => {
      const validToControl = this.couponForm.get('validTo');
      if (noExpiry) {
        validToControl?.disable();
        validToControl?.setValue(null);
      } else {
        validToControl?.enable();
        validToControl?.setValidators(Validators.required);
        validToControl?.setValue(this.currentDate);
      }
      validToControl?.updateValueAndValidity();
    });
  }

  
  private formatDateForInput(date: Date | string): string {
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // Format as yyyy-MM-dd
  }

  
 selectDiscountType(type: string): void {
    this.couponForm.patchValue({
      discountType: type
    });
    // if(type === 'percentage') {
    //   this.couponForm.get('discount')?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
    // } else if(type === 'rupees') {
    //   this.couponForm.get('discount')?.setValidators([Validators.required, Validators.min(1)]);
    // } else {
    //   this.couponForm.get('discount')?.clearValidators();
    // }
    switch(type){
      case 'percentage':
        this.couponForm.get('discount')?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        break;
      case 'rupees':
        this.couponForm.get('discount')?.setValidators([Validators.required, Validators.min(1)]);
        break;
      default:
         this.couponForm.get('discount')?.setErrors(null);
    }
  }

}
