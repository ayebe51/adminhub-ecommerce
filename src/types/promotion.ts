export interface PromotionRule {
  id: string;
  name: string;
  description: string;
  status: PromotionStatus;
  priority: number;
  conditions: ConditionGroup;
  actions: PromotionAction[];
  schedule: PromotionSchedule;
  usageLimit: number | null;
  usageCount: number;
  perCustomerLimit: number | null;
  applicableTo: 'all' | 'specific_products' | 'specific_categories';
  productIds: string[];
  categoryIds: string[];
  stackable: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'archived';

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
}

export interface Condition {
  id: string;
  type: ConditionType;
  field: string;
  operator: ComparisonOperator;
  value: string | number | boolean | string[];
}

export type ConditionType =
  | 'cart_total'
  | 'cart_quantity'
  | 'product_category'
  | 'product_brand'
  | 'product_tag'
  | 'product_price'
  | 'customer_group'
  | 'customer_order_count'
  | 'coupon_code'
  | 'day_of_week'
  | 'time_of_day';

export type ComparisonOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'between';

export interface PromotionAction {
  id: string;
  type: ActionType;
  value: number;
  maxDiscount: number | null;
  target: 'order' | 'product' | 'shipping';
  targetProductIds: string[];
  targetCategoryIds: string[];
}

export type ActionType =
  | 'percentage_discount'
  | 'fixed_discount'
  | 'free_shipping'
  | 'buy_x_get_y'
  | 'fixed_price';

export interface PromotionSchedule {
  startDate: string;
  endDate: string | null;
  isRecurring: boolean;
  recurringDays: number[];
  recurringStartTime: string | null;
  recurringEndTime: string | null;
  timezone: string;
}

// Preview
export interface CartPreview {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  appliedPromotions: AppliedPromotion[];
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  categoryId: string;
}

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  discount: number;
  description: string;
}

export interface PromotionFilter {
  search?: string;
  status?: PromotionStatus[];
  dateFrom?: string;
  dateTo?: string;
}
