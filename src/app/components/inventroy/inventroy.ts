import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InventoryItem } from '../../models/inventory';
import { InventroyService } from '../../services/inventroy';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventroy',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventroy.html',
  styleUrl: './inventroy.scss'
})
export class Inventroy implements OnInit{

  private inventoryService = inject(InventroyService);
  
  searchTerm = signal('');
  sortField = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  inventoryItems = this.inventoryService.getInventoryItems();

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const items = this.inventoryItems();

    if (!term) return this.sortItems([...items]);

    return this.sortItems(
      items.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term)
      )
    );
  });

  lowStockItems = computed(() => 
    this.inventoryItems().filter(item => item.quantity <= item.reorderLevel)
  );
  ngOnInit(): void {
    
  }

  
  private sortItems(items: InventoryItem[]) {
    const field = this.sortField();
    const direction = this.sortDirection();

    return [...items].sort((a, b) => {
      const valueA = a[field as keyof InventoryItem];
      const valueB = b[field as keyof InventoryItem];

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

  updateSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }
  deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.inventoryService.deleteItem(id);
    }
  }
}
