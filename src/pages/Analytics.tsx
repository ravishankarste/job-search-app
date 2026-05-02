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
  
  const ghosted = jobs?.filter(job => {
    if (!job.application) return false;
    const status = job.application.status;
    if (status !== 'applied' && status !== 'interviewing') return false;
    const dateString = job.application.updated_at || job.application.created_at;
    if (!dateString) return false;
    const updatedDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 14;
  }).length || 0;

  const successRate = totalApps > 0 ? Math.round((offered / totalApps) * 100) : 0;

  const stats = [
    { label: 'Total Applications', value: totalApps, icon: Briefcase, change: '+12%', trend: 'up', color: 'text-[#FC6100]' },
    { label: 'Ghosted (Stale)', value: ghosted, icon: Clock, change: `${ghosted > 0 ? '+' : ''}${ghosted}`, trend: ghosted > 0 ? 'down' : 'up', color: 'text-red-500' },
    { label: 'Offers Received', value: offered, icon: CheckCircle2, change: '+1', trend: 'up', color: 'text-emerald-500' },
    { label: 'Success Rate', value: `${successRate}%`, icon: Target, change: '+5%', trend: 'up', color: 'text-blue-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16 fade-in-up pb-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-8 h-[2px] bg-[#FC6100]"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Performance Metrics</span>
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tighter">Career Analytics</h1>
        <p className="text-gray-400 font-medium max-w-xl text-lg">Detailed breakdown of your application lifecycle and pipeline health.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="clean-card group border-white/5 bg-white/[0.02] relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color.replace('text-', 'bg-')}/5 rounded-full -mr-8 -mt-8 blur-2xl transition-all group-hover:scale-150 group-hover:opacity-100 opacity-50`}></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`w-14 h-14 ${stat.color.replace('text-', 'bg-')}/10 border ${stat.color.replace('text-', 'border-')}/20 rounded-2xl flex items-center justify-center group-hover:${stat.color.replace('text-', 'bg-')} transition-all duration-500 shadow-xl shadow-black/20`}>
                <stat.icon className={`w-7 h-7 ${stat.color} group-hover:text-white transition-colors`} />
              </div>
              <div className={`flex items-center ${stat.trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'} text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${stat.trend === 'up' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <ArrowUpRight className={`w-3.5 h-3.5 mr-1.5 ${stat.trend === 'down' ? 'rotate-90' : ''}`} />
                {stat.change}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className="text-4xl font-bold text-white tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Pipeline Breakdown */}
        <div className="lg:col-span-2 clean-card border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Application Pipeline</h2>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Conversion by Stage</p>
            </div>
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Weekly</button>
              <button className="px-4 py-1.5 bg-[#FC6100] rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#FC6100]/20">Monthly</button>
            </div>
          </div>
          
          <div className="space-y-8">
            {[
              { label: 'Applied', count: applied, color: 'bg-blue-500', icon: Briefcase },
              { label: 'Interviewing', count: interviewing, color: 'bg-purple-500', icon: Users },
              { label: 'Offered', count: offered, color: 'bg-[#FC6100]', icon: Target },
              { label: 'Saved', count: jobs?.filter(j => j.application?.status === 'saved').length || 0, color: 'bg-gray-500', icon: Clock }
            ].map((item) => (
              <div key={item.label} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}/10 border ${item.color.replace('bg-', 'border-')}/20`}>
                      <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-sm font-bold text-white">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-white">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                    style={{ width: `${totalApps > 0 ? (item.count / totalApps) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Analysis Side Panel */}
        <div className="space-y-8">
          <div className="clean-card border-white/5 bg-white/[0.02] h-full">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-[#FC6100]" /> Skill Gap Analysis
            </h3>
            
            <div className="space-y-10">
              {/* Top Skills You Have */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'SQL', 'Testing'].map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Skills Missing */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#FC6100] uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Skills to Learn
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Docker', 'Kubernetes', 'AWS', 'Next.js', 'GraphQL'].map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-[#FC6100]/10 border border-[#FC6100]/20 text-[#FC6100] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Profile Readyness</span>
                <span className="text-sm font-bold text-white">74%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[74%] h-full bg-gradient-to-r from-[#FC6100] to-orange-400 shadow-[0_0_10px_rgba(252,97,0,0.3)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
