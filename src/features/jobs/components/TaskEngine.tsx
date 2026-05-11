import React, { useState } from 'react';
import { useFollowups } from '../hooks/useFollowups';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { FollowupInsert } from '../services/followupService';

interface TaskEngineProps {
  applicationId: string;
}

export const TaskEngine: React.FC<TaskEngineProps> = ({ applicationId }) => {
  const { followups, isLoading, createFollowup, toggleFollowup, deleteFollowup, isCreating } = useFollowups(applicationId);
  const [isAdding, setIsAdding] = useState(false);
  const [taskNotes, setTaskNotes] = useState('');
  const [taskType, setTaskType] = useState('follow-up');
  const [taskDate, setTaskDate] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskNotes || !taskDate) return;

    const newFollowup: FollowupInsert = {
      application_id: applicationId,
      notes: taskNotes,
      type: taskType,
      scheduled_at: new Date(taskDate).toISOString(),
    };

    await createFollowup(newFollowup);
    setTaskNotes('');
    setTaskDate('');
    setIsAdding(false);
  };

  const isOverdue = (dateStr: string, completed_at: string | null) => {
    if (completed_at) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center">
          <Clock className="w-5 h-5 mr-2 text-[#FC6100]" /> Tasks & Follow-ups
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          data-testid="task-add-btn"
          className="p-2 bg-white/5 text-white hover:text-[#FC6100] hover:bg-[#FC6100]/10 rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4 fade-in-up">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Action</label>
            <input
              type="text"
              required
              data-testid="task-notes-input"
              placeholder="e.g., Email recruiter, Prepare portfolio"
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
              <input
                type="date"
                required
                data-testid="task-date-input"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
              <select
                value={taskType}
                data-testid="task-type-select"
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100]"
              >
                <option value="follow-up">Follow-up</option>
                <option value="interview-prep">Interview Prep</option>
                <option value="portfolio">Portfolio</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              data-testid="task-submit-btn"
              className="px-5 py-2 bg-[#FC6100] text-white text-sm font-bold rounded-xl hover:bg-[#E35205] transition-all disabled:opacity-50"
            >
              {isCreating ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-6 text-gray-500 font-bold text-sm">Loading tasks...</div>
      ) : followups.length === 0 ? (
        <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <p className="text-gray-500 font-bold text-sm">No tasks scheduled yet.</p>
          <p className="text-xs text-gray-600 mt-1">Keep track of follow-ups and interview prep here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {followups.map((task) => (
            <li
              key={task.id}
              className={`flex items-start p-4 rounded-2xl border transition-all ${
                task.completed_at 
                  ? 'bg-emerald-500/5 border-emerald-500/10 opacity-75' 
                  : isOverdue(task.scheduled_at, task.completed_at)
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggleFollowup({ id: task.id, isCompleted: !task.completed_at })}
                data-testid="task-toggle-btn"
                className="mt-0.5 mr-4 flex-shrink-0 focus:outline-none"
              >
                {task.completed_at ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Circle className={`w-6 h-6 ${isOverdue(task.scheduled_at, task.completed_at) ? 'text-red-500' : 'text-gray-500 hover:text-[#FC6100]'}`} />
                )}
              </button>
              <div className="flex-grow">
                <p className={`text-sm font-bold ${task.completed_at ? 'text-emerald-400 line-through decoration-emerald-500/50' : 'text-white'}`}>
                  {task.notes}
                </p>
                <div className="flex items-center mt-1.5 space-x-3 text-xs font-bold uppercase tracking-wider">
                  <span className={`flex items-center ${isOverdue(task.scheduled_at, task.completed_at) ? 'text-red-400' : 'text-gray-500'}`}>
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(task.scheduled_at).toLocaleDateString()}
                  </span>
                  <span className="text-gray-600 px-2 py-0.5 bg-black/40 rounded-md">
                    {task.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteFollowup(task.id)}
                data-testid="task-delete-btn"
                className="ml-4 p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                style={{ opacity: 1 }} // Make always visible for now to avoid group-hover issues if group class is missing
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
