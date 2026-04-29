import React from 'react';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Target,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';
import { useJobs } from '../features/jobs/hooks/useJobs';

export const Analytics: React.FC = () => {
  const { data: jobs } = useJobs();

  const totalApps = jobs?.length || 0;
  const interviewing = jobs?.filter(j => j.application?.status === 'interviewing').length || 0;
  const offered = jobs?.filter(j => j.application?.status === 'offered').length || 0;
  const applied = jobs?.filter(j => j.application?.status === 'applied').length || 0;
  
  const successRate = totalApps > 0 ? Math.round((offered / totalApps) * 100) : 0;

  const stats = [
    { label: 'Total Applications', value: totalApps, icon: Briefcase, change: '+12%', trend: 'up' },
    { label: 'Active Interviews', value: interviewing, icon: Users, change: '+2', trend: 'up' },
    { label: 'Offers Received', value: offered, icon: CheckCircle2, change: '+1', trend: 'up' },
    { label: 'Success Rate', value: `${successRate}%`, icon: Target, change: '+5%', trend: 'up' },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Career Analytics</h1>
        <p className="text-gray-400 font-medium">Track your progress and optimize your search strategy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="clean-card group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-300">
                <stat.icon className="w-6 h-6 text-[#FC6100] group-hover:text-white" />
              </div>
              <div className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Breakdown */}
        <div className="lg:col-span-2 clean-card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Application Pipeline</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400">Weekly</span>
              <span className="px-3 py-1 bg-[#FC6100] rounded-lg text-xs font-bold text-white">Monthly</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {[
              { label: 'Applied', count: applied, color: 'bg-blue-500' },
              { label: 'Interviewing', count: interviewing, color: 'bg-purple-500' },
              { label: 'Offered', count: offered, color: 'bg-[#FC6100]' },
              { label: 'Saved', count: jobs?.filter(j => j.application?.status === 'saved').length || 0, color: 'bg-gray-500' }
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white">{item.count}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-1000`} 
                    style={{ width: `${totalApps > 0 ? (item.count / totalApps) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity / Insights */}
        <div className="clean-card">
          <h2 className="text-xl font-bold text-white mb-6">Smart Insights</h2>
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-[#FC6100]/5 border border-[#FC6100]/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-[#FC6100] shrink-0" />
              <div>
                <p className="text-sm font-bold text-white mb-1">High Engagement</p>
                <p className="text-xs text-gray-400 leading-relaxed">Your application-to-interview ratio is up 15% this month. Keep it up!</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <Clock className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white mb-1">Follow-up Needed</p>
                <p className="text-xs text-gray-400 leading-relaxed">3 applications haven't been updated in over 7 days. Time for a check-in?</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-center">
              <button className="text-sm font-bold text-[#FC6100] hover:underline">View Detailed Reports</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
