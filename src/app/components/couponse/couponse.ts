import { Component, inject, OnInit, signal } from '@angular/core';
import { Coupon } from '../../services/coupon';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiResponse } from '../../models/response';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CouponseForm } from './couponse-form/couponse-form';
import { CouponseM } from '../../models/couponse';

@Component({
  selector: 'app-couponse',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './couponse.html',
  styleUrl: './couponse.scss'
})
export class Couponse implements OnInit{
  
   // Search control with debounce
  searchControl = new FormControl('');
  coupons = signal<Coupon[] | any>([]);
  public couponService = inject(Coupon);
  private modalService = inject(NgbModal);
  ngOnInit(): void {
    this.loadCoupose();
  }

  public addCoupon(item?: any){
    const modalRef = this.modalService.open(CouponseForm, { size: 'lg', backdrop: false});
    if (modalRef && modalRef.componentInstance) {
      modalRef.componentInstance.item = item ? { ...item } : null;
      if (modalRef.result) {
        modalRef.result.then((result: any) => {
          if (result) {
            this.loadCoupose();
          }
        }).catch(() => {});
      }
    }
  }

  public loadCoupose(){
    this.couponService.getAllCoupons().subscribe({
      next: (couponse: ApiResponse) => {
        this.coupons.set(couponse.data);
      }
    })
  }
  onSearchChange(): void {
    const searchValue = this.searchControl.value;
    if(searchValue && searchValue.length > 2){
      let debounceTimer: any;
      let tempCoupons = this.coupons();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        tempCoupons = tempCoupons.filter((coupon: CouponseM) => {
          return coupon?.code.toLowerCase().includes(searchValue.toLowerCase());
        });
        this.coupons.set(tempCoupons);
      }, 300);
    } else if(!searchValue || searchValue.length === 0){
      this.loadCoupose();
    }
  }
  deleteCoupon(id: string){
    if(confirm('Are you sure to delete this coupon?')){
      this.couponService.deleteCoupon(id).subscribe({
        next: (response: ApiResponse) => {
          this.loadCoupose();
        }
      })
    } 
  }
}
