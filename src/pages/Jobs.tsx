import React from 'react';

export const Jobs: React.FC = () => {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar placeholder */}
      <div className="w-64 bg-white border-r">
        Sidebar
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="font-medium text-gray-800">Jobs</div>

          <button className="px-3 py-1.5 bg-black text-white text-sm rounded-md">
            Add Job
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 p-6">
          <div className="text-gray-500">
            Your workspace will go here
          </div>
        </div>
      </div>
    </div>
  );
};