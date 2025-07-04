import { Component, inject, OnInit, signal } from '@angular/core';
import { Coupon } from '../../services/coupon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CouponseM } from '../../models/couponse';
import { ApiResponse } from '../../models/response';

@Component({
  selector: 'app-couponse',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './couponse.html',
  styleUrl: './couponse.scss'
})
export class Couponse implements OnInit{
  
  coupons = signal<Coupon[] | any>([]);
  public couponService = inject(Coupon);
  ngOnInit(): void {
    this.getCoupons();
  }
  public addCoupon(){

  }

  public getCoupons(){
    this.couponService.getAllCoupons().subscribe({
      next: (couponse: ApiResponse) => {
        this.coupons.set(couponse.data);
      }
    })
  }
}
