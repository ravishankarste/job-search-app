import React from 'react';

export interface VersionMetadata {
  versionNumber: number;
  label: string;
}

interface VersionMetadataFormProps {
  data: VersionMetadata;
  onChange: (data: VersionMetadata) => void;
  suggestedVersionNumber: number;
}

export const VersionMetadataForm: React.FC<VersionMetadataFormProps> = ({
  data,
  onChange,
  suggestedVersionNumber,
}) => {
  const inputClasses = "flex-1 block w-full min-w-0 bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] sm:text-sm outline-none transition-all";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
      <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">Version Details</h3>
      
      <div>
        <label htmlFor="versionNumber" className={labelClasses}>
          Version Number <span className="text-[#FC6100]">*</span>
        </label>
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-white/10 bg-white/5 text-gray-500 sm:text-sm font-bold">
            v
          </span>
          <input
            type="number"
            id="versionNumber"
            min="1"
            required
            value={data.versionNumber || suggestedVersionNumber}
            onChange={(e) => onChange({ ...data, versionNumber: parseInt(e.target.value) || suggestedVersionNumber })}
            className={`${inputClasses} rounded-r-lg`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="label" className={labelClasses}>
          Version Label (Optional)
        </label>
        <input
          type="text"
          id="label"
          value={data.label}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
          placeholder="e.g., Tailored for Google"
          className={`${inputClasses} rounded-lg`}
        />
        <p className="mt-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-tight">Helps you identify this specific version later.</p>
      </div>
    </div>
  );
};
