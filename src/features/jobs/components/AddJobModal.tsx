import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus } from 'lucide-react';
import { trackEvent } from '../../../lib/analytics';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<{
    company_name: string;
    title: string;
    url: string;
    description: string;
    location: string;
    employment_type: string;
  }>;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    company_name: '',
    title: '',
    url: '',
    description: '',
    location: '',
    employment_type: 'full-time',
  });

  // Reset form with initialData when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        company_name: initialData?.company_name || '',
        title: initialData?.title || '',
        url: initialData?.url || '',
        description: initialData?.description || '',
        location: initialData?.location || '',
        employment_type: initialData?.employment_type || 'full-time',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('job_import_success', { method: 'manual', url: formData.url });
    onSubmit(formData);
  };

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-1 focus:ring-[#FC6100] focus:border-[#FC6100] outline-none transition-all duration-200 text-sm text-white placeholder:text-gray-600";
  const labelClasses = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#121212] border border-white/10 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden fade-in-up">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Add New Opportunity</h2>
            <p className="text-gray-500 text-sm mt-1">Found a great role? Let's track it in your pipeline.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Company Name */}
            <div>
              <label className={labelClasses}>Company <span className="text-[#FC6100]">*</span></label>
              <input
                required
                type="text"
                placeholder="e.g. Google, Stripe"
                className={inputClasses}
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            {/* Job Title */}
            <div>
              <label className={labelClasses}>Role Title <span className="text-[#FC6100]">*</span></label>
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

          {/* Job URL */}
          <div>
            <label className={labelClasses}>Job Posting URL</label>
            <input
              type="url"
              placeholder="https://careers.company.com/..."
              className={inputClasses}
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          {/* Job Description */}
          <div>
            <label className={labelClasses}>Job Description (For ATS Match Scoring)</label>
            <textarea
              placeholder="Paste the full job description here..."
              className={`${inputClasses} h-24 resize-y`}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Location */}
            <div>
              <label className={labelClasses}>Location</label>
              <input
                type="text"
                placeholder="e.g. Remote, New York, NY"
                className={inputClasses}
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className={labelClasses}>Type</label>
              <select
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-1 focus:ring-[#FC6100] focus:border-[#FC6100] outline-none transition-all duration-200 text-sm text-white appearance-none cursor-pointer"
                value={formData.employment_type}
                onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
              >
                <option value="full-time" className="bg-[#121212]">Full-time</option>
                <option value="part-time" className="bg-[#121212]">Part-time</option>
                <option value="contract" className="bg-[#121212]">Contract</option>
                <option value="internship" className="bg-[#121212]">Internship</option>
                <option value="freelance" className="bg-[#121212]">Freelance</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 text-sm font-bold text-gray-400 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-200 active:scale-95"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] inline-flex items-center justify-center px-6 py-4 text-sm font-bold rounded-2xl shadow-xl shadow-[#FC6100]/10 text-white bg-[#FC6100] hover:bg-[#E35205] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-50"
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
    </div>,
    document.body
  );
};
