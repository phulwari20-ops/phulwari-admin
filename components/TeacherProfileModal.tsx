'use client'

import React, { useState } from 'react'
import { X, User, CalendarCheck, Wallet, HandCoins, Receipt, FileDown, Trash2, Check } from 'lucide-react'

interface TeacherProfileModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: any
  isLight: boolean
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  teacherPayments: any[]
  teacherAttendance: any[]
  onAddPayment: (payment: any) => void
  onDeletePayment: (id: string) => void
  onMarkAttendance: (teacherId: string, date: string, status: string) => void
}

const ATT_STATES = ['Present', 'Absent', 'Half Day', 'Paid Leave', 'Unpaid Leave', 'Late', 'Holiday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function TeacherProfileModal({
  isOpen, onClose, teacher, isLight, bgCard, bgSubCard, textPrimary, textSecondary,
  teacherPayments, teacherAttendance, onAddPayment, onDeletePayment, onMarkAttendance
}: TeacherProfileModalProps) {
  const now = new Date()
  const [tab, setTab] = useState<'profile' | 'attendance' | 'salary' | 'advances' | 'payments'>('profile')
  const [summaryMonth, setSummaryMonth] = useState(`${MONTHS[now.getMonth()]} ${now.getFullYear()}`)
  const [attDate, setAttDate] = useState(now.toISOString().split('T')[0])
  const [payForm, setPayForm] = useState<any>({
    salary_month: `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    salary_amount: '',
    advance_taken: '',
    advance_adjusted: '',
    deduction: '',
    bonus: '',
    payment_mode: 'Cash',
    payment_type: 'Salary',
    remarks: '',
    reference_no: '',
  })

  if (!isOpen || !teacher) return null

  const inputCls = `w-full border rounded-xl px-3 py-2 font-semibold outline-none ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`
  const num = (v: any) => Number(v) || 0
  const inr = (v: any) => `₹${num(v).toLocaleString('en-IN')}`

  const myPayments = teacherPayments.filter(p => p.teacher_id === teacher.id)
  const myAttendance = teacherAttendance.filter(a => a.teacher_id === teacher.id)

  // Advance ledger
  const advanceTaken = myPayments.reduce((s, p) => s + num(p.advance_taken), 0)
  const advanceAdjusted = myPayments.reduce((s, p) => s + num(p.advance_adjusted), 0)
  const advanceBalance = advanceTaken - advanceAdjusted

  const netPayable = num(payForm.salary_amount) + num(payForm.bonus) - num(payForm.deduction) - num(payForm.advance_adjusted) + num(payForm.advance_taken)

  // Monthly attendance summary for the chosen month
  const monthAtt = myAttendance.filter(a => {
    const d = new Date(a.date)
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}` === summaryMonth
  })
  const countBy = (status: string) => monthAtt.filter(a => a.status === status).length
  const summary = {
    present: countBy('Present'),
    absent: countBy('Absent'),
    halfDay: countBy('Half Day'),
    paidLeave: countBy('Paid Leave'),
    unpaidLeave: countBy('Unpaid Leave'),
    late: countBy('Late'),
    holiday: countBy('Holiday'),
    working: monthAtt.filter(a => a.status !== 'Holiday').length,
  }

  const attToday = myAttendance.find(a => a.date === attDate)?.status || ''

  const generateSalarySlip = (p: any) => {
    const win = window.open('', '_blank', 'width=850,height=1100')
    if (!win) return
    const gross = num(p.salary_amount) + num(p.bonus)
    win.document.write(`<!DOCTYPE html><html><head><title>Salary Slip - ${teacher.name} - ${p.salary_month}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',sans-serif;color:#1e293b;padding:32px;}.hd{border-bottom:3px solid #4338ca;padding-bottom:14px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;}.org{font-size:18px;font-weight:900;color:#4338ca;}.tag{background:#eef2ff;color:#4338ca;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:800;}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0;}.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;}.lbl{font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;}.val{font-size:13px;font-weight:700;}table{width:100%;border-collapse:collapse;margin:14px 0;}th{background:#4338ca;color:#fff;padding:9px 12px;font-size:11px;text-align:left;}td{padding:9px 12px;font-size:12px;border-bottom:1px solid #e2e8f0;}.amt{text-align:right;font-family:monospace;font-weight:700;}.net{background:#f0fdf4;color:#16a34a;font-weight:900;}@media print{@page{size:A4;margin:15mm;}}</style></head><body>
      <div class="hd"><div><div class="org">🌸 Phulwari Mother & Child Activity Centre</div><div style="font-size:11px;color:#64748b;margin-top:4px;">M/32, Road No. 25, Sri Krishna Nagar, Patna — 800001</div></div><div class="tag">SALARY SLIP</div></div>
      <div class="grid">
        <div class="box"><div class="lbl">Teacher</div><div class="val">${teacher.name}</div></div>
        <div class="box"><div class="lbl">Teacher ID</div><div class="val">${teacher.id}</div></div>
        <div class="box"><div class="lbl">Salary Month</div><div class="val">${p.salary_month || '—'}</div></div>
        <div class="box"><div class="lbl">Designation</div><div class="val">${teacher.designation || teacher.specialization || '—'}</div></div>
        <div class="box"><div class="lbl">Payment Date</div><div class="val">${p.date ? new Date(p.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</div></div>
        <div class="box"><div class="lbl">Payment Mode</div><div class="val">${p.payment_mode || '—'}</div></div>
      </div>
      <table>
        <thead><tr><th>Description</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>
          <tr><td>Basic / Monthly Salary</td><td class="amt">${inr(p.salary_amount)}</td></tr>
          <tr><td>Bonus / Incentive</td><td class="amt">+ ${inr(p.bonus)}</td></tr>
          <tr><td>Gross</td><td class="amt">${inr(gross)}</td></tr>
          <tr><td>Deductions</td><td class="amt" style="color:#dc2626;">- ${inr(p.deduction)}</td></tr>
          <tr><td>Advance Adjusted</td><td class="amt" style="color:#dc2626;">- ${inr(p.advance_adjusted)}</td></tr>
          <tr><td>Advance Paid (separate)</td><td class="amt">${inr(p.advance_taken)}</td></tr>
          <tr class="net"><td>Net Paid</td><td class="amt net">${inr(p.net_paid)}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:20px;font-size:11px;color:#64748b;">Reference: ${p.reference_no || '—'} · Remarks: ${p.remarks || '—'}</div>
      <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
        <div>Computer generated payslip. No signature required.</div>
        <div style="text-align:center;border-top:1px solid #94a3b8;padding-top:6px;width:160px;"><b style="color:#4338ca;">Authorised Signatory</b><br/>Phulwari Management</div>
      </div>
      <script>window.onload=function(){window.print();setTimeout(()=>window.close(),1500);}<\/script></body></html>`)
    win.document.close()
  }

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault()
    onAddPayment({
      teacher_id: teacher.id,
      date: new Date().toISOString().split('T')[0],
      salary_month: payForm.salary_month,
      salary_amount: num(payForm.salary_amount),
      advance_taken: num(payForm.advance_taken),
      advance_adjusted: num(payForm.advance_adjusted),
      deduction: num(payForm.deduction),
      bonus: num(payForm.bonus),
      net_paid: netPayable,
      payment_mode: payForm.payment_mode,
      payment_type: payForm.payment_type,
      remarks: payForm.remarks,
      reference_no: payForm.reference_no,
    })
    setPayForm({ ...payForm, salary_amount: '', advance_taken: '', advance_adjusted: '', deduction: '', bonus: '', remarks: '', reference_no: '' })
    setTab('payments')
  }

  const Row = ({ label, value }: { label: string; value: any }) => (
    <p><strong className={textSecondary}>{label}:</strong> {value || 'N/A'}</p>
  )

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className={`${bgCard} rounded-3xl p-6 max-w-3xl w-full space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto relative`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {teacher.photo_url ? (
              <img src={teacher.photo_url} alt={teacher.name} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-xl shadow-md">{teacher.name?.charAt(0) || 'T'}</div>
            )}
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>{teacher.name}</h3>
              <p className="text-xs text-indigo-500 font-mono font-bold">ID: {teacher.id} · {teacher.designation || teacher.specialization}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-6 h-6" /></button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
            { id: 'salary', label: 'Salary', icon: Wallet },
            { id: 'advances', label: 'Advances', icon: HandCoins },
            { id: 'payments', label: 'Payments', icon: Receipt },
          ].map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${active ? 'bg-indigo-600 text-white shadow-md' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
              <h4 className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] border-b pb-1">Personal</h4>
              <Row label="Full Name" value={teacher.name} />
              <Row label="Phone" value={teacher.phone} />
              <Row label="Email" value={teacher.email} />
              <Row label="Address" value={teacher.address} />
              <Row label="Emergency Contact" value={teacher.emergency_contact} />
              <Row label="Documents" value={teacher.documents} />
            </div>
            <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
              <h4 className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] border-b pb-1">Employment</h4>
              <Row label="Qualification" value={teacher.qualification} />
              <Row label="Subject" value={teacher.subject} />
              <Row label="Designation" value={teacher.designation} />
              <Row label="Assigned Batch" value={teacher.assigned_batch} />
              <Row label="Joining Date" value={teacher.join_date} />
              <Row label="Employment Type" value={teacher.employment_type} />
              <Row label="Status" value={teacher.status} />
            </div>
            <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard} md:col-span-2`}>
              <h4 className="font-bold text-amber-600 uppercase tracking-wider text-[10px] border-b pb-1">Salary & Bank</h4>
              <div className="grid grid-cols-2 gap-2">
                <Row label="Salary Type" value={teacher.salary_type} />
                <Row label="Monthly Salary" value={teacher.monthly_salary ? inr(teacher.monthly_salary) : 'N/A'} />
                <Row label="Effective From" value={teacher.salary_effective_from} />
                <Row label="Bank Details" value={teacher.bank_details} />
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE */}
        {tab === 'attendance' && (
          <div className="space-y-4 text-xs">
            <div className={`p-4 rounded-2xl border space-y-3 ${bgSubCard}`}>
              <h4 className="font-bold text-indigo-600 uppercase tracking-wider text-[10px]">Mark Attendance</h4>
              <div className="flex items-center gap-3 flex-wrap">
                <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} className={`${inputCls} w-auto`} />
                {attToday && <span className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold">Current: {attToday}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {ATT_STATES.map(s => (
                  <button key={s} onClick={() => onMarkAttendance(teacher.id, attDate, attToday === s ? 'unmarked' : s)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${attToday === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${bgSubCard}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-600 uppercase tracking-wider text-[10px]">Monthly Summary</h4>
                <select value={summaryMonth} onChange={(e) => setSummaryMonth(e.target.value)} className={`${inputCls} w-auto text-[11px]`}>
                  {[0, 1, 2].map(off => {
                    const d = new Date(now.getFullYear(), now.getMonth() - off, 1)
                    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
                    return <option key={label} value={label}>{label}</option>
                  })}
                </select>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  ['Working Days', summary.working, 'text-slate-600'],
                  ['Present', summary.present, 'text-emerald-600'],
                  ['Absent', summary.absent, 'text-rose-600'],
                  ['Half Day', summary.halfDay, 'text-amber-600'],
                  ['Paid Leave', summary.paidLeave, 'text-blue-600'],
                  ['Unpaid Leave', summary.unpaidLeave, 'text-rose-500'],
                  ['Late', summary.late, 'text-orange-600'],
                  ['Holiday', summary.holiday, 'text-purple-600'],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="p-2 rounded-xl border bg-white dark:bg-slate-900 text-center">
                    <div className="text-[9px] font-bold uppercase text-slate-400">{label}</div>
                    <div className={`text-lg font-extrabold ${color}`}>{val as number}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SALARY — record payment */}
        {tab === 'salary' && (
          <form onSubmit={submitPayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-2xl border bg-indigo-50 dark:bg-indigo-950/40 text-center">
                <div className="text-[9px] font-bold uppercase text-indigo-500">Monthly Salary</div>
                <div className="text-base font-extrabold font-mono text-indigo-700 dark:text-indigo-300">{inr(teacher.monthly_salary)}</div>
              </div>
              <div className="p-3 rounded-2xl border bg-rose-50 dark:bg-rose-950/40 text-center">
                <div className="text-[9px] font-bold uppercase text-rose-500">Advance Balance</div>
                <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-300">{inr(advanceBalance)}</div>
              </div>
              <div className="p-3 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 text-center col-span-2">
                <div className="text-[9px] font-bold uppercase text-emerald-500">Net Payable (this entry)</div>
                <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300">{inr(netPayable)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className={`font-bold ${textSecondary}`}>Salary Month</label>
                <input type="text" value={payForm.salary_month} onChange={(e) => setPayForm({ ...payForm, salary_month: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Payment Type</label>
                <select value={payForm.payment_type} onChange={(e) => setPayForm({ ...payForm, payment_type: e.target.value })} className={inputCls}>
                  <option>Salary</option>
                  <option>Advance</option>
                  <option>Bonus</option>
                </select>
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Salary Amount (₹)</label>
                <input type="number" value={payForm.salary_amount} onChange={(e) => setPayForm({ ...payForm, salary_amount: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="font-bold text-emerald-600">Bonus / Incentive (₹)</label>
                <input type="number" value={payForm.bonus} onChange={(e) => setPayForm({ ...payForm, bonus: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="font-bold text-rose-600">Deduction (₹)</label>
                <input type="number" value={payForm.deduction} onChange={(e) => setPayForm({ ...payForm, deduction: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="font-bold text-amber-600">Advance Given Now (₹)</label>
                <input type="number" value={payForm.advance_taken} onChange={(e) => setPayForm({ ...payForm, advance_taken: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="font-bold text-amber-600">Advance Adjusted (₹)</label>
                <input type="number" value={payForm.advance_adjusted} onChange={(e) => setPayForm({ ...payForm, advance_adjusted: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Payment Mode</label>
                <select value={payForm.payment_mode} onChange={(e) => setPayForm({ ...payForm, payment_mode: e.target.value })} className={inputCls}>
                  <option>Cash</option>
                  <option>Bank</option>
                  <option>UPI</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Reference / Txn No.</label>
                <input type="text" value={payForm.reference_no} onChange={(e) => setPayForm({ ...payForm, reference_no: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={`font-bold ${textSecondary}`}>Remarks</label>
              <input type="text" value={payForm.remarks} onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })} className={inputCls} />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 cursor-pointer">
                <Check className="w-4 h-4" /> Record Payment
              </button>
            </div>
          </form>
        )}

        {/* ADVANCES ledger */}
        {tab === 'advances' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl border bg-amber-50 dark:bg-amber-950/40 text-center">
                <div className="text-[9px] font-bold uppercase text-amber-500">Total Advance Taken</div>
                <div className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-300">{inr(advanceTaken)}</div>
              </div>
              <div className="p-3 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 text-center">
                <div className="text-[9px] font-bold uppercase text-emerald-500">Advance Adjusted</div>
                <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300">{inr(advanceAdjusted)}</div>
              </div>
              <div className="p-3 rounded-2xl border bg-rose-50 dark:bg-rose-950/40 text-center">
                <div className="text-[9px] font-bold uppercase text-rose-500">Advance Balance</div>
                <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-300">{inr(advanceBalance)}</div>
              </div>
            </div>
            <div className="space-y-2">
              {myPayments.filter(p => num(p.advance_taken) > 0 || num(p.advance_adjusted) > 0).length === 0 ? (
                <p className="text-slate-400 italic text-center py-6">No advance transactions yet.</p>
              ) : (
                myPayments.filter(p => num(p.advance_taken) > 0 || num(p.advance_adjusted) > 0).map(p => (
                  <div key={p.id} className={`p-3 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
                    <div>
                      <span className="font-bold">{p.date ? new Date(p.date).toLocaleDateString('en-GB') : ''}</span>
                      <span className="text-slate-400 ml-2">{p.salary_month}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      {num(p.advance_taken) > 0 && <span className="text-amber-600">+ {inr(p.advance_taken)} taken</span>}
                      {num(p.advance_adjusted) > 0 && <span className="text-emerald-600">- {inr(p.advance_adjusted)} adjusted</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PAYMENTS history */}
        {tab === 'payments' && (
          <div className="space-y-3 text-xs">
            {myPayments.length === 0 ? (
              <p className="text-slate-400 italic text-center py-6">No salary payments recorded yet. Use the Salary tab to record one.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b font-bold uppercase text-[10px] tracking-wider ${textSecondary}`}>
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Month</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2 text-right">Salary</th>
                      <th className="py-2 px-2 text-right">Advance</th>
                      <th className="py-2 px-2 text-right">Deduct</th>
                      <th className="py-2 px-2 text-right">Net Paid</th>
                      <th className="py-2 px-2 text-right">Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {myPayments.map(p => (
                      <tr key={p.id}>
                        <td className="py-2 px-2 font-mono">{p.date ? new Date(p.date).toLocaleDateString('en-GB') : ''}</td>
                        <td className="py-2 px-2">{p.salary_month || '—'}</td>
                        <td className="py-2 px-2"><span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-[10px]">{p.payment_type}</span></td>
                        <td className="py-2 px-2 text-right font-mono">{inr(p.salary_amount)}</td>
                        <td className="py-2 px-2 text-right font-mono text-amber-600">{inr(p.advance_taken)}</td>
                        <td className="py-2 px-2 text-right font-mono text-rose-600">{inr(p.deduction)}</td>
                        <td className="py-2 px-2 text-right font-mono font-extrabold text-emerald-600">{inr(p.net_paid)}</td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => generateSalarySlip(p)} className="p-1 text-blue-500 hover:bg-blue-600 hover:text-white rounded transition" title="Salary Slip"><FileDown className="w-3.5 h-3.5" /></button>
                            <button onClick={() => onDeletePayment(p.id)} className="p-1 text-rose-500 hover:bg-rose-600 hover:text-white rounded transition" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
