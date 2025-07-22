import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-main',
  imports: [CommonModule,RouterOutlet, FormsModule, Sidebar],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {
  isSidebarCollapsed = signal<boolean>(false);

  // toggleSidebar() {
  //   this.isSidebarCollapsed.update(value => !value);
  // }

  sidebarCollapsed = signal<boolean>(false);
  searchQuery = '';

  // State for notification and message sections
  showNotificationSection = signal<boolean>(false);
  showMessageSection = signal<boolean>(false);

  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());  
  }

  onSearch(){
    // Implement search functionality here
    console.log('Search query:', this.searchQuery);
  }

  // Toggle notification section
  toggleNotificationSection() {
    this.showNotificationSection.set(!this.showNotificationSection());
    if (this.showNotificationSection()) {
      this.showMessageSection.set(false);
    }
  }

  // Toggle message section
  toggleMessageSection() {
    this.showMessageSection.set(!this.showMessageSection());
    if (this.showMessageSection()) {
      this.showNotificationSection.set(false);
    }
  }
}
