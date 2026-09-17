import React, { useState, useMemo } from 'react';
import { Users, Download, ArrowUpDown, CalendarDays, Hash, ArrowUp, ArrowDown, Filter, Sparkles } from 'lucide-react';

const ALPHABETS = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return '—';
  let str = String(dateStr).trim();
  if (str.includes('T')) {
    str = str.split('T')[0];
  } else if (str.includes(' ')) {
    str = str.split(' ')[0];
  }
  if (str.includes('/')) return str;
  const parts = str.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y.length === 4) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  return dateStr;
};

interface StudentListTabProps {
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  tableHeaderBg: string;
  badgeClass: string;
  filteredStudents: any[];
  students?: any[];
  batches: any[];
  setIsExportModalOpen: (v: boolean) => void;
  onSelectStudent?: (st: any) => void;
}

type SortKey =
  | 'name_asc'
  | 'name_desc'
  | 'admission_id_asc'
  | 'admission_id_desc'
  | 'admission_date_desc'
  | 'admission_date_asc'
  | 'default';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name_asc', label: 'Name: A → Z' },
  { key: 'name_desc', label: 'Name: Z → A' },
  { key: 'admission_id_asc', label: 'Admission ID: First → Last (Asc)' },
  { key: 'admission_id_desc', label: 'Admission ID: Last → First (Desc)' },
  { key: 'admission_date_desc', label: 'Admission Date: Newest First' },
  { key: 'admission_date_asc', label: 'Admission Date: Oldest First' },
];

function parseAdmissionDate(st: any): Date {
  const raw = st.admission_date || st.created_at || '';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function compareAdmissionId(a: string, b: string): number {
  const numA = parseInt((a || '').replace(/\D+/g, ''), 10) || 0;
  const numB = parseInt((b || '').replace(/\D+/g, ''), 10) || 0;
  if (numA !== numB) return numA - numB;
  return (a || '').localeCompare(b || '');
}

export default function StudentListTab({
  bgCard, textPrimary, textSecondary, isLight, tableHeaderBg,
  badgeClass, filteredStudents, students, batches, setIsExportModalOpen, onSelectStudent
}: StudentListTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name_asc');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  // Filter by Alphabet Letter
  const letterFiltered = useMemo(() => {
    if (selectedLetter === 'ALL') return filteredStudents;
    return filteredStudents.filter(st =>
      (st.full_name || '').trim().toUpperCase().startsWith(selectedLetter)
    );
  }, [filteredStudents, selectedLetter]);

  // Sort filtered students
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
      case 'admission_date_desc':
        return list.sort((a, b) => parseAdmissionDate(b).getTime() - parseAdmissionDate(a).getTime());
      case 'admission_date_asc':
        return list.sort((a, b) => parseAdmissionDate(a).getTime() - parseAdmissionDate(b).getTime());
      default:
        return list;
    }
  }, [letterFiltered, sortKey]);

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-5 shadow-sm`}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Users className="w-5 h-5 text-blue-500" /> Student Directory &amp; Export Center
          </h3>
          <p className={`text-xs ${textSecondary}`}>
            Full directory of enrolled students categorized by assigned dynamic batches.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>📥 Export Options (CSV / PDF)</span>
          </button>
        </div>
      </div>

      {/* ── Admission & Student Status KPI Cards ── */}
      {(() => {
        const masterList = (students && students.length > 0) ? students : filteredStudents;
        const activeCount = masterList.filter(s => s.status !== 'deactivated' && s.status !== 'left' && s.status !== 'inactive').length;
        const deactivatedCount = masterList.filter(s => s.status === 'deactivated' || s.status === 'left' || s.status === 'inactive').length;
        const newCount = masterList.filter(st => {
          if (st.status === 'deactivated' || st.status === 'left' || st.status === 'inactive') return false;
          if (st.status === 'new' || st.status === 'New') return true;
          const dateStr = st.admission_date || st.created_at || st.print_date || st.plan_start_date;
          if (dateStr) {
            const d = new Date(dateStr);
            const now = new Date();
            return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }
          return false;
        }).length;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-emerald-600">Total Active Students</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{activeCount}</p>
              </div>
              <Users className="w-6 h-6 text-emerald-500 opacity-80" />
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-blue-600">Total New Admissions</p>
                <p className="text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{newCount}</p>
              </div>
              <Users className="w-6 h-6 text-blue-500 opacity-80" />
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-rose-600">Total Left / Deactivated</p>
                <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{deactivatedCount}</p>
              </div>
              <Users className="w-6 h-6 text-rose-500 opacity-80" />
            </div>
          </div>
        );
      })()}

      {/* ── Sort & Alphabet Quick Filter Bar ── */}
      <div className={`rounded-2xl border p-4 space-y-3 ${
        isLight
          ? 'bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-blue-500 shrink-0" />
            <span className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
              Sort &amp; Alphabet Quick Filter
            </span>
            <span className={`text-[10px] font-semibold ${textSecondary}`}>
              — Showing {sortedStudents.length} student{sortedStudents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${textSecondary}`}>Sort By:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border outline-none font-bold ${
                isLight ? 'bg-white border-slate-300 text-slate-800 focus:border-blue-500' : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-blue-500'
              }`}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alphabet Letter Chips */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className={`text-[11px] font-extrabold uppercase mr-1 shrink-0 ${textSecondary}`}>Letter:</span>
            {ALPHABETS.map((letter) => {
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 scale-105'
                      : isLight
                      ? 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`${tableHeaderBg} border-b font-bold uppercase tracking-wider`}>
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">
                <button
                  onClick={() => setSortKey(sortKey === 'admission_id_asc' ? 'admission_id_desc' : 'admission_id_asc')}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition group"
                  title="Sort by Admission ID"
                >
                  <span>Admission ID</span>
                  {sortKey === 'admission_id_asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                  {sortKey === 'admission_id_desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                  {!sortKey.startsWith('admission_id') && <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />}
                </button>
              </th>
              <th className="py-3.5 px-4">
                <button
                  onClick={() => setSortKey(sortKey === 'name_asc' ? 'name_desc' : 'name_asc')}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition group"
                  title="Sort by Name"
                >
                  <span>Student Name</span>
                  {sortKey === 'name_asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                  {sortKey === 'name_desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                  {!sortKey.startsWith('name_') && <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />}
                </button>
              </th>
              <th className="py-3.5 px-4">Assigned Batch Name</th>
              <th className="py-3.5 px-4">Parent Name</th>
              <th className="py-3.5 px-4">Contact Phone</th>
              <th className="py-3.5 px-4">
                <button
                  onClick={() => setSortKey(sortKey === 'admission_date_desc' ? 'admission_date_asc' : 'admission_date_desc')}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition group"
                  title="Sort by Admission Date"
                >
                  <span>Admission Date</span>
                  {sortKey === 'admission_date_desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                  {sortKey === 'admission_date_asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                  {!sortKey.startsWith('admission_date') && <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />}
                </button>
              </th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
            {sortedStudents.map((st, idx) => {
              const admDate = st.admission_date
                ? formatDateToDisplay(st.admission_date)
                : st.created_at
                  ? formatDateToDisplay(st.created_at)
                  : '—';

              return (
                <tr 
                  key={st.id} 
                  onClick={() => onSelectStudent && onSelectStudent(st)}
                  className={`hover:bg-blue-50/70 dark:hover:bg-blue-950/20 transition cursor-pointer group`}
                >
                  <td className={`py-3.5 px-4 font-bold text-[11px] ${textSecondary}`}>{idx + 1}</td>
                  <td className="py-3.5 px-4 font-mono text-blue-500 font-bold group-hover:underline">{st.admission_id}</td>
                  <td className="py-3.5 px-4 font-bold">{st.full_name}</td>
                  <td className="py-3.5 px-4 font-semibold">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${badgeClass}`}>
                      {st.batch_name || batches.find((b: any) => b.id === st.batch_id)?.batch_name || 'Mother & Toddler Program'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold">{st.parent_name}</td>
                  <td className="py-3.5 px-4 font-mono">{st.parent_phone}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      admDate !== '—'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-slate-400'
                    }`}>
                      {admDate}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectStudent) onSelectStudent(st);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm cursor-pointer"
                    >
                      View ERP Details
                    </button>
                  </td>
                </tr>
              );
            })}
            {sortedStudents.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold text-sm">
                  No students found {selectedLetter !== 'ALL' ? `starting with letter "${selectedLetter}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
