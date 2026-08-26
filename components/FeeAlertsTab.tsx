'use client'
import React, { useMemo } from 'react'
import { IndianRupee, Phone, MessageSquare, CheckCircle2, User, AlertTriangle } from 'lucide-react'

interface FeeAlertsTabProps {
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  isLight: boolean
  students: any[]
  fees: any[]
  batches: any[]
}

function getDaysDiff(dueDateStr: string) {
  if (!dueDateStr) return null
  const due = new Date(dueDateStr)
  if (isNaN(due.getTime())) return null
  const today = new Date()
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  return Math.round((dueMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24))
}

function feeLabel(diff: number | null) {
  if (diff === null) return { text: 'No due date', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' }
  if (diff < 0) return { text: `Fee overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''}`, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' }
  if (diff === 0) return { text: 'Fee due Today!', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' }
  if (diff === 1) return { text: 'Fee due Tomorrow', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
  return { text: `Fee due in ${diff} days`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' }
}

function buildFeeWhatsapp(st: any, pendingAmt: number, totalFee: number, dueDate: string) {
  const phone = (st.parent_phone || '').replace(/[^0-9]/g, '')
  const target = phone.length === 10 ? `91${phone}` : phone || '919999999999'
  const formattedDue = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
  const msg = `Dear ${st.parent_name || 'Parent'},\n\nWe would like to remind you about the pending fee for your child at Phulwari Mother & Child Activity Centre.\n\n🎓 Student: ${st.full_name} (${st.admission_id})\n💰 Total Fee: ₹${totalFee.toLocaleString('en-IN')}\n✅ Paid: ₹${(totalFee - pendingAmt).toLocaleString('en-IN')}\n❗ Pending: ₹${pendingAmt.toLocaleString('en-IN')}\n📅 Due Date: ${formattedDue}\n\nKindly clear the pending fee at your earliest convenience to avoid any disruption in classes.\n\nThank you for your prompt response.\n\n🌸 Phulwari Mother & Child Activity Centre\nM/32, Road No. 25, Sri Krishna Nagar, Patna — 800001`
  return `https://wa.me/${target}?text=${encodeURIComponent(msg)}`
}

function buildFeeSmsLink(st: any, pendingAmt: number, dueDate: string) {
  const phone = (st.parent_phone || '').replace(/[^0-9]/g, '')
  const formattedDue = dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : 'ASAP'
  const msg = `Dear ${st.parent_name}, ₹${pendingAmt} fee is pending for ${st.full_name} (${st.admission_id}). Due: ${formattedDue}. Please clear at earliest. -Phulwari Centre`
  return `sms:${phone}?body=${encodeURIComponent(msg)}`
}

export default function FeeAlertsTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight, students, fees, batches
}: FeeAlertsTabProps) {

  const analyzed = useMemo(() => {
    return students
      .map(st => {
        const studentLedger = fees.filter((f: any) => f.student_id === st.id || f.students?.admission_id === st.admission_id)
        let totalFee = 0
        let paidAmount = 0
        let pendingAmount = 0
        let latestDueDate: string | null = null

        if (studentLedger.length > 0) {
          studentLedger.forEach((f: any) => {
            const feeAmt = Number(f.amount || f.net_amount || 0)
            const netAmt = Number(f.net_amount || f.amount || 0)
            if (f.status === 'paid') paidAmount += netAmt
            if (f.status === 'pending' || f.status === 'due') {
              pendingAmount += netAmt
              totalFee += feeAmt
              if (!latestDueDate || (f.due_date && f.due_date > latestDueDate)) latestDueDate = f.due_date
            }
            if (f.status === 'paid') totalFee += feeAmt
          })
        } else {
          const paid = Number(st.amount_paid || 0)
          const batchObj = batches.find((b: any) => b.id === st.batch_id || (b.batch_name && st.batch_name && b.batch_name.toLowerCase().trim() === st.batch_name?.toLowerCase().trim()))
          const total = st.total_fee ? Number(st.total_fee) : (batchObj ? Number(batchObj.fee_amount) : 3500)
          paidAmount = paid
          pendingAmount = Math.max(0, total - paid)
          totalFee = total
        }

        const daysDiff = getDaysDiff(latestDueDate || '')

        return { ...st, totalFee, paidAmount, pendingAmount, latestDueDate, daysDiff }
      })
      .filter(st => {
        if (st.pendingAmount > 0) {
          // Show if overdue or within 7 days of due date
          if (st.daysDiff === null) return st.pendingAmount > 0 // no date - still show if pending
          return st.daysDiff <= 7
        }
        return false
      })
      .sort((a, b) => {
        const da = a.daysDiff ?? 999
        const db = b.daysDiff ?? 999
        return da - db
      })
  }, [students, fees, batches])

  const overdueCount = analyzed.filter(s => s.daysDiff !== null && s.daysDiff < 0).length
  const urgentCount = analyzed.filter(s => s.daysDiff !== null && s.daysDiff >= 0 && s.daysDiff <= 3).length
  const upcomingCount = analyzed.filter(s => s.daysDiff !== null && s.daysDiff > 3).length
  const totalPending = analyzed.reduce((sum, s) => sum + s.pendingAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`${bgCard} p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <IndianRupee className="w-5 h-5 text-rose-500" /> Fee Alert Dashboard
          </h3>
          <p className={`text-xs ${textSecondary} mt-0.5`}>
            Students with pending fees due within 7 days or overdue.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="text-center px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <div className="text-xl font-black text-rose-600">{overdueCount}</div>
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Overdue</div>
          </div>
          <div className="text-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="text-xl font-black text-amber-600">{urgentCount}</div>
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Urgent</div>
          </div>
          <div className="text-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="text-xl font-black text-blue-600">{upcomingCount}</div>
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Upcoming</div>
          </div>
          <div className="text-center px-4 py-2 bg-rose-600/10 border border-rose-600/20 rounded-xl">
            <div className="text-lg font-black text-rose-700">₹{totalPending.toLocaleString('en-IN')}</div>
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Total Pending</div>
          </div>
        </div>
      </div>

      {/* Alert Table */}
      <div className={`${bgCard} p-6 rounded-2xl space-y-4`}>
        <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
          <AlertTriangle className="w-4 h-4 text-rose-500" /> Fee Due Alerts ({analyzed.length} students)
        </h4>

        {analyzed.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 opacity-60" />
            <p className={`text-sm font-semibold ${textSecondary}`}>No pending fee alerts right now! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} text-slate-400 text-[10px] uppercase font-bold tracking-wider`}>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Parent</th>
                  <th className="py-2.5 px-3 text-right">Fee</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Pending</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {analyzed.map(st => {
                  const label = feeLabel(st.daysDiff)
                  const isOverdue = st.daysDiff !== null && st.daysDiff < 0
                  const isUrgent = st.daysDiff !== null && st.daysDiff >= 0 && st.daysDiff <= 3

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                        isOverdue ? 'border-l-2 border-l-rose-500' : isUrgent ? 'border-l-2 border-l-amber-500' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className={`font-bold flex items-center gap-1.5 ${textPrimary}`}>
                          <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{st.full_name}</span>
                        </div>
                        <div className={`text-[10px] ${textSecondary} font-mono`}>{st.admission_id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`font-semibold text-[11px] ${textPrimary}`}>{st.parent_name}</div>
                        <div className={`text-[10px] ${textSecondary} font-mono`}>{st.parent_phone}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-500">₹{st.totalFee.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">₹{st.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-extrabold text-rose-600">₹{st.pendingAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {st.latestDueDate
                          ? new Date(st.latestDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : <span className="italic text-slate-300">Not set</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${label.bg} ${label.color}`}>
                          {label.text}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* WhatsApp */}
                          <a
                            href={buildFeeWhatsapp(st, st.pendingAmount, st.totalFee, st.latestDueDate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 border border-emerald-500/20 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Send WhatsApp reminder"
                          >
                            🟢 WhatsApp
                          </a>
                          {/* Call */}
                          <a
                            href={`tel:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}`}
                            className="px-2 py-1.5 bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-500/20 rounded-xl text-[10px] font-bold flex items-center gap-1 transition"
                            title="Call parent"
                          >
                            📞 Call
                          </a>
                          {/* SMS */}
                          <a
                            href={buildFeeSmsLink(st, st.pendingAmount, st.latestDueDate)}
                            className="px-2 py-1.5 bg-violet-500/10 hover:bg-violet-600 hover:text-white text-violet-600 border border-violet-500/20 rounded-xl text-[10px] font-bold flex items-center gap-1 transition"
                            title="Send SMS"
                          >
                            <MessageSquare className="w-3 h-3" /> SMS
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
