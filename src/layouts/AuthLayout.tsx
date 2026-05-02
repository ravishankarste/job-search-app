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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FC6100]/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md text-center relative z-10">
        <div className="w-20 h-20 bg-[#FC6100] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#FC6100]/30 mx-auto mb-8 animate-pulse">
          <Layers className="text-white w-12 h-12" />
        </div>
        <h2 className="text-5xl font-bold text-white tracking-tighter leading-tight">
          Udyog Marg
        </h2>
        <p className="mt-4 text-[10px] font-black text-[#FC6100] uppercase tracking-[0.4em] opacity-90">
          Professional Career Workspace
        </p>
      </div>

      <div className="mt-12 w-full max-w-md relative z-10">
        <div className="bg-[#121212] border border-white/5 py-12 px-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] sm:px-12 backdrop-blur-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );

};
