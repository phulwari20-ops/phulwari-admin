import React, { useState, useMemo } from 'react';
import { Users, Download, ArrowUpDown, CalendarDays, Hash, ArrowUp, ArrowDown } from 'lucide-react';

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
  batches: any[];
  setIsExportModalOpen: (v: boolean) => void;
}

type SortKey = 'admission_date_desc' | 'admission_date_asc' | 'admission_id_asc' | 'admission_id_desc' | 'default';

const SORT_OPTIONS: { key: SortKey; label: string; icon: 'cal-desc' | 'cal-asc' | 'num-asc' | 'num-desc' }[] = [
  { key: 'admission_date_desc', label: 'Newest First', icon: 'cal-desc' },
  { key: 'admission_date_asc',  label: 'Oldest First',  icon: 'cal-asc'  },
  { key: 'admission_id_asc',    label: 'ID: Asc (A→Z)', icon: 'num-asc'  },
  { key: 'admission_id_desc',   label: 'ID: Desc (Z→A)', icon: 'num-desc' },
];

function parseAdmissionDate(st: any): Date {
  const raw = st.admission_date || st.created_at || '';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function compareAdmissionId(a: string, b: string): number {
  // Format: PH-2026-001 — extract the numeric tail for proper numeric sort
  const numA = parseInt((a || '').replace(/\D+/g, ''), 10) || 0;
  const numB = parseInt((b || '').replace(/\D+/g, ''), 10) || 0;
  if (numA !== numB) return numA - numB;
  return (a || '').localeCompare(b || '');
}

export default function StudentListTab({
  bgCard, textPrimary, textSecondary, isLight, tableHeaderBg,
  badgeClass, filteredStudents, batches, setIsExportModalOpen
}: StudentListTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    switch (sortKey) {
      case 'admission_date_desc':
        return list.sort((a, b) => parseAdmissionDate(b).getTime() - parseAdmissionDate(a).getTime());
      case 'admission_date_asc':
        return list.sort((a, b) => parseAdmissionDate(a).getTime() - parseAdmissionDate(b).getTime());
      case 'admission_id_asc':
        return list.sort((a, b) => compareAdmissionId(a.admission_id, b.admission_id));
      case 'admission_id_desc':
        return list.sort((a, b) => compareAdmissionId(b.admission_id, a.admission_id));
      default:
        return list;
    }
  }, [filteredStudents, sortKey]);

  const inputBase = `border rounded-xl px-3 py-1.5 text-xs font-bold outline-none transition ${
    isLight
      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400'
      : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
  }`;

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
        const activeCount = filteredStudents.filter(s => s.status !== 'deactivated').length
        const deactivatedCount = filteredStudents.filter(s => s.status === 'deactivated').length
        const newCount = filteredStudents.filter(st => {
          if (st.status === 'deactivated') return false
          if (st.status === 'new' || st.status === 'New') return true
          const dateStr = st.created_at || st.print_date
          if (dateStr) {
            const d = new Date(dateStr)
            const now = new Date()
            return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          }
          return false
        }).length

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
        )
      })()}

      {/* ── Sort / Filter Toolbar ── */}
      <div className={`rounded-2xl border p-4 space-y-3 ${
        isLight
          ? 'bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-blue-500 shrink-0" />
          <span className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
            Sort &amp; Filter
          </span>
          <span className={`text-[10px] font-semibold ${textSecondary}`}>
            — {sortedStudents.length} student{sortedStudents.length !== 1 ? 's' : ''}
          </span>
          {sortKey !== 'default' && (
            <button
              onClick={() => setSortKey('default')}
              className="ml-auto text-[10px] font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
            >
              ✕ Reset Sort
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* ── Admission Date Sort ── */}
          <div className={`rounded-xl border p-3 space-y-2 ${
            isLight ? 'bg-white/80 border-blue-100' : 'bg-slate-800/50 border-slate-700'
          }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                Admission Date
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortKey(sortKey === 'admission_date_desc' ? 'default' : 'admission_date_desc')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                  sortKey === 'admission_date_desc'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-blue-900/30 hover:border-blue-700 hover:text-blue-400'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                <span>Newest First</span>
              </button>
              <button
                onClick={() => setSortKey(sortKey === 'admission_date_asc' ? 'default' : 'admission_date_asc')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                  sortKey === 'admission_date_asc'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-blue-900/30 hover:border-blue-700 hover:text-blue-400'
                }`}
              >
                <ArrowUp className="w-3 h-3" />
                <span>Oldest First</span>
              </button>
            </div>
          </div>

          {/* ── Admission Number Sort ── */}
          <div className={`rounded-xl border p-3 space-y-2 ${
            isLight ? 'bg-white/80 border-indigo-100' : 'bg-slate-800/50 border-slate-700'
          }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Hash className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                Admission Number
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortKey(sortKey === 'admission_id_asc' ? 'default' : 'admission_id_asc')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                  sortKey === 'admission_id_asc'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-indigo-900/30 hover:border-indigo-700 hover:text-indigo-400'
                }`}
              >
                <ArrowUp className="w-3 h-3" />
                <span>Asc (001→Last)</span>
              </button>
              <button
                onClick={() => setSortKey(sortKey === 'admission_id_desc' ? 'default' : 'admission_id_desc')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                  sortKey === 'admission_id_desc'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-indigo-900/30 hover:border-indigo-700 hover:text-indigo-400'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                <span>Desc (Last→001)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active sort label */}
        {sortKey !== 'default' && (
          <div className="flex items-center gap-2 pt-1">
            <span className={`text-[10px] font-semibold ${textSecondary}`}>Active sort:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              sortKey.startsWith('admission_date')
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
            }`}>
              {SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? sortKey}
            </span>
          </div>
        )}
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
              <th className="py-3.5 px-4">Student Name</th>
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
                <tr key={st.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-950/10 transition`}>
                  <td className={`py-3.5 px-4 font-bold text-[11px] ${textSecondary}`}>{idx + 1}</td>
                  <td className="py-3.5 px-4 font-mono text-blue-500 font-bold">{st.admission_id}</td>
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
                </tr>
              );
            })}
            {sortedStudents.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold text-sm">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



