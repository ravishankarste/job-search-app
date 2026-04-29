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
  ChevronRight,
  Compass
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-[#FC6100] border-t-transparent rounded-full animate-spin"></div>
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
    { name: 'Discovery', path: '/discovery', icon: Compass },
    { name: 'Job Pipeline', path: '/jobs', icon: Briefcase },
    { name: 'Resumes', path: '/resumes', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 
                    (session.user.email?.split('@')[0].includes('ravishankar') ? 'Ravishankar' : session.user.email?.split('@')[0].split(/[._]/)[0]);

  return (
    <div className="min-h-screen flex w-full bg-black">
      {/* Sidebar - Strava Dark Style */}
      <aside className="w-[280px] bg-black border-r border-white/10 flex flex-col h-screen sticky top-0 z-40 shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FC6100] rounded-xl flex items-center justify-center shadow-lg">
              <Layers className="text-white w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Udyog Marg</h2>
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
                    ? 'bg-white/10 text-[#FC6100]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FC6100]' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#FC6100] flex items-center justify-center text-white font-bold text-lg">
              {firstName?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate capitalize">{firstName}</p>
              <p className="text-[10px] font-bold text-[#FC6100] uppercase tracking-wider">Premium Account</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar - Dark Strava Style */}
        <header 
          className="h-16 bg-black border-b border-white/10 flex items-center justify-between sticky top-0 z-30"
          style={{ paddingLeft: '40px', paddingRight: '40px' }}
        >
           <div className="flex items-center gap-3 text-sm font-bold text-white/60">
              <Link to="/dashboard" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 opacity-50" />
              <span className="text-white capitalize">{location.pathname.substring(1) || 'Dashboard'}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search dashboard..." 
                  className="pl-4 pr-10 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] outline-none transition-all w-64"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
              </button>
           </div>
        </header>

        <div 
          className="py-16 flex-1 overflow-x-hidden bg-black"
          style={{ paddingLeft: '40px', paddingRight: '40px' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};
