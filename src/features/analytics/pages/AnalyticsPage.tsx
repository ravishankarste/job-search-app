import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Briefcase, Target, 
  ArrowUpRight, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';

const COLORS = ['#FC6100', '#FF8B3D', '#FFA566', '#FFC094', '#FFE1CC'];

export default function AnalyticsPage() {
  const { stats, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="h-[400px] bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-gray-700" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">No data yet</h3>
          <p className="text-gray-500">Add some jobs to your pipeline to see analytics.</p>
        </div>
      </div>
    );
  }

  const statusData = Object.entries(stats.statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Analytics</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Performance & Pipeline Velocity</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Opportunities" 
          value={stats.metrics.total} 
          icon={Briefcase}
          trend="+12% vs last week"
        />
        <MetricCard 
          title="Applications Sent" 
          value={stats.metrics.applied} 
          icon={Target}
          trend="Active search"
        />
        <MetricCard 
          title="Active Interviews" 
          value={stats.metrics.interviewing} 
          icon={Users}
          trend="High momentum"
          highlight
        />
        <MetricCard 
          title="Success Rate" 
          value={`${stats.metrics.successRate}%`} 
          icon={TrendingUp}
          trend="Based on interviews"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Velocity */}
        <div className="lg:col-span-2 clean-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Pipeline Velocity</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Applications over last 14 days</p>
            </div>
            <div className="px-3 py-1 bg-[#FC6100]/10 rounded-full border border-[#FC6100]/20">
              <span className="text-[10px] font-black text-[#FC6100] uppercase tracking-tighter">Live Trend</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
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
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#FC6100' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#FC6100" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorApp)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="clean-card p-8">
          <h3 className="text-xl font-bold text-white mb-8">Status Funnel</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {statusData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-gray-400 font-bold">{item.name}</span>
                </div>
                <span className="text-xs text-white font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, highlight = false }: any) {
  return (
    <div className={`clean-card p-6 group transition-all duration-300 ${highlight ? 'border-[#FC6100]/30 bg-[#FC6100]/5' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${highlight ? 'bg-[#FC6100] text-white' : 'bg-white/5 text-gray-400 group-hover:text-[#FC6100]'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-[#FC6100]">
          <ArrowUpRight className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Live</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-white">{value}</h4>
        <p className="text-[10px] text-gray-600 mt-2 font-medium">{trend}</p>
      </div>
    </div>
  );
}
