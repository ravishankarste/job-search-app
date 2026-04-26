import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Job Search OS</h1>
        <p className="text-gray-600 mt-2">Manage your career journey from one centralized dashboard.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/resumes"
          className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Resumes</h3>
          <p className="text-sm text-gray-500 mt-1">Manage multiple versions of your resume.</p>
        </Link>

        <Link 
          to="/jobs"
          className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
        >
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Jobs</h3>
          <p className="text-sm text-gray-500 mt-1">Track job openings and opportunities.</p>
        </Link>

        <Link 
          to="/applications"
          className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
          <p className="text-sm text-gray-500 mt-1">Monitor your application status.</p>
        </Link>
      </div>
    </div>
  );
};
