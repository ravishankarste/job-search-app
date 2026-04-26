import React, { useState, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { VersionMetadataForm } from './VersionMetadataForm';
import type { VersionMetadata } from './VersionMetadataForm';

interface UploadVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, metadata: VersionMetadata) => Promise<void>;
  isUploading: boolean;
  suggestedVersionNumber: number;
}

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isUploading,
  suggestedVersionNumber,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VersionMetadata>({
    versionNumber: suggestedVersionNumber,
    label: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync suggested version number if it changes
  React.useEffect(() => {
    setMetadata(prev => ({ ...prev, versionNumber: suggestedVersionNumber }));
  }, [suggestedVersionNumber]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        setLocalError('Please upload a PDF file.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLocalError(null);
    
    try {
      await onSubmit(file, metadata);
      setFile(null);
      setMetadata({ versionNumber: suggestedVersionNumber, label: '' });
    } catch (err: any) {
      console.error("Submit Error Catch:", err);
      setLocalError(err.message || 'An unexpected error occurred during upload.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Upload New Version</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${
                file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <UploadCloud className={`mx-auto h-12 w-12 ${file ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>{file ? 'Change file' : 'Upload a file'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                  {!file && <p className="pl-1">or drag and drop</p>}
                </div>
                <p className="text-xs text-gray-500">
                  {file ? file.name : 'PDF up to 10MB'}
                </p>
              </div>
            </div>
          </div>

          <VersionMetadataForm
            data={metadata}
            onChange={setMetadata}
            suggestedVersionNumber={suggestedVersionNumber}
          />

          {localError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg animate-pulse">
              {localError}
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
