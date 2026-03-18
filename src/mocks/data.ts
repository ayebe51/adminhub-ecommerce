import { v4 as uuid } from 'uuid';
import type { Product, Category, Brand, StockEntry, PromotionRule, AuditEntry } from '@/types';

// ── Helpers ──────────────────────────────────────────────

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(2);
const pick = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
const pickMany = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// ── Static Data ──────────────────────────────────────────

const ADJECTIVES = ['Premium', 'Classic', 'Ultra', 'Pro', 'Essential', 'Elite', 'Signature', 'Vintage', 'Modern', 'Luxury', 'Smart', 'Eco', 'Artisan', 'Heritage', 'Compact'];
const NOUNS = ['Backpack', 'Watch', 'Sneakers', 'Headphones', 'Camera', 'Laptop', 'Tablet', 'Speaker', 'Jacket', 'Sunglasses', 'Wallet', 'Belt', 'Scarf', 'Mug', 'Bottle', 'Charger', 'Mouse', 'Keyboard', 'Monitor', 'Desk Lamp', 'Chair', 'Notebook', 'Pen Set', 'Luggage', 'Blanket'];
const BRAND_NAMES = ['NovaTech', 'Meridian Co', 'Apex Goods', 'Urban Edge', 'Stellar Labs', 'Pinnacle', 'Zenith Works', 'Craft & Co', 'Helix', 'Vantage'];
const TAGS = ['bestseller', 'new-arrival', 'sale', 'limited-edition', 'trending', 'eco-friendly', 'handmade', 'imported', 'exclusive', 'seasonal', 'clearance', 'bundle-eligible'];

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', parentId: null, level: 0, productCount: 0 },
  { id: 'cat-2', name: 'Clothing', slug: 'clothing', parentId: null, level: 0, productCount: 0 },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', parentId: null, level: 0, productCount: 0 },
  { id: 'cat-4', name: 'Home & Living', slug: 'home-living', parentId: null, level: 0, productCount: 0 },
  { id: 'cat-5', name: 'Audio', slug: 'audio', parentId: 'cat-1', level: 1, productCount: 0 },
  { id: 'cat-6', name: 'Computers', slug: 'computers', parentId: 'cat-1', level: 1, productCount: 0 },
  { id: 'cat-7', name: 'Watches', slug: 'watches', parentId: 'cat-3', level: 1, productCount: 0 },
  { id: 'cat-8', name: 'Bags', slug: 'bags', parentId: 'cat-3', level: 1, productCount: 0 },
  { id: 'cat-9', name: 'Outerwear', slug: 'outerwear', parentId: 'cat-2', level: 1, productCount: 0 },
  { id: 'cat-10', name: 'Furniture', slug: 'furniture', parentId: 'cat-4', level: 1, productCount: 0 },
];

export const BRANDS: Brand[] = BRAND_NAMES.map((name, i) => ({
  id: `brand-${i + 1}`,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=64`,
}));

// ── Generators ───────────────────────────────────────────

export function generateProduct(index: number): Product {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  const name = `${adj} ${noun}`;
  const category = pick(CATEGORIES);
  const brand = pick(BRANDS);
  const price = randomFloat(9.99, 999.99);
  const costPrice = +(price * randomFloat(0.3, 0.65)).toFixed(2);
  const hasComparePrice = Math.random() > 0.6;
  const statuses: Product['status'][] = ['active', 'active', 'active', 'draft', 'archived'];
  const status = pick(statuses);

  const now = new Date();
  const createdDate = new Date(now.getTime() - randomInt(1, 365) * 86400000);
  const updatedDate = new Date(createdDate.getTime() + randomInt(0, 60) * 86400000);

  const PRODUCT_IMAGES: Record<string, string> = {
    'cat-1': '/assets/products/laptop.png', // Electronics
    'cat-5': '/assets/products/headphones.png', // Audio
    'cat-6': '/assets/products/laptop.png', // Computers
    'cat-7': '/assets/products/watch.png', // Watches
    'cat-2': '/assets/products/sneakers.png', // Clothing
    'cat-3': '/assets/products/watch.png', // Accessories
  };

  const imageUrl = PRODUCT_IMAGES[category.id] || `https://picsum.photos/seed/${index}/400/400`;

  return {
    id: uuid(),
    sku: `SKU-${String(index + 1).padStart(6, '0')}`,
    name,
    slug: `${adj}-${noun}`.toLowerCase().replace(/\s+/g, '-') + `-${index}`,
    description: `High-quality ${name.toLowerCase()} from ${brand.name}. Perfect for everyday use with premium materials and craftsmanship.`,
    shortDescription: `${adj} ${noun.toLowerCase()} by ${brand.name}`,
    categoryId: category.id,
    categoryName: category.name,
    brandId: brand.id,
    brandName: brand.name,
    price,
    compareAtPrice: hasComparePrice ? +(price * randomFloat(1.1, 1.5)).toFixed(2) : null,
    costPrice,
    currency: 'USD',
    status,
    visibility: pick(['visible', 'visible', 'visible', 'hidden']),
    stockQuantity: randomInt(0, 500),
    lowStockThreshold: 10,
    weight: randomFloat(0.1, 15),
    weightUnit: 'kg',
    tags: pickMany(TAGS, randomInt(1, 4)),
    images: [{
      id: uuid(),
      url: imageUrl,
      alt: name,
      position: 0,
      isPrimary: true,
    }],
    variants: [],
    attributes: [
      { name: 'Color', value: pick(['Black', 'White', 'Navy', 'Gray', 'Red', 'Green']), isFilterable: true },
      { name: 'Size', value: pick(['S', 'M', 'L', 'XL', 'One Size']), isFilterable: true },
    ],
    seoTitle: `Buy ${name} | E-Commerce Store`,
    seoDescription: `Shop ${name} from ${brand.name}. Free shipping on orders over $50.`,
    createdAt: createdDate.toISOString(),
    updatedAt: updatedDate.toISOString(),
    publishedAt: status === 'active' ? createdDate.toISOString() : null,
    version: 1,
  };
}

export function generateProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => generateProduct(i));
}

export function generateStockEntries(products: Product[]): StockEntry[] {
  const warehouses = [
    { id: 'wh-1', name: 'Main Warehouse' },
    { id: 'wh-2', name: 'East Hub' },
    { id: 'wh-3', name: 'West Distribution' },
  ];

  return products.map(product => {
    const wh = pick(warehouses);
    const quantity = product.stockQuantity;
    const reserved = randomInt(0, Math.min(quantity, 20));
    let status: StockEntry['status'];
    if (quantity === 0) status = 'out_of_stock';
    else if (quantity <= product.lowStockThreshold) status = 'low_stock';
    else status = 'in_stock';

    return {
      id: uuid(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      variantId: null,
      warehouseId: wh.id,
      warehouseName: wh.name,
      quantity,
      reservedQuantity: reserved,
      availableQuantity: quantity - reserved,
      lowStockThreshold: product.lowStockThreshold,
      reorderPoint: 20,
      reorderQuantity: 100,
      status,
      lastCountedAt: Math.random() > 0.3 ? new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString() : null,
      updatedAt: product.updatedAt,
    };
  });
}

export function generatePromotions(): PromotionRule[] {
  const promos: PromotionRule[] = [
    {
      id: uuid(),
      name: 'Summer Sale 20% Off',
      description: 'Get 20% off on all products during the summer season',
      status: 'active',
      priority: 1,
      conditions: {
        operator: 'AND',
        conditions: [
          { id: uuid(), type: 'cart_total', field: 'subtotal', operator: 'greater_than', value: 50 },
        ],
      },
      actions: [
        { id: uuid(), type: 'percentage_discount', value: 20, maxDiscount: 100, target: 'order', targetProductIds: [], targetCategoryIds: [] },
      ],
      schedule: {
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-08-31T23:59:59Z',
        isRecurring: false,
        recurringDays: [],
        recurringStartTime: null,
        recurringEndTime: null,
        timezone: 'UTC',
      },
      usageLimit: 10000,
      usageCount: 3421,
      perCustomerLimit: 1,
      applicableTo: 'all',
      productIds: [],
      categoryIds: [],
      stackable: false,
      createdBy: 'admin-001',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-03-01T08:00:00Z',
      version: 3,
    },
    {
      id: uuid(),
      name: 'Buy 3 Get Free Shipping',
      description: 'Free shipping when cart has 3 or more items',
      status: 'active',
      priority: 2,
      conditions: {
        operator: 'AND',
        conditions: [
          { id: uuid(), type: 'cart_quantity', field: 'totalItems', operator: 'greater_than_or_equal', value: 3 },
        ],
      },
      actions: [
        { id: uuid(), type: 'free_shipping', value: 0, maxDiscount: null, target: 'shipping', targetProductIds: [], targetCategoryIds: [] },
      ],
      schedule: {
        startDate: '2026-01-01T00:00:00Z',
        endDate: null,
        isRecurring: false,
        recurringDays: [],
        recurringStartTime: null,
        recurringEndTime: null,
        timezone: 'UTC',
      },
      usageLimit: null,
      usageCount: 8732,
      perCustomerLimit: null,
      applicableTo: 'all',
      productIds: [],
      categoryIds: [],
      stackable: true,
      createdBy: 'admin-001',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-02-15T12:00:00Z',
      version: 1,
    },
    {
      id: uuid(),
      name: 'Electronics 15% Off',
      description: '15% discount on all electronics category products',
      status: 'scheduled',
      priority: 3,
      conditions: {
        operator: 'AND',
        conditions: [
          { id: uuid(), type: 'product_category', field: 'categoryId', operator: 'in', value: ['cat-1', 'cat-5', 'cat-6'] },
          { id: uuid(), type: 'cart_total', field: 'subtotal', operator: 'greater_than', value: 100 },
        ],
      },
      actions: [
        { id: uuid(), type: 'percentage_discount', value: 15, maxDiscount: 75, target: 'product', targetProductIds: [], targetCategoryIds: ['cat-1'] },
      ],
      schedule: {
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T23:59:59Z',
        isRecurring: false,
        recurringDays: [],
        recurringStartTime: null,
        recurringEndTime: null,
        timezone: 'UTC',
      },
      usageLimit: 5000,
      usageCount: 0,
      perCustomerLimit: 2,
      applicableTo: 'specific_categories',
      productIds: [],
      categoryIds: ['cat-1', 'cat-5', 'cat-6'],
      stackable: true,
      createdBy: 'admin-001',
      createdAt: '2026-03-10T14:00:00Z',
      updatedAt: '2026-03-10T14:00:00Z',
      version: 1,
    },
    {
      id: uuid(),
      name: 'Weekend Flash Sale',
      description: '$10 off orders over $75 every weekend',
      status: 'active',
      priority: 4,
      conditions: {
        operator: 'AND',
        conditions: [
          { id: uuid(), type: 'cart_total', field: 'subtotal', operator: 'greater_than_or_equal', value: 75 },
          { id: uuid(), type: 'day_of_week', field: 'dayOfWeek', operator: 'in', value: ['Saturday', 'Sunday'] },
        ],
      },
      actions: [
        { id: uuid(), type: 'fixed_discount', value: 10, maxDiscount: null, target: 'order', targetProductIds: [], targetCategoryIds: [] },
      ],
      schedule: {
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
        isRecurring: true,
        recurringDays: [6, 0],
        recurringStartTime: '00:00',
        recurringEndTime: '23:59',
        timezone: 'UTC',
      },
      usageLimit: null,
      usageCount: 4521,
      perCustomerLimit: 1,
      applicableTo: 'all',
      productIds: [],
      categoryIds: [],
      stackable: false,
      createdBy: 'admin-001',
      createdAt: '2026-01-05T09:00:00Z',
      updatedAt: '2026-02-20T11:00:00Z',
      version: 2,
    },
    {
      id: uuid(),
      name: 'VIP Customer 25% Off',
      description: '25% discount for VIP tier customers',
      status: 'active',
      priority: 5,
      conditions: {
        operator: 'AND',
        conditions: [
          { id: uuid(), type: 'customer_group', field: 'group', operator: 'equals', value: 'vip' },
          { id: uuid(), type: 'customer_order_count', field: 'orderCount', operator: 'greater_than', value: 10 },
        ],
      },
      actions: [
        { id: uuid(), type: 'percentage_discount', value: 25, maxDiscount: 150, target: 'order', targetProductIds: [], targetCategoryIds: [] },
      ],
      schedule: {
        startDate: '2026-01-01T00:00:00Z',
        endDate: null,
        isRecurring: false,
        recurringDays: [],
        recurringStartTime: null,
        recurringEndTime: null,
        timezone: 'UTC',
      },
      usageLimit: null,
      usageCount: 1234,
      perCustomerLimit: null,
      applicableTo: 'all',
      productIds: [],
      categoryIds: [],
      stackable: true,
      createdBy: 'admin-001',
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2026-03-01T08:00:00Z',
      version: 4,
    },
  ];

  return promos;
}

export function generateAuditEntries(count: number): AuditEntry[] {
  const actions: AuditEntry['action'][] = ['create', 'update', 'delete', 'bulk_update', 'import', 'status_change'];
  const entityTypes: AuditEntry['entityType'][] = ['product', 'inventory', 'promotion', 'category'];
  const users = [
    { id: 'admin-001', name: 'Sarah Chen', role: 'super_admin' },
    { id: 'admin-002', name: 'James Park', role: 'admin' },
    { id: 'editor-001', name: 'Maria Lopez', role: 'editor' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const user = pick(users);
    const action = pick(actions);
    const entityType = pick(entityTypes);
    const timestamp = new Date(Date.now() - i * randomInt(600000, 3600000));

    return {
      id: uuid(),
      entityType,
      entityId: uuid(),
      entityName: `${pick(ADJECTIVES)} ${pick(NOUNS)}`,
      action,
      changes: action === 'update' || action === 'bulk_update'
        ? [
            {
              field: pick(['price', 'status', 'stockQuantity', 'name', 'categoryId']),
              fieldLabel: pick(['Price', 'Status', 'Stock Quantity', 'Name', 'Category']),
              oldValue: pick(['29.99', 'draft', '100', 'Old Name']),
              newValue: pick(['39.99', 'active', '50', 'New Name']),
              type: 'string' as const,
            },
          ]
        : [],
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
      userAgent: 'Mozilla/5.0 (Admin Portal)',
      timestamp: timestamp.toISOString(),
      metadata: { source: 'admin_portal', batchId: action === 'bulk_update' ? uuid() : undefined },
    };
  });
}
