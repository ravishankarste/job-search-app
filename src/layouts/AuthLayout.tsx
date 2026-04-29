import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-[#FC6100] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-[#FC6100] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <Layers className="text-white w-10 h-10" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">
          Udyog Marg
        </h2>
        <p className="mt-2 text-sm font-bold text-[#FC6100] uppercase tracking-widest opacity-80">
          Professional Career Workspace
        </p>
      </div>

      <div className="mt-8 w-full max-w-md">
        <div className="bg-[#121212] border border-white/10 py-10 px-6 shadow-2xl rounded-3xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
