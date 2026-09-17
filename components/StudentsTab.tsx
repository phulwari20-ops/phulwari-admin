import React, { useState, useMemo } from 'react';
import { Receipt, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const ALPHABETS = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

interface StudentsTabProps {
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  tipBannerBg: string;
  tableHeaderBg: string;
  badgeClass: string;
  badgePassword: string;
  filteredStudents: any[];
  batches: any[];
  setSelectedERPStudent: (st: any) => void;
  setErpModalTab: (tab: any) => void;
  setFeeForm: (form: any) => void;
  loadAllAdminData?: () => void;
}

type SortKey = 'name_asc' | 'name_desc' | 'admission_id_asc' | 'admission_id_desc';

function compareAdmissionId(a: string, b: string): number {
  const numA = parseInt((a || '').replace(/\D+/g, ''), 10) || 0;
  const numB = parseInt((b || '').replace(/\D+/g, ''), 10) || 0;
  if (numA !== numB) return numA - numB;
  return (a || '').localeCompare(b || '');
}

export default function StudentsTab({
  bgCard, textPrimary, textSecondary, isLight, tipBannerBg, tableHeaderBg,
  badgeClass, badgePassword, filteredStudents, batches,
  setSelectedERPStudent, setErpModalTab, setFeeForm, loadAllAdminData
}: StudentsTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name_asc');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  const letterFiltered = useMemo(() => {
    if (selectedLetter === 'ALL') return filteredStudents;
    return filteredStudents.filter(st =>
      (st.full_name || '').trim().toUpperCase().startsWith(selectedLetter)
    );
  }, [filteredStudents, selectedLetter]);

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
    <div className={`${bgCard} rounded-2xl overflow-hidden space-y-3`}>
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-semibold ${tipBannerBg}`}>
        <div className="flex items-center gap-3">
          <span>💡 Click &quot;Open ERP&quot; button to open fee management, payment ledger, password reset, or student profile.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-xs">
            Total Students: {filteredStudents.length} Active
          </span>
        </div>
      </div>

      {/* Sort & Alphabet Filter Header */}
      <div className="px-6 py-2 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
            <span className={textSecondary}>Quick Sort:</span>
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

          <span className={`text-[11px] font-semibold ${textSecondary}`}>
            Showing {sortedStudents.length} of {filteredStudents.length} students
          </span>
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
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : isLight
                    ? 'bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200'
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
            <tr className={`${tableHeaderBg} border-b font-bold uppercase tracking-wider`}>
              <th className="py-4 px-6 w-32">
                <button
                  onClick={() => setSortKey(sortKey === 'admission_id_asc' ? 'admission_id_desc' : 'admission_id_asc')}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition"
                >
                  <span>Admission ID</span>
                  {sortKey === 'admission_id_asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                  {sortKey === 'admission_id_desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                </button>
              </th>
              <th className="py-4 px-6 min-w-[180px]">
                <button
                  onClick={() => setSortKey(sortKey === 'name_asc' ? 'name_desc' : 'name_asc')}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition"
                >
                  <span>Student Name</span>
                  {sortKey === 'name_asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                  {sortKey === 'name_desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                </button>
              </th>
              <th className="py-4 px-6 w-44">Assigned Batch</th>
              <th className="py-4 px-6 w-36">Assigned Password</th>
              <th className="py-4 px-6 min-w-[160px]">Parent / Guardian</th>
              <th className="py-4 px-6 w-36">Contact Phone</th>
              <th className="py-4 px-6 text-right w-36">ERP Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
            {sortedStudents.map((st) => (
              <tr
                key={st.id}
                onClick={() => {
                  setSelectedERPStudent(st);
                  setErpModalTab('collect_fee');
                  setFeeForm({
                    title: 'Monthly Activity Fee (August 2026)',
                    amount: '3500',
                    discount_type: 'amount',
                    discount: '500',
                    due_date: '2026-08-10',
                    status: 'paid',
                    payment_method: 'UPI / Online',
                    receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
                  });
                }}
                className={`${isLight ? 'hover:bg-blue-50/70' : 'hover:bg-slate-800/60'} transition cursor-pointer`}
              >
                <td className="py-4 px-6 font-mono text-blue-500 font-bold">{st.admission_id}</td>
                <td className="py-4 px-6 font-semibold flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                    {st.full_name?.charAt(0)}
                  </div>
                  <span className="truncate">{st.full_name}</span>
                </td>
                <td className="py-4 px-6 font-semibold">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${badgeClass}`}>
                    {st.batch_name || batches.find((b: any) => b.id === st.batch_id)?.batch_name || 'Mother & Toddler Program'}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono font-bold">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${badgePassword}`}>{st.password}</span>
                </td>
                <td className="py-4 px-6">{st.parent_name}</td>
                <td className="py-4 px-6 font-mono text-slate-400">{st.parent_phone}</td>
                <td className="py-4 px-6 text-right">
                  <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto transition shadow-sm cursor-pointer">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Open ERP</span>
                  </button>
                </td>
              </tr>
            ))}
            {sortedStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                  No students found {selectedLetter !== 'ALL' ? `starting with "${selectedLetter}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
