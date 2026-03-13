# Architecture — AdminHub E-Commerce Admin Portal

## Component Architecture

```mermaid
graph TD
    A[App.tsx] --> B[QueryClientProvider]
    B --> C[RouterProvider]
    C --> D[AppShell]
    D --> E[Sidebar]
    D --> F[Header]
    D --> G[Outlet / Feature Routes]
    
    G --> H[DashboardPage]
    G --> I[ProductsPage]
    G --> J[InventoryPage]
    G --> K[PromotionsPage]
    G --> L[AuditPage]
    G --> M[FeatureFlagsPage]
    
    I --> N[AG Grid]
    I --> O[BulkEditPanel]
    I --> P[ImportExport]
    
    K --> Q[PromotionCards]
    K --> R[RuleBuilderModal]
    R --> S[ConditionEditor]
    R --> T[ActionEditor]
    R --> U[ScheduleEditor]
    R --> V[PreviewPanel]
```

## Data Flow

```mermaid
flowchart LR
    UI[React Components] -->|user action| Hook[React Query Hooks]
    Hook -->|fetch/mutate| API[Mock API Layer]
    API -->|response| Hook
    Hook -->|cache update| UI

    UI -->|bulk edit| Store[Zustand Store]
    Store -->|undo/redo stack| UI

    Store -->|operation| API
    API -->|conflict check| Store
```

## State Management Strategy

| State Type | Tool | Reasoning |
|-----------|------|-----------|
| **Server state** | React Query | Caching, deduplication, background refresh, stale-while-revalidate |
| **Auth state** | Zustand (`useAuthStore`) | Global singleton, needs access from any component |
| **Bulk operations** | Zustand (`useBulkOperations`) | Undo/redo stack needs Immer integration, global keyboard shortcuts |
| **Feature flags** | Zustand (`useFeatureFlags`) | Toggle-based, accessed across modules |
| **UI state** | React useState | Local to components (modals, search, filters) |

### Why NOT Redux?
- **Over-engineering** for this scope. Zustand gives the same isolation with 80% less boilerplate.
- **No middleware needed** — side effects handled by React Query.
- **Immer built-in** — Zustand + Immer = immutable updates without Redux Toolkit.

## Type Safety Architecture

```
types/
├── product.ts    → Product, ProductVariant, BulkUpdateProductDTO, BulkOperationResult
├── inventory.ts  → StockEntry, StockAdjustment, BulkStockAdjustmentDTO
├── promotion.ts  → PromotionRule, ConditionGroup, Condition, PromotionAction
├── audit.ts      → AuditEntry, ChangeRecord, AuditFilter
└── common.ts     → PaginatedResponse<T>, User, Permission, FeatureFlag, BulkOperation<T>
```

**Key patterns:**
- Generic `PaginatedResponse<T>` for all list endpoints
- `BulkOperationResult` with `success[]`, `failed[]`, `conflicts[]` for atomic ops
- Version-based optimistic concurrency (`expectedVersion` on every mutation)
- Discriminated unions for status types (`ProductStatus`, `PromotionStatus`)

## Caching Strategy

```mermaid
flowchart TD
    A[User navigates to Products] --> B{React Query cache?}
    B -->|Fresh < 5min| C[Render from cache]
    B -->|Stale > 5min| D[Background refetch]
    D --> E[Update cache]
    E --> C
    
    F[Bulk edit] --> G[Optimistic update]
    G --> H[API mutation]
    H -->|Success| I[Confirm cache]
    H -->|Conflict| J[Rollback + show conflict UI]
    H -->|Error| K[Rollback + toast]
```

## Performance Strategy

| Technique | Implementation |
|-----------|---------------|
| **Code splitting** | `React.lazy()` per feature route — 6 separate chunks |
| **Virtualization** | AG Grid renders only visible rows (of 10k+) |
| **Lazy loading** | Product images use `loading="lazy"` |
| **Debounced search** | Search triggers API after user stops typing |
| **Pagination** | Server-side pagination (100/page default) |
| **Memoization** | `useMemo` for AG Grid column defs, `useCallback` for handlers |

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| **XSS** | React auto-escapes; no `dangerouslySetInnerHTML` |
| **CSRF** | JWT token auth (memory only, not localStorage) |
| **Input validation** | Zod schemas on all user inputs |
| **RBAC** | Permission-based UI rendering via `useAuthStore` |
| **Audit trail** | Every mutation logged with user, IP, timestamp |
