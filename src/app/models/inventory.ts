export interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  quantity: number;
  reorderLevel: number;
  lastUpdated: Date;
  supplier?: string;
  sku: string;
}