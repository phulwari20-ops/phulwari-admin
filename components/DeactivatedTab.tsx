import React, { useState, useMemo } from 'react';
import { UserX, RefreshCw, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const ALPHABETS = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

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

type SortKey = 'name_asc' | 'name_desc' | 'admission_id_asc' | 'admission_id_desc';

function compareAdmissionId(a: string, b: string): number {
  const numA = parseInt((a || '').replace(/\D+/g, ''), 10) || 0;
  const numB = parseInt((b || '').replace(/\D+/g, ''), 10) || 0;
  if (numA !== numB) return numA - numB;
  return (a || '').localeCompare(b || '');
}

export default function DeactivatedTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight,
  deactivatedStudents, onReactivate, onPermanentDelete
}: DeactivatedTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name_asc');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  const letterFiltered = useMemo(() => {
    if (selectedLetter === 'ALL') return deactivatedStudents;
    return deactivatedStudents.filter(st =>
      (st.full_name || '').trim().toUpperCase().startsWith(selectedLetter)
    );
  }, [deactivatedStudents, selectedLetter]);

  const sortedStudents = useMemo(() => {
    const list = [...letterFiltered];
    switch (sortKey) {
      case 'name_asc':
        return list.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
      case 'name_desc':
        return list.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
      case 'admission_id_asc':
        return list.sort((a, b) => compareAdmissionId(a.admission_id, b.admission_id));
      case 'admission_id_desc':
        return list.sort((a, b) => compareAdmissionId(b.admission_id, a.admission_id));
      default:
        return list;
    }
  }, [letterFiltered, sortKey]);

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-4 shadow-sm`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <UserX className="w-5 h-5 text-rose-500" /> Deactivated Students Archive
          </h3>
          <p className={`text-xs ${textSecondary}`}>Inactive students who have discontinued classes. Their historical records are preserved but hidden from ERP analytics and attendance sheets.</p>
        </div>
        <span className="font-mono text-rose-500 font-bold text-xs shrink-0">
          {sortedStudents.length} Deactivated
        </span>
      </div>

      {/* Sort & Alphabet Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
            <span className={textSecondary}>Sort:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={`text-xs px-3 py-1 rounded-xl border outline-none font-bold ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-100'
              }`}
            >
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="admission_id_asc">Admission ID: First → Last</option>
              <option value="admission_id_desc">Admission ID: Last → First</option>
            </select>
          </div>
        </div>

        {/* Alphabet Letter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <span className={`text-[10px] font-extrabold uppercase mr-1 shrink-0 ${textSecondary}`}>Letter:</span>
          {ALPHABETS.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                className={`px-2 py-0.5 rounded text-[11px] font-black transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs scale-105'
                    : isLight
                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 border border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b font-bold uppercase tracking-wider ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-slate-800/20 text-slate-400'}`}>
              <th className="py-3 px-4">
                <button
                  onClick={() => setSortKey(sortKey === 'admission_id_asc' ? 'admission_id_desc' : 'admission_id_asc')}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition"
                >
                  <span>Admission ID</span>
                  {sortKey === 'admission_id_asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                  {sortKey === 'admission_id_desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => setSortKey(sortKey === 'name_asc' ? 'name_desc' : 'name_asc')}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition"
                >
                  <span>Student Name</span>
                  {sortKey === 'name_asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                  {sortKey === 'name_desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                </button>
              </th>
              <th className="py-3 px-4">Parent Details</th>
              <th className="py-3 px-4">Primary Contact</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                  No deactivated students found {selectedLetter !== 'ALL' ? `starting with letter "${selectedLetter}"` : ''}.
                </td>
              </tr>
            ) : (
              sortedStudents.map((st) => (
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
