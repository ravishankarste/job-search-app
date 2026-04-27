import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  BarChart3, 
  LogOut,
  Layers,
  Search,
  Bell,
  ChevronRight
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ececec]">
        <div className="w-10 h-10 border-4 border-[#007bff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await authService.signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Pipeline', path: '/jobs', icon: Briefcase },
    { name: 'Resumes', path: '/resumes', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 
                    (session.user.email?.split('@')[0].includes('ravishankar') ? 'Ravishankar' : session.user.email?.split('@')[0].split(/[\._]/)[0]);

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar - Sticky instead of Fixed to prevent overlapping */}
      <aside className="w-[280px] bg-white border-r-8 border-gray-100 flex flex-col h-screen sticky top-0 z-40 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.05)] shrink-0">
        <div className="p-6 border-b border-gray-100 bg-[#0056b3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Layers className="text-[#007bff] w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">CareerFlow</h2>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#d4f3ff] text-[#0056b3]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#007bff]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0056b3]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-white border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-[#007bff] flex items-center justify-center text-white font-bold text-lg">
              {firstName?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate capitalize">{firstName}</p>
              <p className="text-[10px] font-bold text-[#007bff] uppercase tracking-wider">Premium Account</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area - No more margin needed as sidebar is in-flow */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar - Solid Blue like tools-website */}
        <header 
          className="h-16 bg-[#007bff] flex items-center justify-between sticky top-0 z-30 shadow-md"
          style={{ paddingLeft: '40px', paddingRight: '40px' }}
        >
           <div className="flex items-center gap-3 text-sm font-bold text-white/80">
              <Link to="/dashboard" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 opacity-50" />
              <span className="text-white capitalize">{location.pathname.substring(1) || 'Dashboard'}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input 
                  type="text" 
                  placeholder="Global Search..." 
                  className="pl-10 pr-4 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 outline-none transition-all w-64"
                />
              </div>
              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
              </button>
           </div>
        </header>

        <div 
          className="py-16 flex-1 overflow-x-hidden"
          style={{ paddingLeft: '40px', paddingRight: '40px' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};
