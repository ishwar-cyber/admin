import { CommonModule } from '@angular/common';
import { Component, inject, Inject, input, OnInit, output, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../services/auth';
import { StorageHandler } from '../../../services/storage-handler';
import { StorageKeys } from '../../../common/commonConstant';
interface NavItem {
  title: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
  expanded?: boolean;
  roles?: string[]; // Define roles for each menu item
}
interface Role {
  username?: string;
  email?: string;
  _id?: string;
  role?: string;
}
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  collapsed = input<boolean>(false);
  toggleSidebar = output();
  isBrowser = signal(false);
  adminRoles = signal<Role[]>([]);
  public storageHandler = inject(StorageHandler);
  public loginService = inject(Auth);
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if the platform is browser
    this.isBrowser.set(typeof window !== 'undefined');
    const userCookie = this.storageHandler.getSessionStorage(StorageKeys.currentUser) as Role;
    console.log(userCookie);
    if (userCookie && userCookie.role) {
      this.adminRoles.set([userCookie]);
    }
  }
  ngOnInit(): void {
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
    //   {
    //   title: 'Inventory',
    //   route: '/admin/inventroy',
    //   icon: 'bi bi-receipt'
    // },
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
          title: 'Service Pincode',
          route: '/admin/pincode',
          icon: 'bi bi-amd'
        },
      ]
    },
    {
      title: 'Orders',
      route: '/admin/order',
      icon: 'bi bi-house'
    },
    // {
    //   title: 'Sales',
    //   icon: 'bi bi-amd',
    //   children: [
    //     {
    //       title: 'All Sales',
    //       route: '/admin/order',
    //       icon: 'bi bi-amd'
    //     },
    //     {
    //       title: 'Create Sale',
    //       route: '/admin/sell',
    //       icon: 'bi bi-amd'
    //     }
    //   ]
    // },
    // {
    //   title: 'Purchase',
    //   icon: 'bi bi-amd',
    //   children: [
    //     {
    //       title: 'All Purchase',
    //       route: '/admin/purchase-orders',
    //       icon: 'bi bi-amd'
    //     },
    //     {
    //       title: 'Create Purchase',
    //       route: '/admin/create-purchase-order',
    //       icon: 'bi bi-amd'
    //     }
    //   ]
    // }
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
