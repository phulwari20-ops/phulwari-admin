import React from 'react';
import { Users, Download } from 'lucide-react';

interface StudentListTabProps {
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  tableHeaderBg: string;
  badgeClass: string;
  filteredStudents: any[];
  batches: any[];
  setIsExportModalOpen: (v: boolean) => void;
}

export default function StudentListTab({
  bgCard, textPrimary, textSecondary, isLight, tableHeaderBg,
  badgeClass, filteredStudents, batches, setIsExportModalOpen
}: StudentListTabProps) {
  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-5 shadow-sm`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Users className="w-5 h-5 text-blue-500" /> Student Directory &amp; Export Center
          </h3>
          <p className={`text-xs ${textSecondary}`}>Full directory of enrolled students categorized by assigned dynamic batches.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>📥 Export Options (CSV / PDF)</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`${tableHeaderBg} border-b font-bold uppercase tracking-wider`}>
              <th className="py-3.5 px-4">Admission ID</th>
              <th className="py-3.5 px-4">Student Name</th>
              <th className="py-3.5 px-4">Assigned Batch Name</th>
              <th className="py-3.5 px-4">Batch ID</th>
              <th className="py-3.5 px-4">Parent Name</th>
              <th className="py-3.5 px-4">Contact Phone</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
            {filteredStudents.map((st) => (
              <tr key={st.id} className="hover:bg-blue-50/50 transition">
                <td className="py-3.5 px-4 font-mono text-blue-500 font-bold">{st.admission_id}</td>
                <td className="py-3.5 px-4 font-bold">{st.full_name}</td>
                <td className="py-3.5 px-4 font-semibold">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${badgeClass}`}>
                    {st.batch_name || batches.find((b: any) => b.id === st.batch_id)?.batch_name || 'Mother & Toddler Program'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px] truncate max-w-[120px]">{st.batch_id || '11111111-1111-1111-1111-111111111111'}</td>
                <td className="py-3.5 px-4 font-semibold">{st.parent_name}</td>
                <td className="py-3.5 px-4 font-mono">{st.parent_phone}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
