import { CommonModule } from '@angular/common';
import { Component, Inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
      icon: 'fas fa-tag'
    },
    {
      title: 'Coupons',
      route: '/admin/coupons',
      icon: 'fas fa-ticket-alt'
    },
      {
      title: 'Inventory',
      route: '/admin/inventory',
      icon: 'fas fa-ticket-alt'
    },
    {
      title: 'Category',
      icon: 'fas fa-sitemap',
      children: [
        {
          title: 'Category',
          route: '/admin/category',
          icon: 'fas fa-list'
        },
        {
          title: 'Sub Category',
          route: '/admin/sub-category',
          icon: 'fas fa-stream'
        },
      ]
    },
    {
      title: 'Products',
      icon: 'bi bi-box',
      children: [
        {
          title: 'All Products',
          route: '/admin/products',
          icon: 'bi bi-box-seam'
        },
        {
          title: 'Add Product',
          route: '/admin/add-product',
          icon: 'fas fa-plus-circle'
        },
        {
          title: 'Service Pincode',
          route: '/admin/service-pincode',
          icon: 'fas fa-map-marker-alt'
        },
      ]
    },
    {
      title: 'Orders',
      icon: 'fas fa-shopping-cart',
      children: [
        {
          title: 'All Orders',
          route: '/admin/sell',
          icon: 'fas fa-list-alt'
        },
        {
          title: 'Create Order',
          route: '/admin/create-order',
          icon: 'fas fa-plus-square'
        }
      ]
    },
    {
      title: 'Purchase Orders',
      icon: 'fas fa-truck',
      children: [
        {
          title: 'All Purchase Orders',
          route: '/admin/purchase-orders',
          icon: 'fas fa-clipboard-list'
        },
        {
          title: 'Create Purchase Order',
          route: '/admin/create-purchase-order',
          icon: 'fas fa-file-invoice'
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

  logout(){
    // Implement logout logic here
    console.log('User logged out');
  }
}
