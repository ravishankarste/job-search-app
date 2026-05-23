import React, { useState } from 'react';
import { Download, AlertTriangle, ShieldCheck, Database, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { jobService } from '../features/jobs/services/jobService';
import { resumeService } from '../features/resumes/services/resumeService';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch all user data
      const jobs = await jobService.getJobs();
      const resumes = await resumeService.getUserResumes();
      
      const exportData = {
        meta: {
          app: 'Udyog Marg',
          exportedAt: new Date().toISOString(),
          version: '1.0'
        },
        jobs,
        resumes
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `udyog_marg_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const jobs = await jobService.getJobs();
      
      // Create CSV headers
      let csvContent = "Company,Job Title,Location,Status,Date Added,Job URL\n";
      
      // Add rows
      jobs.forEach(job => {
        const company = `"${(job.company_name || '').replace(/"/g, '""')}"`;
        const title = `"${(job.title || '').replace(/"/g, '""')}"`;
        const location = `"${(job.location || '').replace(/"/g, '""')}"`;
        const status = job.application?.status || 'unknown';
        const date = job.created_at ? new Date(job.created_at).toLocaleDateString() : '';
        const url = job.url || '';
        
        csvContent += `${company},${title},${location},${status},${date},${url}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `udyog_marg_pipeline_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
      });
      
      if (error) throw error;
      
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 fade-in-up pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Privacy & Data</h1>
        <p className="text-gray-500 text-sm mt-2">Manage your data, export your pipeline, and control your privacy settings.</p>
      </div>

      <div className="space-y-6">
        {/* Data Export Section */}
        <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FC6100]/10 rounded-2xl shrink-0 mt-1">
              <Database className="w-6 h-6 text-[#FC6100]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Export Your Data</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-2xl">
                Download a complete archive of your job search history. Use CSV for Excel/Google Sheets to share with a mentor, or JSON for a complete developer backup.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleExportCSV}
                  disabled={isExporting || exportSuccess}
                  className="flex items-center gap-2 px-6 py-3 bg-[#FC6100] text-white font-bold rounded-xl hover:bg-[#E35205] shadow-lg shadow-[#FC6100]/10 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : exportSuccess ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  Export Pipeline (CSV)
                </button>

                <button 
                  onClick={handleExportData}
                  disabled={isExporting || exportSuccess}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 hover:border-[#FC6100]/50 transition-all disabled:opacity-50"
                >
                  Download JSON Backup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Promise */}
        <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl shrink-0 mt-1">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Our Privacy Promise</h2>
              <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                Udyog Marg is designed as a personal, private operating system for your career. We do not sell your job search data to recruiters, employers, or third-party advertisers. Your resumes and pipelines are securely encrypted and accessible only by you.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-red-500/10 rounded-2xl shrink-0 mt-1">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Danger Zone</h2>
              <p className="text-red-400/80 text-sm mb-6 max-w-2xl">
                Permanently delete your account and wipe all data from our servers. This action is irreversible. All resumes, job tracking, and analytics will be destroyed instantly.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-[#121212] border border-red-500/30 p-6 rounded-2xl max-w-md">
                  <h3 className="text-white font-bold mb-2">Are you absolutely sure?</h3>
                  <p className="text-gray-400 text-sm mb-6">Type "delete" to confirm.</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all font-bold text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-bold text-sm disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
