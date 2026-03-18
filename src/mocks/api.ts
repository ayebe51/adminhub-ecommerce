import { generateProducts, generateStockEntries, generatePromotions, generateAuditEntries, CATEGORIES, BRANDS } from './data';
import type { Product, BulkOperationResult, PromotionRule } from '@/types';
import { db, initializePersistence } from '@/lib/persistence';

// Initialize data if needed
const initialProducts = generateProducts(10000);
initializePersistence({
  products: initialProducts,
  inventory: generateStockEntries(initialProducts),
  promotions: generatePromotions(),
  auditLogs: generateAuditEntries(500),
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Products API ──────────────────────────────────────
export const productsApi = {
  async getAll(page = 1, pageSize = 100, search?: string, filters?: Record<string, unknown>) {
    await delay(100);
    let collection = db.products.toCollection();

    if (search) {
      const q = search.toLowerCase();
      collection = db.products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        p.brandName.toLowerCase().includes(q)
      );
    }

    let items = await collection.toArray();

    if (filters) {
      if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
        items = items.filter(p => (filters.status as string[]).includes(p.status));
      }
      if (filters.categoryId && Array.isArray(filters.categoryId) && filters.categoryId.length > 0) {
        items = items.filter(p => (filters.categoryId as string[]).includes(p.categoryId));
      }
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: start + pageSize < total,
      hasPrevious: page > 1,
    };
  },

  async getById(id: string) {
    await delay(50);
    return await db.products.get(id) ?? null;
  },

  async create(data: Partial<Product>) {
    await delay(200);
    const newProduct: Product = {
      ...generateProducts(1)[0],
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    await db.products.add(newProduct);
    return newProduct;
  },

  async update(id: string, data: Partial<Product>, expectedVersion: number) {
    await delay(100);
    const product = await db.products.get(id);
    if (!product) throw new Error('Product not found');
    if (product.version !== expectedVersion) {
      throw new Error(`Version conflict: expected ${expectedVersion}, got ${product.version}`);
    }
    const updated = { ...product, ...data, version: product.version + 1, updatedAt: new Date().toISOString() };
    await db.products.put(updated);
    return updated;
  },

  async bulkUpdate(ids: string[], changes: Partial<Product>, expectedVersions: Record<string, number>): Promise<BulkOperationResult> {
    await delay(300);
    const result: BulkOperationResult = { success: [], failed: [], conflicts: [] };

    for (const id of ids) {
      const product = await db.products.get(id);
      if (!product) {
        result.failed.push({ id, reason: 'Product not found', currentVersion: 0 });
        continue;
      }
      if (expectedVersions[id] !== undefined && product.version !== expectedVersions[id]) {
        result.conflicts.push({
          id,
          serverVersion: product.version,
          clientVersion: expectedVersions[id],
        });
        continue;
      }
      const updated = { ...product, ...changes, version: product.version + 1, updatedAt: new Date().toISOString() };
      await db.products.put(updated);
      result.success.push(id);
    }
    return result;
  },

  async delete(ids: string[]) {
    await delay(200);
    await db.products.bulkDelete(ids);
    return { deleted: ids.length };
  },
};

// ── Inventory API ─────────────────────────────────────
export const inventoryApi = {
  async getAll(page = 1, pageSize = 100, search?: string, filters?: Record<string, unknown>) {
    await delay(100);
    let collection = db.inventory.toCollection();

    if (search) {
      const q = search.toLowerCase();
      collection = db.inventory.filter(s =>
        s.productName.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q)
      );
    }
    
    let items = await collection.toArray();
    if (filters?.status && Array.isArray(filters.status) && filters.status.length > 0) {
      items = items.filter(s => (filters.status as string[]).includes(s.status));
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize), hasNext: start + pageSize < total, hasPrevious: page > 1 };
  },

  async adjustStock(productId: string, quantity: number, type: string, reason: string) {
    await delay(100);
    const entry = await db.inventory.where('productId').equals(productId).first();
    if (!entry) throw new Error('Stock entry not found');
    const prev = entry.quantity;
    if (type === 'received') entry.quantity += quantity;
    else if (type === 'adjustment') entry.quantity = quantity;
    else entry.quantity -= quantity;
    entry.availableQuantity = entry.quantity - entry.reservedQuantity;
    entry.status = entry.quantity === 0 ? 'out_of_stock' : entry.quantity <= entry.lowStockThreshold ? 'low_stock' : 'in_stock';
    entry.updatedAt = new Date().toISOString();
    await db.inventory.put(entry);
    return { previousQuantity: prev, newQuantity: entry.quantity, reason };
  },

  async getStats() {
    await delay(50);
    const allStock = await db.inventory.toArray();
    const allProducts = await db.products.toArray();

    const total = allStock.length;
    const inStock = allStock.filter(s => s.status === 'in_stock').length;
    const lowStock = allStock.filter(s => s.status === 'low_stock').length;
    const outOfStock = allStock.filter(s => s.status === 'out_of_stock').length;
    const totalValue = allStock.reduce((sum, s) => {
      const product = allProducts.find(p => p.id === s.productId);
      return sum + (product ? product.price * s.quantity : 0);
    }, 0);
    return { total, inStock, lowStock, outOfStock, totalValue };
  },
};

// ── Promotions API ────────────────────────────────────
export const promotionsApi = {
  async getAll() {
    await delay(100);
    return await db.promotions.toArray();
  },

  async getById(id: string) {
    await delay(50);
    return await db.promotions.get(id) ?? null;
  },

  async create(data: Partial<PromotionRule>) {
    await delay(200);
    const promo: PromotionRule = { 
      ...generatePromotions()[0], 
      ...data, 
      id: crypto.randomUUID(), 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(), 
      version: 1 
    };
    await db.promotions.add(promo);
    return promo;
  },

  async update(id: string, data: Partial<PromotionRule>) {
    await delay(100);
    const promo = await db.promotions.get(id);
    if (!promo) throw new Error('Promotion not found');
    const updated = { ...promo, ...data, updatedAt: new Date().toISOString(), version: promo.version + 1 };
    await db.promotions.put(updated);
    return updated;
  },

  async delete(id: string) {
    await delay(100);
    await db.promotions.delete(id);
  },
};

// ── Audit API ─────────────────────────────────────────
export const auditApi = {
  async getAll(page = 1, pageSize = 50, filters?: Record<string, unknown>) {
    await delay(100);
    let collection = db.auditLogs.toCollection();

    if (filters?.search) {
      const q = (filters.search as string).toLowerCase();
      collection = db.auditLogs.filter(a => a.entityName.toLowerCase().includes(q) || a.userName.toLowerCase().includes(q));
    }

    let items = await collection.reverse().sortBy('timestamp');

    if (filters?.entityType && Array.isArray(filters.entityType) && filters.entityType.length > 0) {
      items = items.filter(a => (filters.entityType as string[]).includes(a.entityType));
    }
    if (filters?.action && Array.isArray(filters.action) && filters.action.length > 0) {
      items = items.filter(a => (filters.action as string[]).includes(a.action));
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize), hasNext: start + pageSize < total, hasPrevious: page > 1 };
  },
};

// ── Categories & Brands API ───────────────────────────
export const categoriesApi = {
  async getAll() {
    await delay(50);
    return CATEGORIES;
  },
};

export const brandsApi = {
  async getAll() {
    await delay(50);
    return BRANDS;
  },
};
