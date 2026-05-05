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
  Bell,
  ChevronRight,
  Compass,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { SupportBot } from '../components/common/SupportBot';
import { useJobs } from '../features/jobs/hooks/useJobs';
import { useNotifications } from '../features/notifications/hooks/useNotifications';


interface SidebarContentProps {
  navItems: { name: string; path: string; icon: any }[];
  location: { pathname: string };
  firstName: string;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => Promise<void>;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  navItems, 
  location, 
  firstName, 
  setIsMobileMenuOpen, 
  handleLogout 
}) => (
  <>
    <div className="px-10 flex flex-col items-center gap-8 w-full" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
      <div className="flex items-center justify-between w-full lg:hidden">
        <h2 className="text-xl font-bold text-white tracking-tight font-display">Udyog Marg</h2>
        <button
          className="text-gray-400"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="w-40 h-40 flex items-center justify-center rounded-[32px] overflow-hidden border border-white/10 bg-black shadow-2xl shadow-[#FC6100]/20 animate-in fade-in zoom-in duration-700">
        <img 
          src="/udyog_marg_full_brand_logo_1777806735358.png" 
          alt="Udyog Marg" 
          className="w-full h-full object-cover scale-[1.2] filter drop-shadow-[0_0_15px_rgba(252,97,0,0.4)]" 
        />
      </div>

      <div className="text-center hidden lg:block">
        <h2 className="text-3xl font-black text-white tracking-tighter font-display uppercase leading-none">Udyog Marg</h2>
        <p className="text-[10px] font-black text-[#FC6100] uppercase tracking-[0.4em] mt-2 opacity-80">Job Search OS</p>
      </div>
    </div>

    <nav className="flex-1 space-y-1 overflow-y-auto border-t border-white/5 pt-8" style={{ paddingLeft: '85px' }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all tactile-press ${isActive
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
      <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg bg-white/5 border border-white/10 tactile-press">
        <div className="w-10 h-10 rounded-md bg-[#FC6100] flex items-center justify-center text-white font-bold text-lg">
          {firstName?.[0].toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate capitalize">{firstName}</p>
          <p className="text-[10px] font-bold text-[#FC6100] uppercase tracking-wider font-display">Premium Account</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all tactile-press"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  </>
);

export const DashboardLayout: React.FC = () => {
  const { session, isLoading: authLoading } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { notifications, unreadCount, sendTest, markAsRead } = useNotifications();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const location = useLocation();

  const filteredJobs = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [jobs, searchQuery]);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (authLoading) {
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
    { name: 'Job Pipeline', path: '/pipeline', icon: Briefcase },
    { name: 'Resumes', path: '/resumes', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] ||
    (session.user.email?.split('@')[0].includes('ravishankar') ? 'Ravishankar' : session.user.email?.split('@')[0].split(/[._]/)[0]);

  const sidebarProps = {
    navItems,
    location,
    firstName,
    setIsMobileMenuOpen,
    handleLogout
  };

  return (
    <div className="min-h-screen flex w-full bg-[#0D0D0D]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[280px] bg-[#0D0D0D] border-r border-white/10 flex-col h-screen sticky top-0 z-40 shrink-0">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute top-0 left-0 bottom-0 w-[280px] bg-black border-r border-white/10 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent {...sidebarProps} />
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-20 bg-[#0D0D0D] border-b border-white/10 flex items-center justify-between sticky top-0 z-30 px-6 md:px-10">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/40">
              <Link to="/dashboard" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-30" />
              <span className="text-[#FC6100]">
                {location.pathname === '/pipeline' ? 'Job Pipeline' : (location.pathname.substring(1) || 'Dashboard')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block group">
              <input
                type="text"
                placeholder="Search pipeline..."
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] outline-none transition-all w-64 lg:w-[400px] group-hover:bg-white/15 group-hover:border-white/30 text-center"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Quick Search Results */}
              {searchQuery.trim() && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Pipeline Search</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map(job => (
                        <Link 
                          key={job.id} 
                          to={`/pipeline/${job.id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                        >
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-[#FC6100] transition-colors">{job.title}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{job.company_name}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No matching jobs</p>
                      </div>
                    )}
                  </div>
                  {filteredJobs.length > 0 && (
                    <Link 
                      to="/pipeline" 
                      onClick={() => setSearchQuery('')}
                      className="block p-3 text-center bg-white/5 hover:bg-white/10 text-[10px] font-black text-[#FC6100] uppercase tracking-widest transition-colors border-t border-white/5"
                    >
                      View All Results
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2.5 rounded-xl transition-all relative group ${isNotificationsOpen ? 'bg-[#FC6100] text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'group-hover:animate-shake' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FC6100] rounded-full border-2 border-black"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Momentum Feed</span>
                    <button 
                      onClick={() => sendTest(`Momentum Boost: ${new Date().toLocaleTimeString()}`)}
                      className="text-[8px] font-black text-[#FC6100] uppercase tracking-tighter hover:underline"
                    >
                      Test Alert
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.read_at && markAsRead(n.id)}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.read_at ? 'bg-[#FC6100]/5' : ''}`}
                        >
                          {!n.read_at && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FC6100]"></div>}
                          <p className="text-xs text-white leading-relaxed">{n.message}</p>
                          <p className="text-[8px] text-gray-500 font-bold uppercase mt-2">
                            {new Date(n.created_at || '').toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center space-y-4">
                        <Bell className="w-10 h-10 text-gray-800 mx-auto opacity-20" />
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-loose">
                          Silence is golden.<br />Stay focused on the hunt.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="layout-spacing flex-1 overflow-x-hidden bg-[#0D0D0D]">
          <Outlet />
        </div>

        {/* Help & Support Bot */}
        <SupportBot />
      </main>
    </div>
  );
};
