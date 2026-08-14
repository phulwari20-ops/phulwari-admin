import React from 'react';
import { UserX, RefreshCw, Trash2 } from 'lucide-react';

interface DeactivatedTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  deactivatedStudents: any[];
  onReactivate: (id: string) => void;
  onPermanentDelete?: (id: string, name: string) => void;
}

export default function DeactivatedTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight,
  deactivatedStudents, onReactivate, onPermanentDelete
}: DeactivatedTabProps) {
  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-4 shadow-sm`}>
      <div>
        <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
          <UserX className="w-5 h-5 text-rose-500" /> Deactivated Students Archive
        </h3>
        <p className={`text-xs ${textSecondary}`}>Inactive students who have discontinued classes. Their historical records are preserved but hidden from ERP analytics and attendance sheets.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b font-bold uppercase tracking-wider ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-slate-800/20 text-slate-400'}`}>
              <th className="py-3 px-4">Admission ID</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Parent Details</th>
              <th className="py-3 px-4">Primary Contact</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
            {deactivatedStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">No deactivated students found.</td>
              </tr>
            ) : (
              deactivatedStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-500">{st.admission_id}</td>
                  <td className="py-3.5 px-4 font-bold">{st.full_name}</td>
                  <td className="py-3.5 px-4 font-semibold">{st.parent_name}</td>
                  <td className="py-3.5 px-4 font-mono">{st.parent_phone}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onReactivate(st.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/10 flex items-center gap-1.5 text-[10px] cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reactivate</span>
                      </button>
                      {onPermanentDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm(`⚠️ Permanently delete "${st.full_name}" (${st.admission_id})?\n\nThis action CANNOT be undone. All records will be erased.`)) {
                              onPermanentDelete(st.id, st.full_name)
                            }
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold rounded-xl transition shadow-md shadow-rose-500/10 flex items-center gap-1.5 text-[10px] cursor-pointer"
                          title="Permanently delete this student record"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Permanently</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

