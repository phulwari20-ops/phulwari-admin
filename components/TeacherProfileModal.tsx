'use client'

import React, { useState, useEffect } from 'react'
import { X, User, CalendarCheck, Wallet, HandCoins, Receipt, FileDown, Trash2, Check, Edit3 } from 'lucide-react'

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
  onMarkAttendance: (teacherId: string, date: string, status: string, reason?: string) => void
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

  useEffect(() => {
    if (teacher) {
      const baseSalary = teacher.monthly_salary || teacher.salary_amount || ''
      setPayForm((prev: any) => ({
        ...prev,
        salary_amount: prev.salary_amount || (baseSalary ? String(baseSalary) : '')
      }))
    }
  }, [teacher?.id])

  if (!isOpen || !teacher) return null

  const inputCls = `w-full border rounded-xl px-3 py-2 font-semibold outline-none ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`
  const num = (v: any) => Number(v) || 0
  const inr = (v: any) => `₹${num(v).toLocaleString('en-IN')}`

  const myPayments = (teacherPayments || []).filter(p => p.teacher_id === teacher.id)
  const myAttendance = (teacherAttendance || []).filter(a => a.teacher_id === teacher.id)

  // Advance ledger
  const advanceTaken = myPayments.reduce((s, p) => s + num(p.advance_taken), 0)
  const advanceAdjusted = myPayments.reduce((s, p) => s + num(p.advance_adjusted), 0)
  const advanceBalance = advanceTaken - advanceAdjusted

  const activeSalaryAmt = num(payForm.salary_amount) || num(teacher?.monthly_salary) || 0
  const netPayable = payForm.payment_type === 'Advance'
    ? num(payForm.advance_taken)
    : payForm.payment_type === 'Bonus'
    ? num(payForm.bonus)
    : Math.max(0, activeSalaryAmt + num(payForm.bonus) - num(payForm.deduction) - num(payForm.advance_adjusted) + num(payForm.advance_taken))

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

  const attTodayRecord = myAttendance.find(a => a.date === attDate)
  const attToday = attTodayRecord?.status || ''

  const [attReason, setAttReason] = useState(attTodayRecord?.reason || '')

  useEffect(() => {
    setAttReason(attTodayRecord?.reason || '')
  }, [attDate, attTodayRecord?.reason])

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
    const paymentObj = {
      teacher_id: teacher.id,
      date: new Date().toISOString().split('T')[0],
      salary_month: payForm.salary_month,
      salary_amount: num(payForm.salary_amount) || num(teacher?.monthly_salary) || 0,
      advance_taken: num(payForm.advance_taken),
      advance_adjusted: num(payForm.advance_adjusted),
      deduction: num(payForm.deduction),
      bonus: num(payForm.bonus),
      net_paid: netPayable,
      payment_mode: payForm.payment_mode || 'Cash',
      payment_type: payForm.payment_type || 'Salary',
      reference_no: payForm.reference_no || '',
      remarks: payForm.remarks || '',
    }

    onAddPayment(paymentObj)
    alert(`✅ Payment of ${inr(netPayable)} recorded for ${teacher.name}!`)
    generateSalarySlip(paymentObj)

    setPayForm({
      salary_month: `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      salary_amount: String(teacher.monthly_salary || ''),
      advance_taken: '',
      advance_adjusted: '',
      deduction: '',
      bonus: '',
      payment_mode: 'Cash',
      payment_type: 'Salary',
      remarks: '',
      reference_no: '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-3xl rounded-3xl p-6 space-y-5 shadow-2xl border my-8 ${bgCard}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
              {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h3 className={`text-base font-extrabold ${textPrimary}`}>{teacher.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {teacher.id} · <span className="text-indigo-500 font-bold">{teacher.designation || teacher.specialization || 'Faculty'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold hover:text-rose-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            ['profile', 'Teacher Profile', User],
            ['attendance', 'Attendance Register', CalendarCheck],
            ['salary', 'Salary / Pay Slip', Wallet],
            ['advances', 'Advance Ledger', HandCoins],
            ['payments', 'Payment History', Receipt],
          ].map(([tKey, label, Icon]: any) => (
            <button
              key={tKey}
              onClick={() => setTab(tKey)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                tab === tKey
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Row label="Full Name" value={teacher.name} />
              <Row label="Email Address" value={teacher.email} />
              <Row label="Phone Number" value={teacher.phone} />
              <Row label="Specialization" value={teacher.specialization} />
              <Row label="Assigned Batch" value={teacher.assigned_batch} />
              <Row label="Designation" value={teacher.designation || 'N/A'} />
              <Row label="Qualification" value={teacher.qualification || 'N/A'} />
              <Row label="Employment Type" value={teacher.employment_type || 'Full Time'} />
              <Row label="Monthly Salary" value={inr(teacher.monthly_salary || payForm.salary_amount || 0)} />
              <Row label="Join Date" value={teacher.join_date || 'N/A'} />
              <Row label="Address" value={teacher.address || 'N/A'} />
              <Row label="Emergency Contact" value={teacher.emergency_contact || 'N/A'} />
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab === 'attendance' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                    Mark Attendance for Today ({attDate})
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Single-click to select status, click again to deselect.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ATT_STATES.map(st => {
                    const isSelected = attToday === st
                    let activeCls = 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400/40'
                    if (st === 'Present') activeCls = 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105 ring-2 ring-emerald-400/40'
                    else if (st === 'Absent') activeCls = 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 ring-2 ring-rose-400/40'
                    else if (st === 'Half Day') activeCls = 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/30 scale-105 ring-2 ring-amber-400/40'
                    else if (st === 'Paid Leave') activeCls = 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/30 scale-105 ring-2 ring-blue-400/40'
                    else if (st === 'Unpaid Leave') activeCls = 'bg-slate-700 border-slate-700 text-white shadow-md shadow-slate-700/30 scale-105 ring-2 ring-slate-400/40'
                    else if (st === 'Late') activeCls = 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/30 scale-105 ring-2 ring-purple-400/40'
                    else if (st === 'Holiday') activeCls = 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/30 scale-105 ring-2 ring-teal-400/40'

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            // Single-click deselect back to unmarked normal state
                            onMarkAttendance(teacher.id, attDate, 'unmarked', '')
                          } else {
                            // Single-click select status
                            const currentReason = ['Paid Leave', 'Unpaid Leave', 'Late', 'Holiday'].includes(st) ? attReason : ''
                            onMarkAttendance(teacher.id, attDate, st, currentReason)
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? activeCls
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        {isSelected && <span className="font-black text-white">✓</span>}
                        <span>{st}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Interactive Reason / Remarks Input for Paid Leave, Unpaid Leave, Late, Holiday */}
              {['Paid Leave', 'Unpaid Leave', 'Late', 'Holiday'].includes(attToday) && (
                <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center gap-2 animate-fadeIn">
                  <label className="font-extrabold text-indigo-700 dark:text-indigo-300 text-[11px] shrink-0 flex items-center gap-1">
                    <span>✏️</span> Reason / Remarks for {attToday}:
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter reason for ${attToday} (e.g. Sick Leave, Medical, Traffic, Festival)...`}
                    value={attReason}
                    onChange={(e) => {
                      setAttReason(e.target.value)
                      onMarkAttendance(teacher.id, attDate, attToday, e.target.value)
                    }}
                    className="flex-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-1.5 font-semibold text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-400">Monthly Attendance Breakdown</span>
                <select
                  value={summaryMonth}
                  onChange={(e) => setSummaryMonth(e.target.value)}
                  className="text-xs font-bold px-3 py-1 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                    const mName = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
                    return <option key={mName} value={mName}>{mName}</option>
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ['Present', summary.present, 'text-emerald-600'],
                  ['Absent', summary.absent, 'text-rose-600'],
                  ['Half Day', summary.halfDay, 'text-amber-600'],
                  ['Paid Leave', summary.paidLeave, 'text-blue-600'],
                  ['Unpaid Leave', summary.unpaidLeave, 'text-purple-600'],
                  ['Late', summary.late, 'text-orange-600'],
                  ['Holiday', summary.holiday, 'text-teal-600'],
                  ['Total Marked', monthAtt.length, 'text-slate-600'],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="p-2.5 rounded-xl border bg-white dark:bg-slate-900 text-center">
                    <div className="text-[9px] font-bold uppercase text-slate-400">{label}</div>
                    <div className={`text-base font-extrabold ${color}`}>{val as number}</div>
                  </div>
                ))}
              </div>

              {/* List of Marked Days in Summary Month */}
              {monthAtt.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">
                    Marked Attendance Log ({summaryMonth})
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {monthAtt.map(a => (
                      <div key={a.id || a.date} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] shadow-xs">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{a.date}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                            a.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            a.status === 'Absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            a.status === 'Half Day' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            a.status === 'Paid Leave' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                            a.status === 'Unpaid Leave' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                            a.status === 'Late' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                            'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            {a.status}
                          </span>
                          {a.reason && (
                            <span className="text-[10px] text-slate-500 font-medium italic truncate max-w-[150px]">
                              Reason: "{a.reason}"
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SALARY TAB */}
        {tab === 'salary' && (
          <form onSubmit={submitPayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3.5 rounded-2xl border bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-center">
                <div className="text-[9px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400">Monthly Base Salary</div>
                <div className="text-base font-extrabold font-mono text-indigo-700 dark:text-indigo-300 mt-0.5">
                  {inr(payForm.salary_amount || teacher.monthly_salary || 0)}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl border bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-center">
                <div className="text-[9px] font-extrabold uppercase text-rose-600 dark:text-rose-400">Advance Balance</div>
                <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-300 mt-0.5">
                  {inr(advanceBalance)}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-center col-span-2">
                <div className="text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Net Payable (This Entry)</div>
                <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {inr(netPayable)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <label className={`font-bold block mb-1 ${textSecondary}`}>Salary Month</label>
                <input
                  type="text"
                  value={payForm.salary_month}
                  onChange={(e) => setPayForm({ ...payForm, salary_month: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={`font-bold block mb-1 ${textSecondary}`}>Payment Type</label>
                <select
                  value={payForm.payment_type}
                  onChange={(e) => {
                    const pType = e.target.value
                    setPayForm((prev: any) => ({
                      ...prev,
                      payment_type: pType,
                      salary_amount: pType === 'Salary' ? (prev.salary_amount || String(teacher.monthly_salary || '')) : prev.salary_amount
                    }))
                  }}
                  className={inputCls}
                >
                  <option value="Salary">Salary Payment</option>
                  <option value="Advance">Advance Given</option>
                  <option value="Bonus">Bonus / Incentive</option>
                  <option value="Allowance">Allowance</option>
                </select>
              </div>
              <div>
                <label className={`font-bold block mb-1 ${textSecondary}`}>Salary Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={payForm.salary_amount}
                  onChange={(e) => setPayForm({ ...payForm, salary_amount: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-bold text-emerald-600 block mb-1">Bonus / Incentive (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={payForm.bonus}
                  onChange={(e) => setPayForm({ ...payForm, bonus: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-bold text-rose-600 block mb-1">Deduction (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={payForm.deduction}
                  onChange={(e) => setPayForm({ ...payForm, deduction: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-bold text-amber-600 block mb-1">Advance Given Now (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={payForm.advance_taken}
                  onChange={(e) => setPayForm({ ...payForm, advance_taken: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-bold text-amber-600 block mb-1">Advance Adjusted (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={payForm.advance_adjusted}
                  onChange={(e) => setPayForm({ ...payForm, advance_adjusted: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={`font-bold block mb-1 ${textSecondary}`}>Payment Mode</label>
                <select
                  value={payForm.payment_mode}
                  onChange={(e) => setPayForm({ ...payForm, payment_mode: e.target.value })}
                  className={inputCls}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className={`font-bold block mb-1 ${textSecondary}`}>Reference / Txn No.</label>
                <input
                  type="text"
                  placeholder="e.g. TXN987654321"
                  value={payForm.reference_no}
                  onChange={(e) => setPayForm({ ...payForm, reference_no: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={`font-bold block mb-1 ${textSecondary}`}>Remarks / Notes</label>
              <input
                type="text"
                placeholder="e.g. Monthly salary payout processed cleanly..."
                value={payForm.remarks}
                onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition"
              >
                <Check className="w-4 h-4" />
                <span>Record Payment &amp; Print Slip</span>
              </button>
            </div>
          </form>
        )}

        {/* ADVANCES TAB */}
        {tab === 'advances' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-center">
                <div className="text-[9px] font-extrabold uppercase text-amber-600">Total Advance Taken</div>
                <div className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-300 mt-0.5">{inr(advanceTaken)}</div>
              </div>
              <div className="p-3.5 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-center">
                <div className="text-[9px] font-extrabold uppercase text-emerald-600">Advance Adjusted</div>
                <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">{inr(advanceAdjusted)}</div>
              </div>
              <div className="p-3.5 rounded-2xl border bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-center">
                <div className="text-[9px] font-extrabold uppercase text-rose-600">Advance Balance</div>
                <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-300 mt-0.5">{inr(advanceBalance)}</div>
              </div>
            </div>

            <div className="space-y-2">
              {myPayments.filter(p => num(p.advance_taken) > 0 || num(p.advance_adjusted) > 0).length === 0 ? (
                <p className="text-slate-400 italic text-center py-6">No advance transactions recorded yet.</p>
              ) : (
                myPayments.filter(p => num(p.advance_taken) > 0 || num(p.advance_adjusted) > 0).map(p => (
                  <div key={p.id} className={`p-3 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
                    <div>
                      <span className="font-bold">{p.date ? new Date(p.date).toLocaleDateString('en-GB') : ''}</span>
                      <span className="text-slate-400 ml-2 font-semibold">({p.salary_month})</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-xs font-bold">
                      {num(p.advance_taken) > 0 && <span className="text-amber-600">+ {inr(p.advance_taken)} taken</span>}
                      {num(p.advance_adjusted) > 0 && <span className="text-emerald-600">- {inr(p.advance_adjusted)} adjusted</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PAYMENTS HISTORY TAB */}
        {tab === 'payments' && (
          <div className="space-y-3 text-xs">
            {myPayments.length === 0 ? (
              <p className="text-slate-400 italic text-center py-6">No salary payments recorded yet. Use the Salary tab to record one.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {myPayments.map(p => (
                  <div key={p.id} className={`p-3.5 rounded-2xl border flex items-center justify-between ${bgSubCard}`}>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">{p.salary_month}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {p.payment_type || 'Salary'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Date: {p.date ? new Date(p.date).toLocaleDateString('en-GB') : 'N/A'} · Mode: {p.payment_mode || 'Cash'} {p.reference_no ? `· Ref: ${p.reference_no}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {inr(p.net_paid || p.salary_amount)}
                      </span>
                      <button
                        onClick={() => generateSalarySlip(p)}
                        className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition cursor-pointer"
                        title="Print Salary Slip"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePayment(p.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer"
                        title="Delete Payment Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">{label}</div>
      <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{value || 'N/A'}</div>
    </div>
  )
}
