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
import { useResumes } from '../features/resumes/hooks/useResumes';
import { useActionPlan } from '../features/jobs/hooks/useActionPlan';
import { FollowUpModal } from '../features/jobs/components/FollowUpModal';
import { Ghost } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OnboardingAccelerator } from '../components/onboarding/OnboardingAccelerator';

export const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const { data: jobs } = useJobs();
  const { data: resumes } = useResumes();
  const { tasks, toggleFollowup, isLoading: isTasksLoading } = useActionPlan();
  const navigate = useNavigate();
  
  const [followUpCompany, setFollowUpCompany] = React.useState<string | null>(null);

  const firstName = session?.user?.user_metadata?.full_name?.split(' ')[0] || 
                    (session?.user?.email?.split('@')[0].includes('ravishankar') ? 'Ravishankar' : session?.user?.email?.split('@')[0].split(/[._]/)[0]) || 
                    'User';

  const stats = [
    { label: 'Total Applications', value: jobs?.length || 0, icon: Briefcase, description: 'All the jobs you have added to your pipeline.' },
    { label: 'Interviews Scheduled', value: jobs?.filter(j => j.application?.status === 'interviewing').length || 0, icon: Users, description: 'Jobs where you have upcoming interviews.' },
    { label: 'Offers Received', value: jobs?.filter(j => j.application?.status === 'offered').length || 0, icon: CheckCircle2, description: 'Success! Your recent job offers.' },
  ];

  const tools = [
    { name: 'Job Pipeline', path: '/pipeline', icon: LayoutDashboard, description: 'Track all your job applications in one place.' },
    { name: 'Resume Library', path: '/resumes', icon: FileText, description: 'Manage and upload different versions of your resume.' },
    { name: 'Career Analytics', path: '/analytics', icon: BarChart3, description: 'See how your job search is performing over time.' },
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
          <Link 
            key={stat.label} 
            to={stat.label === 'Total Applications' ? '/pipeline' : '/pipeline'} // Ensure stats lead somewhere useful
            className="clean-card group border-white/10 bg-white/[0.02] tactile-press no-underline block"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-[#FC6100]/10 rounded-lg flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500">
                <stat.icon className="w-7 h-7 text-[#FC6100] group-hover:text-white transition-colors" />
              </div>
              <div className="text-4xl font-bold text-white/90 group-hover:text-[#FC6100] transition-colors tracking-tighter">{stat.value}</div>
            </div>
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 font-display">{stat.label}</h2>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{stat.description}</p>
          </Link>
        ))}
      </div>

      {/* Today's Action Plan */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Clock className="w-6 h-6 mr-3 text-[#FC6100]" /> Today's Action Plan
          </h2>
          <Link to="/pipeline" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FC6100] transition-colors">
            View Full Pipeline
          </Link>
        </div>
        
        {isTasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="clean-card h-40 animate-pulse bg-white/5" />)}
          </div>
        ) : (!resumes || resumes.length === 0) ? (
          <div className="clean-card text-center py-16 border-white/10 bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <FileText className="w-32 h-32 text-[#FC6100]" />
            </div>
            <FileText className="w-12 h-12 text-[#FC6100] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Step 1: Upload Your Resume</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">
              To activate the <strong>Match Engine</strong> and see your compatibility scores, we first need to know your skills.
            </p>
            <Link to="/resumes" className="px-10 py-4 bg-[#FC6100] text-white rounded-lg font-black uppercase tracking-widest text-xs hover:bg-[#E35205] transition-all inline-flex items-center tactile-press border border-white/10 shadow-2xl shadow-[#FC6100]/20">
              Open Resume Library <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : tasks.length === 0 ? (
          <div className="space-y-4">
            {(!jobs || jobs.length === 0) ? (
              <OnboardingAccelerator 
                onManualClick={() => navigate('/pipeline')}
                onImportClick={() => navigate('/pipeline')}
              />
            ) : (
              <div className="clean-card text-center py-16 border-dashed border-white/10 bg-transparent">
                <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium">No pending follow-ups or interview prep tasks today. Time to refine your resume or explore new roles.</p>
                <Link to="/pipeline" className="px-8 py-3 bg-[#FC6100] text-white rounded-lg font-black uppercase tracking-widest text-[11px] hover:bg-[#E35205] transition-all inline-flex items-center tactile-press border border-white/10">
                  Go to Pipeline <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task.id} className="clean-card hover:border-[#FC6100]/40 group relative overflow-hidden flex flex-col justify-between bg-white/[0.02] tactile-press">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${task.isGhost ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#FC6100] shadow-[0_0_15px_rgba(252,97,0,0.4)]'}`}></div>
                <div>
                   <div className="flex justify-between items-start mb-6">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-md flex items-center gap-2 ${task.isGhost ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#FC6100]/10 text-[#FC6100] border border-[#FC6100]/20'}`}>
                      {task.isGhost && <Ghost className="w-3 h-3" />}
                      {task.type}
                    </span>
                    {!task.isGhost && (
                      <button 
                        onClick={() => toggleFollowup({ id: task.id, isCompleted: true })}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all bg-white/5 tactile-press"
                        title="Mark as done"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-tight group-hover:text-[#FC6100] transition-colors">{task.notes}</h3>
                  <div className="flex flex-col gap-2 mt-4">
                    <Link to={`/pipeline/${task.job?.id}`} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center font-bold">
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
                      className="px-3 py-1.5 bg-red-500 text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:bg-red-600 transition-colors tactile-press"
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
              className="clean-card group no-underline hover:border-[#FC6100]/30 bg-white/[0.01] hover:bg-white/[0.03] tactile-press"
            >
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#FC6100] transition-all duration-500">
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
