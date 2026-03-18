import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';

// Lazy load feature pages for code splitting
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProductsPage = lazy(() => import('@/features/products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const InventoryPage = lazy(() => import('@/features/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const PromotionsPage = lazy(() => import('@/features/promotions/PromotionsPage').then(m => ({ default: m.PromotionsPage })));
const AuditPage = lazy(() => import('@/features/audit/AuditPage').then(m => ({ default: m.AuditPage })));
const FeatureFlagsPage = lazy(() => import('@/features/flags/FeatureFlagsPage').then(m => ({ default: m.FeatureFlagsPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

import { Toaster } from 'sonner';
import { PageSkeleton } from '@/components/common/Skeleton';

const LoadingFallback = () => <PageSkeleton />;

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingFallback />}><DashboardPage /></Suspense> },
      { path: 'products', element: <Suspense fallback={<LoadingFallback />}><ProductsPage /></Suspense> },
      { path: 'inventory', element: <Suspense fallback={<LoadingFallback />}><InventoryPage /></Suspense> },
      { path: 'promotions', element: <Suspense fallback={<LoadingFallback />}><PromotionsPage /></Suspense> },
      { path: 'audit', element: <Suspense fallback={<LoadingFallback />}><AuditPage /></Suspense> },
      { path: 'flags', element: <Suspense fallback={<LoadingFallback />}><FeatureFlagsPage /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense> },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors closeButton />
    <RouterProvider router={router} />
  </QueryClientProvider>
);

export default App;
