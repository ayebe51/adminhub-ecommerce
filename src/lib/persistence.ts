import Dexie, { type Table } from 'dexie';
import type { Product, StockEntry, PromotionRule, AuditEntry } from '../types';

export class AdminHubDatabase extends Dexie {
  products!: Table<Product>;
  inventory!: Table<StockEntry>;
  promotions!: Table<PromotionRule>;
  auditLogs!: Table<AuditEntry>;

  constructor() {
    super('AdminHubDB');
    this.version(1).stores({
      products: 'id, sku, name, categoryId, status, visibility',
      inventory: 'id, productId, sku, warehouseId, status',
      promotions: 'id, name, status, priority',
      auditLogs: 'id, entityType, entityId, action, userId, timestamp'
    });
  }
}

export const db = new AdminHubDatabase();

// Helper to initialize data if empty
export async function initializePersistence(initialData: {
  products: Product[];
  inventory: StockEntry[];
  promotions: PromotionRule[];
  auditLogs: AuditEntry[];
}) {
  const productCount = await db.products.count();
  if (productCount === 0) {
    await db.products.bulkAdd(initialData.products);
    await db.inventory.bulkAdd(initialData.inventory);
    await db.promotions.bulkAdd(initialData.promotions);
    await db.auditLogs.bulkAdd(initialData.auditLogs);
    console.log('Persistence layer initialized with mock data');
  }
}
