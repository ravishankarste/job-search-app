import React from 'react';
import { useAnalytics } from '../features/analytics/hooks/useAnalytics';
import { useJobs } from '../features/jobs/hooks/useJobs';
import { useResumes } from '../features/resumes/hooks/useResumes';
import { useNavigate, Link } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Briefcase, Target, 
  ArrowUpRight, FileText, ArrowRight
} from 'lucide-react';
import { OnboardingAccelerator } from '../components/onboarding/OnboardingAccelerator';

const COLORS = ['#FC6100', '#FF8B3D', '#FFA566', '#FFC094', '#FFE1CC'];

export const Analytics: React.FC = () => {
  const { stats, isLoading } = useAnalytics();
  const { data: jobs } = useJobs();
  const { data: resumes } = useResumes();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="h-[400px] bg-white/5 rounded-3xl" />
      </div>
    );
  }

  // Zero-State Onboarding Loop
  if (!stats) {
    if (!resumes || resumes.length === 0) {
      return (
        <div className="max-w-4xl mx-auto py-20 px-4">
          <div className="clean-card text-center py-16 border-white/10 bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <FileText className="w-32 h-32 text-[#FC6100]" />
            </div>
            <FileText className="w-12 h-12 text-[#FC6100] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Step 1: Establish Your Identity</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">
              We can't analyze your career trajectory until we know your skills. Upload your resume to unlock the analytics engine.
            </p>
            <Link to="/resumes" className="px-10 py-4 bg-[#FC6100] text-white rounded-lg font-black uppercase tracking-widest text-xs hover:bg-[#E35205] transition-all inline-flex items-center tactile-press border border-white/10 shadow-2xl shadow-[#FC6100]/20">
              Open Resume Library <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      );
    }

    if (!jobs || jobs.length === 0) {
      return (
        <div className="max-w-4xl mx-auto py-20 px-4">
          <div className="space-y-6">
            <div className="text-center mb-10">
               <h3 className="text-2xl font-bold text-white mb-2">Step 2: Start Your Pipeline</h3>
               <p className="text-gray-500">Add your first job to see velocity and conversion analytics.</p>
            </div>
            <OnboardingAccelerator 
              onManualClick={() => navigate('/pipeline')}
              onImportClick={() => navigate('/pipeline')}
            />
          </div>
        </div>
      );
    }

    // Safety fallback: if stats is still null but we passed onboarding checks, return null to satisfy TS
    return null;
  }

  const statusData = Object.entries(stats.statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 fade-in-up">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-[2px] bg-[#FC6100]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Performance Metrics</span>
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tighter">Career Analytics</h1>
        <p className="text-gray-400 font-medium max-w-xl text-lg">Real-time breakdown of your pipeline velocity and search momentum.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
          title="Total Opportunities" 
          value={stats.metrics.total} 
          icon={Briefcase}
          trend="+12% velocity"
          color="text-[#FC6100]"
        />
        <MetricCard 
          title="Applications Sent" 
          value={stats.metrics.applied} 
          icon={Target}
          trend="Active Search"
          color="text-blue-400"
        />
        <MetricCard 
          title="Active Interviews" 
          value={stats.metrics.interviewing} 
          icon={Users}
          trend="High Momentum"
          highlight
          color="text-emerald-400"
        />
        <MetricCard 
          title="Success Rate" 
          value={`${stats.metrics.successRate}%`} 
          icon={TrendingUp}
          trend="Avg conversion"
          color="text-purple-400"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Velocity */}
        <div className="lg:col-span-2 clean-card p-10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Pipeline Velocity</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">Applications over last 14 days</p>
            </div>
            <div className="px-4 py-2 bg-[#FC6100]/10 rounded-xl border border-[#FC6100]/20">
              <span className="text-[10px] font-black text-[#FC6100] uppercase tracking-widest">Live Activity Feed</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FC6100" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FC6100" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ color: '#FC6100', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#FC6100" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorApp)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="clean-card p-10 bg-white/[0.02]">
          <h3 className="text-2xl font-bold text-white mb-10 tracking-tight">Status Funnel</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-3xl font-black text-white">{stats.metrics.total}</span>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Total Jobs</p>
            </div>
          </div>
          <div className="mt-10 space-y-3">
            {statusData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <span className="text-sm text-white font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, highlight = false, color }: any) {
  return (
    <div className={`clean-card p-8 group transition-all duration-500 hover:scale-[1.02] border-white/5 bg-white/[0.02] relative overflow-hidden ${highlight ? 'border-[#FC6100]/30 bg-[#FC6100]/5' : ''}`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${highlight ? 'bg-[#FC6100]' : color.replace('text-', 'bg-')}/5 rounded-full -mr-8 -mt-8 blur-2xl transition-all group-hover:scale-150 opacity-50`}></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl shadow-black/20 ${highlight ? 'bg-[#FC6100] text-white' : 'bg-white/5 text-gray-400 group-hover:bg-[#FC6100] group-hover:text-white'}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-1.5 text-[#FC6100]">
          <ArrowUpRight className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Real-time</span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{title}</p>
        <h4 className="text-4xl font-bold text-white tracking-tighter">{value}</h4>
        <p className={`text-[10px] mt-4 font-bold uppercase tracking-widest ${highlight ? 'text-[#FC6100]' : 'text-gray-600'}`}>{trend}</p>
      </div>
    </div>
  );
}
