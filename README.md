# AdminHub — E-Commerce Admin Portal

> Enterprise-grade Admin Portal for E-Commerce platform management. Built with React, TypeScript, AG Grid, and GraphQL — showcasing bulk operations, rule-based promotions, and 10k+ row performance.

## ✨ Highlights

| Feature | Details |
|---------|---------|
| **Spreadsheet-style Product Grid** | AG Grid with 10,000+ virtualized rows, inline editing, sort, filter |
| **Bulk Operations + Undo/Redo** | Atomic batch updates with `Ctrl+Z` undo stack, conflict resolution |
| **CSV Import/Export** | PapaParse-powered file I/O with validation preview |
| **Promotion Rule Builder** | Visual "IF condition THEN action" builder with AND/OR logic |
| **Promotion Preview** | Live cart simulation showing discount effects |
| **Audit Trail** | Timeline-style change logs with field-level diffs |
| **Feature Flags** | Runtime feature toggles with rollout percentages |
| **Dark Enterprise Theme** | Glassmorphism, design tokens, smooth animations |

## 📖 Technical Case Study

For recruiters and engineering leaders: Please read the **[Technical Case Study](./docs/case-study.md)**. It details how I solved key engineering challenges:
1. Virtualizing 10,000+ rows for smooth 60fps scrolling.
2. Building an atomic, immutable Undo/Redo stack with Zustand and Immer.
3. Designing an intuitive visual rule builder for complex boolean logic.
4. Implementing route-level code splitting for faster time-to-interactive.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + Vite 8 |
| **Language** | TypeScript (strict mode) |
| **Data Grid** | AG Grid Community |
| **State** | Zustand (global) + React Query (server state) |
| **API Mock** | MSW-ready mock API layer |
| **Styling** | Tailwind CSS v4 + custom design tokens |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Routing** | React Router v7 (lazy routes, code splitting) |
| **Validation** | Zod schemas |
| **Testing** | Vitest + React Testing Library |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📂 Project Structure

```
src/
├── components/
│   └── layout/          # AppShell, Sidebar, Header
├── features/
│   ├── dashboard/       # KPI cards, revenue charts
│   ├── products/        # AG Grid, bulk edit, import/export
│   ├── inventory/       # Stock management, alerts
│   ├── promotions/      # Rule builder, preview, scheduling
│   ├── audit/           # Change log timeline, diffs
│   └── flags/           # Feature flag management
├── mocks/
│   ├── api.ts           # Mock API with 10k+ synthetic data
│   └── data.ts          # Data generators
├── store/
│   ├── useAuthStore.ts  # Authentication state
│   ├── useBulkOperations.ts  # Undo/redo stack (Immer)
│   └── useFeatureFlags.ts    # Feature toggles
├── types/               # Domain models, DTOs
│   ├── product.ts       # Product, Variant, BulkOperation
│   ├── inventory.ts     # Stock, Adjustment, Movement
│   ├── promotion.ts     # Rule, Condition, Action, Schedule
│   ├── audit.ts         # AuditEntry, ChangeRecord
│   └── common.ts        # Pagination, RBAC, FeatureFlag
├── App.tsx              # Router + providers
├── main.tsx             # Entry point
└── index.css            # Design system tokens
```

## 🎯 Architecture Decisions

### Why Zustand over Redux?
- **Minimal boilerplate** — no action creators, reducers, or middleware
- **Module isolation** — each store is independent (auth, bulk ops, flags)
- **Immer integration** — immutable undo/redo stack with `produce()`

### Why Mock API over MSW?
- **Zero setup** — works instantly without service worker registration
- **Realistic delays** — simulated network latency (100-500ms)
- **Enterprise scale** — generates 10k+ products with realistic data

### Why AG Grid?
- **Virtualization** — handles 10k+ rows without DOM bloat
- **Built-in features** — sorting, filtering, pagination, cell editing
- **Enterprise feel** — matches the design language of tools like Salesforce/SAP

## 🔐 Security Notes (Frontend)

- **XSS Mitigation**: React auto-escapes JSX; no `dangerouslySetInnerHTML`
- **CSRF**: Token-based auth ready (JWT in auth store)
- **Secure Storage**: Auth tokens stored in Zustand (memory), not localStorage
- **Input Validation**: Zod schemas validate all user inputs

## ⚡ Performance

- **Code Splitting**: Lazy routes reduce initial bundle
- **AG Grid Virtualization**: Only visible rows rendered
- **React Query Caching**: 5-minute stale time, deduplication
- **CSS Design Tokens**: No runtime CSS-in-JS overhead

## 📄 License

MIT
