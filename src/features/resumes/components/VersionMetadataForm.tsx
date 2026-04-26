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
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Version Details</h3>
      
      <div>
        <label htmlFor="versionNumber" className="block text-xs font-medium text-gray-700 mb-1">
          Version Number <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 sm:text-sm">
            v
          </span>
          <input
            type="number"
            id="versionNumber"
            min="1"
            required
            value={data.versionNumber || suggestedVersionNumber}
            onChange={(e) => onChange({ ...data, versionNumber: parseInt(e.target.value) || suggestedVersionNumber })}
            className="flex-1 block w-full min-w-0 rounded-none rounded-r-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="label" className="block text-xs font-medium text-gray-700 mb-1">
          Version Label (Optional)
        </label>
        <input
          type="text"
          id="label"
          value={data.label}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
          placeholder="e.g., Tailored for Google"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Helps you identify this specific version later.</p>
      </div>
    </div>
  );
};
