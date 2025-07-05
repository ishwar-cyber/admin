import { Component, inject, OnInit, signal } from '@angular/core';
import { Coupon } from '../../services/coupon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiResponse } from '../../models/response';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CouponseForm } from './couponse-form/couponse-form';

@Component({
  selector: 'app-couponse',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './couponse.html',
  styleUrl: './couponse.scss'
})
export class Couponse implements OnInit{
  
  coupons = signal<Coupon[] | any>([]);
  public couponService = inject(Coupon);
  private modalService = inject(NgbModal);
  ngOnInit(): void {
    this.loadCoupose();
  }

  public addCoupon(item?: any){
    const modalRef = this.modalService.open(CouponseForm, { size: 'lg' });
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
}
