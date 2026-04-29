import React from 'react';

export const Jobs: React.FC = () => {
  return (
    <div className="h-screen flex bg-black">
      {/* Sidebar placeholder */}
      <div className="w-64 bg-[#121212] border-r border-white/10">
        <span className="text-gray-500 p-4 block">Sidebar</span>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-14 bg-[#121212] border-b border-white/10 flex items-center justify-between px-4">
          <div className="font-bold text-white">Jobs</div>

          <button className="px-3 py-1.5 bg-[#FC6100] text-white text-sm font-bold rounded-lg">
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