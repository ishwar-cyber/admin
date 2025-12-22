import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { OrderService } from '../../../services/order';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-order-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-view.html',
  styleUrls: ['./order-view.scss']
})
export class OrderView implements OnInit {

  private route = inject(ActivatedRoute);
  private scroller = inject(ViewportScroller);
  private orderService = inject(OrderService);
  public activeModal = inject(NgbActiveModal);

  order = signal<any>(null);
  loading = signal(true);
  error = signal('');

  @Input() isAdmin: boolean = false; // works for user + admin both

  ngOnInit() {
    this.scroller.scrollToPosition([0, 0]);

    // const orderId = this.route.snapshot.paramMap.get('id');
    // if (orderId) this.getOrder(orderId);
    this.getOrder(this.orderService.setOrderId());
  }

  getOrder(orderId: string) {
    this.loading.set(true);

    this.orderService.getOrderById(orderId).subscribe({
      next: (res: any) => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to load order');
        this.loading.set(false);
      }
    });
  }

  copyAddress(address: any) {
    const text = `${address.fullName}
    ${address.line1},${address.line2}
    ${address.city ? address.city + ', ' : ''}${address.state} - ${address.pincode}
    Phone: ${address.phone}
    `.trim();
    // Angular 20 SSR-safe clipboard
    navigator.clipboard.writeText(text).then(() => {
      this.showCopiedToast();
    }).catch(() => {
      console.error("Copy failed");
    });
  }
  // Optional toast signal
  toastMessage = signal<string>("");

  showCopiedToast() {
    this.toastMessage.set("Address copied!");
    setTimeout(() => this.toastMessage.set(""), 2000);
  }
}

