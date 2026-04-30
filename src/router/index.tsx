import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';
import { Discovery } from '../pages/Discovery';
import { ResumeListPage } from '../features/resumes/pages/ResumeListPage';
import { ResumeDetailPage } from '../features/resumes/pages/ResumeDetailPage';
import { JobListPage } from '../features/jobs/pages/JobListPage';
import { JobDetailPage } from '../features/jobs/pages/JobDetailPage';
import { Analytics } from '../pages/Analytics';
import { Settings } from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/discovery',
        element: <Discovery />,
      },
      {
        path: '/jobs',
        element: <JobListPage />,
      },
      {
        path: '/jobs/:id',
        element: <JobDetailPage />,
      },
      {
        path: '/resumes',
        element: <ResumeListPage />,
      },
      {
        path: '/resumes/:id',
        element: <ResumeDetailPage />,
      },
      {
        path: '/analytics',
        element: <Analytics />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
  // Fallback route
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
], {
  basename: import.meta.env.BASE_URL
});
