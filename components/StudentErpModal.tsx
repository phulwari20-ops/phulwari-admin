'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { X, IndianRupee, FileText, Users, Key, Download, Trash2, UserX, Pencil, Layers, Save, Plus, ArrowRight } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

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
  feeHeads: any[]
  loadAllAdminData: () => Promise<void>
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

const MONTHS_LIST = [
  'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
  'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026',
  'January 2027', 'February 2027', 'March 2027'
]

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
  setCategories,
  feeHeads,
  loadAllAdminData
}: StudentErpModalProps) {
  
  const [erpModalTab, setErpModalTab] = useState<'collect_fee' | 'fee_history' | 'profile' | 'edit_details' | 'manage_batch' | 'password'>('collect_fee')

  // Local editable copy for the "Edit Details" tab.
  const [editForm, setEditForm] = useState<any>({})
  const [dobInput, setDobInput] = useState('')
  const [batchSelect, setBatchSelect] = useState<string>('')

  // Multi-item transaction builder states
  const [transactionItems, setTransactionItems] = useState<Array<{
    id: string
    fee_head: string
    month: string
    custom_head_name: string
    amount: number
    discount: number
  }>>([
    { id: '1', fee_head: 'Monthly Fee', month: 'January 2027', custom_head_name: '', amount: 3500, discount: 0 }
  ])
  const [paymentMode, setPaymentMode] = useState('UPI / Online')
  const [amountCollected, setAmountCollected] = useState('')
  const [receiptNo, setReceiptNo] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  // Initialize and update form fields on open
  useEffect(() => {
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
      const defaultAmount = student.total_fee ? Number(student.total_fee) : (batchObj ? Number(batchObj.fee_amount) : 3500);

      // Default receipt number
      setReceiptNo(`REC-2027-${Math.floor(10000 + Math.random() * 90000)}`)
      setPaymentMode(student.payment_mode || 'UPI / Online')
      
      // Default to one Monthly Fee item
      setTransactionItems([
        { id: '1', fee_head: 'Monthly Fee', month: 'January 2027', custom_head_name: '', amount: defaultAmount, discount: 0 }
      ])
      setAmountCollected(String(defaultAmount))
    }
  }, [student?.id, isOpen])

  const additionalBatches: any[] = Array.isArray(student?.additional_batches)
    ? student.additional_batches
    : (() => { try { return JSON.parse(student?.additional_batches || '[]') } catch { return [] } })()

  // Auto calculate transaction sums
  const calculatedTotals = useMemo(() => {
    let totalOrig = 0
    let totalNet = 0
    transactionItems.forEach(item => {
      totalOrig += Number(item.amount || 0)
      const net = Math.max(0, Number(item.amount || 0) - Number(item.discount || 0))
      totalNet += net
    })
    return {
      original: totalOrig,
      net: totalNet
    }
  }, [transactionItems])

  if (!isOpen || !student) return null

  const inputCls = `w-full border rounded-xl px-3 py-2 font-semibold outline-none text-xs ${
    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
  }`

  // Handlers for adding/removing items in transaction builder
  const handleAddTransactionItem = () => {
    setTransactionItems(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        fee_head: 'Other',
        month: '',
        custom_head_name: '',
        amount: 500,
        discount: 0
      }
    ])
  }

  const handleRemoveTransactionItem = (id: string) => {
    if (transactionItems.length === 1) return
    setTransactionItems(prev => prev.filter(item => item.id !== id))
  }

  const handleItemFieldChange = (id: string, field: string, val: any) => {
    setTransactionItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: val }

      // If head changes, update default amount from configured feeHeads
      if (field === 'fee_head') {
        if (val === 'Monthly Fee') {
          const batchObj = allAvailableBatches.find(b => b.id === student.batch_id);
          updated.amount = batchObj ? Number(batchObj.fee_amount) : 3500
          updated.month = 'January 2027'
        } else if (val === 'Registration Fee') {
          updated.amount = 1000
          updated.month = ''
        } else {
          const matchedHead = feeHeads.find(h => h.name === val)
          updated.amount = matchedHead ? Number(matchedHead.default_amount) : 500
          updated.month = ''
        }
      }
      return updated
    }))
  }

  // Duplicate Check & Transaction Submission
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSubmit(true)

    // 1. Validate Duplicate Monthly Payments
    for (const item of transactionItems) {
      if (item.fee_head === 'Monthly Fee') {
        const alreadyPaid = fees.some(f => 
          (f.student_id === student.id || f.students?.admission_id === student.admission_id) &&
          f.month === item.month &&
          f.status === 'paid'
        )
        if (alreadyPaid) {
          alert(`⚠️ Warning: Selected month (${item.month}) fee already paid for this student!`)
          setLoadingSubmit(false)
          return
        }
      }
    }

    // 2. Build insertion payload for each item
    const collectedAmt = parseFloat(amountCollected) || 0
    let remainingPaidPool = collectedAmt
    const finalInsertedItems: any[] = []

    const supabase = createClient()
    const rNo = receiptNo.trim() || `REC-2027-${Math.floor(10000 + Math.random() * 90000)}`

    for (let i = 0; i < transactionItems.length; i++) {
      const item = transactionItems[i]
      const origAmt = Number(item.amount || 0)
      const discAmt = Number(item.discount || 0)
      const netAmt = Math.max(0, origAmt - discAmt)

      // Allocate payment pool sequentially
      let itemPaid = 0
      let itemStatus: 'paid' | 'partial' | 'pending' = 'pending'

      if (remainingPaidPool >= netAmt) {
        itemPaid = netAmt
        remainingPaidPool -= netAmt
        itemStatus = 'paid'
      } else if (remainingPaidPool > 0) {
        itemPaid = remainingPaidPool
        remainingPaidPool = 0
        itemStatus = 'partial'
      } else {
        itemPaid = 0
        itemStatus = 'pending'
      }

      const itemPending = Math.max(0, netAmt - itemPaid)
      const titleText = item.fee_head === 'Other' && item.custom_head_name
        ? item.custom_head_name
        : item.fee_head === 'Monthly Fee'
          ? `Monthly Fee (${item.month})`
          : item.fee_head

      const dbRow = {
        id: `fee-${Date.now()}-${i}-${Math.floor(Math.random() * 100)}`,
        student_id: student.id,
        title: titleText,
        amount: origAmt,
        discount_type: 'flat',
        discount: discAmt,
        net_amount: netAmt,
        due_date: new Date().toISOString().split('T')[0],
        status: itemStatus,
        payment_method: itemPaid > 0 ? paymentMode : null,
        paid_date: itemPaid > 0 ? new Date().toISOString().split('T')[0] : null,
        receipt_no: rNo,
        month: item.fee_head === 'Monthly Fee' ? item.month : null,
        amount_paid: itemPaid,
        pending_amount: itemPending
      }

      try {
        const { error } = await supabase.from('fees').insert([dbRow])
        if (error) throw error
        finalInsertedItems.push(dbRow)
      } catch (err: any) {
        console.error('Failed to save fee row:', err)
      }
    }

    // 3. Update parent/student table defaults for receipt display
    try {
      const totalFee = calculatedTotals.net
      await supabase.from('students').update({
        amount_paid: collectedAmt,
        total_fee: totalFee,
        payment_mode: paymentMode,
        payment_for: transactionItems.map(item => item.fee_head).join(', ')
      }).eq('id', student.id)
    } catch (_) {}

    // Reload layout and close or print
    alert('✅ Transaction submitted successfully!')
    await loadAllAdminData()
    setLoadingSubmit(false)
    setErpModalTab('fee_history')
  }

  // Unified Print Receipt function
  const handlePrintTransactionReceipt = (matchReceiptNo: string) => {
    // Find all items sharing the same receipt number
    const receiptItems = fees.filter(f => 
      f.receipt_no === matchReceiptNo && 
      (f.student_id === student.id || f.students?.admission_id === student.admission_id)
    )

    const printableList = receiptItems.length > 0 ? receiptItems : [
      {
        title: 'Monthly Activity Fee',
        amount: 3500,
        discount: 0,
        net_amount: 3500,
        status: 'pending',
        payment_method: 'UPI / Online',
        receipt_no: matchReceiptNo,
        paid_date: new Date().toLocaleDateString(),
        amount_paid: 0,
        pending_amount: 3500
      }
    ]

    const firstItem = printableList[0]
    const totalOrig = printableList.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const totalDisc = printableList.reduce((sum, item) => sum + Number(item.discount || 0), 0)
    const totalNet = printableList.reduce((sum, item) => sum + Number(item.net_amount || 0), 0)
    const totalPaid = printableList.reduce((sum, item) => sum + Number(item.amount_paid || item.net_amount || 0), 0)
    const totalPending = printableList.reduce((sum, item) => sum + Number(item.pending_amount || 0), 0)

    const pdfWin = window.open('', '_blank', 'width=850,height=1100')
    if (pdfWin) {
      pdfWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fee Receipt - ${matchReceiptNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1e293b; padding: 32px; }
            .header { border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .org { font-size: 18px; font-weight: 900; color: #1e40af; }
            .receipt-no { font-size: 12px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
            .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
            .info-value { font-size: 13px; font-weight: 700; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            thead tr { background: #1e40af; color: #fff; }
            th { padding: 10px 14px; font-size: 11px; font-weight: 700; text-align: left; }
            td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            .amount { text-align: right; font-weight: 700; font-family: monospace; }
            .total-row { background: #f0fdf4; font-weight: 900; color: #16a34a; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-20deg); font-size: 90px; font-weight: 900; color: rgba(0,0,0,0.04); pointer-events: none; white-space: nowrap; }
            @media print { @page { size: A4; margin: 15mm; } }
          </style>
        </head>
        <body>
          <div class="watermark">PHULWARI PAID</div>
          <div class="header">
            <div>
              <div class="org">🌸 Phulwari Mother & Child Activity Centre</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px;">M/32, Road No. 25, Sri Krishna Nagar, Patna — 800001</div>
            </div>
            <div class="receipt-no">Receipt: ${matchReceiptNo}</div>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <div class="info-label">Student Name</div>
              <div class="info-value">${student.full_name}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Admission ID</div>
              <div class="info-value">${student.admission_id}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Payment Method</div>
              <div class="info-value">${firstItem.payment_method || 'UPI / Online'}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Date Paid</div>
              <div class="info-value">${firstItem.paid_date || new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align:right;">Original Fee</th>
                <th style="text-align:right;">Discount</th>
                <th style="text-align:right;">Paid Amount</th>
                <th style="text-align:right;">Pending Due</th>
              </tr>
            </thead>
            <tbody>
              ${printableList.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td class="amount">₹${Number(item.amount).toFixed(2)}</td>
                  <td class="amount" style="color:#d97706;">- ₹${Number(item.discount).toFixed(2)}</td>
                  <td class="amount" style="color:#16a34a;">₹${Number(item.amount_paid || item.net_amount || 0).toFixed(2)}</td>
                  <td class="amount" style="color:#dc2626;">₹${Number(item.pending_amount || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>TOTAL SUMMARY</td>
                <td class="amount">₹${totalOrig.toFixed(2)}</td>
                <td class="amount">- ₹${totalDisc.toFixed(2)}</td>
                <td class="amount">₹${totalPaid.toFixed(2)}</td>
                <td class="amount" style="color:#dc2626;">₹${totalPending.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div>
              <div style="font-weight:700;color:#1e293b;">Verified & Generated via Phulwari ERP</div>
              <div>Computer generated receipt. No signature required.</div>
            </div>
            <div style="text-align:right;border-top:1px solid #94a3b8;padding-top:8px;width:160px;">
              <div style="font-weight:700;color:#1e40af;">Authorized Signatory</div>
              <div>Phulwari Management</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 2000);
            }
          <\/script>
        </body>
        </html>
      `)
      pdfWin.document.close()
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto relative`}>
        
        {/* Header */}
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
            <button
              onClick={() => handlePrintRegistrationForm(student)}
              className="px-3 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
              title="Print Registration Form"
            >
              <span>📥 Print Reg Form</span>
            </button>

            {student.status !== 'deactivated' && (
              <button
                onClick={() => handleDeactivateStudent(student.id)}
                className="px-3 py-1.5 bg-amber-600/10 text-amber-500 border border-amber-500/20 hover:bg-amber-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                title="Deactivate Student"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Deactivate</span>
              </button>
            )}

            {adminRole === 'Admin' && (
              <button
                onClick={() => handleDeleteStudent(student.id)}
                className="px-3 py-1.5 bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                title="Delete Student Record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
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
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  active ? 'bg-blue-600 text-white shadow-md' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── TAB: COLLECT FEE (ITEMIZED TRANSACTION BUILDER) ── */}
        {erpModalTab === 'collect_fee' && (
          <form onSubmit={handleTransactionSubmit} className="space-y-4 text-xs">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${tipBannerBg}`}>
              <span>💸 Record payments for dynamic fee heads. Click <strong>+ Add Item</strong> to combine multiple heads.</span>
              <button
                type="button"
                onClick={handleAddTransactionItem}
                className="px-2.5 py-1 bg-blue-600 text-white font-extrabold rounded-lg hover:bg-blue-700 transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            {/* List of items */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {transactionItems.map((item, index) => (
                <div key={item.id} className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase text-blue-600`}>Item #{index + 1}</span>
                    {transactionItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTransactionItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 font-extrabold text-[10px] uppercase"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className={`block font-bold mb-1 ${textSecondary}`}>Fee Head</label>
                      <select
                        value={item.fee_head}
                        onChange={e => handleItemFieldChange(item.id, 'fee_head', e.target.value)}
                        className={inputCls}
                      >
                        <option value="Monthly Fee">Monthly Fee</option>
                        <option value="Registration Fee">Registration Fee</option>
                        {feeHeads.filter(h => !h.is_system).map(h => (
                          <option key={h.id} value={h.name}>{h.name}</option>
                        ))}
                        <option value="Other">Other Custom Fee</option>
                      </select>
                    </div>

                    {item.fee_head === 'Monthly Fee' && (
                      <div>
                        <label className={`block font-bold mb-1 ${textSecondary}`}>Select Month</label>
                        <select
                          value={item.month}
                          onChange={e => handleItemFieldChange(item.id, 'month', e.target.value)}
                          className={inputCls}
                        >
                          {MONTHS_LIST.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {item.fee_head === 'Other' && (
                      <div>
                        <label className={`block font-bold mb-1 ${textSecondary}`}>Fee Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Activity Fee"
                          value={item.custom_head_name}
                          onChange={e => handleItemFieldChange(item.id, 'custom_head_name', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    )}

                    <div>
                      <label className={`block font-bold mb-1 ${textSecondary}`}>Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={item.amount}
                        onChange={e => handleItemFieldChange(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-600 mb-1">Discount (₹)</label>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={e => handleItemFieldChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Transaction Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-500/5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className={inputCls}>
                  <option value="UPI / Online">UPI / Online</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="NetBanking">NetBanking</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Receipt No.</label>
                <input
                  type="text"
                  required
                  value={receiptNo}
                  onChange={e => setReceiptNo(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-600 mb-1">Total Amount Collected (₹)</label>
                <input
                  type="number"
                  required
                  value={amountCollected}
                  onChange={e => setAmountCollected(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 font-mono font-extrabold text-xs bg-emerald-50 border-emerald-300 text-emerald-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="p-4 rounded-2xl border border-emerald-200/40 bg-emerald-500/5 grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-[9px] font-bold text-slate-500">ORIGINAL TOTAL</div>
                <div className="text-xs font-black font-mono text-slate-800 dark:text-slate-200">₹{calculatedTotals.original.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-amber-600">DISCOUNT TOTAL</div>
                <div className="text-xs font-black font-mono text-amber-700 dark:text-amber-400">₹{(calculatedTotals.original - calculatedTotals.net).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-emerald-600">NET DUE</div>
                <div className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400">₹{calculatedTotals.net.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-rose-600">PENDING BALANCE</div>
                <div className="text-xs font-black font-mono text-rose-700 dark:text-rose-400">
                  ₹{Math.max(0, calculatedTotals.net - (parseFloat(amountCollected) || 0)).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loadingSubmit}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                {loadingSubmit ? 'Submitting...' : 'Collect Fee & Generate Receipt'}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB: MONTHLY FEE LEDGER & AUDIT TRAIL ── */}
        {erpModalTab === 'fee_history' && (
          <div className="space-y-5 text-xs max-h-[60vh] overflow-y-auto pr-1">
            
            {/* Month-wise status tracker */}
            <div>
              <span className="block font-black text-[10px] uppercase text-slate-400 tracking-wider mb-2">Month-Wise Fee Status</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MONTHS_LIST.map(mName => {
                  const matchFees = fees.filter(f => 
                    (f.student_id === student.id || f.students?.admission_id === student.admission_id) && 
                    (f.month === mName || f.title?.includes(mName))
                  )

                  const isPaid = matchFees.length > 0 && matchFees.every(f => f.status === 'paid')
                  const isPartial = matchFees.length > 0 && !isPaid && matchFees.some(f => f.status === 'paid' || f.status === 'partial')

                  return (
                    <div
                      key={mName}
                      className={`p-2 rounded-xl border text-center transition ${
                        isPaid 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                          : isPartial 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400' 
                            : 'bg-rose-500/5 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-[10px] truncate">{mName}</div>
                      <div className="text-[9px] font-extrabold uppercase mt-0.5">
                        {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Due'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Complete Transaction Audit Table */}
            <div>
              <span className="block font-black text-[10px] uppercase text-slate-400 tracking-wider mb-2">Ledger Transaction Audit Trail</span>
              
              {(() => {
                const studentFees = fees.filter(f => f.student_id === student.id || f.students?.admission_id === student.admission_id)
                if (studentFees.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 font-bold border border-dashed rounded-2xl">
                      No transactions recorded in fee ledger yet.
                    </div>
                  )
                }

                // Group by receipt number to show dynamic transaction cards
                const groupedMap = new Map<string, any[]>()
                studentFees.forEach(f => {
                  const key = f.receipt_no || 'NO-RECEIPT'
                  if (!groupedMap.has(key)) groupedMap.set(key, [])
                  groupedMap.get(key)!.push(f)
                })

                return (
                  <div className="space-y-3">
                    {Array.from(groupedMap.entries()).map(([rNo, items]) => {
                      const totalPaid = items.reduce((sum, it) => sum + Number(it.amount_paid || it.net_amount || 0), 0)
                      const totalPending = items.reduce((sum, it) => sum + Number(it.pending_amount || 0), 0)
                      const datePaid = items[0].paid_date || items[0].created_at || '—'
                      const isFullyPaid = totalPending === 0

                      return (
                        <div key={rNo} className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 ${bgSubCard} flex items-center justify-between gap-4`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                {rNo}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                isFullyPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {isFullyPaid ? 'PAID' : 'PENDING'}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1 pl-1">
                              {items.map((it, idx) => (
                                <div key={idx} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                  <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                                  <span>{it.title}:</span>
                                  <strong className={textPrimary}>₹{it.net_amount}</strong>
                                  <span className="text-[10px]">
                                    (Paid: ₹{it.amount_paid || 0} | Status: {it.status})
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold font-mono mt-2">
                              Paid: {new Date(datePaid).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Mode: {items[0].payment_method || 'UPI'}
                            </p>
                          </div>

                          <button
                            onClick={() => handlePrintTransactionReceipt(rNo)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ── TAB: STUDENT PROFILE ── */}
        {erpModalTab === 'profile' && (
          <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {(() => {
              const studentFees = fees.filter((f: any) => f.student_id === student.id || f.students?.admission_id === student.admission_id)
              const collected = studentFees.reduce((sum, f) => sum + Number(f.amount_paid || f.net_amount || 0), 0)
              const totalFee = studentFees.reduce((sum, f) => sum + Number(f.net_amount || f.amount || 0), 0)
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
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <h4 className="font-bold text-pink-600 uppercase tracking-wider text-[10px] border-b pb-1">Child Details</h4>
                <p><strong className={textSecondary}>Full Name:</strong> {student.full_name}</p>
                <p><strong className={textSecondary}>Admission ID:</strong> {student.admission_id}</p>
                <p><strong className={textSecondary}>Date of Birth:</strong> {student.dob || 'N/A'}</p>
                <p><strong className={textSecondary}>Gender:</strong> {student.gender || 'N/A'}</p>
                <p><strong className={textSecondary}>Blood Group:</strong> {student.blood_group || 'N/A'}</p>
                <p><strong className={textSecondary}>Address:</strong> {student.address || 'N/A'}</p>
                <p><strong className={textSecondary}>Password:</strong> <span className={`font-mono font-bold border px-2 py-0.5 rounded ${badgePassword}`}>{student.password}</span></p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <h4 className="font-bold text-purple-600 uppercase tracking-wider text-[10px] border-b pb-1">Parent Details</h4>
                <p><strong className={textSecondary}>Parent Name:</strong> {student.parent_name}</p>
                <p><strong className={textSecondary}>Relationship:</strong> {student.parent_relationship || 'Father'}</p>
                <p><strong className={textSecondary}>Contact Phone:</strong> {student.parent_phone}</p>
                <p><strong className={textSecondary}>Email:</strong> {student.parent_email || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: EDIT DETAILS ── */}
        {erpModalTab === 'edit_details' && (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const dbDob = parseDateToDb(dobInput)
            const payload = { ...editForm, dob: dbDob }
            const ok = await handleUpdateStudent(student.id, payload)
            if (ok) onClose()
          }} className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`font-bold ${textSecondary}`}>Child Full Name</label>
                <input type="text" required value={editForm.full_name || ''} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Date of Birth (DD/MM/YYYY)</label>
                <input type="text" required placeholder="e.g. 01/01/2021" value={dobInput} onChange={(e) => setDobInput(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Parent Full Name</label>
                <input type="text" required value={editForm.parent_name || ''} onChange={(e) => setEditForm({ ...editForm, parent_name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Parent Relationship</label>
                <select value={editForm.parent_relationship || 'Father'} onChange={(e) => setEditForm({ ...editForm, parent_relationship: e.target.value })} className={inputCls}>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Contact Phone</label>
                <input type="text" required value={editForm.parent_phone || ''} onChange={(e) => setEditForm({ ...editForm, parent_phone: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Parent Email</label>
                <input type="email" value={editForm.parent_email || ''} onChange={(e) => setEditForm({ ...editForm, parent_email: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`font-bold ${textSecondary}`}>Total Monthly Allowed Classes</label>
                <input type="number" required value={editForm.classes_total || 12} onChange={(e) => setEditForm({ ...editForm, classes_total: parseInt(e.target.value) || 12 })} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Consumed Classes</label>
                <input type="number" required value={editForm.classes_consumed !== undefined ? editForm.classes_consumed : 0} onChange={(e) => setEditForm({ ...editForm, classes_consumed: parseInt(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className={`font-bold ${textSecondary}`}>Validity End Date</label>
                <input type="date" required value={editForm.validity_end_date || ''} onChange={(e) => setEditForm({ ...editForm, validity_end_date: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-1.5"><Save className="w-4 h-4" /> Save Details</button>
            </div>
          </form>
        )}

        {/* ── TAB: MANAGE BATCH ── */}
        {erpModalTab === 'manage_batch' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
              ⚙️ Switch the student's primary batch, or assign additional batches.
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Primary Batch</label>
                <div className="flex items-center gap-2">
                  <select
                    value={batchSelect || student.batch_id}
                    onChange={e => setBatchSelect(e.target.value)}
                    className={inputCls}
                  >
                    {allAvailableBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_name}</option>
                    ))}
                  </select>
                  <button
                    onClick={async () => {
                      const ok = await handleUpdateStudentBatch(student.id, 'change', batchSelect)
                      if (ok) onClose()
                    }}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl whitespace-nowrap"
                  >
                    Change Batch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: RESET PASSWORD ── */}
        {erpModalTab === 'password' && (
          <form onSubmit={handleERPPasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className={`block font-bold mb-1 ${textSecondary}`}>Enter New Password</label>
              <input
                type="text"
                required
                value={erpPassword}
                onChange={e => setErpPassword(e.target.value)}
                placeholder="Enter new portal password"
                className={inputCls}
              />
            </div>
            {erpPasswordMsg && (
              <p className="text-[11px] font-bold text-emerald-600">{erpPasswordMsg}</p>
            )}
            <div className="flex justify-end gap-2">
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Update Password</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
