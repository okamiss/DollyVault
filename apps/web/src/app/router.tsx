import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AuthLayout } from './layouts/AuthLayout';
import { AppShell } from './layouts/AppShell';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/home/HomePage';
import { StatsPage } from '../pages/stats/StatsPage';
import { CatalogListPage } from '../pages/catalog/CatalogListPage';
import { CatalogCreatePage } from '../pages/catalog/CatalogCreatePage';
import { CatalogDetailPage } from '../pages/catalog/CatalogDetailPage';
import { TimelinePage } from '../pages/timeline/TimelinePage';
import { PosterPage } from '../pages/poster/PosterPage';
import { MePage } from '../pages/me/MePage';
import { CollectionDetailPage } from '../pages/collections/CollectionDetailPage';
import { http } from '../shared/api/http';
import { useAuthStore } from '../shared/stores/authStore';
import type { CurrentUser } from '../shared/types';

function RequireAuth() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await http.get<CurrentUser>('/auth/me');
      setUser(data);
      return data;
    },
    enabled: Boolean(token),
    retry: false,
  });

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (meQuery.isPending) {
    return (
      <div className="center-screen">
        <Spin />
      </div>
    );
  }

  if (meQuery.isError) {
    logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/stats', element: <StatsPage /> },
          { path: '/catalog', element: <CatalogListPage /> },
          { path: '/catalog/new', element: <CatalogCreatePage /> },
          { path: '/catalog/:id', element: <CatalogDetailPage /> },
          { path: '/catalog/:id/edit', element: <CatalogCreatePage /> },
          { path: '/collections/:id', element: <CollectionDetailPage /> },
          { path: '/timeline', element: <TimelinePage /> },
          { path: '/poster', element: <PosterPage /> },
          { path: '/me', element: <MePage /> },
        ],
      },
    ],
  },
]);
