export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number; // Cost of the product (for profit margin calculation)
  quantity: number; // Available quantity
  initialQuantity: number; // Quantity at shift start (stored in metadata or calculated)
  soldQuantity: number; // Total quantity sold (calculated)
  soldQuantityCash: number; // Quantity sold paid in cash (stored in metadata)
  soldQuantityCredit: number; // Quantity sold on credit (stored in metadata)
  imageUrl: string;
  category: string;
  minStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AppRole = 'admin' | 'user';

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockProducts: number;
}
