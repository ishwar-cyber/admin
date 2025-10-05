import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../../services/order';
import { Order, OrderQueryParams } from '../../models/order';
import { CommonConstants } from '../../common/common-constant';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule, NgbDropdownModule],
  templateUrl: './order.html',
  styleUrl: './order.scss'
})
export class OrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private modalService = inject(NgbModal);

  // Add Math to component scope
  Math = Math;

  // State signals
  orders = signal<any[]>([]);
  statistics = signal<any>({});
  loading = signal(false);
  error = signal<string | null>(null);
  totalItems = signal(0);

  // Filter signals
  searchTerm = signal('');
  statusFilter = signal<string>('');
  deliveryStatusFilter = signal<string>('');
  paymentStatusFilter = signal<string>('');
  dateFromFilter = signal<string>('');
  dateToFilter = signal<string>('');
  orderStatuses = CommonConstants.OrderStatus;
  selectedOrderStatus = signal<string>('');
  selectedOrderId = signal<string>('');

  confirmed = 0;
  delivered = 0;
  pending = 0;
  cancelled = 0;
  processing = 0;
  shipped = 0;
  // Sort signals
  sortField = signal<'orderNumber' | 'customer' | 'total' | 'status' | 'deliveryStatus' | 'createdAt'>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  // Computed values
  filteredOrders = computed(() => {
    let orders = this.orders();
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      orders = orders?.filter(order => 
        order.orderNumber?.toLowerCase().includes(search) ||
        order.customer?.name?.toLowerCase().includes(search) ||
        order.customer?.email?.toLowerCase().includes(search)
      );
    }

    // Apply status filters
    if (this.statusFilter()) {
      orders = orders.filter(order => order.status === this.statusFilter());
    }
    if (this.deliveryStatusFilter()) {
      orders = orders.filter(order => order.deliveryStatus === this.deliveryStatusFilter());
    }
    if (this.paymentStatusFilter()) {
      orders = orders.filter(order => order.paymentStatus === this.paymentStatusFilter());
    }

    // Apply date filters
    if (this.dateFromFilter()) {
      const dateFrom = new Date(this.dateFromFilter());
      orders = orders.filter(order => new Date(order.createdAt) >= dateFrom);
    }
    if (this.dateToFilter()) {
      const dateTo = new Date(this.dateToFilter());
      orders = orders.filter(order => new Date(order.createdAt) <= dateTo);
    }

    return this.sortOrders(orders);
  });



  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    const params: OrderQueryParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortField(),
      sortOrder: this.sortDirection(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
      deliveryStatus: this.deliveryStatusFilter() || undefined,
      paymentStatus: this.paymentStatusFilter() || undefined,
      dateFrom: this.dateFromFilter() || undefined,
      dateTo: this.dateToFilter() || undefined
    };

    this.orderService.getOrders(params).subscribe({
      next: (response: any) => {
        this.statistics.set(response.data?.statistics?.orderStatusStats);
        this.orders.set(response.data.orders);
        this.totalItems.set(response.data.statistics?.totalOrders || 0);

      const stats =  response.data.statistics.orderStatusStats || [];
      this.confirmed = stats.find((s: any) => s._id === 'Confirmed')?.count || 0;
      this.delivered = stats.find((s: any) => s._id === 'Delivered')?.count || 0;
      this.pending = stats.find((s: any) => s._id === 'pending')?.count || 0;
      this.cancelled = stats.find((s: any) => s._id === 'Cancelled')?.count || 0;
      this.processing = stats.find((s: any) => s._id === 'Processing')?.count || 0;
      this.shipped = stats.find((s: any) => s._id === 'Shipped')?.count || 0;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  private sortOrders(orders: Order[]): Order[] {
    const field = this.sortField();
    const direction = this.sortDirection();

    return [...orders].sort((a, b) => {
      let valueA: any, valueB: any;

      switch (field) {
        case 'orderNumber':
          valueA = a.orderNumber;
          valueB = b.orderNumber;
          break;
        case 'customer':
          valueA = a.user.username;
          valueB = b.user.username;
          break;
        case 'total':
          valueA = a.totalAmount;
          valueB = b.totalAmount;
          break;
        case 'status':
          valueA = a.orderStatus;
          valueB = b.orderStatus;
          break;
        case 'deliveryStatus':
          valueA = a.deliveryStatus;
          valueB = b.deliveryStatus;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        return direction === 'asc' 
          ? valueA.getTime() - valueB.getTime() 
          : valueB.getTime() - valueA.getTime();
      }
      return 0;
    });
  }

  updateSort(field: 'orderNumber' | 'customer' | 'total' | 'status' | 'deliveryStatus' | 'createdAt') {
    if (this.sortField() === field) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadOrders();
  }

  updateDeliveryStatus(orderId: string, deliveryStatus: string) {
    this.orderService.updateOrderStatus(orderId, deliveryStatus).subscribe({
      next: (response) => {
        if (response) {
          // Update local state
          this.orders.update(orders => 
            orders.map(order => 
              order.id === orderId 
                ? { ...order, deliveryStatus: deliveryStatus as any }
                : order
            )
          );
        } else {
         
        }
      },
      error: () => alert('Failed to update delivery status')
    });
  }

  updateOrderStatus(orderId: string, status: string) {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders.update(orders => 
            orders.map(order => 
              order.id === orderId 
                ? { ...order, status: status as any }
                : order
            )
          );
        } else {
          alert('Failed to update order status');
        }
      },
      error: () => alert('Failed to update order status')
    });
  }

  deleteOrder(orderId: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: (response) => {
          if (response.success) {
            this.orders.update(orders => orders.filter(order => order.id !== orderId));
          } else {
            alert('Failed to delete order');
          }
        },
        error: () => alert('Failed to delete order')
      });
    }
  }

  viewOrderDetails(order: Order) {
    // TODO: Implement order details modal
    alert(`Viewing order: ${order.orderNumber}`);
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadOrders();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.deliveryStatusFilter.set('');
    this.paymentStatusFilter.set('');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.currentPage.set(1);
    this.loadOrders();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadOrders();
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'warning',
      'confirmed': 'info',
      'processing': 'primary',
      'shipped': 'info',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return statusColors[status] || 'secondary';
  }

  getDeliveryStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'warning',
      'in_transit': 'info',
      'out_for_delivery': 'primary',
      'delivered': 'success',
      'failed': 'danger'
    };
    return statusColors[status] || 'secondary';
  }

  getPaymentStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'warning',
      'paid': 'success',
      'failed': 'danger',
      'refunded': 'secondary'
    };
    return statusColors[status] || 'secondary';
  }

  // Helper methods for template
  onOrderStatusChange(orderId: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.selectedOrderStatus.set(target.value);
      this.selectedOrderId.set(orderId);
      this.updateOrderStatus(orderId, target.value);
    }
  }

  onDeliveryStatusChange(orderId: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updateDeliveryStatus(orderId, target.value);
    }
  }
}

