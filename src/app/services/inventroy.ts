import { Injectable, signal } from '@angular/core';
import { InventoryItem } from '../models/inventory';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventroyService {
 private inventoryItems = signal<InventoryItem[]>([
    {
      id: 1,
      name: 'Laptop',
      description: '15-inch business laptop',
      category: 'Electronics',
      price: 999.99,
      quantity: 25,
      reorderLevel: 5,
      lastUpdated: new Date('2023-05-15'),
      supplier: 'TechSuppliers Inc.',
      sku: 'EL-LP-001'
    },
    {
      id: 2,
      name: 'Desk Chair',
      description: 'Ergonomic office chair',
      category: 'Furniture',
      price: 199.99,
      quantity: 15,
      reorderLevel: 3,
      lastUpdated: new Date('2023-06-20'),
      supplier: 'OfficeFurnishings Co.',
      sku: 'FU-CH-002'
    }
  ]);

  getInventoryItems() {
    return this.inventoryItems.asReadonly();
  }

  getItemById(id: number) {
    return this.inventoryItems().find(item => item.id === id);
  }

  addItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>) {
    const newItem: InventoryItem = {
      ...item,
      id: this.generateId(),
      lastUpdated: new Date()
    };
    this.inventoryItems.update(items => [...items, newItem]);
    return newItem;
  }

  updateItem(updatedItem: InventoryItem) {
    this.inventoryItems.update(items => 
      items.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, lastUpdated: new Date() } 
          : item
      )
    );
    return updatedItem;
  }

  deleteItem(id: number) {
    this.inventoryItems.update(items => items.filter(item => item.id !== id));
    return true;
  }

  private generateId(): number {
    const items = this.inventoryItems();
    return Math.max(...items.map(i => i.id), 0) + 1;
  }
}