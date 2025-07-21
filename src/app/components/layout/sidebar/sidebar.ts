import { CommonModule } from '@angular/common';
import { Component, inject, Inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../services/auth';
interface NavItem {
  title: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
  expanded?: boolean;
  roles?: string[]; // Define roles for each menu item
}
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
 collapsed = input<boolean>(false);
  toggleSidebar = output();
  isBrowser = signal(false);
 public loginService = inject(Auth)
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if the platform is browser
    this.isBrowser.set(typeof window !== 'undefined');
  }

  menuItems = signal<NavItem[]>([
    {
      title: 'Dashboard',
      route: '/admin',
      icon: 'bi bi-house'
    },
    {
      title: 'Brand',
      route: '/admin/brand',
      icon: 'bi bi-amd'
    },
    {
      title: 'Coupons',
      route: '/admin/coupons',
      icon: 'bi bi-amd'
    },
      {
      title: 'Inventory',
      route: '/admin/inventroy',
      icon: 'bi bi-receipt'
    },
    {
      title: 'Category',
      icon: 'bi bi-box',
      children: [
        {
          title: 'Category',
          route: '/admin/category',
          icon: 'bi bi-amd'
        },
        {
          title: 'Sub Category',
          route: '/admin/sub-category',
          icon: 'bi bi-amd'
        },
      ]
    },
    {
      title: 'Products',
      icon: 'bi bi-box',
      children: [
        {
          title: 'All Products',
          route: '/admin/product',
          icon: 'bi bi-box-seam'
        },
        {
          title: 'Add Product',
          route: '/admin/add-product',
          icon: 'bi bi-amd'
        },
        {
          title: 'Service Pincode',
          route: '/admin/pincode',
          icon: 'bi bi-amd'
        },
      ]
    },
    {
      title: 'Orders',
      icon: 'bi bi-amd',
      children: [
        {
          title: 'All Orders',
          route: '/admin/order',
          icon: 'bi bi-amd'
        },
        {
          title: 'Create Order',
          route: '/admin/create-order',
          icon: 'bi bi-amd'
        }
      ]
    },
    {
      title: 'Purchase Orders',
      icon: 'bi bi-amd',
      children: [
        {
          title: 'All Purchase Orders',
          route: '/admin/purchase-orders',
          icon: 'bi bi-amd'
        },
        {
          title: 'Create Purchase Order',
          route: '/admin/create-purchase-order',
          icon: 'bi bi-amd'
        }
      ]
    }
  ]);


  toggleExpanded(item: NavItem) {
    item.expanded = !item.expanded;
  }
  isActive(route: any): boolean {
    if(!route) return false;
    if(!this.isBrowser()) return false;
    return window.location.pathname.startsWith(route);  
    // return route ? this.isBrowser ? window.location.pathname === route : false;
  }
}
