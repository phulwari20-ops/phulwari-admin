import React from 'react';
import { Clock, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

interface BatchesTabProps {
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  badgeClass: string;
  batches: any[];
  setIsAddBatchOpen: (v: boolean) => void;
  setEditingBatch: (batch: any) => void;
  handleDeleteBatch: (id: string, name: string) => void;
  handleToggleBatchVisibility: (id: string, current: boolean) => void;
}

export default function BatchesTab({
  bgCard, textPrimary, textSecondary, badgeClass,
  batches, setIsAddBatchOpen, setEditingBatch,
  handleDeleteBatch, handleToggleBatchVisibility
}: BatchesTabProps) {
  return (
    <div className="space-y-4">
      <div className={`${bgCard} p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Clock className="w-5 h-5 text-blue-500" /> Batches &amp; Class Timings
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage batch timings, age groups, validity, and student capacities.</p>
        </div>
        <button
          onClick={() => setIsAddBatchOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Batch</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.map((bt) => {
          const isVisible = bt.is_visible !== false; // Default to true if undefined
          return (
            <div key={bt.id} className={`${bgCard} p-6 rounded-2xl space-y-4 flex flex-col justify-between`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold ${textPrimary}`}>{bt.batch_name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono border ${badgeClass}`}>{bt.age_group}</span>
                    <button
                      onClick={() => setEditingBatch(bt)}
                      className="p-1.5 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition cursor-pointer"
                      title="Edit Batch Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(bt.id, bt.batch_name)}
                      className="p-1.5 bg-rose-600/10 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className={`text-xs ${textSecondary} space-y-1 font-mono`}>
                  <p>Timing: <strong className={textPrimary}>{bt.start_time} - {bt.end_time}</strong></p>
                  <p>Days: <strong className={textPrimary}>{bt.days}</strong></p>
                  <p>Capacity: <strong className="text-blue-500">{bt.capacity} Students</strong></p>
                </div>
              </div>

              {/* Visibility Toggle Row */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className={`text-xs font-bold ${textSecondary}`}>Show in User Panel</span>
                <button
                  onClick={() => handleToggleBatchVisibility(bt.id, isVisible)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                    isVisible 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500 hover:text-white'
                  }`}
                >
                  {isVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>🟢 Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>⚪ Hidden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
