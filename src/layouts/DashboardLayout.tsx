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
  Bell,
  ChevronRight,
  Compass,
  Settings,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { SupportBot } from '../components/common/SupportBot';
import { ExitNudge } from '../components/common/ExitNudge';
import { useJobs } from '../features/jobs/hooks/useJobs';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { InstallPrompt } from '../features/pwa/components/InstallPrompt';

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
          aria-label="Close menu"
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
        <h2 className="text-3xl font-black text-white tracking-tight font-display uppercase leading-none">Udyog Marg</h2>
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
            data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
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
        data-testid="nav-logout-btn"
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
  const [isExitNudgeOpen, setIsExitNudgeOpen] = React.useState(false);
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

  // Exit Intent Logic & External Control
  React.useEffect(() => {
    (window as any).setIsExitNudgeOpen = setIsExitNudgeOpen;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse leaves toward the top (tab area)
      if (e.clientY <= 10) {
        const hasSeenNudge = sessionStorage.getItem('udyog_marg_exit_nudge_seen');
        if (!hasSeenNudge) {
          setIsExitNudgeOpen(true);
          sessionStorage.setItem('udyog_marg_exit_nudge_seen', 'true');
        }
      }
    };

    // Mobile/Session Fail-safe: Trigger after 5 minutes of focused activity
    const pulseTimer = setTimeout(() => {
      const hasSeenNudge = sessionStorage.getItem('udyog_marg_exit_nudge_seen');
      if (!hasSeenNudge) {
        setIsExitNudgeOpen(true);
        sessionStorage.setItem('udyog_marg_exit_nudge_seen', 'true');
      }
    }, 5 * 60 * 1000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(pulseTimer);
      delete (window as any).setIsExitNudgeOpen;
    };
  }, []);

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
    sessionStorage.removeItem('udyog_marg_exit_nudge_seen');
    await authService.signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Search', path: '/discovery', icon: Compass },
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
              aria-label="Open menu"
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
            {location.pathname !== '/discovery' && (
              <div className="absolute left-1/2 -translate-x-1/2 hidden md:block group">
                <input
                  type="text"
                  placeholder="Global Job Search..."
                  className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] outline-none transition-all w-64 lg:w-[400px] group-hover:bg-white/15 group-hover:border-white/30 text-center"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        window.location.href = `/discovery?q=${encodeURIComponent(val)}`;
                      }
                    }
                  }}
                />
              </div>
            )}
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

        {/* Global Platform Sentiment FAB - Top Right Heart */}
        <div className="fixed top-24 right-8 z-[60] flex flex-col items-end gap-3 group">
          <button 
            onClick={() => setIsExitNudgeOpen(true)}
            data-testid="feedback-fab"
            className="w-16 h-16 bg-[#111] border border-white/10 rounded-full flex items-center justify-center text-[#FC6100] shadow-2xl hover:bg-[#FC6100] hover:text-white transition-all relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FC6100]/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <Heart className="w-7 h-7 relative z-10 group-hover/btn:scale-125 transition-transform animate-heartbeat" />
            <div className="absolute inset-0 border-2 border-[#FC6100]/30 rounded-full animate-ping opacity-20 pointer-events-none"></div>
          </button>
          <div className="bg-[#111] border border-white/10 px-4 py-2 rounded-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-2xl pointer-events-none">
            <p className="text-[10px] font-black text-[#FC6100] uppercase tracking-widest whitespace-nowrap">Give Feedback</p>
          </div>
        </div>

        {/* Sovereign Exit Nudge */}
        <ExitNudge 
          isOpen={isExitNudgeOpen} 
          onClose={() => setIsExitNudgeOpen(false)} 
        />
        <InstallPrompt />
      </main>
    </div>
  );
};
