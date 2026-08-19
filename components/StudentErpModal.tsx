'use client'

import React, { useState } from 'react'
import { X, IndianRupee, FileText, Users, Key, Download, Trash2, UserX } from 'lucide-react'

interface StudentErpModalProps {
  isOpen: boolean
  onClose: () => void
  student: any
  adminRole: string
  isLight: boolean
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  badgeStatus: string
  badgePassword: string
  tipBannerBg: string
  fees: any[]
  handlePrintRegistrationForm: (st: any) => void
  handleDeactivateStudent: (id: string) => Promise<void>
  handleDeleteStudent: (id: string) => Promise<void>
  handleFeeSubmit: (e: React.FormEvent) => void
  handleERPPasswordSubmit: (e: React.FormEvent) => void
  feeForm: any
  setFeeForm: (val: any) => void
  erpPassword: string
  setErpPassword: (val: string) => void
  erpPasswordMsg: string
  batchSchedules: any[]
  studentCustomSchedules: any[]
}

export default function StudentErpModal({
  isOpen,
  onClose,
  student,
  adminRole,
  isLight,
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  badgeStatus,
  badgePassword,
  tipBannerBg,
  fees,
  handlePrintRegistrationForm,
  handleDeactivateStudent,
  handleDeleteStudent,
  handleFeeSubmit,
  handleERPPasswordSubmit,
  feeForm,
  setFeeForm,
  erpPassword,
  setErpPassword,
  erpPasswordMsg,
  batchSchedules,
  studentCustomSchedules
}: StudentErpModalProps) {
  const [erpModalTab, setErpModalTab] = useState<'collect_fee' | 'fee_history' | 'profile' | 'password'>('collect_fee')

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto relative`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>{student.full_name}</h3>
              <p className="text-xs text-blue-500 font-mono font-bold">
                Admission ID: {student.admission_id} | Class: {student.class_name || 'Nursery'}-{student.section_name || 'A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Print Reg PDF button */}
            <button
              onClick={() => handlePrintRegistrationForm(student)}
              className="px-3 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
              title="Print Registration Form"
            >
              <span>📥 Print Reg Form</span>
            </button>

            {/* Deactivate Student button */}
            {student.status !== 'deactivated' && (
              <button
                onClick={() => handleDeactivateStudent(student.id)}
                className="px-3 py-1.5 bg-amber-600/10 text-amber-500 border border-amber-500/20 hover:bg-amber-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                title="Deactivate Student"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Deactivate Student</span>
              </button>
            )}

            {/* Delete Student button */}
            {adminRole === 'Admin' && (
              <button
                onClick={() => handleDeleteStudent(student.id)}
                className="px-3 py-1.5 bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                title="Delete Student Record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Student</span>
              </button>
            )}

            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'collect_fee', label: 'Submit Fee & Discount', icon: IndianRupee },
            { id: 'fee_history', label: 'Monthly Fee Ledger', icon: FileText },
            { id: 'profile', label: 'Student Profile', icon: Users },
            { id: 'password', label: 'Reset Password', icon: Key },
          ].map(tab => {
            const Icon = tab.icon
            const active = erpModalTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setErpModalTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  active ? 'bg-blue-600 text-white shadow-md' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB: SUBMIT FEE WITH DISCOUNT SYSTEM */}
        {erpModalTab === 'collect_fee' && (
          <form onSubmit={handleFeeSubmit} className="space-y-4 text-xs">
            <div className={`p-3.5 rounded-2xl text-xs font-semibold border ${tipBannerBg}`}>
              💸 Submit new fee payment or apply a discount for <strong className="underline">{student.full_name}</strong>.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`font-bold ${textSecondary}`}>Fee Title</label>
                <input
                  type="text"
                  required
                  value={feeForm.title}
                  onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Due Date</label>
                <input
                  type="date"
                  required
                  value={feeForm.due_date}
                  onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className={`font-bold ${textSecondary}`}>Total Fee Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  style={{ cursor: 'text' }}
                  className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-amber-500">Discount Type</label>
                <select
                  value={feeForm.discount_type || 'flat'}
                  onChange={(e) => setFeeForm({ ...feeForm, discount_type: e.target.value as 'flat' | 'percentage' })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/80 border-amber-800 text-amber-300'
                  }`}
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-amber-500">Discount Value</label>
                <input
                  type="number"
                  value={feeForm.discount}
                  onChange={(e) => setFeeForm({ ...feeForm, discount: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                    isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/80 border-amber-800 text-amber-300'
                  }`}
                  placeholder={feeForm.discount_type === 'percentage' ? "e.g. 10" : "e.g. 500"}
                />
              </div>

              <div>
                <label className="font-bold text-emerald-500">Net Amount (₹)</label>
                <div className={`w-full flex items-center border rounded-xl px-3 py-2 font-mono font-extrabold text-sm ${
                  isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                }`}>
                  ₹{Math.max(0, 
                    feeForm.discount_type === 'percentage' 
                      ? (parseFloat(feeForm.amount) || 0) - ((parseFloat(feeForm.amount) || 0) * (parseFloat(feeForm.discount) || 0) / 100)
                      : (parseFloat(feeForm.amount) || 0) - (parseFloat(feeForm.discount) || 0)
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`font-bold ${textSecondary}`}>Fee Status</label>
                <select
                  value={feeForm.status}
                  onChange={(e) => setFeeForm({ ...feeForm, status: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                >
                  <option value="paid">PAID</option>
                  <option value="pending">PENDING</option>
                </select>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Payment Mode</label>
                <select
                  value={feeForm.payment_method}
                  onChange={(e) => setFeeForm({ ...feeForm, payment_method: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                >
                  <option value="UPI / Online">UPI / Online</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="NetBanking">NetBanking</option>
                </select>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Receipt No.</label>
                <input
                  type="text"
                  value={feeForm.receipt_no}
                  onChange={(e) => setFeeForm({ ...feeForm, receipt_no: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                Close
              </button>
              <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 cursor-pointer">
                Mark Paid & Download Receipt
              </button>
            </div>
          </form>
        )}

        {/* TAB: MULTI-MONTH FEE HISTORY LEDGER */}
        {erpModalTab === 'fee_history' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h4 className={`font-bold ${textPrimary}`}>Complete Monthly Fee Payment Ledger</h4>
              <span className="text-blue-500 font-mono font-bold">2026 Academic Session</span>
            </div>

            <div className="space-y-3">
              {['April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026'].map((mName) => {
                const matchFee = fees.find(f => (f.student_id === student.id || f.students?.admission_id === student.admission_id) && (f.title?.includes(mName) || f.month === mName))
                const isMonthPaid = matchFee?.status === 'paid'

                return (
                  <div key={mName} className={`p-4 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className={`font-bold ${textPrimary}`}>{mName} Monthly Activity Fee</h5>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                          isMonthPaid ? badgeStatus : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          {isMonthPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </div>
                      <p className={`text-[11px] ${textSecondary}`}>
                        {isMonthPaid ? `Paid Amount: ₹${matchFee?.net_amount || 3000} (Discount: ₹${matchFee?.discount || 500}) | Receipt: ${matchFee?.receipt_no || 'REC-2026-0891'}` : 'Fee Amount: ₹3,500'}
                      </p>
                    </div>

                    <div>
                      {isMonthPaid ? (
                        <button
                          onClick={() => {
                            const feeData = matchFee || {
                              title: `Monthly Activity Fee (${mName})`,
                              amount: 3500,
                              discount: 500,
                              net_amount: 3000,
                              due_date: '2026-08-10',
                              status: 'paid',
                              payment_method: 'UPI / Online',
                              receipt_no: 'REC-2026-0891',
                              paid_date: new Date().toISOString().split('T')[0],
                              students: { full_name: student.full_name, admission_id: student.admission_id, class_name: student.class_name, section_name: student.section_name }
                            };
                            const pdfWin = window.open('', '_blank', 'width=850,height=1100');
                            if (pdfWin) {
                              pdfWin.document.write(`<!DOCTYPE html><html><head><title>Fee Receipt - ${feeData.receipt_no}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1e293b;padding:32px;}.header{border-bottom:3px solid #1e40af;padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;}.org{font-size:18px;font-weight:900;color:#1e40af;}.receipt-no{font-size:12px;font-weight:700;color:#64748b;background:#f1f5f9;padding:6px 12px;border-radius:8px;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;}.info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;}.info-label{font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;}.info-value{font-size:13px;font-weight:700;color:#1e293b;}table{width:100%;border-collapse:collapse;margin:16px 0;}thead tr{background:#1e40af;color:#fff;}th{padding:10px 14px;font-size:11px;font-weight:700;text-align:left;}td{padding:10px 14px;font-size:12px;border-bottom:1px solid #e2e8f0;}.amount{text-align:right;font-weight:700;font-family:monospace;}.total-row{background:#f0fdf4;font-weight:900;color:#16a34a;}.footer{margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#64748b;}.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-20deg);font-size:90px;font-weight:900;color:rgba(0,0,0,0.04);pointer-events:none;white-space:nowrap;}@media print{@page{size:A4;margin:15mm;}}</style></head><body><div class="watermark">PHULWARI PAID</div><div class="header"><div><div class="org">🌸 Phulwari Mother & Child Activity Centre</div><div style="font-size:11px;color:#64748b;margin-top:4px;">M/32, Road No. 25, Sri Krishna Nagar, Patna — 800001</div></div><div class="receipt-no">Receipt: ${feeData.receipt_no}</div></div><div class="info-grid"><div class="info-box"><div class="info-label">Student Name</div><div class="info-value">${feeData.students?.full_name || student.full_name}</div></div><div class="info-box"><div class="info-label">Admission ID</div><div class="info-value">${feeData.students?.admission_id || student.admission_id}</div></div><div class="info-box"><div class="info-label">Fee Title</div><div class="info-value">${feeData.title}</div></div><div class="info-box"><div class="info-label">Payment Method</div><div class="info-value">${feeData.payment_method || 'UPI / Online'}</div></div><div class="info-box"><div class="info-label">Date Paid</div><div class="info-value">${feeData.paid_date || new Date().toLocaleDateString()}</div></div><div class="info-box"><div class="info-label">Status</div><div class="info-value" style="color:#16a34a;">✓ PAID</div></div></div><table><thead><tr><th>Description</th><th style="text-align:right;">Original Fee</th><th style="text-align:right;">Discount</th><th style="text-align:right;">Net Paid</th></tr></thead><tbody><tr><td>${feeData.title}</td><td class="amount">₹${feeData.amount || 3500}</td><td class="amount" style="color:#d97706;">- ₹${feeData.discount || 0}</td><td class="amount total-row">₹${feeData.net_amount || feeData.amount}</td></tr></tbody></table><div class="footer"><div><div style="font-weight:700;color:#1e293b;">Verified & Generated via Phulwari ERP</div><div>Computer generated receipt. No signature required.</div></div><div style="text-align:right;border-top:1px solid #94a3b8;padding-top:8px;width:160px;"><div style="font-weight:700;color:#1e40af;">Authorized Signatory</div><div>Phulwari Management</div></div></div><script>window.onload=function(){window.print();setTimeout(()=>window.close(),2000);}<\/script></body></html>`);
                              pdfWin.document.close();
                            }
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Receipt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setFeeForm({
                              title: `Monthly Activity Fee (${mName})`,
                              amount: '3500',
                              discount_type: 'amount',
                              discount: '500',
                              due_date: '2026-08-10',
                              status: 'paid',
                              payment_method: 'UPI / Online',
                              receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
                            })
                            setErpModalTab('collect_fee')
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Mark Paid & Collect</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {erpModalTab === 'profile' && (
          <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Child Details */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <h4 className="font-bold text-pink-600 uppercase tracking-wider text-[10px] border-b pb-1">Child Details</h4>
                <p><strong className={textSecondary}>Full Name:</strong> {student.full_name}</p>
                <p><strong className={textSecondary}>Admission ID:</strong> {student.admission_id}</p>
                <p><strong className={textSecondary}>Date of Birth:</strong> {student.dob || 'N/A'}</p>
                <p><strong className={textSecondary}>Gender:</strong> {student.gender || 'N/A'}</p>
                <p><strong className={textSecondary}>Blood Group:</strong> {student.blood_group || 'N/A'}</p>
                <p><strong className={textSecondary}>City/State/PIN:</strong> {student.city || 'Patna'}, {student.state || 'Bihar'} {student.pin_code && `(${student.pin_code})`}</p>
                <p><strong className={textSecondary}>Address:</strong> {student.address || 'N/A'}</p>
                <p><strong className={textSecondary}>Assigned Password:</strong> <span className={`font-mono font-bold border px-2 py-0.5 rounded ${badgePassword}`}>{student.password}</span></p>
              </div>

              {/* Parent Details */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <h4 className="font-bold text-purple-600 uppercase tracking-wider text-[10px] border-b pb-1">Parent Details</h4>
                <p><strong className={textSecondary}>Parent Name:</strong> {student.parent_name}</p>
                <p><strong className={textSecondary}>Relationship:</strong> {student.parent_relationship || 'Father'}</p>
                <p><strong className={textSecondary}>Occupation:</strong> {student.parent_occupation || 'N/A'}</p>
                <p><strong className={textSecondary}>Contact Phone:</strong> {student.parent_phone}</p>
                <p><strong className={textSecondary}>Alternate Phone:</strong> {student.parent_alt_phone || 'N/A'}</p>
                <p><strong className={textSecondary}>Email:</strong> {student.parent_email || 'N/A'}</p>
              </div>

              {/* Emergency Details */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <h4 className="font-bold text-green-600 uppercase tracking-wider text-[10px] border-b pb-1">Emergency Details</h4>
                <p><strong className={textSecondary}>Contact Person:</strong> {student.emergency_contact_name || 'N/A'}</p>
                <p><strong className={textSecondary}>Relationship:</strong> {student.emergency_relationship || 'N/A'}</p>
                <p><strong className={textSecondary}>Primary Phone:</strong> {student.emergency_phone || 'N/A'}</p>
                <p><strong className={textSecondary}>Alternate Phone:</strong> {student.emergency_alt_phone || 'N/A'}</p>
              </div>

              {/* Program & Medical Details */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <h4 className="font-bold text-orange-600 uppercase tracking-wider text-[10px] border-b pb-1">Program & Batch</h4>
                <p><strong className={textSecondary}>Programs Active:</strong> {student.program_interested || 'General Activity'}</p>
                <p><strong className={textSecondary}>Preferred Time Slot:</strong> {student.preferred_time_slot || 'Morning'}</p>
                <p><strong className={textSecondary}>Joined On:</strong> {student.created_at ? new Date(student.created_at).toLocaleDateString('en-GB') : 'N/A'}</p>
                
                {/* Active class timings schedule */}
                <h4 className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] border-b pb-1 pt-1">Active Timings (Schedule)</h4>
                {(() => {
                  let schedules: any[] = [];
                  if (student.batch_id === '00000000-0000-0000-0000-000000000000') {
                    schedules = studentCustomSchedules.filter(sch => sch.student_id === student.id);
                  } else {
                    schedules = batchSchedules.filter(sch => sch.batch_id === student.batch_id);
                  }
                  
                  if (schedules.length === 0) {
                    return <p className="text-[10px] text-slate-400 italic">No scheduled classes configured.</p>;
                  }
                  
                  return (
                    <div className="space-y-1 mt-1 max-h-32 overflow-y-auto custom-scrollbar pr-0.5">
                      {schedules.map((sch, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] p-1 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 rounded">
                          <span className="font-bold text-slate-700 dark:text-slate-300">📅 {sch.day_of_week}</span>
                          <span className="font-mono text-blue-500 font-semibold">{sch.start_time} - {sch.end_time}</span>
                          <span className="font-bold text-pink-600">{sch.class_name}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <h4 className="font-bold text-blue-600 uppercase tracking-wider text-[10px] border-b pb-1 pt-2">Medical Information</h4>
                <p><strong className={textSecondary}>Condition:</strong> {student.has_medical_condition ? (student.medical_condition_details || 'Yes') : 'None'}</p>
                <p><strong className={textSecondary}>Medication:</strong> {student.regular_medication || 'None'}</p>
                <p><strong className={textSecondary}>Doctor:</strong> {student.doctor_name || 'N/A'} {student.doctor_phone && `(${student.doctor_phone})`}</p>
                <p><strong className={textSecondary}>Hospital:</strong> {student.hospital_preference || 'N/A'}</p>
              </div>
            </div>

            {/* Consent & Deletion */}
            <div className={`p-4 rounded-2xl border ${bgSubCard} flex items-center justify-between`}>
              <p><strong className={textSecondary}>Consent Terms Status:</strong> {student.consent_accepted ? '✓ YES, Agreed to legal terms' : 'Pending Verification'}</p>
              <p><strong className={textSecondary}>Status:</strong> <span className={`font-bold ${student.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>{student.status?.toUpperCase() || 'ACTIVE'}</span></p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDeleteStudent(student.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Student Record</span>
              </button>
            </div>
          </div>
        )}

        {erpModalTab === 'password' && (
          <form onSubmit={handleERPPasswordSubmit} className="space-y-4 text-xs">
            {erpPasswordMsg && (
              <div className={`p-3 rounded-xl font-bold border ${badgeStatus}`}>
                {erpPasswordMsg}
              </div>
            )}

            <div className={`p-4 rounded-2xl border space-y-1.5 ${bgSubCard}`}>
              <span className={`text-[10px] font-bold uppercase ${textSecondary}`}>Current Assigned Password</span>
              <div className="flex items-center justify-between">
                <span className={`text-base font-mono font-extrabold px-3 py-1 rounded-xl border ${badgePassword}`}>
                  {student.password || 'parent123'}
                </span>
                <span className="text-slate-400 text-[11px]">Active Parent Credentials</span>
              </div>
            </div>

            <div>
              <label className={`font-bold ${textSecondary}`}>Enter New Password for Student</label>
              <input
                type="text"
                required
                placeholder="e.g. newpassword123"
                value={erpPassword}
                onChange={(e) => setErpPassword(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                  isLight ? 'bg-slate-100 border-slate-300 text-amber-700' : 'bg-slate-950 border-slate-800 text-amber-400'
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 cursor-pointer">
                Update & Save New Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
