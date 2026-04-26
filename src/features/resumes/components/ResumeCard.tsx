import React from 'react';
import { Link } from 'react-router-dom';
import type { Resume } from '../services/resumeService';
import { FileText, Calendar, Briefcase } from 'lucide-react';

interface ResumeCardProps {
  resume: Resume;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume }) => {
  const formattedDate = resume.updated_at
    ? new Date(resume.updated_at).toLocaleDateString()
    : 'Unknown Date';

  return (
    <Link
      to={`/resumes/${resume.id}`}
      className="block group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {resume.name}
            </h3>
            {resume.target_role && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Briefcase className="w-4 h-4 mr-1.5" />
                {resume.target_role}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-400">
        <Calendar className="w-3.5 h-3.5 mr-1" />
        Last updated {formattedDate}
      </div>
    </Link>
  );
};
