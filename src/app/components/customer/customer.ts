import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../services/customer';
export interface CustomerModel {
  id: string
  email: string
  username: string
  isRole: string,
  totalOrders?: number,
  phone?:number,
  status?: string,
  addresses?: any[]
  createdAt: string
  updatedAt: string
}
@Component({
  selector: 'app-customer',
  imports: [CommonModule],
  templateUrl: './customer.html',
  styleUrls: ['./customer.scss']
})
export class Customer implements OnInit {


// Customer List (You can replace with API call)
  customers = signal<CustomerModel[]>([
      {
    id: "CUS001",
    email: "ramesh.kumar@example.com",
    username: "ramesh_k",
    isRole: "customer",
    totalOrders: 12,
    phone: 9876543210,
    status: "active",
    addresses: [
      {
        type: "home",
        line1: "101, MG Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: 400001,
      }
    ],
    createdAt: "2024-02-10T10:15:30.000Z",
    updatedAt: "2024-02-15T08:40:20.000Z"
  },

  {
    id: "CUS002",
    email: "priya.shah@example.com",
    username: "priya_shah",
    isRole: "customer",
    totalOrders: 5,
    phone: 9123456789,
    status: "active",
    addresses: [
      {
        type: "office",
        line1: "22, Lake View Apartments",
        city: "Pune",
        state: "Maharashtra",
        pincode: 411001,
      }
    ],
    createdAt: "2024-01-20T12:30:45.000Z",
    updatedAt: "2024-01-22T09:10:05.000Z"
  },

  {
    id: "CUS003",
    email: "amit.singh@example.com",
    username: "amit_singh",
    isRole: "customer",
    totalOrders: 0,
    phone: 9988776655,
    status: "blocked",
    addresses: [],
    createdAt: "2023-12-11T14:00:00.000Z",
    updatedAt: "2024-01-05T11:20:50.000Z"
  },

  {
    id: "CUS004",
    email: "neha.verma@example.com",
    username: "neha_v",
    isRole: "customer",
    totalOrders: 3,
    phone: 9012345678,
    status: "active",
    addresses: [
      {
        type: "home",
        line1: "44, Green Park",
        city: "Delhi",
        state: "Delhi",
        pincode: 110016,
      }
    ],
    createdAt: "2024-02-01T09:15:10.000Z",
    updatedAt: "2024-02-03T10:20:00.000Z"
  },

  {
    id: "CUS005",
    email: "john.doe@example.com",
    username: "john_doe",
    isRole: "customer",
    totalOrders: 7,
    phone: 9876001234,
    status: "pending",
    addresses: [
      {
        type: "home",
        line1: "88, Park Avenue",
        city: "Bangalore",
        state: "Karnataka",
        pincode: 560001,
      },
      {
        type: "office",
        line1: "12, Tech Hub",
        city: "Bangalore",
        state: "Karnataka",
        pincode: 560076,
      }
    ],
    createdAt: "2024-02-12T11:05:40.000Z",
    updatedAt: "2024-02-14T13:45:00.000Z"
  }
  ]);


  searchText = signal('');
  currentPage = signal(1);
  pageSize = 10;

  private readonly customerService = inject(CustomerService)
  // Filter + Pagination
  filteredCustomers = computed(() => {
    const search = this.searchText().toLowerCase();
    const all = this.customers().filter(c =>
      c?.username?.toLowerCase().includes(search) ||
      c?.email?.toLowerCase().includes(search) ||
      c?.phone?.toString().includes(search)
    );

    const start = (this.currentPage() - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(
      this.customers().filter(c =>
        c.username.toLowerCase().includes(this.searchText().toLowerCase()) ||
        c.email.toLowerCase().includes(this.searchText().toLowerCase())
      ).length / this.pageSize
    );
  });

  ngOnInit(): void {
   this.loadCustomers();
  }
  // Actions
  viewCustomer(customer: string) {
    console.log("View:", customer);
  }

  editCustomer(customer: string) {
    console.log("Edit:", customer);
  }

  deleteCustomer(customer: string) {
    if (confirm("Are you sure to delete?")) {
      // this.customers.update(list => list.filter(c => c.id !== customer?.id));
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (res: any) => {
        console.log('ressss', res);
        
       this.customers?.set(res?.data)
      }, error: (err) => {
        console.error(err);
      }
    });
  }

}