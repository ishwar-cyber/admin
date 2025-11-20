import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../services/order';
export interface OrderProductItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku?: string;
  category?: string;
  subtotal?: number;
}
@Component({
  selector: 'app-order-view',
  imports: [CommonModule],
  templateUrl: './order-view.html',
  styleUrl: './order-view.scss'
})
export class OrderView implements OnInit{

  @Input() items: OrderProductItem[] = [];

  private readonly orderService = inject(OrderService);
  showImage = signal(true);
  ngOnInit(): void {
    this.orderService.getOrderById('orderId').subscribe({
      next: (res: any) => {
        console.log(res);
      }
    }); 
  }


  getTotal() {
    return this.items.reduce((t, i) => t + i.price * i.quantity, 0);
  }


  formatCurrency(v: number) {
    return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    }).format(v);
  }
}