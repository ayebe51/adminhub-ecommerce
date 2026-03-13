export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
  value: unknown;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  permissions: Permission[];
  lastLoginAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export type Permission =
  | 'products:read' | 'products:write' | 'products:delete' | 'products:bulk'
  | 'inventory:read' | 'inventory:write'
  | 'promotions:read' | 'promotions:write' | 'promotions:delete'
  | 'audit:read'
  | 'settings:read' | 'settings:write'
  | 'users:read' | 'users:write';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rolloutPercentage: number;
}

// Bulk operation types
export interface BulkOperation<T = unknown> {
  id: string;
  type: 'update' | 'delete' | 'status_change';
  timestamp: number;
  affectedIds: string[];
  previousValues: Record<string, T>;
  newValues: Record<string, T>;
  description: string;
  status: 'pending' | 'applied' | 'undone' | 'failed';
}
