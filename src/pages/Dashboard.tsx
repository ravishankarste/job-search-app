import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  BarChart3,
  LayoutDashboard,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useJobs } from '../features/jobs/hooks/useJobs';
import { useActionPlan } from '../features/jobs/hooks/useActionPlan';
import { FollowUpModal } from '../features/jobs/components/FollowUpModal';
import { Ghost } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const { data: jobs } = useJobs();
  const { tasks, toggleFollowup, isLoading: isTasksLoading } = useActionPlan();
  
  const [followUpCompany, setFollowUpCompany] = React.useState<string | null>(null);

  const firstName = session?.user?.user_metadata?.full_name?.split(' ')[0] || 
                    (session?.user?.email?.split('@')[0].includes('ravishankar') ? 'Ravishankar' : session?.user?.email?.split('@')[0].split(/[._]/)[0]) || 
                    'User';

  const stats = [
    { label: 'Total Applications', value: jobs?.length || 0, icon: Briefcase, description: 'Explore all your job opportunities in one place.' },
    { label: 'Interviews Scheduled', value: jobs?.filter(j => j.application?.status === 'interviewing').length || 0, icon: Users, description: 'Manage your upcoming interview stages.' },
    { label: 'Offers Received', value: jobs?.filter(j => j.application?.status === 'offered').length || 0, icon: CheckCircle2, description: 'Celebrate and review your recent job offers.' },
  ];

  const tools = [
    { name: 'Job Pipeline', path: '/jobs', icon: LayoutDashboard, description: 'Track your applications through every stage of the hiring process.' },
    { name: 'Resume Library', path: '/resumes', icon: FileText, description: 'Store and manage multiple versions of your professional resume.' },
    { name: 'Career Analytics', path: '/analytics', icon: BarChart3, description: 'Get detailed insights into your job search performance.' },
  ];

  return (
    <div className="max-w-7xl space-y-16 fade-in-up">
      {/* Welcome Header - Left Aligned */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-8 h-[2px] bg-[#FC6100]"></div>
           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Career OS Overview</span>
        </div>
        <h1 className="text-6xl font-bold text-white tracking-tighter leading-none">
          Morning, <span className="text-[#FC6100]">{firstName}</span>.
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl font-medium leading-relaxed">
          You have <span className="text-white font-bold">{tasks.length} active tasks</span> in your action plan today. 
          Your pipeline is looking <span className="text-emerald-500 font-bold">healthy</span>.
        </p>
      </div>

      {/* Stats Cards - Strava Dark Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="clean-card group border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-[#FC6100]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500 shadow-lg shadow-[#FC6100]/5">
                <stat.icon className="w-7 h-7 text-[#FC6100] group-hover:text-white transition-colors" />
              </div>
              <div className="text-4xl font-bold text-white/90 group-hover:text-[#FC6100] transition-colors tracking-tighter">{stat.value}</div>
            </div>
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">{stat.label}</h2>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Today's Action Plan */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Clock className="w-6 h-6 mr-3 text-[#FC6100]" /> Today's Action Plan
          </h2>
          <Link to="/jobs" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FC6100] transition-colors">
            View Full Pipeline
          </Link>
        </div>
        
        {isTasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="clean-card h-40 animate-pulse bg-white/5" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="clean-card text-center py-16 border-dashed border-white/10 bg-transparent">
            <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium">No pending follow-ups or interview prep tasks today. Time to refine your resume or explore new roles.</p>
            <Link to="/jobs" className="px-8 py-3 bg-[#FC6100] text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-[#E35205] transition-all inline-flex items-center shadow-xl shadow-[#FC6100]/20">
              Go to Pipeline <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task.id} className="clean-card hover:border-[#FC6100]/40 group relative overflow-hidden flex flex-col justify-between bg-white/[0.02]">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${task.isGhost ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#FC6100] shadow-[0_0_15px_rgba(252,97,0,0.4)]'}`}></div>
                <div>
                   <div className="flex justify-between items-start mb-6">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg flex items-center gap-2 ${task.isGhost ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#FC6100]/10 text-[#FC6100] border border-[#FC6100]/20'}`}>
                      {task.isGhost && <Ghost className="w-3 h-3" />}
                      {task.type}
                    </span>
                    {!task.isGhost && (
                      <button 
                        onClick={() => toggleFollowup({ id: task.id, isCompleted: true })}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all bg-white/5"
                        title="Mark as done"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-tight group-hover:text-[#FC6100] transition-colors">{task.notes}</h3>
                  <div className="flex flex-col gap-2 mt-4">
                    <Link to={`/jobs/${task.job?.id}`} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center font-bold">
                      <Briefcase className="w-4 h-4 mr-2 text-[#FC6100]/60" /> 
                      {task.job?.company_name}
                    </Link>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5">
                  <div className={`text-[11px] font-black uppercase tracking-widest ${task.isGhost ? 'text-red-500/60' : 'text-gray-600'}`}>
                    {task.isGhost ? 'Stale: ' : 'Scheduled: '}
                    {new Date(task.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  {task.isGhost && (
                    <button 
                      onClick={() => setFollowUpCompany(task.job?.company_name)}
                      className="px-3 py-1.5 bg-red-500 text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:bg-red-600 transition-colors"
                    >
                      Follow up
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Tools Grid */}
      <div className="space-y-8 pb-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-[#FC6100]" /> Career Toolbox
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link 
              key={tool.name} 
              to={tool.path}
              className="clean-card group no-underline hover:border-[#FC6100]/30 bg-white/[0.01] hover:bg-white/[0.03]"
            >
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FC6100] group-hover:scale-110 transition-all duration-500">
                <tool.icon className="w-6 h-6 text-[#FC6100] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                {tool.name}
                <ArrowRight className="w-4 h-4 text-[#FC6100] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <FollowUpModal 
        isOpen={!!followUpCompany}
        onClose={() => setFollowUpCompany(null)}
        companyName={followUpCompany || ''}
        jobTitle=""
      />
    </div>
  );
};
