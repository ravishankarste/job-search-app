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
  Circle,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useJobs } from '../features/jobs/hooks/useJobs';
import { useUpcomingTasks } from '../features/jobs/hooks/useFollowups';

export const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const { data: jobs } = useJobs();
  const { tasks, toggleFollowup, isLoading: isTasksLoading } = useUpcomingTasks();

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
    <div className="max-w-6xl space-y-12 fade-in-up">
      {/* Welcome Header - Left Aligned */}
      <div className="text-left space-y-6 pl-1">
        <h1 className="text-5xl font-bold text-white tracking-tight">Welcome, {firstName}!</h1>
        <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
          Manage your career search with our suite of professional tools. Track, organize, and accelerate your path to your next role.
        </p>
      </div>

      {/* Stats Cards - Strava Dark Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="clean-card text-center group">
            <div className="w-20 h-20 bg-[#FC6100]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <stat.icon className="w-10 h-10 text-[#FC6100]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{stat.label}</h2>
            <div className="text-4xl font-bold text-[#FC6100] mb-3">{stat.value}</div>
            <p className="text-sm text-gray-400">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 w-full" />

      {/* Next Actions Widget */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white/80 text-left pl-1 flex items-center">
          <Clock className="w-6 h-6 mr-3 text-[#FC6100]" /> Today's Action Plan
        </h2>
        
        {isTasksLoading ? (
          <div className="clean-card h-32 animate-pulse" />
        ) : tasks.length === 0 ? (
          <div className="clean-card text-center py-10 border-dashed">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm mb-6">No pending follow-ups or interview prep tasks today. Time to relax or apply to more jobs!</p>
            <Link to="/jobs" className="px-6 py-3 bg-[#FC6100] text-white rounded-xl font-bold hover:bg-[#E35205] transition-all text-sm inline-flex items-center">
              Go to Pipeline <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task.id} className="clean-card hover:border-[#FC6100]/50 group relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FC6100]"></div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FC6100] px-3 py-1 bg-[#FC6100]/10 rounded-md">
                      {task.type}
                    </span>
                    <button 
                      onClick={() => toggleFollowup({ id: task.id, isCompleted: true })}
                      className="text-gray-500 hover:text-emerald-500 transition-colors"
                      title="Mark as done"
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{task.notes}</h3>
                  <Link to={`/jobs/${task.application?.job?.id}`} className="text-sm text-gray-400 hover:text-[#FC6100] transition-colors flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" /> 
                    {task.job?.title} at {task.job?.company_name}
                  </Link>
                </div>
                
                <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-red-400">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Due: {new Date(task.scheduled_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 w-full" />

      {/* Primary Tools Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white/80 text-left pl-1">Your Career Toolbox</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link 
              key={tool.name} 
              to={tool.path}
              className="clean-card group no-underline hover:border-[#FC6100]/50"
            >
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#FC6100] transition-colors">
                <tool.icon className="w-8 h-8 text-[#FC6100] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                {tool.name}
                <ArrowRight className="w-4 h-4 text-[#FC6100] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
