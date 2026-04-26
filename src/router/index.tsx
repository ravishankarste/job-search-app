import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';
import { Jobs } from '../pages/Jobs';
import { Resumes } from '../pages/Resumes';
import { Applications } from '../pages/Applications';

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
        path: '/jobs',
        element: <Jobs />,
      },
      {
        path: '/resumes',
        element: <Resumes />,
      },
      {
        path: '/applications',
        element: <Applications />,
      },
    ],
  },
  // Fallback route
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
