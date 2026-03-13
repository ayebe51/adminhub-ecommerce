export interface AuditEntry {
  id: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  action: AuditAction;
  changes: ChangeRecord[];
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export type EntityType = 'product' | 'inventory' | 'promotion' | 'category' | 'user' | 'order' | 'setting';
export type AuditAction = 'create' | 'update' | 'delete' | 'bulk_update' | 'import' | 'export' | 'status_change' | 'publish' | 'archive';

export interface ChangeRecord {
  field: string;
  fieldLabel: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

export interface AuditFilter {
  search?: string;
  entityType?: EntityType[];
  action?: AuditAction[];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditStats {
  totalChanges: number;
  changesByType: Record<EntityType, number>;
  changesByAction: Record<AuditAction, number>;
  topUsers: { userId: string; userName: string; count: number }[];
  recentActivity: AuditEntry[];
}
