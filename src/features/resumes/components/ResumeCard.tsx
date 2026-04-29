import React from 'react';
import { Link } from 'react-router-dom';
import type { Resume } from '../services/resumeService';
import { FileText, Calendar, Briefcase, ChevronRight } from 'lucide-react';

interface ResumeCardProps {
  resume: Resume;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume }) => {
  const formattedDate = resume.updated_at
    ? new Date(resume.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown Date';

  return (
    <Link
      to={`/resumes/${resume.id}`}
      className="clean-card group block no-underline bg-[#121212] border-white/10 hover:border-[#FC6100]/50"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#FC6100]/10 border border-[#FC6100]/20 text-[#FC6100] rounded-xl flex items-center justify-center group-hover:bg-[#FC6100] group-hover:text-white transition-all duration-300">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#FC6100] transition-colors leading-tight">
              {resume.name}
            </h3>
            {resume.target_role && (
              <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mt-1.5">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-[#FC6100]/50" />
                {resume.target_role}
              </div>
            )}
          </div>
        </div>
        <div className="p-1.5 bg-white/5 text-gray-500 rounded-lg group-hover:bg-[#FC6100] group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#FC6100]/30" />
          Updated {formattedDate}
        </div>
      </div>
    </Link>
  );
};
