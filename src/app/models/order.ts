export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryStatus: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cod' | 'online' | 'card' | 'upi';
  deliveryMethod: 'standard' | 'express' | 'same_day';
  trackingNumber?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderApiResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  deliveryStatus?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}
