'use client'

import React, { useState } from 'react'
import { X, IndianRupee, FileText, Users, Key, Download, Trash2, UserX, Pencil, Layers, Save, Plus } from 'lucide-react'

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
  handleUpdateStudent: (studentId: string, updates: Record<string, any>) => Promise<boolean>
  allAvailableBatches: any[]
  handleUpdateStudentBatch: (studentId: string, mode: 'change' | 'add' | 'remove', batchId: string) => Promise<boolean>
  categories: any[]
  setCategories: (val: any) => void
}

const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
};

const parseDateToDb = (displayStr: string): string => {
  if (!displayStr) return '';
  const parts = displayStr.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return displayStr;
};

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
  studentCustomSchedules,
  handleUpdateStudent,
  allAvailableBatches,
  handleUpdateStudentBatch,
  categories,
  setCategories
}: StudentErpModalProps) {
  const [erpModalTab, setErpModalTab] = useState<'collect_fee' | 'fee_history' | 'profile' | 'edit_details' | 'manage_batch' | 'password'>('collect_fee')

  // Local editable copy for the "Edit Details" tab.
  const [editForm, setEditForm] = useState<any>({})
  const [dobInput, setDobInput] = useState('')
  const [batchSelect, setBatchSelect] = useState<string>('')

  React.useEffect(() => {
    if (student && isOpen) {
      const studentCustSchedules = (studentCustomSchedules || []).filter(sch => sch.student_id === student.id);
      setEditForm({
        full_name: student.full_name || '',
        parent_phone: student.parent_phone || '',
        parent_alt_phone: student.parent_alt_phone || '',
        parent_email: student.parent_email || '',
        address: student.address || '',
        city: student.city || '',
        state: student.state || '',
        pin_code: student.pin_code || '',
        parent_name: student.parent_name || '',
        parent_relationship: student.parent_relationship || '',
        parent_occupation: student.parent_occupation || '',
        dob: student.dob || '',
        blood_group: student.blood_group || '',
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_relationship: student.emergency_relationship || '',
        emergency_phone: student.emergency_phone || '',
        emergency_alt_phone: student.emergency_alt_phone || '',
        gender: student.gender || 'Boy',
        has_medical_condition: student.has_medical_condition || false,
        medical_condition_details: student.medical_condition_details || '',
        regular_medication: student.regular_medication || '',
        doctor_name: student.doctor_name || '',
        doctor_phone: student.doctor_phone || '',
        hospital_preference: student.hospital_preference || '',
        consent_accepted: student.consent_accepted || false,
        status: student.status || 'active',
        category: student.category || 'Child Activity',
        batch_id: student.batch_id || '',
        classes_total: student.classes_total || 12,
        classes_consumed: student.classes_consumed || 0,
        admission_date: student.admission_date || '',
        validity_end_date: student.validity_end_date || '',
        custom_days: student.custom_days || '',
        custom_schedules: studentCustSchedules
      })
      setDobInput(formatDateToDisplay(student.dob || ''));
      
      const batchObj = allAvailableBatches.find(b => b.id === student.batch_id);
      const defaultAmount = student.total_fee ? String(student.total_fee) : (batchObj ? String(batchObj.fee_amount) : '3500');
      setFeeForm({
        title: `Monthly Activity Fee (August 2026)`,
        amount: defaultAmount,
        discount_type: 'flat',
        discount: '0',
        due_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        payment_method: student.payment_mode || 'UPI / Online',
        receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }
  }, [student?.id, isOpen])

  const additionalBatches: any[] = Array.isArray(student?.additional_batches)
    ? student.additional_batches
    : (() => { try { return JSON.parse(student?.additional_batches || '[]') } catch { return [] } })()

  if (!isOpen || !student) return null

  const inputCls = `w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
  }`

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
            { id: 'edit_details', label: 'Edit Details', icon: Pencil },
            { id: 'manage_batch', label: 'Manage Batch', icon: Layers },
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

            {/* Calculation summary preview card matching Part D requirement */}
            {(() => {
              const amountVal = parseFloat(feeForm.amount) || 0;
              const discVal = parseFloat(feeForm.discount) || 0;
              const netVal = Math.max(0, 
                feeForm.discount_type === 'percentage' 
                  ? amountVal - (amountVal * discVal / 100)
                  : amountVal - discVal
              );
              const isPaid = feeForm.status === 'paid';
              const paidAmount = isPaid ? netVal : 0;
              const pendingAmount = isPaid ? 0 : netVal;

              return (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <span className="block font-bold text-[10px] uppercase text-blue-500 tracking-wider">🧮 Live Calculation Breakdown</span>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <div className="text-[9px] font-bold text-slate-500">TOTAL FEE</div>
                      <div className="text-xs font-black font-mono text-slate-800 dark:text-slate-200">₹{amountVal.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <div className="text-[9px] font-bold text-amber-600">DISCOUNT</div>
                      <div className="text-xs font-black font-mono text-amber-700 dark:text-amber-400">- ₹{discVal.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-500/10">
                      <div className="text-[9px] font-bold text-emerald-600">PAID AMOUNT</div>
                      <div className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400">₹{paidAmount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-500/10">
                      <div className="text-[9px] font-bold text-rose-600">PENDING AMOUNT</div>
                      <div className="text-xs font-black font-mono text-rose-700 dark:text-rose-400">₹{pendingAmount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

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
                            const batchObj = allAvailableBatches.find(b => b.id === student.batch_id);
                            const defaultAmount = student.total_fee ? String(student.total_fee) : (batchObj ? String(batchObj.fee_amount) : '3500');
                            setFeeForm({
                              title: `Monthly Activity Fee (${mName})`,
                              amount: defaultAmount,
                              discount_type: 'flat',
                              discount: '0',
                              due_date: new Date().toISOString().split('T')[0],
                              status: 'paid',
                              payment_method: student.payment_mode || 'UPI / Online',
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
            {/* FEE SUMMARY — Total / Collected / Due (auto: Due = Total - Collected) */}
            {(() => {
              const studentFees = fees.filter((f: any) => f.student_id === student.id || f.students?.admission_id === student.admission_id)
              const collectedFromLedger = studentFees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (parseFloat(f.net_amount ?? f.amount) || 0), 0)
              const collected = collectedFromLedger > 0 ? collectedFromLedger : (parseFloat(student.amount_paid) || 0)
              const totalFee = parseFloat(student.total_fee) || collected || 0
              const due = Math.max(0, totalFee - collected)
              return (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl border bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-center">
                    <div className="text-[9px] font-bold uppercase text-blue-500">Total Fee</div>
                    <div className="text-base font-extrabold font-mono text-blue-700 dark:text-blue-300">₹{totalFee.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-3 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-center">
                    <div className="text-[9px] font-bold uppercase text-emerald-500">Fee Collected</div>
                    <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300">₹{collected.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-3 rounded-2xl border bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-center">
                    <div className="text-[9px] font-bold uppercase text-rose-500">Fee Due</div>
                    <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-300">₹{due.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )
            })()}
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

        {/* TAB: EDIT STUDENT DETAILS */}
        {erpModalTab === 'edit_details' && (() => {
          const isZumbaYogaBatch = (name: string) => {
            const n = (name || '').toLowerCase();
            return n.includes('zumba') || n.includes('yoga') || n.includes('mother');
          };

          const filteredBatches = (allAvailableBatches || []).filter(b => {
            if (b.id === '00000000-0000-0000-0000-000000000000') return false;
            const isZY = isZumbaYogaBatch(b.batch_name || '');
            return editForm.category === 'Zumba & Yoga' ? isZY : !isZY;
          });

          return (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const dbVal = parseDateToDb(dobInput);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(dbVal)) {
                  alert('❌ Error: Please enter Date of Birth in a valid DD/MM/YYYY format.');
                  return;
                }
                const finalForm = {
                  ...editForm,
                  dob: dbVal
                };
                await handleUpdateStudent(student.id, finalForm)
              }}
              className="space-y-4 text-xs"
            >
              <div className={`p-3.5 rounded-2xl text-xs font-semibold border ${tipBannerBg}`}>
                ✏️ Update <strong className="underline">{student.full_name}</strong>'s complete registration profile, program batches, medical profile, emergency contacts or status.
              </div>

              {/* 1. STUDENT REGISTRATION DETAILS */}
              <div>
                <h4 className="font-bold text-pink-600 uppercase tracking-wider text-[10px] border-b pb-1 mb-2">1. Child's Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Student Name</label>
                    <input type="text" required value={editForm.full_name || ''} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Date of Birth (DD/MM/YYYY)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 01/01/2021" 
                      value={dobInput} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setDobInput(val);
                        const dbVal = parseDateToDb(val);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(dbVal)) {
                          setEditForm({ ...editForm, dob: dbVal });
                        } else {
                          setEditForm({ ...editForm, dob: val });
                        }
                      }} 
                      className={inputCls} 
                    />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Gender</label>
                    <div className="flex gap-4 mt-2">
                      {['Boy', 'Girl', 'Other'].map(g => (
                        <label key={g} className="flex items-center gap-1.5 font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                          <input 
                            type="radio" 
                            name="edit_gender" 
                            value={g} 
                            checked={editForm.gender === g || (g === 'Other' && !['Boy', 'Girl'].includes(editForm.gender))} 
                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} 
                            className="w-4 h-4 accent-pink-600" 
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Blood Group</label>
                    <select 
                      value={editForm.blood_group || 'O+'} 
                      onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })} 
                      className={inputCls}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Date of Admission</label>
                    <input 
                      type="date" 
                      required 
                      value={editForm.admission_date || ''} 
                      onChange={(e) => setEditForm({ ...editForm, admission_date: e.target.value })} 
                      className={inputCls} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`font-bold ${textSecondary}`}>Address</label>
                    <input type="text" value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>City</label>
                    <input type="text" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`font-bold ${textSecondary}`}>State</label>
                      <input type="text" value={editForm.state || ''} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={`font-bold ${textSecondary}`}>PIN</label>
                      <input type="text" value={editForm.pin_code || ''} onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PARENT/GUARDIAN DETAILS */}
              <div>
                <h4 className="font-bold text-purple-600 uppercase tracking-wider text-[10px] border-b pb-1 mb-2">2. Parent / Guardian Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Parent / Guardian Name</label>
                    <input type="text" value={editForm.parent_name || ''} onChange={(e) => setEditForm({ ...editForm, parent_name: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Relationship</label>
                    <select 
                      value={editForm.parent_relationship || 'Father'} 
                      onChange={(e) => setEditForm({ ...editForm, parent_relationship: e.target.value })} 
                      className={inputCls}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Phone Number</label>
                    <input type="tel" required value={editForm.parent_phone || ''} onChange={(e) => setEditForm({ ...editForm, parent_phone: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Alternate Phone</label>
                    <input type="tel" value={editForm.parent_alt_phone || ''} onChange={(e) => setEditForm({ ...editForm, parent_alt_phone: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Email</label>
                    <input type="email" value={editForm.parent_email || ''} onChange={(e) => setEditForm({ ...editForm, parent_email: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Occupation</label>
                    <input type="text" value={editForm.parent_occupation || ''} onChange={(e) => setEditForm({ ...editForm, parent_occupation: e.target.value })} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* 3. EMERGENCY CONTACT DETAILS */}
              <div>
                <h4 className="font-bold text-green-700 uppercase tracking-wider text-[10px] border-b pb-1 mb-2">3. Emergency Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Emergency Contact Name</label>
                    <input type="text" value={editForm.emergency_contact_name || ''} onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Relationship</label>
                    <input type="text" value={editForm.emergency_relationship || ''} onChange={(e) => setEditForm({ ...editForm, emergency_relationship: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Emergency Phone</label>
                    <input type="tel" value={editForm.emergency_phone || ''} onChange={(e) => setEditForm({ ...editForm, emergency_phone: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Alternate Phone</label>
                    <input type="tel" value={editForm.emergency_alt_phone || ''} onChange={(e) => setEditForm({ ...editForm, emergency_alt_phone: e.target.value })} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* 4. MEDICAL INFORMATION */}
              <div>
                <h4 className="font-bold text-teal-600 uppercase tracking-wider text-[10px] border-b pb-1 mb-2">4. Medical Profile</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={editForm.has_medical_condition || false} 
                      onChange={(e) => setEditForm({ ...editForm, has_medical_condition: e.target.checked })} 
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span>Has Medical Conditions / Allergies / Health Concerns?</span>
                  </label>
                  
                  {editForm.has_medical_condition && (
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Medical Condition Details</label>
                      <textarea 
                        rows={2}
                        value={editForm.medical_condition_details || ''} 
                        onChange={(e) => setEditForm({ ...editForm, medical_condition_details: e.target.value })} 
                        className={inputCls}
                        placeholder="Please describe allergy details, asthma, history, etc."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Regular Medication (if any)</label>
                      <input type="text" value={editForm.regular_medication || ''} onChange={(e) => setEditForm({ ...editForm, regular_medication: e.target.value })} className={inputCls} placeholder="e.g. Inhaler" />
                    </div>
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Pediatrician / Family Doctor Name</label>
                      <input type="text" value={editForm.doctor_name || ''} onChange={(e) => setEditForm({ ...editForm, doctor_name: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Doctor Contact Phone No.</label>
                      <input type="tel" value={editForm.doctor_phone || ''} onChange={(e) => setEditForm({ ...editForm, doctor_phone: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Preferred Emergency Hospital</label>
                      <input type="text" value={editForm.hospital_preference || ''} onChange={(e) => setEditForm({ ...editForm, hospital_preference: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. PROGRAM, BATCH AND ENROLLMENT CONTROLS */}
              <div>
                <h4 className="font-bold text-orange-600 uppercase tracking-wider text-[10px] border-b pb-1 mb-2">5. Program, Batch & Validity Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Registration Category</label>
                    <select 
                      value={editForm.category || 'Child Activity'} 
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const firstValid = (allAvailableBatches || []).find(b => {
                          if (b.id === '00000000-0000-0000-0000-000000000000') return false;
                          const isZY = isZumbaYogaBatch(b.batch_name || '');
                          return newCat === 'Zumba & Yoga' ? isZY : !isZY;
                        });
                        const schedules = batchSchedules.filter(sch => sch.batch_id === firstValid?.id);
                        const weeklyCount = schedules.length;
                        const totalCls = weeklyCount > 0 ? weeklyCount * 4 : 12;
                        const daysString = Array.from(new Set(schedules.map(sch => sch.day_of_week))).join(', ');
                        setEditForm({
                          ...editForm,
                          category: newCat,
                          batch_id: firstValid?.id || '',
                          classes_total: totalCls,
                          custom_days: daysString || firstValid?.days || ''
                        });
                      }}
                      className={inputCls}
                    >
                      {categories.map((cat: any) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name} {cat.emoji || ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`font-bold ${textSecondary}`}>Select Student Batch</label>
                    <select 
                      value={editForm.batch_id || ''} 
                      onChange={(e) => {
                        const bId = e.target.value;
                        if (bId === '00000000-0000-0000-0000-000000000000') {
                          setEditForm({
                            ...editForm,
                            batch_id: bId,
                            classes_total: 0,
                            custom_days: '',
                            custom_schedules: []
                          });
                          return;
                        }
                        const matchedBatch = allAvailableBatches.find(b => b.id === bId);
                        const schedules = batchSchedules.filter(sch => sch.batch_id === bId);
                        const weeklyCount = schedules.length;
                        const totalCls = weeklyCount > 0 ? weeklyCount * 4 : 12;
                        const daysString = Array.from(new Set(schedules.map(sch => sch.day_of_week))).join(', ');
                        setEditForm({
                          ...editForm,
                          batch_id: bId,
                          classes_total: totalCls,
                          custom_days: daysString || matchedBatch?.days || ''
                        });
                      }}
                      className={inputCls}
                    >
                      {filteredBatches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.batch_name} ({b.batch_time || '10:30 AM'}) — ₹{b.fee_amount || 3500}
                        </option>
                      ))}
                      {editForm.category === 'Child Activity' && (
                        <option value="00000000-0000-0000-0000-000000000000" className="font-bold text-orange-600">
                          ⚙️ Customized Batch (Build Custom Schedule)
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Customized Batch builder rendering */}
                  {editForm.batch_id === '00000000-0000-0000-0000-000000000000' && (
                    <div className="space-y-3 pt-3 border-t border-dashed border-orange-200 col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">Customized Batch Schedule Builder</label>
                      <p className="text-[10px] text-slate-500 font-semibold italic -mt-2">Select classes/times available in Batch Master for each day:</p>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                          const dayClasses = Array.from(
                            new Map(
                              batchSchedules
                                .filter(sch => sch.day_of_week === day)
                                .map(sch => [`${sch.start_time}-${sch.end_time}-${sch.class_name}`, sch])
                            ).values()
                          );

                          if (dayClasses.length === 0) return null;

                          return (
                            <div key={day} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                              <span className="font-bold text-pink-600 block text-xs border-b pb-0.5">{day}</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {dayClasses.map((sch: any) => {
                                  const isChecked = (editForm.custom_schedules || []).some(
                                    (s: any) => s.day_of_week === day && s.start_time === sch.start_time && s.end_time === sch.end_time
                                  );

                                  return (
                                    <label key={`${sch.start_time}-${sch.end_time}`} className="flex items-center gap-2 p-1.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={isChecked}
                                        onChange={(e) => {
                                          let current = [...(editForm.custom_schedules || [])];
                                          if (e.target.checked) {
                                            current.push({
                                              day_of_week: day,
                                              start_time: sch.start_time,
                                              end_time: sch.end_time,
                                              class_name: sch.class_name
                                            });
                                          } else {
                                            current = current.filter(
                                              (s: any) => !(s.day_of_week === day && s.start_time === sch.start_time && s.end_time === sch.end_time)
                                            );
                                          }
                                          const classesCount = current.length * 4;
                                          const daysString = Array.from(new Set(current.map((s: any) => s.day_of_week))).join(', ');
                                          setEditForm({
                                            ...editForm,
                                            custom_schedules: current,
                                            classes_total: classesCount,
                                            custom_days: daysString
                                          });
                                        }}
                                        className="w-4 h-4 accent-pink-600 shrink-0" 
                                      />
                                      <div className="text-[10px]">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{sch.class_name}</span>
                                        <span className="font-mono text-slate-500 ml-1.5">{sch.start_time} - {sch.end_time}</span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={`font-bold ${textSecondary}`}>Total Allowed Monthly Classes</label>
                    <input type="number" value={editForm.classes_total || 12} onChange={(e) => setEditForm({ ...editForm, classes_total: parseInt(e.target.value, 10) })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Consumed Classes</label>
                    <input type="number" value={editForm.classes_consumed !== undefined ? editForm.classes_consumed : 0} onChange={(e) => setEditForm({ ...editForm, classes_consumed: parseInt(e.target.value, 10) || 0 })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Validity End Date</label>
                    <input type="date" value={editForm.validity_end_date || ''} onChange={(e) => setEditForm({ ...editForm, validity_end_date: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Status</label>
                    <select value={editForm.status || 'active'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputCls}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={editForm.consent_accepted || false} 
                        onChange={(e) => setEditForm({ ...editForm, consent_accepted: e.target.checked })} 
                        className="w-4 h-4 accent-orange-600"
                      />
                      <span>Consent Legal Terms Accepted?</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                  Close
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Updated Details
                </button>
              </div>
            </form>
          )
        })()}

        {/* TAB: MANAGE BATCH (change / add / remove batches) */}
        {erpModalTab === 'manage_batch' && (
          <div className="space-y-4 text-xs">
            <div className={`p-3.5 rounded-2xl text-xs font-semibold border ${tipBannerBg}`}>
              🎯 Manage batches for <strong className="underline">{student.full_name}</strong>. Change the primary batch, or add extra batches (e.g. add Chess while keeping Skating). Fee & plan validity update accordingly.
            </div>

            {/* Primary batch */}
            <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
              <h4 className="font-bold text-orange-600 uppercase tracking-wider text-[10px] border-b pb-1">Primary Batch</h4>
              <p className={textPrimary}><strong>{student.batch_name || 'Unassigned'}</strong></p>
            </div>

            {/* Additional active batches */}
            <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
              <h4 className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] border-b pb-1">Additional Active Batches</h4>
              {additionalBatches.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No additional batches. Use "Add Batch" below to enroll in more.</p>
              ) : (
                <div className="space-y-1.5">
                  {additionalBatches.map((ab: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                      <span className={`font-bold ${textPrimary}`}>{ab.batch_name}</span>
                      <button
                        onClick={() => handleUpdateStudentBatch(student.id, 'remove', ab.batch_id)}
                        className="p-1 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition"
                        title="Remove this batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change / Add controls */}
            <div className={`p-4 rounded-2xl border space-y-3 ${bgSubCard}`}>
              <label className={`font-bold ${textSecondary}`}>Select a batch</label>
              <select
                value={batchSelect}
                onChange={(e) => setBatchSelect(e.target.value)}
                className={inputCls}
              >
                <option value="">— Choose a batch —</option>
                {(allAvailableBatches || []).map((b: any) => (
                  <option key={b.id} value={b.id}>{b.batch_name}{b.fee_amount ? ` — ₹${b.fee_amount}` : ''}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={!batchSelect}
                  onClick={async () => { const ok = await handleUpdateStudentBatch(student.id, 'change', batchSelect); if (ok) setBatchSelect('') }}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4" /> Change Primary Batch
                </button>
                <button
                  type="button"
                  disabled={!batchSelect}
                  onClick={async () => { const ok = await handleUpdateStudentBatch(student.id, 'add', batchSelect); if (ok) setBatchSelect('') }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add as Extra Batch
                </button>
              </div>
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
