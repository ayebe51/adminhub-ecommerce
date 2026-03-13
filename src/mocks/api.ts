import { generateProducts, generateStockEntries, generatePromotions, generateAuditEntries, CATEGORIES, BRANDS } from './data';
import type { Product, BulkOperationResult } from '@/types';

// ── Initialize 10k+ products ─────────────────────────
let products = generateProducts(10000);
let stockEntries = generateStockEntries(products);
let promotions = generatePromotions();
let auditEntries = generateAuditEntries(500);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Products API ──────────────────────────────────────
export const productsApi = {
  async getAll(page = 1, pageSize = 100, search?: string, filters?: Record<string, unknown>) {
    await delay(200);
    let filtered = [...products];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q)
      );
    }

    if (filters) {
      if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
        filtered = filtered.filter(p => (filters.status as string[]).includes(p.status));
      }
      if (filters.categoryId && Array.isArray(filters.categoryId) && filters.categoryId.length > 0) {
        filtered = filtered.filter(p => (filters.categoryId as string[]).includes(p.categoryId));
      }
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

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
    await delay(100);
    return products.find(p => p.id === id) ?? null;
  },

  async create(data: Partial<Product>) {
    await delay(300);
    const newProduct: Product = {
      ...generateProducts(1)[0],
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    products = [newProduct, ...products];
    return newProduct;
  },

  async update(id: string, data: Partial<Product>, expectedVersion: number) {
    await delay(200);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    if (products[idx].version !== expectedVersion) {
      throw new Error(`Version conflict: expected ${expectedVersion}, got ${products[idx].version}`);
    }
    products[idx] = { ...products[idx], ...data, version: products[idx].version + 1, updatedAt: new Date().toISOString() };
    return products[idx];
  },

  async bulkUpdate(ids: string[], changes: Partial<Product>, expectedVersions: Record<string, number>): Promise<BulkOperationResult> {
    await delay(500);
    const result: BulkOperationResult = { success: [], failed: [], conflicts: [] };

    for (const id of ids) {
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) {
        result.failed.push({ id, reason: 'Product not found', currentVersion: 0 });
        continue;
      }
      if (expectedVersions[id] !== undefined && products[idx].version !== expectedVersions[id]) {
        result.conflicts.push({
          id,
          serverVersion: products[idx].version,
          clientVersion: expectedVersions[id],
        });
        continue;
      }
      products[idx] = { ...products[idx], ...changes, version: products[idx].version + 1, updatedAt: new Date().toISOString() };
      result.success.push(id);
    }
    return result;
  },

  async delete(ids: string[]) {
    await delay(300);
    products = products.filter(p => !ids.includes(p.id));
    return { deleted: ids.length };
  },
};

// ── Inventory API ─────────────────────────────────────
export const inventoryApi = {
  async getAll(page = 1, pageSize = 100, search?: string, filters?: Record<string, unknown>) {
    await delay(200);
    let filtered = [...stockEntries];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.productName.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q)
      );
    }
    if (filters?.status && Array.isArray(filters.status) && filters.status.length > 0) {
      filtered = filtered.filter(s => (filters.status as string[]).includes(s.status));
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize), hasNext: start + pageSize < total, hasPrevious: page > 1 };
  },

  async adjustStock(productId: string, quantity: number, type: string, reason: string) {
    await delay(200);
    const entry = stockEntries.find(s => s.productId === productId);
    if (!entry) throw new Error('Stock entry not found');
    const prev = entry.quantity;
    if (type === 'received') entry.quantity += quantity;
    else if (type === 'adjustment') entry.quantity = quantity;
    else entry.quantity -= quantity;
    entry.availableQuantity = entry.quantity - entry.reservedQuantity;
    entry.status = entry.quantity === 0 ? 'out_of_stock' : entry.quantity <= entry.lowStockThreshold ? 'low_stock' : 'in_stock';
    entry.updatedAt = new Date().toISOString();
    return { previousQuantity: prev, newQuantity: entry.quantity, reason };
  },

  async getStats() {
    await delay(100);
    const total = stockEntries.length;
    const inStock = stockEntries.filter(s => s.status === 'in_stock').length;
    const lowStock = stockEntries.filter(s => s.status === 'low_stock').length;
    const outOfStock = stockEntries.filter(s => s.status === 'out_of_stock').length;
    const totalValue = stockEntries.reduce((sum, s) => {
      const product = products.find(p => p.id === s.productId);
      return sum + (product ? product.price * s.quantity : 0);
    }, 0);
    return { total, inStock, lowStock, outOfStock, totalValue };
  },
};

// ── Promotions API ────────────────────────────────────
export const promotionsApi = {
  async getAll() {
    await delay(200);
    return promotions;
  },

  async getById(id: string) {
    await delay(100);
    return promotions.find(p => p.id === id) ?? null;
  },

  async create(data: Partial<typeof promotions[0]>) {
    await delay(300);
    const promo = { ...generatePromotions()[0], ...data, id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 };
    promotions = [promo, ...promotions];
    return promo;
  },

  async update(id: string, data: Partial<typeof promotions[0]>) {
    await delay(200);
    const idx = promotions.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Promotion not found');
    promotions[idx] = { ...promotions[idx], ...data, updatedAt: new Date().toISOString(), version: promotions[idx].version + 1 };
    return promotions[idx];
  },

  async delete(id: string) {
    await delay(200);
    promotions = promotions.filter(p => p.id !== id);
  },
};

// ── Audit API ─────────────────────────────────────────
export const auditApi = {
  async getAll(page = 1, pageSize = 50, filters?: Record<string, unknown>) {
    await delay(150);
    let filtered = [...auditEntries];

    if (filters?.entityType && Array.isArray(filters.entityType) && filters.entityType.length > 0) {
      filtered = filtered.filter(a => (filters.entityType as string[]).includes(a.entityType));
    }
    if (filters?.action && Array.isArray(filters.action) && filters.action.length > 0) {
      filtered = filtered.filter(a => (filters.action as string[]).includes(a.action));
    }
    if (filters?.search) {
      const q = (filters.search as string).toLowerCase();
      filtered = filtered.filter(a => a.entityName.toLowerCase().includes(q) || a.userName.toLowerCase().includes(q));
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize), hasNext: start + pageSize < total, hasPrevious: page > 1 };
  },
};

// ── Categories & Brands API ───────────────────────────
export const categoriesApi = {
  async getAll() {
    await delay(100);
    return CATEGORIES;
  },
};

export const brandsApi = {
  async getAll() {
    await delay(100);
    return BRANDS;
  },
};
