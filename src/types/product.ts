export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number;
  currency: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  stockQuantity: number;
  lowStockThreshold: number;
  weight: number;
  weightUnit: WeightUnit;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  version: number; // for optimistic concurrency
}

export type ProductStatus = 'draft' | 'active' | 'archived' | 'discontinued';
export type ProductVisibility = 'visible' | 'hidden' | 'catalog_only' | 'search_only';
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  weight: number;
  isDefault: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
  isFilterable: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: number;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

// DTOs for mutations
export interface CreateProductDTO {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  price: number;
  costPrice: number;
  status: ProductStatus;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
  version: number;
}

export interface BulkUpdateProductDTO {
  ids: string[];
  changes: Partial<Pick<Product, 'price' | 'compareAtPrice' | 'status' | 'categoryId' | 'tags' | 'visibility'>>;
  expectedVersions: Record<string, number>;
}

export interface BulkOperationResult {
  success: string[];
  failed: { id: string; reason: string; currentVersion: number }[];
  conflicts: { id: string; serverVersion: number; clientVersion: number }[];
}

export interface ProductFilter {
  search?: string;
  status?: ProductStatus[];
  categoryId?: string[];
  brandId?: string[];
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  tags?: string[];
}
