import React from 'react';
import { UserPlus, Edit3, Trash2, Plus, Wallet } from 'lucide-react';

interface TeachersTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  teachers: any[];
  setEditingTeacher: (teacher: any) => void;
  setTeacherForm: (form: any) => void;
  setIsAddTeacherOpen: (isOpen: boolean) => void;
  handleDeleteTeacher: (id: string) => void;
  adminRole?: string;
  onViewProfile?: (teacher: any) => void;
}

export default function TeachersTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  teachers,
  setEditingTeacher,
  setTeacherForm,
  setIsAddTeacherOpen,
  handleDeleteTeacher,
  adminRole,
  onViewProfile
}: TeachersTabProps) {
  const [selectedBatchNameFilter, setSelectedBatchNameFilter] = React.useState<string>('All');

  // Extract all unique assigned batch names from teachers list
  const uniqueBatches = Array.from(new Set(teachers.map(t => t.assigned_batch).filter(Boolean)));

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <UserPlus className="w-5 h-5 text-indigo-500" /> Teacher &amp; Faculty Staff Management
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage educators, assign active batches, track phone &amp; email contacts, and update status live.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBatchNameFilter}
            onChange={(e) => setSelectedBatchNameFilter(e.target.value)}
            className={`text-xs px-3.5 py-2.5 rounded-xl border outline-none font-bold shrink-0 ${
              textPrimary === 'text-white' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <option value="All">All Assigned Batches</option>
            {uniqueBatches.map(bName => (
              <option key={bName} value={bName}>{bName}</option>
            ))}
          </select>
          {adminRole !== 'Staff' && (
            <button
              onClick={() => {
                setEditingTeacher(null);
                setTeacherForm({ name: '', email: '', phone: '', specialization: 'Early Learning', assigned_batch: 'Little Explorers (Morning)', status: 'Active', photo_url: '', address: '', qualification: '', subject: '', designation: '', join_date: '', employment_type: 'Full Time', salary_type: 'Monthly', monthly_salary: '', salary_effective_from: '', bank_details: '', emergency_contact: '', documents: '' });
                setIsAddTeacherOpen(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Teacher</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.filter(t => selectedBatchNameFilter === 'All' || t.assigned_batch === selectedBatchNameFilter).map((tch) => (
          <div key={tch.id} className={`relative p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 space-y-5 ${bgSubCard} shadow-sm hover:shadow-xl hover:border-indigo-400/50 transition-all duration-300 group`}>
            
            {/* Status Badge - Absolute Top Right */}
            <div className="absolute top-5 right-5">
              <span className={`text-[10px] px-3 py-1 rounded-full font-extrabold tracking-wider uppercase border shadow-sm ${
                tch.status === 'Active' ? 'bg-gradient-to-r from-emerald-400/10 to-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}>
                {tch.status}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 transform group-hover:scale-105 transition-transform duration-300">
                {tch.name ? tch.name.charAt(0) : 'T'}
              </div>
              <div>
                <h4 className={`text-lg font-black tracking-tight ${textPrimary}`}>{tch.name}</h4>
                <p className={`text-xs font-semibold text-indigo-500 dark:text-indigo-400 mt-0.5`}>{tch.specialization}</p>
              </div>
            </div>

            <div className={`text-xs font-medium space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80`}>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${textSecondary} mb-1`}>Assigned Batch</span>
                <strong className={`text-sm ${textPrimary}`}>{tch.assigned_batch}</strong>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${textSecondary} mb-1`}>Phone</span>
                  <strong className={textPrimary}>{tch.phone}</strong>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${textSecondary} mb-1`}>Join Date</span>
                  <strong className={textPrimary}>{tch.join_date}</strong>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${textSecondary} mb-1`}>Email Address</span>
                <strong className="text-blue-600 dark:text-blue-400 truncate">{tch.email}</strong>
              </div>
            </div>

            {adminRole !== 'Staff' && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => onViewProfile && onViewProfile(tch)}
                  className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Wallet className="w-4 h-4" /> Profile & Salary
                </button>
                <button
                  onClick={() => {
                    setEditingTeacher(tch);
                    setTeacherForm({ name: tch.name, email: tch.email, phone: tch.phone, specialization: tch.specialization, assigned_batch: tch.assigned_batch, status: tch.status, photo_url: tch.photo_url || '', address: tch.address || '', qualification: tch.qualification || '', subject: tch.subject || '', designation: tch.designation || '', join_date: tch.join_date || '', employment_type: tch.employment_type || 'Full Time', salary_type: tch.salary_type || 'Monthly', monthly_salary: tch.monthly_salary || '', salary_effective_from: tch.salary_effective_from || '', bank_details: tch.bank_details || '', emergency_contact: tch.emergency_contact || '', documents: tch.documents || '' });
                    setIsAddTeacherOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteTeacher(tch.id)}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
