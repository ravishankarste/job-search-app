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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121212] border border-white/10 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Upload New Version</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                file 
                  ? 'border-[#FC6100] bg-[#FC6100]/5' 
                  : 'border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <UploadCloud className={`mx-auto h-12 w-12 transition-colors ${file ? 'text-[#FC6100]' : 'text-gray-600'}`} />
                <div className="flex text-sm text-gray-400 justify-center">
                  <span className="font-bold text-[#FC6100]">
                    {file ? 'Change file' : 'Upload a file'}
                  </span>
                  {!file && <p className="pl-1">or drag and drop</p>}
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">
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
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg">
              {localError}
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-2 text-sm font-bold text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-6 py-2 text-sm font-bold text-white bg-[#FC6100] border border-transparent rounded-xl hover:bg-[#E35205] transition-all disabled:opacity-50 flex items-center shadow-lg shadow-[#FC6100]/10"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
