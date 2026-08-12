import React from 'react';
import { Receipt } from 'lucide-react';

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

export default function StudentsTab({
  bgCard, textPrimary, textSecondary, isLight, tipBannerBg, tableHeaderBg,
  badgeClass, badgePassword, filteredStudents, batches,
  setSelectedERPStudent, setErpModalTab, setFeeForm, loadAllAdminData
}: StudentsTabProps) {
  return (
    <div className={`${bgCard} rounded-2xl overflow-hidden`}>
      <div className={`p-4 border-b flex items-center justify-between text-xs font-semibold ${tipBannerBg}`}>
        <div className="flex items-center gap-3">
          <span>💡 Click &quot;Open ERP&quot; button to open fee management, payment ledger, password reset, or student profile.</span>
        </div>
        <span className="font-mono text-blue-600 font-bold shrink-0">{filteredStudents.length} Active Students</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`${tableHeaderBg} border-b font-bold uppercase tracking-wider`}>
              <th className="py-4 px-6 w-32">Admission ID</th>
              <th className="py-4 px-6 min-w-[180px]">Student Name</th>
              <th className="py-4 px-6 w-44">Assigned Batch</th>
              <th className="py-4 px-6 w-36">Assigned Password</th>
              <th className="py-4 px-6 min-w-[160px]">Parent / Guardian</th>
              <th className="py-4 px-6 w-36">Contact Phone</th>
              <th className="py-4 px-6 text-right w-36">ERP Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
            {filteredStudents.map((st) => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
