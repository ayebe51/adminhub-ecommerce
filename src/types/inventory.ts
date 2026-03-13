export interface StockEntry {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variantId: string | null;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  status: StockStatus;
  lastCountedAt: string | null;
  updatedAt: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  sku: string;
  warehouseId: string;
  type: AdjustmentType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference: string;
  createdBy: string;
  createdAt: string;
}

export type AdjustmentType = 'received' | 'sold' | 'returned' | 'damaged' | 'adjustment' | 'transfer' | 'count';

export interface StockMovement {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt: string | null;
}

export interface InventoryFilter {
  search?: string;
  warehouseId?: string;
  status?: StockStatus[];
  categoryId?: string;
}

export interface BulkStockAdjustmentDTO {
  adjustments: {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: AdjustmentType;
    reason: string;
  }[];
}
