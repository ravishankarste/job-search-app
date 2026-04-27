import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  BarChart3,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useJobs } from '../features/jobs/hooks/useJobs';

export const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const { data: jobs } = useJobs();

  const firstName = session?.user?.user_metadata?.full_name?.split(' ')[0] || 
                    (session?.user?.email?.split('@')[0].includes('ravishankar') ? 'Ravishankar' : session?.user?.email?.split('@')[0].split(/[\._]/)[0]) || 
                    'User';

  const stats = [
    { label: 'Total Applications', value: jobs?.length || 0, icon: Briefcase, color: 'text-blue-600', description: 'Explore all your job opportunities in one place.' },
    { label: 'Interviews Scheduled', value: jobs?.filter(j => j.application?.status === 'interviewing').length || 0, icon: Users, color: 'text-blue-600', description: 'Manage your upcoming interview stages.' },
    { label: 'Offers Received', value: jobs?.filter(j => j.application?.status === 'offered').length || 0, icon: CheckCircle2, color: 'text-blue-600', description: 'Celebrate and review your recent job offers.' },
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
        <h1 className="text-5xl font-bold text-[#007bff] tracking-tight">Welcome, {firstName}!</h1>
        <p className="text-xl text-gray-600 max-w-2xl font-medium leading-relaxed">
          Manage your career search with our suite of professional tools. Track, organize, and accelerate your path to your next role.
        </p>
      </div>

      {/* Stats Cards - Tools Website Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="clean-card text-center group">
            <div className="w-20 h-20 bg-[#d4f3ff] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <stat.icon className="w-10 h-10 text-[#007bff]" />
            </div>
            <h2 className="text-xl font-bold text-[#007bff] mb-2">{stat.label}</h2>
            <div className="text-4xl font-bold text-gray-900 mb-3">{stat.value}</div>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 w-full" />

      {/* Primary Tools Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Your Career Toolbox</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link 
              key={tool.name} 
              to={tool.path}
              className="clean-card group no-underline"
            >
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#007bff] transition-colors">
                <tool.icon className="w-8 h-8 text-[#007bff] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                {tool.name}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
