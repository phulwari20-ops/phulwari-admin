'use client'
import React, { useMemo } from 'react'
import { RefreshCcw, Phone, MessageSquare, AlertCircle, CheckCircle2, User } from 'lucide-react'

interface RenewalAlertsTabProps {
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  isLight: boolean
  students: any[]
  batches: any[]
}

function getDaysInfo(dueDateStr: string) {
  if (!dueDateStr) return null
  const due = new Date(dueDateStr)
  if (isNaN(due.getTime())) return null
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const diff = Math.round((dueMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function renewalLabel(diff: number | null) {
  if (diff === null) return { text: 'No date set', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' }
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''}`, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' }
  if (diff === 0) return { text: 'Due Today!', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' }
  if (diff === 1) return { text: 'Due Tomorrow', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
  return { text: `Due in ${diff} days`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' }
}

function buildRenewalWhatsapp(st: any, batchName: string, remainingClasses: number) {
  const phone = (st.parent_phone || '').replace(/[^0-9]/g, '')
  const target = phone.length === 10 ? `91${phone}` : phone || '919999999999'
  const msg = `Dear ${st.parent_name || 'Parent'},\n\nThis is a gentle renewal reminder from Phulwari Mother & Child Activity Centre.\n\n🎓 Student: ${st.full_name} (${st.admission_id})\n📦 Package: ${batchName}\n📊 Remaining Classes: ${remainingClasses}\n\nYour child's class package is nearing completion. Please renew at the earliest to avoid any break in classes.\n\nFor queries, please contact us.\n\n🌸 Phulwari Mother & Child Activity Centre\nM/32, Road No. 25, Sri Krishna Nagar, Patna — 800001`
  return `https://wa.me/${target}?text=${encodeURIComponent(msg)}`
}

function buildSmsLink(st: any, remainingClasses: number) {
  const phone = (st.parent_phone || '').replace(/[^0-9]/g, '')
  const msg = `Dear ${st.parent_name}, ${st.full_name}'s class package has ${remainingClasses} classes remaining. Please renew soon. -Phulwari Centre`
  return `sms:${phone}?body=${encodeURIComponent(msg)}`
}

export default function RenewalAlertsTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight, students, batches
}: RenewalAlertsTabProps) {

  const analyzed = useMemo(() => {
    return students
      .map(st => {
        const totalClasses = Number(st.total_classes || st.package_classes || 0)
        const consumed = Number(st.classes_consumed || 0)
        const remaining = Math.max(0, totalClasses - consumed)
        const batchObj = batches.find((b: any) => b.id === st.batch_id || (b.batch_name && st.batch_name && b.batch_name.toLowerCase().trim() === st.batch_name?.toLowerCase().trim()))
        const batchName = st.batch_name || batchObj?.batch_name || 'N/A'

        // Try to find due date - either renewal_date from student, or calculated from admission + package
        const renewalDate = st.renewal_date || st.next_due_date || null
        const daysDiff = getDaysInfo(renewalDate)

        return { ...st, totalClasses, consumed, remaining, batchName, renewalDate, daysDiff }
      })
      .filter(st => {
        // Show if: 0 classes left, or renewal_date within 7 days, or overdue
        if (st.remaining === 0) return true
        if (st.daysDiff !== null && st.daysDiff <= 7) return true
        return false
      })
      .sort((a, b) => {
        const da = a.daysDiff ?? 999
        const db = b.daysDiff ?? 999
        return da - db
      })
  }, [students, batches])

  const overdueCount = analyzed.filter(s => (s.daysDiff !== null && s.daysDiff < 0) || s.remaining === 0).length
  const urgentCount = analyzed.filter(s => s.daysDiff !== null && s.daysDiff >= 0 && s.daysDiff <= 3).length
  const upcomingCount = analyzed.filter(s => s.daysDiff !== null && s.daysDiff > 3 && s.daysDiff <= 7).length

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`${bgCard} p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <RefreshCcw className="w-5 h-5 text-amber-500" /> Renewal Alerts Dashboard
          </h3>
          <p className={`text-xs ${textSecondary} mt-0.5`}>
            Students whose class packages are expiring soon (≤7 days) or have 0 classes remaining.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="text-center px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <div className="text-xl font-black text-rose-600">{overdueCount}</div>
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Overdue</div>
          </div>
          <div className="text-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="text-xl font-black text-amber-600">{urgentCount}</div>
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Urgent (≤3d)</div>
          </div>
          <div className="text-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="text-xl font-black text-blue-600">{upcomingCount}</div>
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Upcoming</div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className={`${bgCard} p-6 rounded-2xl space-y-4`}>
        <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
          🔁 Students Requiring Renewal ({analyzed.length})
        </h4>

        {analyzed.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 opacity-60" />
            <p className={`text-sm font-semibold ${textSecondary}`}>No renewals due in the next 7 days! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} text-slate-400 text-[10px] uppercase font-bold tracking-wider`}>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Package / Batch</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-center">Used</th>
                  <th className="py-2.5 px-3 text-center">Left</th>
                  <th className="py-2.5 px-3">Renewal Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Parent</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {analyzed.map(st => {
                  const label = renewalLabel(st.daysDiff)
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
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200'}`}>
                          {st.batchName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-500">{st.totalClasses || '—'}</td>
                      <td className="py-3 px-3 text-center font-bold text-orange-500">{st.consumed}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-extrabold text-sm ${st.remaining === 0 ? 'text-rose-600' : st.remaining <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {st.remaining}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {st.renewalDate
                          ? new Date(st.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : <span className="italic text-slate-300">Not set</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${label.bg} ${label.color}`}>
                          {label.text}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`font-semibold ${textPrimary} text-[11px]`}>{st.parent_name}</div>
                        <div className={`text-[10px] ${textSecondary} font-mono`}>{st.parent_phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* WhatsApp */}
                          <a
                            href={buildRenewalWhatsapp(st, st.batchName, st.remaining)}
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
                            href={buildSmsLink(st, st.remaining)}
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
