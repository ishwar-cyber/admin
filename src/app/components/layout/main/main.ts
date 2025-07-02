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
  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());  
  }
  onSearch(){
    // Implement search functionality here
    console.log('Search query:', this.searchQuery);
  }
}
