import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from '../../../services/sidebar';


interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  newCustomers: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  lowStockItems: number;
  pendingOrders: number;
}
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit{

   protected readonly sidebarService = inject(Sidebar);
  
  stats: DashboardStats = {
    totalSales: 0,
    totalOrders: 0,
    newCustomers: 0,
    revenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    lowStockItems: 0,
    pendingOrders: 0
  };

  recentOrders = signal<any[]>([]);
  topProducts = signal<any[]>([]);
  salesChart: any;
  revenueChart: any;

  ngOnInit() {
    this.loadDashboardData();
    this.initializeCharts();
  }

  private loadDashboardData() {
    // TODO: Replace with actual API calls
    this.stats = {
      totalSales: 45678,
      totalOrders: 1234,
      newCustomers: 567,
      revenue: 89123,
      averageOrderValue: 72.15,
      conversionRate: 2.8,
      lowStockItems: 15,
      pendingOrders: 23
    };

    this.recentOrders.set([
      { id: '#12345', customer: 'John Doe', product: 'Product A', amount: 99.99, status: 'Completed' },
      { id: '#12346', customer: 'Jane Smith', product: 'Product B', amount: 149.99, status: 'Pending' },
      { id: '#12347', customer: 'Bob Johnson', product: 'Product C', amount: 199.99, status: 'Processing' }
    ]);

    this.topProducts.set([
      { name: 'Product A', sales: 234, revenue: 23400 },
      { name: 'Product B', sales: 189, revenue: 28350 },
      { name: 'Product C', sales: 156, revenue: 31200 }
    ]);
  }

  private initializeCharts() {
    // Sales Analytics Chart
    const salesCtx = document.getElementById('salesChart') as HTMLCanvasElement;
    this.salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Sales',
          data: [65, 59, 80, 81, 56, 55],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Revenue by Category Chart
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    this.revenueChart = new Chart(revenueCtx, {
      type: 'doughnut',
      data: {
        labels: ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Others'],
        datasets: [{
          data: [30, 25, 20, 15, 10],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
