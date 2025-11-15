import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../services/customer';
interface CustomerModel {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}
@Component({
  selector: 'app-customer',
  imports: [CommonModule],
  templateUrl: './customer.html',
  styleUrls: ['./customer.scss']
})
export class Customer implements OnInit {


  private customerService = inject(CustomerService);
  customers = signal<CustomerModel[]>([]);
  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (res: any) => {
        console.log(res);
      }, error: (err) => {
        console.error(err);
      }
    });
  }
}