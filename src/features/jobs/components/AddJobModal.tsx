import React, { useState } from 'react';
import { X, Briefcase, Link as LinkIcon, MapPin, Building2, Plus } from 'lucide-react';

// Helper for tailwind classes if needed later
// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    company_name: '',
    title: '',
    url: '',
    location: '',
    employment_type: 'full-time',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 text-sm placeholder:text-gray-400";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with extreme blur */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Opportunity</h2>
            <p className="text-gray-500 text-sm mt-1">Found a great role? Let's track it in your pipeline.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-1">
              <label className={labelClasses}>Company <span className="text-blue-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Google, Stripe"
                  className={inputClasses}
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-1">
              <label className={labelClasses}>Role Title <span className="text-blue-500">*</span></label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  className={inputClasses}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Job URL */}
          <div className="space-y-1">
            <label className={labelClasses}>Job Posting URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                placeholder="https://careers.company.com/..."
                className={inputClasses}
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-1">
              <label className={labelClasses}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Remote, New York, NY"
                  className={inputClasses}
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Employment Type */}
            <div className="space-y-1">
              <label className={labelClasses}>Type</label>
              <select
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 text-sm appearance-none cursor-pointer"
                value={formData.employment_type}
                onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 active:scale-95"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] inline-flex items-center justify-center px-6 py-4 border border-transparent text-sm font-bold rounded-2xl shadow-xl shadow-blue-200 text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Save to Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
