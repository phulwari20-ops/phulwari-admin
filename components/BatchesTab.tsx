import React from 'react';
import { Clock, Plus, Edit3, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';

interface BatchesTabProps {
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  badgeClass: string;
  batches: any[];
  batchSchedules: any[];
  classes: any[];
  handleAddClass: (name: string) => Promise<boolean>;
  handleDeleteClass: (id: string, name: string) => void;
  setIsAddBatchOpen: (v: boolean) => void;
  setEditingBatch: (batch: any) => void;
  handleDeleteBatch: (id: string, name: string) => void;
  handleToggleBatchVisibility: (id: string, current: boolean) => void;
}

export default function BatchesTab({
  bgCard, textPrimary, textSecondary, badgeClass,
  batches, batchSchedules, classes, handleAddClass, handleDeleteClass,
  setIsAddBatchOpen, setEditingBatch,
  handleDeleteBatch, handleToggleBatchVisibility
}: BatchesTabProps) {
  const [selectedBatchIdFilter, setSelectedBatchIdFilter] = React.useState<string>('All');
  const [newClassName, setNewClassName] = React.useState('');

  const submitNewClass = async () => {
    const ok = await handleAddClass(newClassName);
    if (ok) setNewClassName('');
  };

  return (
    <div className="space-y-4">
      <div className={`${bgCard} p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Clock className="w-5 h-5 text-blue-500" /> Batches &amp; Class Timings
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage batch timings, age groups, validity, and student capacities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBatchIdFilter}
            onChange={(e) => setSelectedBatchIdFilter(e.target.value)}
            className={`text-xs px-3.5 py-2.5 rounded-xl border outline-none font-bold shrink-0 ${
              textPrimary === 'text-white' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <option value="All">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.batch_name}</option>
            ))}
          </select>
          <button
            onClick={() => setIsAddBatchOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Batch</span>
          </button>
        </div>
      </div>
      {/* CLASS MASTER — the catalogue that feeds every Day -> Time -> Class dropdown */}
      <section className={`${bgCard} p-6 rounded-2xl space-y-4`} aria-labelledby="class-master-heading">
        <div>
          <h3 id="class-master-heading" className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <BookOpen className="w-5 h-5 text-purple-500" /> Class Master
          </h3>
          <p className={`text-xs ${textSecondary}`}>
            The list of activities the centre runs. These names fill the class dropdowns
            when you build batch schedules and customised student timetables.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {classes.length === 0 ? (
            <p className={`text-xs italic ${textSecondary}`}>
              No classes yet. Add your first activity below.
            </p>
          ) : (
            classes.map((cls) => {
              const usageCount = batchSchedules.filter(s => s.class_name === cls.class_name).length;
              return (
                <span
                  key={cls.id}
                  className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20"
                >
                  {cls.class_name}
                  <span className={`text-[10px] font-mono font-normal ${textSecondary}`}>
                    {usageCount} slot{usageCount === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(cls.id, cls.class_name)}
                    aria-label={`Remove ${cls.class_name} from the Class Master`}
                    title={`Remove ${cls.class_name}`}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <label htmlFor="new-class-name" className="sr-only">New class name</label>
          <input
            id="new-class-name"
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitNewClass();
              }
            }}
            placeholder="e.g. Skating"
            className={`text-xs px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
              textPrimary === 'text-white'
                ? 'bg-slate-950 border-slate-800 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <button
            type="button"
            onClick={submitNewClass}
            disabled={newClassName.trim() === ''}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.filter(b => selectedBatchIdFilter === 'All' || b.id === selectedBatchIdFilter).map((bt) => {
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

                {/* Schedules list */}
                {batchSchedules && batchSchedules.filter(s => s.batch_id === bt.id).length > 0 && (
                  <div className="pt-2 mt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Schedules (Class Master):</p>
                    <div className="grid grid-cols-1 gap-1.5 pl-1">
                      {batchSchedules.filter(s => s.batch_id === bt.id).map(sch => (
                        <div key={sch.id} className={`text-[11px] font-semibold flex items-center justify-between p-1 px-2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300`}>
                          <span>📅 {sch.day_of_week}</span>
                          <span className="font-mono text-blue-500">{sch.start_time} - {sch.end_time}</span>
                          <span className="bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded text-[10px] font-bold">{sch.class_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
