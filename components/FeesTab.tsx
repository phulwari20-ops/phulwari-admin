import React from 'react';
import { CreditCard, IndianRupee, ChevronRight, MessageSquare } from 'lucide-react';

interface FeesTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  badgeStatus: string;
  filteredStudents: any[];
  fees: any[];
  feeSelectedMonth: string;
  setFeeSelectedMonth: (m: string) => void;
  feeStatusFilter: 'All' | 'PAID' | 'PENDING';
  setFeeStatusFilter: (f: 'All' | 'PAID' | 'PENDING') => void;
  setIsClassFeeModalOpen: (v: boolean) => void;
  setSelectedERPStudent: (st: any) => void;
  setErpModalTab: (tab: any) => void;
  handleSendWhatsAppFeeReminder: (name: string, id: string, phone: string, month: string, amount: number, due: string) => void;
}

export default function FeesTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight, badgeStatus,
  filteredStudents, fees, feeSelectedMonth, setFeeSelectedMonth,
  feeStatusFilter, setFeeStatusFilter, setIsClassFeeModalOpen,
  setSelectedERPStudent, setErpModalTab, handleSendWhatsAppFeeReminder
}: FeesTabProps) {
  return (
    <div className="space-y-6">
      <div className={`${bgCard} rounded-2xl p-6 space-y-5`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <CreditCard className="w-5 h-5 text-blue-500" /> Class &amp; Monthly Fee Management Dashboard
            </h3>
            <p className={`text-xs ${textSecondary}`}>Track pending dues, collected fees, discounts, and fee status for all students by month.</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsClassFeeModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer whitespace-nowrap"
            >
              <IndianRupee className="w-4 h-4" />
              <span>View &amp; Edit All Class Fees</span>
            </button>
            <select
              value={feeSelectedMonth}
              onChange={(e) => setFeeSelectedMonth(e.target.value)}
              className={`text-xs px-3.5 py-2 rounded-xl border outline-none font-bold shrink-0 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            >
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
            <div className="flex items-center space-x-1 border rounded-xl p-1 bg-slate-100 dark:bg-slate-950 shrink-0">
              {(['All', 'PAID', 'PENDING'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFeeStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    feeStatusFilter === st ? 'bg-blue-600 text-white shadow-sm' : `${textSecondary} hover:text-blue-500`
                  }`}
                >{st}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-3 pt-2">
          {filteredStudents.map((st) => {
            const studentFee = fees.find((f: any) =>
              (f.student_id === st.id || f.students?.admission_id === st.admission_id) &&
              (f.month === feeSelectedMonth || f.title?.includes(feeSelectedMonth))
            );
            const isPaid = studentFee?.status === 'paid';
            if (feeStatusFilter === 'PAID' && !isPaid) return null;
            if (feeStatusFilter === 'PENDING' && isPaid) return null;
            return (
              <div
                key={st.id}
                onClick={() => { setSelectedERPStudent(st); setErpModalTab('fee_history'); }}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${bgSubCard} hover:border-blue-500/50`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-extrabold uppercase border whitespace-nowrap w-24 text-center ${
                    isPaid ? badgeStatus : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    {isPaid ? `PAID ₹${studentFee?.net_amount || 3000}` : 'PENDING'}
                  </span>
                  <div>
                    <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                      {st.full_name}
                      <span className="text-[11px] font-mono text-blue-500 font-bold">{st.admission_id}</span>
                    </h4>
                    <p className={`text-xs ${textSecondary}`}>Batch: {st.batch_name || 'Mother & Toddler Program'} | Parent: {st.parent_name}</p>
                  </div>
                </div>
                <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-3 text-xs border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto sm:flex-1 sm:justify-end">
                  <div className="flex flex-wrap items-center justify-end gap-3 w-full 2xl:w-auto">
                    <span className={textSecondary}>Month: <strong>{feeSelectedMonth}</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsAppFeeReminder(st.full_name, st.admission_id, st.parent_phone, feeSelectedMonth, studentFee?.net_amount || 3500, '2026-08-15');
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-300 dark:border-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Notice
                      </button>
                      <a
                        href={`tel:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-300 dark:border-blue-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      >📞 Call</a>
                      <a
                        href={`sms:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(`Dear Parents,\nThis is a gentle reminder that a fee of Rs. ${studentFee?.net_amount || 3500} is pending for ${st.full_name}. Please clear the dues as soon as possible.\n\nRegards,\nLPA`)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-300 dark:border-indigo-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      >✉️ SMS</a>
                    </div>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center justify-end gap-1 whitespace-nowrap 2xl:ml-2">
                    View Ledger &amp; Receipt <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
