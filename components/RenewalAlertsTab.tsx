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

function getAlertInfo(remaining: number, daysDiff: number | null) {
  const alerts: string[] = []
  if (remaining <= 3) {
    alerts.push(`Only ${remaining} class(es) left!`)
  }
  if (daysDiff !== null && daysDiff <= 3) {
    if (daysDiff < 0) {
      alerts.push(`Plan expired by ${Math.abs(daysDiff)} day(s)!`)
    } else if (daysDiff === 0) {
      alerts.push(`Plan expires Today!`)
    } else {
      alerts.push(`Plan expires in ${daysDiff} day(s)!`)
    }
  }
  return alerts
}

function buildRenewalWhatsapp(st: any, batchName: string, remaining: number, daysDiff: number | null) {
  const phone = (st.parent_phone || '').replace(/[^0-9]/g, '')
  const target = phone.length === 10 ? `91${phone}` : phone || '919999999999'
  
  const alerts = getAlertInfo(remaining, daysDiff)
  const alertText = alerts.length > 0 ? alerts.map(a => `⚠️ ${a}`).join('\n') : 'Plan Renewal Reminder'
  
  const msg = `Dear ${st.parent_name || 'Parent'},\n\nThis is a gentle renewal reminder from Phulwari Mother & Child Activity Centre.\n\n🎓 Student: ${st.full_name} (${st.admission_id})\n📦 Package: ${batchName}\n\n${alertText}\n\nPlease renew at the earliest to ensure uninterrupted sessions.\n\n🌸 Phulwari Centre\nPatna`
  return `https://wa.me/${target}?text=${encodeURIComponent(msg)}`
}

function buildSmsLink(st: any, remaining: number, daysDiff: number | null) {
  const phone = (st.parent_phone || '').replace(/[^0-9]/g, '')
  const alerts = getAlertInfo(remaining, daysDiff)
  const alertText = alerts.join(', ')
  const msg = `Dear ${st.parent_name}, renewal notice for ${st.full_name}: ${alertText}. Please renew soon. -Phulwari Centre`
  return `sms:${phone}?body=${encodeURIComponent(msg)}`
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

export default function RenewalAlertsTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight, students, batches
}: RenewalAlertsTabProps) {

  const analyzed = useMemo(() => {
    return students
      .map(st => {
        const totalClasses = Number(st.classes_total !== undefined && st.classes_total !== null ? st.classes_total : 12)
        const consumed = Number(st.classes_consumed || 0)
        const remaining = Math.max(0, totalClasses - consumed)
        const batchObj = batches.find((b: any) => b.id === st.batch_id || (b.batch_name && st.batch_name && b.batch_name.toLowerCase().trim() === st.batch_name?.toLowerCase().trim()))
        const batchName = st.batch_name || batchObj?.batch_name || 'N/A'

        // Use validity_end_date as Plan Expiry Date
        const renewalDate = st.validity_end_date || st.plan_validity_date || st.renewal_date || null
        const daysDiff = getDaysInfo(renewalDate)

        return { ...st, totalClasses, consumed, remaining, batchName, renewalDate, daysDiff }
      })
      .filter(st => {
        // Show if remaining classes <= 3 OR validity days left <= 3 (or overdue)
        const classAlertActive = st.remaining <= 3
        const dateAlertActive = st.daysDiff !== null && st.daysDiff <= 3
        return classAlertActive || dateAlertActive
      })
      .sort((a, b) => {
        const da = a.daysDiff ?? 999
        const db = b.daysDiff ?? 999
        return da - db
      })
  }, [students, batches])

  const overdueCount = analyzed.filter(s => (s.daysDiff !== null && s.daysDiff < 0) || s.remaining === 0).length
  const urgentCount = analyzed.filter(s => s.daysDiff !== null && s.daysDiff >= 0 && s.daysDiff <= 3).length
  const upcomingCount = analyzed.filter(s => s.remaining > 0 && s.remaining <= 3 && (s.daysDiff === null || s.daysDiff > 3)).length

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
                  <th className="py-2.5 px-3">Plan Expiry Date</th>
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
                        <span className={`font-extrabold text-sm ${st.remaining === 0 ? 'text-rose-600' : st.remaining <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {st.remaining}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {st.renewalDate
                          ? formatDateToDisplay(st.renewalDate)
                          : <span className="italic text-slate-300">Not set</span>}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          {st.remaining <= 3 && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-350 border border-rose-200 dark:border-rose-900 rounded-full font-bold text-[9px] w-fit">
                              ⚠️ {st.remaining} Classes Left
                            </span>
                          )}
                          {st.daysDiff !== null && st.daysDiff <= 3 && (
                            <span className={`px-2 py-0.5 border rounded-full font-bold text-[9px] w-fit ${
                              st.daysDiff < 0 
                                ? 'bg-rose-150 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300' 
                                : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-350'
                            }`}>
                              📅 {st.daysDiff < 0 ? `Overdue (${Math.abs(st.daysDiff)}d)` : st.daysDiff === 0 ? 'Expires Today' : `Expires in ${st.daysDiff}d`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`font-semibold ${textPrimary} text-[11px]`}>{st.parent_name}</div>
                        <div className={`text-[10px] ${textSecondary} font-mono`}>{st.parent_phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* WhatsApp */}
                          <a
                            href={buildRenewalWhatsapp(st, st.batchName, st.remaining, st.daysDiff)}
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
                            href={buildSmsLink(st, st.remaining, st.daysDiff)}
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
