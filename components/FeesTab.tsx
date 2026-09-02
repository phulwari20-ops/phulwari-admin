'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { CreditCard, IndianRupee, ChevronRight, MessageSquare, Settings, Plus, Trash2, Edit3, Check, X, FileText, Download, Users, AlertCircle, Save } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

interface FeesTabProps {
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  isLight: boolean
  badgeStatus: string
  filteredStudents: any[]
  fees: any[]
  feeSelectedMonth: string
  setFeeSelectedMonth: (m: string) => void
  feeStatusFilter: 'All' | 'PAID' | 'PENDING'
  setFeeStatusFilter: (f: 'All' | 'PAID' | 'PENDING') => void
  setSelectedERPStudent: (st: any) => void
  setErpModalTab: (tab: any) => void
  handleSendWhatsAppFeeReminder: (name: string, id: string, phone: string, month: string, amount: number, due: string) => void
  batches: any[]
  feeHeads: any[]
  setFeeHeads: (heads: any[]) => void
  loadAllAdminData: () => Promise<void>
  incomeCategories?: any[]
  expenseCategories?: any[]
}

export default function FeesTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight, badgeStatus,
  filteredStudents, fees, feeSelectedMonth, setFeeSelectedMonth,
  feeStatusFilter, setFeeStatusFilter,
  setSelectedERPStudent, setErpModalTab, handleSendWhatsAppFeeReminder,
  batches, feeHeads, setFeeHeads, loadAllAdminData,
  incomeCategories = [], expenseCategories = []
}: FeesTabProps) {
  
  const [selectedBatchIdFilter, setSelectedBatchIdFilter] = useState<string>('All')
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'batches' | 'heads'>('batches')
  const [localBatches, setLocalBatches] = useState<any[]>([])
  const [classFeeSaveStatus, setClassFeeSaveStatus] = useState('')

  // View Ledger & Receipt Modal State
  const [viewLedgerModal, setViewLedgerModal] = useState<{
    isOpen: boolean
    student: any | null
    feeRecords: any[]
    month: string
  }>({
    isOpen: false,
    student: null,
    feeRecords: [],
    month: ''
  })

  const openLedgerViewForm = (st: any, studentFees: any[], month: string) => {
    const studentFeeRecords = studentFees.length > 0 ? studentFees : fees.filter((f: any) => 
      f.student_id === st?.id || 
      f.admission_id === st?.admission_id ||
      f.students?.admission_id === st?.admission_id ||
      (f.student_name && st?.full_name && String(f.student_name).toLowerCase() === String(st.full_name).toLowerCase())
    )
    setViewLedgerModal({
      isOpen: true,
      student: st,
      feeRecords: studentFeeRecords,
      month: month
    })
  }

  const printLedgerDocument = (st: any, studentFeeRecords: any[], month: string) => {
    const printWindow = window.open('', '_blank', 'width=850,height=900')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Fee Ledger & Receipt - ${st.full_name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1e293b; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: 800; color: #1e40af; }
            .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .badge { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; }
            .lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .val { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #1e40af; color: #ffffff; text-align: left; padding: 10px; font-size: 11px; font-weight: 700; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            .amount { text-align: right; font-family: monospace; font-weight: 700; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">🌸 Phulwari Mother & Child Activity Centre</div>
              <div class="sub">Official Student Fee Ledger & Payment Statement</div>
            </div>
            <div class="badge">Month: ${month}</div>
          </div>

          <div class="grid">
            <div class="box"><div class="lbl">Student Name</div><div class="val">${st.full_name}</div></div>
            <div class="box"><div class="lbl">Admission ID</div><div class="val">${st.admission_id}</div></div>
            <div class="box"><div class="lbl">Assigned Batch</div><div class="val">${st.batch_name || 'General'}</div></div>
            <div class="box"><div class="lbl">Parent Name & Phone</div><div class="val">${st.parent_name} (${st.parent_phone})</div></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date / Month</th>
                <th>Fee Head / Description</th>
                <th style="text-align:right;">Total Fee (₹)</th>
                <th style="text-align:right;">Discount (₹)</th>
                <th style="text-align:right;">Paid (₹)</th>
                <th style="text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${studentFeeRecords.length > 0 ? studentFeeRecords.map((f: any) => {
                const isRowPaid = f.status === 'paid' || (Number(f.amount_paid || 0) + Number(f.discount || 0) >= Number(f.amount || f.net_amount || 0) && Number(f.amount || 0) > 0);
                const isRowPartial = !isRowPaid && Number(f.amount_paid || 0) > 0;
                const rowStatusText = isRowPaid ? 'PAID' : isRowPartial ? 'PARTIAL' : 'DUE';
                return `
                  <tr>
                    <td>${f.collection_date || f.paid_date || month}</td>
                    <td>${f.title || f.fee_head || 'Monthly Fee'}</td>
                    <td class="amount">₹${Number(f.amount || 0).toLocaleString()}</td>
                    <td class="amount" style="color:#d97706;">₹${Number(f.discount || 0).toLocaleString()}</td>
                    <td class="amount" style="color:#16a34a;">₹${Number(f.amount_paid || f.net_amount || 0).toLocaleString()}</td>
                    <td><strong style="color:${isRowPaid ? '#16a34a' : isRowPartial ? '#d97706' : '#dc2626'}">${rowStatusText}</strong></td>
                  </tr>
                `
              }).join('') : `
                <tr>
                  <td>${month}</td>
                  <td>Monthly Fee</td>
                  <td class="amount">₹${Number(st.total_fee || 3500).toLocaleString()}</td>
                  <td class="amount">₹0</td>
                  <td class="amount" style="color:#16a34a;">₹${Number(st.amount_paid || 0).toLocaleString()}</td>
                  <td><strong>${st.amount_paid >= (st.total_fee || 3500) ? 'PAID' : 'DUE'}</strong></td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="footer">
            Printed on ${new Date().toLocaleString()} — Phulwari ERP System
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const handleDirectPrintLedgerAndReceipt = (st: any, studentFees: any[], month: string) => {
    const studentFeeRecords = studentFees.length > 0 ? studentFees : fees.filter((f: any) => f.student_id === st.id || f.students?.admission_id === st.admission_id)
    const printWindow = window.open('', '_blank', 'width=850,height=900')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Fee Ledger & Receipt - ${st.full_name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1e293b; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: 800; color: #1e40af; }
            .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .badge { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; }
            .lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .val { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #1e40af; color: #ffffff; text-align: left; padding: 10px; font-size: 11px; font-weight: 700; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            .amount { text-align: right; font-family: monospace; font-weight: 700; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">🌸 Phulwari Mother & Child Activity Centre</div>
              <div class="sub">Official Student Fee Ledger & Payment Statement</div>
            </div>
            <div class="badge">Month: ${month}</div>
          </div>

          <div class="grid">
            <div class="box"><div class="lbl">Student Name</div><div class="val">${st.full_name}</div></div>
            <div class="box"><div class="lbl">Admission ID</div><div class="val">${st.admission_id}</div></div>
            <div class="box"><div class="lbl">Assigned Batch</div><div class="val">${st.batch_name || 'General'}</div></div>
            <div class="box"><div class="lbl">Parent Name & Phone</div><div class="val">${st.parent_name} (${st.parent_phone})</div></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date / Month</th>
                <th>Fee Head / Description</th>
                <th style="text-align:right;">Total Fee (₹)</th>
                <th style="text-align:right;">Discount (₹)</th>
                <th style="text-align:right;">Paid (₹)</th>
                <th style="text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${studentFeeRecords.length > 0 ? studentFeeRecords.map((f: any) => `
                <tr>
                  <td>${f.collection_date || f.paid_date || month}</td>
                  <td>${f.title || f.fee_head || 'Monthly Fee'}</td>
                  <td class="amount">₹${Number(f.amount || 0).toLocaleString()}</td>
                  <td class="amount" style="color:#d97706;">₹${Number(f.discount || 0).toLocaleString()}</td>
                  <td class="amount" style="color:#16a34a;">₹${Number(f.amount_paid || f.net_amount || 0).toLocaleString()}</td>
                  <td><strong style="color:${f.status === 'paid' ? '#16a34a' : '#dc2626'}">${(f.status || 'PAID').toUpperCase()}</strong></td>
                </tr>
              `).join('') : `
                <tr>
                  <td>${month}</td>
                  <td>Monthly Fee</td>
                  <td class="amount">₹${Number(st.total_fee || 3500).toLocaleString()}</td>
                  <td class="amount">₹0</td>
                  <td class="amount" style="color:#16a34a;">₹${Number(st.amount_paid || 0).toLocaleString()}</td>
                  <td><strong>${st.amount_paid >= (st.total_fee || 3500) ? 'PAID' : 'DUE'}</strong></td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="footer">
            Printed on ${new Date().toLocaleString()} — Phulwari ERP System
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
  const [newHeadName, setNewHeadName] = useState('')
  const [newHeadAmount, setNewHeadAmount] = useState('')
  const [editingHeadId, setEditingHeadId] = useState<string | null>(null)
  const [editHeadName, setEditHeadName] = useState('')
  const [editHeadAmount, setEditHeadAmount] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  // Sync local batches copy when opening settings modal or when batches update
  useEffect(() => {
    if (isSettingsModalOpen) {
      setLocalBatches(JSON.parse(JSON.stringify(batches || [])))
    }
  }, [isSettingsModalOpen, batches])

  const handleSaveClassFees = async () => {
    setClassFeeSaveStatus('Updating batch fee structure in database...')
    try {
      const supabase = createClient()
      for (const b of localBatches) {
        const { error } = await supabase
          .from('batches')
          .update({ fee_amount: b.fee_amount })
          .eq('id', b.id)
        if (error) throw error
      }
      setClassFeeSaveStatus('✅ Batch fees updated & published live!')
      await loadAllAdminData()
    } catch (err: any) {
      setClassFeeSaveStatus(`❌ Error: ${err.message || err}`)
    }
    setTimeout(() => setClassFeeSaveStatus(''), 3000)
  }

  // Derive stats dynamically for the selected month
  const stats = useMemo(() => {
    let collected = 0
    let pending = 0
    const studentsWithDue = new Set()

    filteredStudents.forEach(st => {
      // Find fee entries matching this student and selected month
      const monthFees = fees.filter(f => 
        (f.student_id === st.id || f.students?.admission_id === st.admission_id) &&
        (f.month === feeSelectedMonth || f.title?.includes(feeSelectedMonth))
      )

      if (monthFees.length > 0) {
        monthFees.forEach(f => {
          const amt = Number(f.net_amount || f.amount || 0)
          if (f.status === 'paid') {
            collected += amt
          } else {
            pending += amt
            studentsWithDue.add(st.id)
          }
        })
      } else {
        // Fallback to student defaults if no ledger entry exists
        const paid = Number(st.amount_paid || 0)
        const batchObj = batches.find(b => b.id === st.batch_id || (b.batch_name && st.batch_name && b.batch_name.toLowerCase().trim() === st.batch_name.toLowerCase().trim()))
        const total = st.total_fee ? Number(st.total_fee) : (batchObj ? Number(batchObj.fee_amount) : 3500)
        const diff = Math.max(0, total - paid)
        collected += paid
        pending += diff
        if (diff > 0) {
          studentsWithDue.add(st.id)
        }
      }
    })

    return {
      collected,
      pending,
      dueStudentsCount: studentsWithDue.size
    }
  }, [filteredStudents, fees, feeSelectedMonth, batches])

  // Manage Fee Heads actions
  const handleAddHead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHeadName.trim()) return
    setLoadingAction(true)

    const payload = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: newHeadName.trim(),
      default_amount: parseFloat(newHeadAmount) || 0,
      is_system: false
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('fee_heads').insert([payload]).select()
      if (error) throw error
      if (data) {
        const updated = [...feeHeads, data[0]]
        setFeeHeads(updated)
        localStorage.setItem('phulwari_fee_heads', JSON.stringify(updated))
        setNewHeadName('')
        setNewHeadAmount('')
      }
    } catch (err: any) {
      alert(`Error adding fee head: ${err.message}`)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleStartEditHead = (head: any) => {
    setEditingHeadId(head.id)
    setEditHeadName(head.name)
    setEditHeadAmount(String(head.default_amount))
  }

  const handleSaveEditHead = async (id: string) => {
    if (!editHeadName.trim()) return
    setLoadingAction(true)

    const updates = {
      name: editHeadName.trim(),
      default_amount: parseFloat(editHeadAmount) || 0
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('fee_heads').update(updates).eq('id', id)
      if (error) throw error
      const updated = feeHeads.map(h => h.id === id ? { ...h, ...updates } : h)
      setFeeHeads(updated)
      localStorage.setItem('phulwari_fee_heads', JSON.stringify(updated))
      setEditingHeadId(null)
    } catch (err: any) {
      alert(`Error updating fee head: ${err.message}`)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteHead = async (id: string, name: string) => {
    const head = feeHeads.find(h => h.id === id)
    if (head?.is_system) {
      alert('System fee heads cannot be deleted.')
      return
    }
    if (!confirm(`Are you sure you want to delete the fee head "${name}"?`)) return
    setLoadingAction(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('fee_heads').delete().eq('id', id)
      if (error) throw error
      const updated = feeHeads.filter(h => h.id !== id)
      setFeeHeads(updated)
      localStorage.setItem('phulwari_fee_heads', JSON.stringify(updated))
    } catch (err: any) {
      alert(`Error deleting fee head: ${err.message}`)
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* ── Summary & Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${bgCard} p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Collected Fees ({feeSelectedMonth})</span>
            <div className={`text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono`}>₹{stats.collected.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">₹</div>
        </div>

        <div className={`${bgCard} p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Pending Dues ({feeSelectedMonth})</span>
            <div className={`text-xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono`}>₹{stats.pending.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">❗</div>
        </div>

        <div className={`${bgCard} p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Students with Due</span>
            <div className={`text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono`}>{stats.dueStudentsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div className={`${bgCard} rounded-3xl p-6 space-y-5 shadow-sm border border-slate-200/50 dark:border-slate-800/50`}>
        <div className="flex flex-col gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-base sm:text-lg font-extrabold ${textPrimary} flex items-center gap-2`}>
                <CreditCard className="w-5 h-5 text-blue-500 shrink-0" />
                <span>Class &amp; Monthly Fee Management Dashboard</span>
              </h3>
              <p className={`text-xs ${textSecondary} mt-0.5`}>Track pending dues, collected fees, discounts, and fee status for all students by month.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setSettingsTab('heads'); setIsSettingsModalOpen(true); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-blue-500" />
                <span className="whitespace-nowrap">Manage Fee Heads</span>
              </button>

              <button
                onClick={() => { setSettingsTab('batches'); setIsSettingsModalOpen(true); }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer whitespace-nowrap"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>View Class Fees</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBatchIdFilter}
                onChange={(e) => setSelectedBatchIdFilter(e.target.value)}
                className={`text-xs px-3 py-2 rounded-xl border outline-none font-bold shrink-0 ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              >
                <option value="All">All Batches</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batch_name}</option>
                ))}
              </select>
              
              <select
                value={feeSelectedMonth}
                onChange={(e) => setFeeSelectedMonth(e.target.value)}
                className={`text-xs px-3 py-2 rounded-xl border outline-none font-bold shrink-0 ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              >
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="December 2026">December 2026</option>
                <option value="January 2027">January 2027</option>
                <option value="February 2027">February 2027</option>
                <option value="March 2027">March 2027</option>
              </select>
            </div>

            <div className={`flex items-center space-x-1 border rounded-xl p-1 shrink-0 ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
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

        {/* ── Student List ── */}
        <div className="flex flex-col space-y-3 pt-2">
          {filteredStudents.map((st) => {
            if (selectedBatchIdFilter !== 'All' && st.batch_id !== selectedBatchIdFilter) return null;
            
            // Find all matching fee entries for the student and month
            const studentFees = fees.filter((f: any) =>
              (f.student_id === st.id || f.students?.admission_id === st.admission_id) &&
              (f.month === feeSelectedMonth || f.title?.includes(feeSelectedMonth))
            )

            let isPaid = false
            let displayAmount = 3500
            let isPartial = false
            let paidValue = 0
            let pendingValue = 0

            if (studentFees.length > 0) {
              // Sum up stats across matching entries
              let totalOriginal = 0
              let totalPaid = 0
              let totalPending = 0

              studentFees.forEach((f: any) => {
                const net = Number(f.net_amount || f.amount || 0)
                if (f.status === 'paid') {
                  totalPaid += net
                } else if (f.status === 'partial') {
                  totalPaid += Number(f.amount_paid || 0)
                  totalPending += Number(f.pending_amount || 0)
                } else {
                  totalPending += net
                }
                totalOriginal += net
              })

              paidValue = totalPaid
              pendingValue = totalPending
              isPaid = totalPending === 0 && totalPaid > 0
              isPartial = totalPending > 0 && totalPaid > 0
              displayAmount = totalOriginal
            } else {
              // Defaults from student registration if ledger is empty
              const paid = Number(st.amount_paid || 0)
              const batchObj = batches.find(b => b.id === st.batch_id || (b.batch_name && st.batch_name && b.batch_name.toLowerCase().trim() === st.batch_name.toLowerCase().trim()))
              const total = st.total_fee ? Number(st.total_fee) : (batchObj ? Number(batchObj.fee_amount) : 3500)
              paidValue = paid
              pendingValue = Math.max(0, total - paid)
              isPaid = pendingValue === 0
              isPartial = pendingValue > 0 && paidValue > 0
              displayAmount = total
            }

            if (feeStatusFilter === 'PAID' && !isPaid) return null;
            if (feeStatusFilter === 'PENDING' && isPaid) return null;

            return (
              <div
                key={st.id}
                onClick={() => openLedgerViewForm(st, studentFees, feeSelectedMonth)}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${bgSubCard} hover:border-blue-500/50`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-extrabold uppercase border whitespace-nowrap w-28 text-center ${
                    isPaid 
                      ? badgeStatus 
                      : isPartial 
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    {isPaid ? `PAID ₹${paidValue || displayAmount}` : isPartial ? `PARTIAL ₹${paidValue}` : `DUE ₹${pendingValue}`}
                  </span>
                  <div>
                    <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                      {st.full_name}
                      <span className="text-[11px] font-mono text-blue-500 font-bold">{st.admission_id}</span>
                    </h4>
                    <p className={`text-xs ${textSecondary} mt-0.5`}>
                      Batch: {st.batch_name || 'Mother & Toddler Program'} | Parent: {st.parent_name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-3 text-xs border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto sm:flex-1 sm:justify-end">
                  <div className="flex flex-wrap items-center justify-end gap-3 w-full 2xl:w-auto">
                    <span className={textSecondary}>Month: <strong>{feeSelectedMonth}</strong></span>
                    <div className="flex flex-wrap items-center justify-end gap-2 mt-1 sm:mt-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsAppFeeReminder(st.full_name, st.admission_id, st.parent_phone, feeSelectedMonth, pendingValue || displayAmount, '2026-08-15');
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-300 dark:border-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <a
                        href={`tel:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-300 dark:border-blue-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      >📞 Call</a>
                      <a
                        href={`sms:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(`Dear Parents,\nThis is a gentle reminder that a fee of Rs. ${pendingValue || displayAmount} is pending for ${st.full_name}. Please clear the dues as soon as possible.\n\nRegards,\nPhulwari Mother & Child Activity Centre`)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-300 dark:border-indigo-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      >✉️ SMS</a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLedgerViewForm(st, studentFees, feeSelectedMonth);
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold flex items-center justify-end gap-1 whitespace-nowrap 2xl:ml-2 hover:underline cursor-pointer"
                  >
                    View Ledger &amp; Receipt <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── COMBINED FEE SETTINGS & CONFIGURATION MODAL ── */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99] animate-fadeIn">
          <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-black ${textPrimary} flex items-center gap-1.5`}>
                <Settings className="w-5 h-5 text-blue-500" /> Fee Settings &amp; Configuration
              </h3>
              <button onClick={() => { setIsSettingsModalOpen(false); loadAllAdminData(); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSettingsTab('batches')}
                className={`flex-1 pb-3 text-xs font-bold border-b-2 transition ${
                  settingsTab === 'batches' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Batch Fees Structure (monthly defaults)
              </button>
              <button
                onClick={() => setSettingsTab('heads')}
                className={`flex-1 pb-3 text-xs font-bold border-b-2 transition ${
                  settingsTab === 'heads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Dynamic Fee Heads
              </button>
            </div>

            {/* TAB CONTENT 1: BATCH FEES */}
            {settingsTab === 'batches' && (
              <div className="space-y-4">
                {classFeeSaveStatus && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold animate-fadeIn">
                    {classFeeSaveStatus}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {localBatches.map((b) => (
                    <div key={b.id} className={`p-3 rounded-2xl border space-y-1.5 ${bgSubCard} border-slate-200 dark:border-slate-800`}>
                      <label className={`font-bold block ${textPrimary}`}>{b.batch_name} ({b.age_group || '1-3 Yrs'})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={b.fee_amount || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0
                            setLocalBatches(prev => prev.map(item => item.id === b.id ? { ...item, fee_amount: val } : item))
                          }}
                          className={`w-full text-xs font-mono font-bold pl-7 pr-3 py-2 rounded-xl border outline-none ${
                            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className={`text-[10px] ${textSecondary}`}>Updating batch monthly default fees will not affect existing historical entries.</span>
                  <button
                    onClick={handleSaveClassFees}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Batch Fees</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: FEE HEADS */}
            {settingsTab === 'heads' && (
              <div className="space-y-4">
                {/* Add New Head Form */}
                <form onSubmit={handleAddHead} className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                  <span className="block font-bold text-[10px] uppercase text-blue-600 tracking-wider">➕ Create New Custom Fee Head</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className={`block font-bold mb-1 ${textSecondary}`}>Fee Head Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sports Fee"
                        value={newHeadName}
                        onChange={e => setNewHeadName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 outline-none font-semibold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className={`block font-bold mb-1 ${textSecondary}`}>Default Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={newHeadAmount}
                        onChange={e => setNewHeadAmount(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 outline-none font-semibold font-mono text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> {loadingAction ? 'Adding...' : 'Add Fee Head'}
                  </button>
                </form>

                {/* List of Heads */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  <span className="block font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-2">Configure Existing Heads</span>
                  
                  {feeHeads.map(head => {
                    const isEditing = editingHeadId === head.id
                    return (
                      <div key={head.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-4">
                            <input
                              type="text"
                              required
                              value={editHeadName}
                              disabled={head.is_system}
                              onChange={e => setEditHeadName(e.target.value)}
                              className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 font-semibold"
                            />
                            <input
                              type="number"
                              required
                              value={editHeadAmount}
                              onChange={e => setEditHeadAmount(e.target.value)}
                              className="w-20 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 font-semibold font-mono"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className={textPrimary}>{head.name}</strong>
                              {head.is_system && (
                                <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">System</span>
                              )}
                            </div>
                            <div className={`text-[10px] ${textSecondary} mt-0.5 font-mono`}>Default: ₹{head.default_amount}</div>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEditHead(head.id)}
                                className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingHeadId(null)}
                                className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEditHead(head)}
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-500 rounded-lg transition cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {!head.is_system && (
                                <button
                                  onClick={() => handleDeleteHead(head.id, head.name)}
                                  className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => { setIsSettingsModalOpen(false); loadAllAdminData(); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition cursor-pointer"
              >
                Close &amp; Sync
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW LEDGER & RECEIPT MODAL FORM */}
      {viewLedgerModal.isOpen && viewLedgerModal.student && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn overflow-y-auto">
          <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto`}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-extrabold text-lg">📄</div>
                <div>
                  <h3 className={`text-base font-extrabold ${textPrimary}`}>Student Fee Ledger &amp; Receipt View</h3>
                  <p className={`text-xs ${textSecondary}`}>Itemized statement for <strong>{viewLedgerModal.month}</strong></p>
                </div>
              </div>
              <button onClick={() => setViewLedgerModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Student Name</span>
                <span className={`text-xs font-bold ${textPrimary} mt-0.5 block`}>{viewLedgerModal.student.full_name}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Admission ID</span>
                <span className="text-xs font-mono font-bold text-blue-500 mt-0.5 block">{viewLedgerModal.student.admission_id}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Assigned Batch</span>
                <span className={`text-xs font-bold ${textPrimary} mt-0.5 block`}>{viewLedgerModal.student.batch_name || 'General'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">Parent Phone</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{viewLedgerModal.student.parent_phone || 'N/A'}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 font-extrabold text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Date / Month</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 text-right">Discount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Paid (₹)</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                  {viewLedgerModal.feeRecords.length > 0 ? (
                    viewLedgerModal.feeRecords.map((f: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{f.collection_date || f.paid_date || viewLedgerModal.month}</td>
                        <td className="py-2.5 px-3">
                          <div className={`font-bold ${textPrimary}`}>{f.title || f.fee_head || 'Monthly Fee'}</div>
                          {f.receipt_no && <div className="text-[10px] text-slate-400 font-mono">RCPT: {f.receipt_no}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">₹{Number(f.amount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">- ₹{Number(f.discount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-600">₹{Number(f.amount_paid || f.net_amount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          {(() => {
                            const isRowPaid = f.status === 'paid' || (Number(f.amount_paid || 0) + Number(f.discount || 0) >= Number(f.amount || f.net_amount || 0) && Number(f.amount || 0) > 0);
                            const isRowPartial = !isRowPaid && Number(f.amount_paid || 0) > 0;
                            const rowStatusLabel = isRowPaid ? 'paid' : isRowPartial ? 'partial' : 'due';
                            return (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                isRowPaid ? 'bg-emerald-500/10 text-emerald-600' : isRowPartial ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {rowStatusLabel}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 px-3 font-mono text-slate-500">{viewLedgerModal.month}</td>
                      <td className="py-3 px-3 font-bold">Monthly Fee</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">₹{Number(viewLedgerModal.student.total_fee || 3500).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-amber-600">₹0</td>
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">₹{Number(viewLedgerModal.student.amount_paid || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600">
                          {viewLedgerModal.student.amount_paid >= (viewLedgerModal.student.total_fee || 3500) ? 'PAID' : 'DUE'}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewLedgerModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadLedgerPDF(viewLedgerModal.student, viewLedgerModal.feeRecords, viewLedgerModal.month)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download / Save PDF
              </button>
              <button
                type="button"
                onClick={() => printLedgerDocument(viewLedgerModal.student, viewLedgerModal.feeRecords, viewLedgerModal.month)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>🖨️ Print Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
