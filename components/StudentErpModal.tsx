'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { X, IndianRupee, FileText, Users, Key, Download, Trash2, UserX, Pencil, Layers, Save, Plus, ArrowRight, CalendarDays, MessageSquare } from 'lucide-react'
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
  attendance: any[]
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
  handleUpdateStudentBatch: (studentId: string, mode: 'change' | 'add' | 'remove', batchId: string, reason?: string, changeDate?: string) => Promise<boolean>
  categories: any[]
  setCategories: (val: any) => void
  feeHeads: any[]
  loadAllAdminData: () => Promise<void>
}

const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  let str = String(dateStr).trim();
  if (str.includes('T')) {
    str = str.split('T')[0];
  } else if (str.includes(' ')) {
    str = str.split(' ')[0];
  }
  if (str.includes('/')) return str;
  const parts = str.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y.length === 4) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
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

const generateCandidateMonths = (): string[] => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const result: string[] = []
  const now = new Date()
  const currentYear = now.getFullYear()
  for (let y = currentYear; y <= currentYear + 1; y++) {
    for (let m = 0; m < 12; m++) {
      result.push(`${monthNames[m]} ${y}`)
    }
  }
  return result
}

const MONTHS_LIST = generateCandidateMonths()

const getAvailableFeeMonths = (studentFees: any[] = [], studentObj: any = null): string[] => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const now = new Date()
  const currentMonthIdx = now.getMonth()
  const currentYear = now.getFullYear()

  // 1. Determine admission start threshold (month and year)
  let admYear = currentYear
  let admMonthIdx = currentMonthIdx

  const admRaw = studentObj?.admission_date || studentObj?.created_at || studentObj?.plan_start_date
  if (admRaw) {
    let str = String(admRaw).trim()
    if (str.includes('T')) str = str.split('T')[0]
    if (str.includes(' ')) str = str.split(' ')[0]
    
    if (str.includes('/')) {
      const parts = str.split('/')
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          admYear = parseInt(parts[0], 10)
          admMonthIdx = Math.max(0, parseInt(parts[1], 10) - 1)
        } else {
          admYear = parseInt(parts[2], 10)
          admMonthIdx = Math.max(0, parseInt(parts[1], 10) - 1)
        }
      }
    } else if (str.includes('-')) {
      const parts = str.split('-')
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          admYear = parseInt(parts[0], 10)
          admMonthIdx = Math.max(0, parseInt(parts[1], 10) - 1)
        } else {
          admYear = parseInt(parts[2], 10)
          admMonthIdx = Math.max(0, parseInt(parts[1], 10) - 1)
        }
      }
    } else {
      const parsedD = new Date(admRaw)
      if (!isNaN(parsedD.getTime())) {
        admYear = parsedD.getFullYear()
        admMonthIdx = parsedD.getMonth()
      }
    }
  }

  // 2. Generate candidate months starting from Admission Month/Year
  const candidate: string[] = []
  const maxYear = Math.max(currentYear + 1, admYear + 1)

  for (let y = admYear; y <= maxYear; y++) {
    const startM = (y === admYear) ? admMonthIdx : 0
    for (let m = startM; m < 12; m++) {
      candidate.push(`${monthNames[m]} ${y}`)
    }
  }

  // 3. Identify all months paid/cleared for this specific student
  const studentPaidMonths = new Set<string>()
  ;(studentFees || []).forEach((f: any) => {
    const isPaid = f.status === 'paid' || f.status === 'collected' || Number(f.paid_amount || 0) >= Number(f.total_fee || f.net_amount || 1)
    if (isPaid) {
      if (f.collected_for) studentPaidMonths.add(f.collected_for.trim())
      if (f.month) studentPaidMonths.add(f.month.trim())
      if (f.fee_month) studentPaidMonths.add(f.fee_month.trim())
      if (f.title) {
        const match = f.title.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i)
        if (match) {
          studentPaidMonths.add(match[0].trim())
        }
      }
    }
  })

  // 4. Filter out paid months
  const available = candidate.filter(mStr => !studentPaidMonths.has(mStr))

  return available.length > 0 ? available : candidate
}

const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
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
  attendance,
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
  
  const [erpModalTab, setErpModalTab] = useState<'collect_fee' | 'fee_history' | 'profile' | 'attendance_calendar' | 'edit_details' | 'manage_batch' | 'password'>('collect_fee')

  // Local editable copy for the "Edit Details" tab.
  const [editForm, setEditForm] = useState<any>({})
  const [dobInput, setDobInput] = useState('')
  const [batchSelect, setBatchSelect] = useState<string>('')
  const [changeReason, setChangeReason] = useState('General Change')
  const [changeDate, setChangeDate] = useState(new Date().toISOString().split('T')[0])
  const [additionalBatchSelect, setAdditionalBatchSelect] = useState('')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())

  // ─── Image Upload State ───────────────────────────────────────────────────
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // ─── Fee Row State ────────────────────────────────────────────────────────
  interface FeeRow {
    id: string; fee_head: string; custom_head_name: string; collected_for: string
    total_fee: number; discount: number; paid_amount: number; collection_date: string
    mode_of_payment: string; transaction_id: string
    due_amount: number; status: 'paid' | 'partial' | 'due'
  }

  const computeRow = (r: Omit<FeeRow,'due_amount'|'status'>): FeeRow => {
    const due = Math.max(0, r.total_fee - r.discount - r.paid_amount)
    return { ...r, due_amount: due, status: due === 0 ? 'paid' : r.paid_amount > 0 ? 'partial' : 'due' }
  }

  const buildInitialRows = useCallback((): FeeRow[] => {
    const studentPaidFees = (fees || []).filter(f => 
      f.student_id === student?.id || 
      f.admission_id === student?.admission_id ||
      f.students?.admission_id === student?.admission_id ||
      (f.student_name && student?.full_name && String(f.student_name).toLowerCase() === String(student.full_name).toLowerCase())
    )
    const availMonths = getAvailableFeeMonths(studentPaidFees, student)
    const defaultUpcomingMonth = availMonths[0] || 'September 2026'

    const systemHeads = [
      { name: 'Registration Fee', default_amount: 1000 },
      { name: 'Monthly Fee',      default_amount: 3500 },
    ]
    return systemHeads.map((h, i) => {
      const isMonthly = h.name === 'Monthly Fee'
      const batchObj = allAvailableBatches?.find(b => b.id === student?.batch_id)
      const defaultAmt = isMonthly && batchObj?.fee_amount ? Number(batchObj.fee_amount) : Number(h.default_amount || 0)
      return computeRow({
        id: `row-init-${i}`, fee_head: h.name, custom_head_name: '', 
        collected_for: isMonthly ? defaultUpcomingMonth : 'One Time',
        total_fee: defaultAmt, discount: 0, paid_amount: 0, 
        collection_date: new Date().toISOString().split('T')[0],
        mode_of_payment: '', transaction_id: ''
      })
    })
  }, [feeHeads, allAvailableBatches, student?.batch_id, fees, student?.id])

  const [feeRows, setFeeRows] = useState<FeeRow[]>([])
  const [collectionType, setCollectionType] = useState('Multiple Fee Collection')
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0])
  const [planValidityEnd, setPlanValidityEnd] = useState('')
  const [globalPaymentMode, setGlobalPaymentMode] = useState('Cash')
  const [globalTransactionId, setGlobalTransactionId] = useState('')
  const [globalRemarks, setGlobalRemarks] = useState('')
  const [receiptNo, setReceiptNo] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [expandedFeeHead, setExpandedFeeHead] = useState<string | null>(null)

  // Money Input Edit Modal State
  const [amountEditModal, setAmountEditModal] = useState<{
    isOpen: boolean
    rowId: string
    field: 'total_fee' | 'discount' | 'paid_amount'
    title: string
    tempValue: string
  }>({
    isOpen: false,
    rowId: '',
    field: 'paid_amount',
    title: '',
    tempValue: ''
  })

  // legacy - keep for batch compatibility
  const [paymentMode, setPaymentMode] = useState('UPI / Online')
  const [amountCollected, setAmountCollected] = useState('')

  // ERP Manual Schedule Entry state
  const [erpManualSchDay, setErpManualSchDay] = useState('Monday')
  const [erpManualSchClass, setErpManualSchClass] = useState('Gymnastics')
  const [erpManualSchStart, setErpManualSchStart] = useState('05:00 PM')
  const [erpManualSchEnd, setErpManualSchEnd] = useState('06:00 PM')

  // Saved Receipt Modal State (Pops up immediately after saving fee)
  const [savedReceiptModal, setSavedReceiptModal] = useState<{
    isOpen: boolean
    receiptNo: string
    totalPaid: number
    totalDue: number
    feeItems: any[]
    student: any | null
    date: string
    paymentMode: string
    txnId: string
    remarks: string
  }>({
    isOpen: false,
    receiptNo: '',
    totalPaid: 0,
    totalDue: 0,
    feeItems: [],
    student: null,
    date: '',
    paymentMode: '',
    txnId: '',
    remarks: ''
  })

  // ─── Initialize on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (student && isOpen) {
      const studentCustSchedules = (studentCustomSchedules || []).filter(sch => sch.student_id === student.id);
      setEditForm({
        full_name: student.full_name || '',
        print_date: student.print_date || new Date().toISOString().split('T')[0],
        plan_start_date: student.plan_start_date || '',
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
        hospital_preference: student.hospital_preference || '',
        doctor_name: student.doctor_name || '',
        doctor_phone: student.doctor_phone || '',
        classes_total: student.classes_total !== undefined ? student.classes_total : 12,
        classes_consumed: student.classes_consumed !== undefined ? student.classes_consumed : 0,
        validity_end_date: student.validity_end_date || '',
        password: student.password || '',
        category: student.category || 'Child Activity',
        batch_id: student.batch_id || '',
        batch_name: student.batch_name || '',
        program_interested: student.program_interested || '',
        preferred_time_slot: student.preferred_time_slot || '',
        custom_days: student.custom_days || '',
        custom_schedules: studentCustSchedules
      })
      setDobInput(formatDateToDisplay(student.dob || ''));
      setPhotoPreview(student.photo_url || null)
      const batchObj = allAvailableBatches?.find(b => b.id === student.batch_id);
      const defaultAmount = student.total_fee ? Number(student.total_fee) : (batchObj ? Number(batchObj.fee_amount) : 3500);
      setReceiptNo(`RCPt26-27/${Math.floor(10000 + Math.random() * 90000).toString().padStart(5,'0')}`)
      setPaymentMode(student.payment_mode || 'UPI / Online')
      setFeeRows(buildInitialRows())
      setAmountCollected(String(defaultAmount))
      setGlobalPaymentMode('Cash')
      setGlobalTransactionId('')
      setGlobalRemarks('')
    }
  }, [student?.id, isOpen])

  // ─── Fee Row Calculations ─────────────────────────────────────────────────
  const feeCalc = useMemo(() => {
    const totalFee      = feeRows.reduce((s, r) => s + r.total_fee, 0)
    const totalDiscount = feeRows.reduce((s, r) => s + r.discount, 0)
    const totalPaid     = feeRows.reduce((s, r) => s + r.paid_amount, 0)
    const totalDue      = feeRows.reduce((s, r) => s + r.due_amount, 0)
    return { totalFee, totalDiscount, totalPaid, totalDue }
  }, [feeRows])

  // keep legacy calc for other tabs
  const calculatedTotals = useMemo(() => {
    const studentFees = fees.filter(f => f.student_id === student?.id || f.students?.admission_id === student?.admission_id)
    const original = studentFees.reduce((s, f) => s + Number(f.amount || 0), 0)
    const net = studentFees.reduce((s, f) => s + Number(f.net_amount || f.amount || 0), 0)
    return { original, net }
  }, [fees, student?.id])

  // ─── Amount in Words helper ───────────────────────────────────────────────
  const amountToWords = (n: number): string => {
    if (n === 0) return 'Zero Rupees Only'
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
    const toWords = (num: number): string => {
      if (num < 20) return ones[num]
      if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '')
      if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred' + (num%100 ? ' '+toWords(num%100) : '')
      if (num < 100000) return toWords(Math.floor(num/1000)) + ' Thousand' + (num%1000 ? ' '+toWords(num%1000) : '')
      return toWords(Math.floor(num/100000)) + ' Lakh' + (num%100000 ? ' '+toWords(num%100000) : '')
    }
    return toWords(n) + ' Rupees Only'
  }

  // ─── Fee Row Handlers ─────────────────────────────────────────────────────
  const updateFeeRow = (id: string, field: keyof FeeRow, val: any) => {
    setFeeRows(prev => prev.map(r => r.id !== id ? r : computeRow({ ...r, [field]: val })))
  }

  const addFeeRow = () => {
    setFeeRows(prev => [...prev, computeRow({
      id: `row-${Date.now()}`, fee_head: 'Other', custom_head_name: '', collected_for: 'One Time',
      total_fee: 0, discount: 0, paid_amount: 0,
      collection_date: new Date().toISOString().split('T')[0],
      mode_of_payment: '', transaction_id: ''
    })])
  }

  const removeFeeRow = (id: string) => {
    setFeeRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)
  }

  // ─── Photo Upload (any format → WebP) ─────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width; canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const previewUrl = canvas.toDataURL('image/webp', 0.85)
      setPhotoPreview(previewUrl)
      canvas.toBlob(async (blob) => {
        if (!blob) return
        setPhotoUploading(true)
        try {
          const supabase = createClient()
          const fileName = `student-${student.id}-${Date.now()}.webp`
          const { error: upErr } = await supabase.storage.from('student-photos')
            .upload(fileName, blob, { contentType: 'image/webp', upsert: true })
          if (!upErr) {
            const { data: urlData } = supabase.storage.from('student-photos').getPublicUrl(fileName)
            await supabase.from('students').update({ photo_url: urlData.publicUrl }).eq('id', student.id)
            await loadAllAdminData()
          }
        } catch(err) { console.error('Photo upload failed', err) }
        setPhotoUploading(false)
      }, 'image/webp', 0.85)
      URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl
  }

  // ─── Fee Submit ───────────────────────────────────────────────────────────
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSubmit(true)
    const supabase = createClient()
    const rNo = receiptNo.trim() || `RCPt26-27/${Math.floor(10000+Math.random()*90000).toString().padStart(5,'0')}`
    const today = collectionDate || new Date().toISOString().split('T')[0]

    for (let i = 0; i < feeRows.length; i++) {
      const row = feeRows[i]
      if (row.paid_amount === 0 && row.due_amount === 0) continue // skip empty
      const titleText = row.fee_head === 'Other' && row.custom_head_name 
        ? row.custom_head_name 
        : row.fee_head === 'Monthly Fee' 
          ? `Monthly Fee (${row.collected_for})`
          : row.fee_head
      const dbRow = {
        id: generateUUID(),
        student_id: student.id,
        title: titleText,
        fee_head: row.fee_head === 'Other' ? (row.custom_head_name || 'Other') : row.fee_head,
        collected_for: row.collected_for,
        amount: row.total_fee,
        discount_type: 'flat',
        discount: row.discount,
        net_amount: Math.max(0, row.total_fee - row.discount),
        due_date: today,
        collection_date: today,
        status: row.status === 'due' ? 'pending' : row.status,
        payment_method: row.paid_amount > 0 ? (row.mode_of_payment || globalPaymentMode) : null,
        mode_of_payment: row.mode_of_payment || globalPaymentMode,
        paid_date: row.paid_amount > 0 ? today : null,
        receipt_no: rNo,
        month: row.fee_head === 'Monthly Fee' ? row.collected_for : null,
        amount_paid: row.paid_amount,
        pending_amount: row.due_amount,
        transaction_id: row.transaction_id || globalTransactionId || null,
        collection_time: new Date().toISOString(),
        remarks: globalRemarks || null,
        plan_validity_end: planValidityEnd || null,
        collection_type: collectionType
      }
      try {
        const { error } = await supabase.from('fees').insert([dbRow])
        if (error) console.error('Fee insert error:', error)
      } catch(err) { console.error('Fee save failed:', err) }
    }

    // Update student summary
    try {
      await supabase.from('students').update({
        amount_paid: feeCalc.totalPaid,
        total_fee: feeCalc.totalFee,
        payment_mode: globalPaymentMode,
        payment_for: feeRows.map(r => r.fee_head).join(', ')
      }).eq('id', student.id)
    } catch(_) {}

    await loadAllAdminData()
    setLoadingSubmit(false)
    setSavedReceiptModal({
      isOpen: true,
      receiptNo: rNo,
      totalPaid: feeCalc.totalPaid,
      totalDue: feeCalc.totalDue,
      feeItems: [...feeRows],
      student: student,
      date: today,
      paymentMode: globalPaymentMode,
      txnId: globalTransactionId,
      remarks: globalRemarks
    })
  }




  const additionalBatches: any[] = Array.isArray(student?.additional_batches)
    ? student.additional_batches
    : (() => { try { return JSON.parse(student?.additional_batches || '[]') } catch { return [] } })()


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
    const totalPending = Math.max(0, totalOrig - totalDisc - totalPaid)

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
              ${printableList.map(item => {
                const itemOrig = Number(item.amount || 0);
                const itemDisc = Number(item.discount || 0);
                const itemPaid = Number(item.amount_paid || item.net_amount || 0);
                const itemPending = Math.max(0, itemOrig - itemDisc - itemPaid);
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: #0f172a;">${item.title}</div>
                      ${item.transaction_id ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px;">⚡ Ref ID: ${item.transaction_id}</div>` : ''}
                      ${item.collection_time ? `<div style="font-size: 9px; color: #64748b;">📅 Date/Time: ${item.collection_time.includes('T') ? formatDateToDisplay(item.collection_time.split('T')[0]) + ' ' + item.collection_time.split('T')[1] : formatDateToDisplay(item.collection_time)}</div>` : ''}
                      ${item.remarks ? `<div style="font-size: 9px; color: #64748b; font-style: italic;">📌 Notes: ${item.remarks}</div>` : ''}
                    </td>
                    <td class="amount">₹${itemOrig.toFixed(2)}</td>
                    <td class="amount" style="color:#d97706;">- ₹${itemDisc.toFixed(2)}</td>
                    <td class="amount" style="color:#16a34a;">₹${itemPaid.toFixed(2)}</td>
                    <td class="amount" style="color:${itemPending === 0 ? '#16a34a' : '#dc2626'};">₹${itemPending.toFixed(2)}</td>
                  </tr>
                `
              }).join('')}
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

  if (!isOpen || !student) return null

  const inputCls = `w-full border rounded-xl px-3 py-2 font-semibold outline-none text-xs ${
    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
  }`

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className={`${bgCard} rounded-3xl p-6 max-w-5xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto relative`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>{student.full_name}</h3>
              <p className="text-xs text-blue-500 font-mono font-bold">
                Admission ID: {student.admission_id} | Class: {student.batch_name || 'Unassigned'}
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
            { id: 'attendance_calendar', label: 'Attendance Calendar', icon: CalendarDays },
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

            {/* ── Section Header ── */}
            <div className="flex items-center justify-between">
              <h4 className="font-black text-[11px] uppercase tracking-wider text-emerald-600">5. Payment Details &amp; Initial Fee Collection</h4>
              <button type="button" onClick={addFeeRow}
                className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 text-[10px]">
                <Plus className="w-3 h-3" /> ADD FEE HEAD
              </button>
            </div>

            {/* ── Top Controls Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Select Collection Type</label>
                <select value={collectionType} onChange={e => setCollectionType(e.target.value)} className={inputCls}>
                  <option>Multiple Fee Collection</option>
                  <option>Single Fee Collection</option>
                </select>
              </div>
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Collection Date</label>
                <input type="date" value={collectionDate} onChange={e => setCollectionDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Receipt No.</label>
                <input type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Student Batch</label>
                <input type="text" readOnly
                  value={allAvailableBatches?.find(b => b.id === student.batch_id)?.name || student.class_name || 'General'}
                  className={`${inputCls} opacity-70 cursor-not-allowed`} />
              </div>
            </div>

            {/* ── Fee Head Wise Collection Details Table ── */}
            <div>
              <p className="font-black text-[10px] uppercase tracking-wider mb-2 text-blue-600">Fee Head Wise Collection Details</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-[10px] border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-emerald-600 text-white">
                      {['Fee Head','Collected For (Month/Year)','Total Fee (₹)','Discount (₹)','Collected/Paid Amount (₹)','Collection Date','Remaining/Due Amount (₹)','Status','Mode of Payment','Payment Reference / Transaction ID',''].map((h,i) => (
                        <th key={i} className="px-2 py-2 text-left font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feeRows.map((row, idx) => (
                      <tr key={row.id} className={`border-b border-slate-100 dark:border-slate-800 ${idx%2===0?(isLight?'bg-white':'bg-slate-950'):(isLight?'bg-slate-50':'bg-slate-900')}`}>
                        {/* Fee Head */}
                        <td className="px-2 py-1.5">
                          {row.fee_head === 'Other'
                            ? <input type="text" placeholder="Custom fee name" value={row.custom_head_name}
                                onChange={e => updateFeeRow(row.id,'custom_head_name',e.target.value)}
                                className={`${inputCls} w-28`} />
                            : <div className="flex flex-col gap-0.5">
                                <span className="font-bold">{row.fee_head}</span>
                                {row.fee_head !== 'Other' && (
                                  <select value={row.fee_head} onChange={e => {
                                    const h = feeHeads.find((f:any)=>f.name===e.target.value)
                                    updateFeeRow(row.id,'fee_head',e.target.value)
                                    if(h) updateFeeRow(row.id,'total_fee',Number(h.default_amount||0))
                                  }} className={`${inputCls} text-[9px] py-0.5`}>
                                    <option value="Registration Fee">Registration Fee</option>
                                    <option value="Monthly Fee">Monthly Fee</option>
                                    {(feeHeads||[]).filter((h:any)=>!['Registration Fee','Monthly Fee'].includes(h.name)).map((h:any)=>(
                                      <option key={h.id} value={h.name}>{h.name}</option>
                                    ))}
                                    <option value="Other">Other (Custom)</option>
                                  </select>
                                )}
                              </div>
                          }
                        </td>
                        {/* Collected For */}
                        <td className="px-2 py-1.5">
                          {row.fee_head === 'Monthly Fee'
                            ? <select value={row.collected_for} onChange={e=>updateFeeRow(row.id,'collected_for',e.target.value)} className={`${inputCls} w-28`}>
                                {(() => {
                                  const studentPaidFees = (fees || []).filter(f => 
                                    f.student_id === student?.id || 
                                    f.admission_id === student?.admission_id ||
                                    f.students?.admission_id === student?.admission_id ||
                                    (f.student_name && student?.full_name && String(f.student_name).toLowerCase() === String(student.full_name).toLowerCase())
                                  )
                                  const availMonths = getAvailableFeeMonths(studentPaidFees, student)
                                  const optionsList = Array.from(new Set([row.collected_for, ...availMonths])).filter(Boolean)
                                  return optionsList.map(m=><option key={m}>{m}</option>)
                                })()}
                              </select>
                            : <span className="text-slate-500 font-semibold">One Time</span>
                          }
                        </td>
                        {/* Total Fee */}
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => setAmountEditModal({
                              isOpen: true,
                              rowId: row.id,
                              field: 'total_fee',
                              title: `Edit Total Fee (${row.fee_head === 'Other' ? (row.custom_head_name || 'Custom') : row.fee_head})`,
                              tempValue: String(row.total_fee || 0)
                            })}
                            className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono font-bold hover:border-blue-500 cursor-pointer shadow-xs text-xs"
                          >
                            ₹{row.total_fee.toLocaleString()}
                          </button>
                        </td>
                        {/* Discount */}
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => setAmountEditModal({
                              isOpen: true,
                              rowId: row.id,
                              field: 'discount',
                              title: `Edit Discount (${row.fee_head === 'Other' ? (row.custom_head_name || 'Custom') : row.fee_head})`,
                              tempValue: String(row.discount || 0)
                            })}
                            className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono font-bold hover:border-blue-500 cursor-pointer shadow-xs text-xs text-amber-600"
                          >
                            ₹{row.discount.toLocaleString()}
                          </button>
                        </td>
                        {/* Paid Amount */}
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => setAmountEditModal({
                              isOpen: true,
                              rowId: row.id,
                              field: 'paid_amount',
                              title: `Edit Collected/Paid Amount (${row.fee_head === 'Other' ? (row.custom_head_name || 'Custom') : row.fee_head})`,
                              tempValue: String(row.paid_amount || 0)
                            })}
                            className="w-24 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 rounded-lg text-right font-mono font-bold hover:border-emerald-500 cursor-pointer shadow-xs text-xs"
                          >
                            ₹{row.paid_amount.toLocaleString()}
                          </button>
                        </td>
                        {/* Collection Date */}
                        <td className="px-2 py-1.5">
                          <input type="date" value={row.collection_date}
                            onChange={e=>updateFeeRow(row.id,'collection_date',e.target.value)}
                            className={`${inputCls} w-28`} />
                        </td>
                        {/* Due Amount - read only, auto calculated */}
                        <td className="px-2 py-1.5 text-right font-mono font-extrabold">
                          <span className={row.due_amount>0?'text-rose-600':'text-emerald-600'}>
                            {row.due_amount.toLocaleString('en-IN')}
                          </span>
                        </td>
                        {/* Status Badge */}
                        <td className="px-2 py-1.5">
                          {row.status==='paid' && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-extrabold text-[9px]">Paid</span>}
                          {row.status==='partial' && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-extrabold text-[9px]">Partial</span>}
                          {row.status==='due' && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-extrabold text-[9px]">Due</span>}
                        </td>
                        {/* Mode of Payment */}
                        <td className="px-2 py-1.5">
                          <select value={row.mode_of_payment} onChange={e=>updateFeeRow(row.id,'mode_of_payment',e.target.value)} className={`${inputCls} w-24`}>
                            <option value="">Select</option>
                            <option>Cash</option><option>UPI</option>
                            <option>Bank Transfer</option><option>Card</option><option>Other</option>
                          </select>
                        </td>
                        {/* Transaction ID */}
                        <td className="px-2 py-1.5">
                          <input type="text" value={row.transaction_id} placeholder={row.mode_of_payment==='Cash'?'NA':'Enter reference id'}
                            onChange={e=>updateFeeRow(row.id,'transaction_id',e.target.value)}
                            className={`${inputCls} w-28`} />
                        </td>
                        {/* Delete */}
                        <td className="px-2 py-1.5">
                          <button type="button" onClick={()=>removeFeeRow(row.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <button type="button" onClick={addFeeRow}
                  className="text-emerald-600 font-bold text-[10px] hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Another Fee Head
                </button>
                <p className="text-[9px] text-slate-400 font-semibold">
                  Note: Remaining/Due Amount = Total Fee − Discount − Collected Amount &nbsp;
                  <span className="text-emerald-600">● Paid</span> &nbsp;
                  <span className="text-amber-600">● Partial</span> &nbsp;
                  <span className="text-rose-600">● Due</span>
                </p>
              </div>
            </div>

            {/* ── Payment Summary ── */}
            <div className={`rounded-2xl border p-4 ${isLight?'bg-slate-50 border-slate-200':'bg-slate-900 border-slate-800'}`}>
              <p className="font-black text-[10px] uppercase tracking-wider mb-3 text-slate-500">Payment Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className={`p-3 rounded-xl border ${isLight?'bg-white border-slate-200':'bg-slate-950 border-slate-700'}`}>
                  <div className="text-[9px] font-bold text-slate-500 mb-1">Total Fee Amount (₹)</div>
                  <div className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-100">{feeCalc.totalFee.toLocaleString('en-IN')}</div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight?'bg-amber-50 border-amber-200':'bg-amber-950/30 border-amber-900'}`}>
                  <div className="text-[9px] font-bold text-amber-600 mb-1">Total Discount Amount (₹)</div>
                  <div className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-400">{feeCalc.totalDiscount.toLocaleString('en-IN')}</div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight?'bg-emerald-50 border-emerald-200':'bg-emerald-950/30 border-emerald-900'}`}>
                  <div className="text-[9px] font-bold text-emerald-600 mb-1">Total Fee Collected / Paid (₹)</div>
                  <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-400">{feeCalc.totalPaid.toLocaleString('en-IN')}</div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight?'bg-rose-50 border-rose-200':'bg-rose-950/30 border-rose-900'}`}>
                  <div className="text-[9px] font-bold text-rose-600 mb-1">Total Fee Pending / Due (₹)</div>
                  <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-400">{feeCalc.totalDue.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-2 text-center">
                Amount in Words: <strong className={textPrimary}>{amountToWords(feeCalc.totalPaid)}</strong>
              </p>
            </div>

            {/* ── Payment Details ── */}
            <div className={`rounded-2xl border p-4 space-y-3 ${isLight?'bg-slate-50 border-slate-200':'bg-slate-900 border-slate-800'}`}>
              <p className="font-black text-[10px] uppercase tracking-wider text-slate-500">Payment Details</p>
              <div className="flex flex-wrap gap-4">
                <label className="font-bold text-[10px] text-slate-600 mb-1 block">Mode of Payment *</label>
                <div className="flex flex-wrap gap-3">
                  {['Cash','UPI','Bank Transfer','Cheque','Other'].map(m=>(
                    <label key={m} className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold">
                      <input type="radio" name="globalMode" value={m} checked={globalPaymentMode===m}
                        onChange={()=>setGlobalPaymentMode(m)} className="accent-emerald-600" />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-emerald-600 mb-1">Net Amount Paid (₹)</label>
                  <input type="number" readOnly value={feeCalc.totalPaid}
                    className="w-full border rounded-xl px-3 py-2 font-mono font-extrabold text-xs bg-emerald-50 border-emerald-300 text-emerald-800 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-rose-600 mb-1">Total Pending / Due (₹)</label>
                  <input type="number" readOnly value={feeCalc.totalDue}
                    className="w-full border rounded-xl px-3 py-2 font-mono font-extrabold text-xs bg-rose-50 border-rose-300 text-rose-800 focus:outline-none" />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Payment Reference / Transaction ID</label>
                  <input type="text" value={globalTransactionId} onChange={e=>setGlobalTransactionId(e.target.value)}
                    placeholder="UPI ref / Txn ID / Cheque No." className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Remarks (if any)</label>
                  <textarea value={globalRemarks} onChange={e=>setGlobalRemarks(e.target.value)}
                    rows={2} placeholder="Any additional notes or remarks"
                    className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Plan Validity End Date</label>
                  <input type="date" value={planValidityEnd} onChange={e=>setPlanValidityEnd(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Collection History (Fee Head Wise) ── */}
            {(() => {
              const studentFees = fees.filter((f:any) => f.student_id===student.id || f.students?.admission_id===student.admission_id)
              if (studentFees.length === 0) return null
              const headMap = new Map<string,any[]>()
              studentFees.forEach((f:any) => {
                const k = f.fee_head || f.title || 'Other'
                if(!headMap.has(k)) headMap.set(k,[])
                headMap.get(k)!.push(f)
              })
              return (
                <div>
                  <p className="font-black text-[10px] uppercase tracking-wider mb-2 text-slate-500">Collection History (Fee Head Wise)</p>
                  <div className="space-y-2">
                    {Array.from(headMap.entries()).map(([head, items]) => {
                      const totalFeeH = items.reduce((s,f)=>s+Number(f.amount||0),0)
                      const discH = items.reduce((s,f)=>s+Number(f.discount||0),0)
                      const paidH = items.reduce((s,f)=>s+Number(f.amount_paid||0),0)
                      const dueH = Math.max(0, totalFeeH - discH - paidH)
                      const isExpanded = expandedFeeHead === head
                      return (
                        <div key={head} className={`rounded-xl border overflow-hidden ${isLight?'border-slate-200':'border-slate-700'}`}>
                          <button type="button"
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left ${isLight?'bg-slate-100 hover:bg-slate-200':'bg-slate-800 hover:bg-slate-700'} transition`}
                            onClick={()=>setExpandedFeeHead(isExpanded?null:head)}>
                            <span className="font-bold">
                              {isExpanded?'▼':'▶'} {head} — Total Fee: ₹{totalFeeH.toLocaleString('en-IN')} | Discount: ₹{discH}
                            </span>
                            <span className={dueH===0?'text-emerald-600 font-extrabold text-[10px]':'text-rose-600 font-extrabold text-[10px]'}>
                              {dueH===0?'Paid':`Due: ₹${dueH.toLocaleString('en-IN')}`}
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-[10px]">
                                <thead>
                                  <tr className={isLight?'bg-slate-50':'bg-slate-900'}>
                                    {['#','Amount Paid (₹)','Collection Date','Mode of Payment','Payment Ref / Txn ID','Collected For Month','Receipt No.'].map(h=>(
                                      <th key={h} className={`px-3 py-2 text-left font-bold ${textSecondary}`}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((f:any,i:number)=>(
                                    <tr key={f.id||i} className={`border-t ${isLight?'border-slate-100':'border-slate-800'}`}>
                                      <td className="px-3 py-2 font-mono">{i+1}</td>
                                      <td className="px-3 py-2 font-mono font-extrabold text-emerald-600">₹{Number(f.amount_paid||0).toLocaleString('en-IN')}</td>
                                      <td className="px-3 py-2">{f.collection_date||f.paid_date||'—'}</td>
                                      <td className="px-3 py-2">{f.mode_of_payment||f.payment_method||'—'}</td>
                                      <td className="px-3 py-2 font-mono text-blue-600">{f.transaction_id||'NA'}</td>
                                      <td className="px-3 py-2">{f.collected_for||f.month||'One Time'}</td>
                                      <td className="px-3 py-2 font-mono text-[9px]">{f.receipt_no||'—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className={`flex items-center justify-between px-4 py-2 text-[10px] font-bold ${isLight?'bg-emerald-50':'bg-emerald-950/30'}`}>
                                <span>Total Paid: <strong className="text-emerald-600">₹{paidH.toLocaleString('en-IN')}</strong></span>
                                <span className={dueH>0?'text-rose-600':'text-emerald-600'}>
                                  Remaining / Due: ₹{dueH.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* ── Buttons ── */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition">
                Cancel
              </button>
              <button type="submit" disabled={loadingSubmit}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer">
                <Save className="w-3.5 h-3.5" />
                {loadingSubmit ? 'Saving...' : '💾 Save & Generate Receipt'}
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
                  const matchFees = (fees || []).filter(f => 
                    (f.student_id === student?.id || f.admission_id === student?.admission_id || f.students?.admission_id === student?.admission_id || (f.student_name && student?.full_name && String(f.student_name).toLowerCase() === String(student.full_name).toLowerCase())) && 
                    (f.month === mName || f.collected_for === mName || f.fee_month === mName || (f.title && f.title.includes(mName)))
                  )

                  const isPaid = matchFees.length > 0 && matchFees.every(f => f.status === 'paid' || f.status === 'collected' || Number(f.paid_amount || 0) >= Number(f.total_fee || f.net_amount || 1))
                  const isPartial = matchFees.length > 0 && !isPaid && matchFees.some(f => f.status === 'paid' || f.status === 'partial' || Number(f.paid_amount || 0) > 0)

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
                const studentFees = (fees || []).filter(f => 
                  f.student_id === student?.id || 
                  f.admission_id === student?.admission_id ||
                  f.students?.admission_id === student?.admission_id ||
                  (f.student_name && student?.full_name && String(f.student_name).toLowerCase() === String(student.full_name).toLowerCase())
                )
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
                            <p className="text-[10px] text-slate-400 font-semibold font-mono mt-2 flex flex-wrap gap-x-2">
                              <span>Paid: {formatDateToDisplay(datePaid)}</span>
                              <span>| Mode: {items[0].payment_method || 'UPI'}</span>
                              {items[0].transaction_id && <span>| Ref: {items[0].transaction_id}</span>}
                              {items[0].remarks && <span>| Remarks: {items[0].remarks}</span>}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePrintTransactionReceipt(rNo)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title="Print / Save Receipt PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const phone = (student.parent_phone || '').replace(/[^0-9]/g, '')
                                const text = `Dear Parent,\nThank you for your payment to Phulwari Mother & Child Activity Centre!\n\nReceipt No: ${rNo}\nStudent: ${student.full_name} (${student.admission_id})\nAmount Paid: Rs. ${totalPaid}\nRemaining Balance: Rs. ${totalPending}\n\nView Centre Details: https://phulwari.co.in`
                                window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(text)}`, '_blank')
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Share Receipt on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Share
                            </button>
                          </div>
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
              {/* Section 1: Child Details */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-pink-600 uppercase tracking-wider text-[10px]">1. Child Details</h4>
                  <button onClick={() => setErpModalTab('edit_details')} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5">✏️ Edit</button>
                </div>
                <p><strong className={textSecondary}>Full Name:</strong> {student.full_name}</p>
                <p><strong className={textSecondary}>Admission ID:</strong> {student.admission_id}</p>
                <p><strong className={textSecondary}>Date of Birth:</strong> {formatDateToDisplay(student.dob) || 'N/A'}</p>
                <p><strong className={textSecondary}>Gender:</strong> {student.gender || 'N/A'}</p>
                <p><strong className={textSecondary}>Blood Group:</strong> {student.blood_group || 'N/A'}</p>
                <p><strong className={textSecondary}>Address:</strong> {student.address || 'N/A'}</p>
                <p><strong className={textSecondary}>City/State/PIN:</strong> {student.city || 'Patna'}, {student.state || 'Bihar'} - {student.pin_code || '800001'}</p>
              </div>

              {/* Section 2: Parent Details */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-purple-600 uppercase tracking-wider text-[10px]">2. Parent / Guardian Details</h4>
                  <button onClick={() => setErpModalTab('edit_details')} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5">✏️ Edit</button>
                </div>
                <p><strong className={textSecondary}>Parent Name:</strong> {student.parent_name}</p>
                <p><strong className={textSecondary}>Relationship:</strong> {student.parent_relationship || 'Father'}</p>
                <p><strong className={textSecondary}>Contact Phone:</strong> {student.parent_phone}</p>
                <p><strong className={textSecondary}>Alternate Phone:</strong> {student.parent_alt_phone || 'N/A'}</p>
                <p><strong className={textSecondary}>Email:</strong> {student.parent_email || 'N/A'}</p>
                <p><strong className={textSecondary}>Occupation:</strong> {student.parent_occupation || 'N/A'}</p>
              </div>

              {/* Section 3: Emergency Contacts */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-amber-600 uppercase tracking-wider text-[10px]">3. Emergency Contacts</h4>
                  <button onClick={() => setErpModalTab('edit_details')} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5">✏️ Edit</button>
                </div>
                <p><strong className={textSecondary}>Emergency Name:</strong> {student.emergency_contact_name || 'N/A'}</p>
                <p><strong className={textSecondary}>Relationship:</strong> {student.emergency_relationship || 'N/A'}</p>
                <p><strong className={textSecondary}>Emergency Phone:</strong> {student.emergency_phone || 'N/A'}</p>
                <p><strong className={textSecondary}>Alternate Phone:</strong> {student.emergency_alt_phone || 'N/A'}</p>
              </div>

              {/* Section 4: Program Details */}
              <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-green-600 uppercase tracking-wider text-[10px]">4. Program & Validity</h4>
                  <button onClick={() => setErpModalTab('edit_details')} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5">✏️ Edit</button>
                </div>
                <p><strong className={textSecondary}>Batch Name:</strong> {student.batch_name || 'N/A'}</p>
                <p><strong className={textSecondary}>Monthly Allowed Classes:</strong> {student.classes_total || 12}</p>
                <p><strong className={textSecondary}>Consumed Classes:</strong> {student.classes_consumed || 0}</p>
                <p><strong className={textSecondary}>Validity End Date:</strong> {formatDateToDisplay(student.validity_end_date) || 'N/A'}</p>
              </div>

              {/* Section 5: Medical Details */}
              <div className={`p-4 rounded-2xl border col-span-1 md:col-span-2 space-y-2 ${bgSubCard}`}>
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-cyan-600 uppercase tracking-wider text-[10px]">5. Medical Details & Consent</h4>
                  <button onClick={() => setErpModalTab('edit_details')} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5">✏️ Edit</button>
                </div>
                <p><strong className={textSecondary}>Has Medical Condition / Allergies?</strong> {student.has_medical_condition ? 'Yes' : 'No'}</p>
                {student.has_medical_condition && <p><strong className={textSecondary}>Condition Details:</strong> {student.medical_condition_details}</p>}
                <p><strong className={textSecondary}>Regular Medication:</strong> {student.regular_medication || 'N/A'}</p>
                <p><strong className={textSecondary}>Preferred Hospital:</strong> {student.hospital_preference || 'N/A'}</p>
                <p><strong className={textSecondary}>Doctor Details:</strong> {student.doctor_name || 'N/A'} (Phone: {student.doctor_phone || 'N/A'})</p>
              </div>

              {/* Section 6: Portal Access Credentials */}
              <div className={`p-4 rounded-2xl border col-span-1 md:col-span-2 space-y-2 ${bgSubCard}`}>
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">6. Portal Access Credentials</h4>
                  <button onClick={() => setErpModalTab('edit_details')} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5">✏️ Edit</button>
                </div>
                <p><strong className={textSecondary}>Login Username:</strong> <span className="font-mono font-bold text-blue-500">{student.admission_id}</span></p>
                <p><strong className={textSecondary}>Password:</strong> <span className={`font-mono font-bold border px-2 py-0.5 rounded ${badgePassword}`}>{student.password}</span></p>
              </div>

              {/* Additional Enrolled Batches */}
              {additionalBatches.length > 0 && (
                <div className={`p-4 rounded-2xl border col-span-1 md:col-span-2 space-y-2 ${bgSubCard}`}>
                  <h4 className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] border-b pb-1">Additional Enrolled Batches</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {additionalBatches.map((b: any) => (
                      <div key={b.batch_id} className={`p-2.5 rounded-xl border flex items-center justify-between ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                        <div>
                          <span className={`font-bold ${textPrimary}`}>{b.batch_name}</span>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">Assigned: {formatDateToDisplay(b.added_on)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch History Timeline */}
              {(() => {
                const history = Array.isArray(student.batch_history)
                  ? student.batch_history
                  : (() => { try { return JSON.parse(student.batch_history || '[]') } catch { return [] } })()

                if (history.length === 0) return null

                return (
                  <div className={`p-4 rounded-2xl border col-span-1 md:col-span-2 space-y-2 ${bgSubCard}`}>
                    <h4 className="font-bold text-purple-600 uppercase tracking-wider text-[10px] border-b pb-1">Batch Change Logs History</h4>
                    <div className="relative border-l border-slate-200 dark:border-slate-850 pl-4 space-y-4 ml-2 mt-2">
                      {history.map((log: any, idx: number) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white dark:border-slate-950" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded">
                                {formatDateToDisplay(log.changed_at)}
                              </span>
                              <span className={`text-[10px] ${textSecondary}`}>
                                Changed from <strong className={textPrimary}>{log.from_batch_name}</strong> to <strong className={textPrimary}>{log.to_batch_name}</strong>
                              </span>
                            </div>
                            {log.reason && (
                              <p className="text-[10px] text-slate-400 font-medium italic mt-1 pl-1">Reason: {log.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ── TAB: ATTENDANCE CALENDAR ── */}
        {erpModalTab === 'attendance_calendar' && (
          <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
            {/* Header / Month selectors */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="font-extrabold text-sm text-slate-700 dark:text-slate-350">
                📅 {new Date(calYear, calMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCalMonth(prev => {
                      if (prev === 0) {
                        setCalYear(y => y - 1)
                        return 11
                      }
                      return prev - 1
                    })
                  }}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 font-bold"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={() => {
                    setCalMonth(prev => {
                      if (prev === 11) {
                        setCalYear(y => y + 1)
                        return 0
                      }
                      return prev + 1
                    })
                  }}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 font-bold"
                >
                  Next ▶
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            {(() => {
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
              const firstDayIndex = new Date(calYear, calMonth, 1).getDay()

              const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1)
              const blanksArr = Array.from({ length: firstDayIndex }, (_, i) => i)

              // Filter attendance records of this student for this month/year
              const studentAtts = attendance.filter(a => {
                if (a.student_id !== student.id && a.students?.admission_id !== student.admission_id) return false
                const [y, m, d] = a.date.split('-').map(Number)
                return y === calYear && m === (calMonth + 1)
              })

              const pCount = studentAtts.filter(a => a.status === 'present').length
              const aCount = studentAtts.filter(a => a.status === 'absent').length
              const hdCount = studentAtts.filter(a => a.status === 'halfday').length
              const lCount = studentAtts.filter(a => a.status === 'leave').length
              const hCount = studentAtts.filter(a => a.status === 'holiday').length

              return (
                <div className="space-y-4">
                  {/* Calendar Grid Box */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 bg-slate-500/5">
                    <div className="grid grid-cols-7 gap-2 text-center font-bold text-[10px] text-slate-400 mb-2">
                      <span>SUN</span>
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                      <span>SAT</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {blanksArr.map(b => (
                        <div key={`blank-${b}`} className="h-10" />
                      ))}

                      {daysArr.map(dayNum => {
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                        const dayAtts = studentAtts.filter(a => a.date === dateStr)

                        // Choose status: prioritize present, leave, etc.
                        let statusColor = 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
                        let statusText = ''
                        let remarksStr = ''

                        if (dayAtts.length > 0) {
                          const mainAtt = dayAtts[0]
                          remarksStr = mainAtt.remarks || ''
                          if (mainAtt.status === 'present') {
                            statusColor = 'bg-emerald-500 text-white font-black'
                            statusText = 'P'
                          } else if (mainAtt.status === 'absent') {
                            statusColor = 'bg-rose-500 text-white font-black'
                            statusText = 'A'
                          } else if (mainAtt.status === 'halfday') {
                            statusColor = 'bg-amber-500 text-white font-black'
                            statusText = 'HD'
                          } else if (mainAtt.status === 'leave') {
                            statusColor = 'bg-blue-600 text-white font-black'
                            statusText = 'L'
                            remarksStr = mainAtt.leave_reason ? `Leave: ${mainAtt.leave_reason}` : remarksStr
                          } else if (mainAtt.status === 'holiday') {
                            statusColor = 'bg-purple-600 text-white font-black'
                            statusText = 'H'
                            remarksStr = mainAtt.holiday_reason ? `Holiday: ${mainAtt.holiday_reason}` : remarksStr
                          }
                        }

                        return (
                          <div
                            key={`day-${dayNum}`}
                            className={`h-10 rounded-xl flex flex-col items-center justify-center relative border transition group hover:scale-[1.05] shadow-sm ${statusColor}`}
                            title={remarksStr ? `${remarksStr}` : `Date: ${dayNum}/${calMonth+1}/${calYear}`}
                          >
                            <span className="text-[10px] font-bold">{dayNum}</span>
                            {statusText && (
                              <span className="text-[8px] font-black uppercase opacity-90 mt-0.5">{statusText}</span>
                            )}

                            {/* Tooltip detail hover bubble */}
                            {remarksStr && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-950 text-white rounded-lg p-2 text-[9px] pointer-events-none opacity-0 group-hover:opacity-100 transition z-50 shadow-lg text-center leading-normal">
                                <div className="font-extrabold">{dayNum} {new Date(calYear, calMonth).toLocaleString('default', { month: 'short' })}</div>
                                <div className="mt-1 font-semibold text-slate-350">{remarksStr}</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
                      <div className="text-[18px] font-black">{pCount}</div>
                      <div className="text-[9px] font-bold uppercase mt-0.5">Present</div>
                    </div>
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl">
                      <div className="text-[18px] font-black">{aCount}</div>
                      <div className="text-[9px] font-bold uppercase mt-0.5">Absent</div>
                    </div>
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl">
                      <div className="text-[18px] font-black">{hdCount}</div>
                      <div className="text-[9px] font-bold uppercase mt-0.5">Half Day</div>
                    </div>
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl">
                      <div className="text-[18px] font-black">{lCount}</div>
                      <div className="text-[9px] font-bold uppercase mt-0.5">Leave</div>
                    </div>
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 rounded-xl">
                      <div className="text-[18px] font-black">{hCount}</div>
                      <div className="text-[9px] font-bold uppercase mt-0.5">Holiday</div>
                    </div>
                  </div>
                </div>
              )
            })()}
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
            {/* Section 1: Child Details */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-[10px] text-pink-650 uppercase tracking-wider pb-1 border-b">1. Child's Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Child Full Name</label>
                  <input type="text" required value={editForm.full_name || ''} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Date of Birth (DD/MM/YYYY)</label>
                  <input type="text" required placeholder="e.g. 01/01/2021" value={dobInput} onChange={(e) => setDobInput(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Gender</label>
                  <select value={editForm.gender || 'Boy'} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className={inputCls}>
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Blood Group</label>
                  <input type="text" placeholder="e.g. B+" value={editForm.blood_group || ''} onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={`font-bold ${textSecondary}`}>Address</label>
                  <input type="text" required value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>City</label>
                  <input type="text" value={editForm.city || 'Patna'} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>State</label>
                  <input type="text" value={editForm.state || 'Bihar'} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>PIN Code</label>
                  <input type="text" value={editForm.pin_code || '800001'} onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Section 2: Parent Details */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-[10px] text-purple-650 uppercase tracking-wider pb-1 border-b">2. Parent / Guardian Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Parent Full Name</label>
                  <input type="text" required value={editForm.parent_name || ''} onChange={(e) => setEditForm({ ...editForm, parent_name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Relationship</label>
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
                <div>
                  <label className={`font-bold ${textSecondary}`}>Alternate Phone</label>
                  <input type="text" value={editForm.parent_alt_phone || ''} onChange={(e) => setEditForm({ ...editForm, parent_alt_phone: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Occupation</label>
                  <input type="text" value={editForm.parent_occupation || ''} onChange={(e) => setEditForm({ ...editForm, parent_occupation: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-[10px] text-amber-655 uppercase tracking-wider pb-1 border-b">3. Emergency Contact Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Emergency Name</label>
                  <input type="text" value={editForm.emergency_contact_name || ''} onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Relationship</label>
                  <input type="text" placeholder="e.g. Uncle" value={editForm.emergency_relationship || ''} onChange={(e) => setEditForm({ ...editForm, emergency_relationship: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Emergency Phone</label>
                  <input type="text" value={editForm.emergency_phone || ''} onChange={(e) => setEditForm({ ...editForm, emergency_phone: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Alternate Phone</label>
                  <input type="text" value={editForm.emergency_alt_phone || ''} onChange={(e) => setEditForm({ ...editForm, emergency_alt_phone: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Section 4: Program & Batch Details */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-[10px] text-green-600 uppercase tracking-wider pb-1 border-b">4. Program &amp; Batch Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Category</label>
                  <select
                    value={editForm.category || 'Child Activity'}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Child Activity">Child Activity</option>
                    <option value="Zumba & Yoga">Zumba & Yoga</option>
                    <option value="Daycare">Daycare</option>
                    <option value="Events & Parties">Events & Parties</option>
                  </select>
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Primary Batch</label>
                  <select
                    value={editForm.batch_id || ''}
                    onChange={(e) => {
                      const selectedBt = allAvailableBatches?.find(b => b.id === e.target.value)
                      setEditForm({
                        ...editForm,
                        batch_id: e.target.value,
                        batch_name: selectedBt?.batch_name || editForm.batch_name
                      })
                    }}
                    className={inputCls}
                  >
                    <option value="">-- Select Batch --</option>
                    {allAvailableBatches?.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_name} ({b.age_group || '1-3 Yrs'})</option>
                    ))}
                    <option value="00000000-0000-0000-0000-000000000000" className="font-bold text-orange-600">
                      ⚙️ Customized Batch (Build Custom Schedule)
                    </option>
                  </select>
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Program Interested</label>
                  <input
                    type="text"
                    value={editForm.program_interested || ''}
                    onChange={(e) => setEditForm({ ...editForm, program_interested: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Preferred Time Slot</label>
                  <select
                    value={editForm.preferred_time_slot || 'Morning (9:00 AM - 12:00 PM)'}
                    onChange={(e) => setEditForm({ ...editForm, preferred_time_slot: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</option>
                    <option value="Evening (3:00 PM - 6:00 PM)">Evening (3:00 PM - 6:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Custom Days / Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Mon, Wed, Fri"
                    value={editForm.custom_days || ''}
                    onChange={(e) => setEditForm({ ...editForm, custom_days: e.target.value })}
                    className={inputCls}
                  />
                </div>

                {/* Select Attendance Days Checkboxes */}
                <div className="col-span-2 md:col-span-3">
                  <label className={`block font-bold mb-1.5 ${textSecondary}`}>Select Attendance Days (Custom Plan)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const isChecked = editForm.custom_days ? editForm.custom_days.split(', ').includes(day) : false
                      return (
                        <label key={day} className="flex items-center gap-1.5 font-semibold cursor-pointer p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-green-600 rounded"
                            checked={isChecked}
                            onChange={(e) => {
                              let days = editForm.custom_days ? editForm.custom_days.split(', ') : []
                              if (e.target.checked) days.push(day)
                              else days = days.filter((d: string) => d !== day)
                              const totalCls = days.length * 4
                              setEditForm({
                                ...editForm,
                                custom_days: days.join(', '),
                                classes_total: totalCls > 0 ? totalCls : 12
                              })
                            }}
                          />
                          <span>{day.slice(0,3)}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Program / Activity Interested Checkboxes */}
                <div className="col-span-2 md:col-span-3">
                  <label className={`block font-bold mb-1.5 ${textSecondary}`}>Program / Activity Interested In</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Playzone', 'Weekend Program', '3 Days Program', '5 Days Program', '6 Days Program', '7 Days Program', 'Mother Zumba'].map(prog => {
                      const isChecked = editForm.program_interested ? editForm.program_interested.split(', ').includes(prog) : false
                      return (
                        <label key={prog} className="flex items-center gap-1.5 font-semibold cursor-pointer p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-green-600 rounded"
                            checked={isChecked}
                            onChange={(e) => {
                              let progs = editForm.program_interested ? editForm.program_interested.split(', ') : []
                              if (e.target.checked) progs.push(prog)
                              else progs = progs.filter((p: string) => p !== prog)
                              setEditForm({
                                ...editForm,
                                program_interested: progs.join(', ')
                              })
                            }}
                          />
                          <span>{prog}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Customized Batch Builder in ERP Edit Details */}
                {editForm.batch_id === '00000000-0000-0000-0000-000000000000' && (
                  <div className="col-span-2 md:col-span-3 p-3.5 bg-gradient-to-br from-orange-50 to-amber-50/60 border border-orange-200/90 rounded-2xl space-y-3 shadow-xs mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span>⚙️</span> Customized Batch Schedule Builder
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">Manual Day, Time &amp; Class Builder</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Day of Week</label>
                        <select
                          value={erpManualSchDay}
                          onChange={(e) => setErpManualSchDay(e.target.value)}
                          className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-orange-500"
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Class / Activity</label>
                        <input
                          type="text"
                          placeholder="e.g. Gymnastics"
                          value={erpManualSchClass}
                          onChange={(e) => setErpManualSchClass(e.target.value)}
                          className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Start Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 05:00 PM"
                          value={erpManualSchStart}
                          onChange={(e) => setErpManualSchStart(e.target.value)}
                          className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none font-mono focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">End Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 06:00 PM"
                          value={erpManualSchEnd}
                          onChange={(e) => setErpManualSchEnd(e.target.value)}
                          className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none font-mono focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!erpManualSchClass.trim()) return;
                          const currentCustomSch = editForm.custom_schedules || [];
                          const updated = [
                            ...currentCustomSch,
                            {
                              day_of_week: erpManualSchDay,
                              class_name: erpManualSchClass.trim(),
                              start_time: erpManualSchStart.trim() || '05:00 PM',
                              end_time: erpManualSchEnd.trim() || '06:00 PM'
                            }
                          ];
                          const uniqueDays = Array.from(new Set(updated.map((s: any) => s.day_of_week))).join(', ');
                          setEditForm({
                            ...editForm,
                            custom_schedules: updated,
                            custom_days: uniqueDays,
                            classes_total: updated.length * 4
                          });
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition cursor-pointer"
                      >
                        <span>➕ Add Schedule Entry</span>
                      </button>
                    </div>

                    {/* Display configured custom entries */}
                    {(editForm.custom_schedules || []).length > 0 && (
                      <div className="pt-2 border-t border-orange-200/80 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-orange-700 tracking-wider">Configured Custom Entries ({(editForm.custom_schedules || []).length})</span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                          {(editForm.custom_schedules || []).map((sch: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-orange-200 text-[11px] font-semibold text-slate-700 shadow-xs">
                              <span className="font-bold text-orange-600">📅 {sch.day_of_week}</span>
                              <span>|</span>
                              <span>{sch.class_name}</span>
                              <span className="font-mono text-[10px] text-blue-500">({sch.start_time} - {sch.end_time})</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editForm.custom_schedules || []).filter((_: any, i: number) => i !== idx);
                                  const uniqueDays = Array.from(new Set(updated.map((s: any) => s.day_of_week))).join(', ');
                                  setEditForm({
                                    ...editForm,
                                    custom_schedules: updated,
                                    custom_days: uniqueDays,
                                    classes_total: updated.length * 4
                                  });
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className={`font-bold ${textSecondary}`}>Registration Date</label>
                  <input type="date" required value={editForm.print_date || ''} onChange={(e) => setEditForm({ ...editForm, print_date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Validity Start Date</label>
                  <input type="date" value={editForm.plan_start_date || ''} onChange={(e) => setEditForm({ ...editForm, plan_start_date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Validity End Date</label>
                  <input type="date" required value={editForm.validity_end_date || ''} onChange={(e) => setEditForm({ ...editForm, validity_end_date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Total Allowed Classes</label>
                  <input type="number" required value={editForm.classes_total || 12} onChange={(e) => setEditForm({ ...editForm, classes_total: parseInt(e.target.value) || 12 })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Consumed Classes</label>
                  <input type="number" required value={editForm.classes_consumed !== undefined ? editForm.classes_consumed : 0} onChange={(e) => setEditForm({ ...editForm, classes_consumed: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Section 5: Medical Details */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-[10px] text-cyan-600 uppercase tracking-wider pb-1 border-b">5. Medical Details</h4>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="edit_has_medical" checked={editForm.has_medical_condition || false} onChange={(e) => setEditForm({ ...editForm, has_medical_condition: e.target.checked })} className="rounded text-blue-650" />
                <label htmlFor="edit_has_medical" className={`font-bold ${textPrimary}`}>Has Medical Condition / Allergies?</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={`font-bold ${textSecondary}`}>Condition Details</label>
                  <input type="text" placeholder="Details if yes" value={editForm.medical_condition_details || ''} onChange={(e) => setEditForm({ ...editForm, medical_condition_details: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Regular Medication</label>
                  <input type="text" value={editForm.regular_medication || ''} onChange={(e) => setEditForm({ ...editForm, regular_medication: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Preferred Hospital</label>
                  <input type="text" value={editForm.hospital_preference || ''} onChange={(e) => setEditForm({ ...editForm, hospital_preference: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Doctor Name</label>
                  <input type="text" value={editForm.doctor_name || ''} onChange={(e) => setEditForm({ ...editForm, doctor_name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Doctor Contact Phone</label>
                  <input type="text" value={editForm.doctor_phone || ''} onChange={(e) => setEditForm({ ...editForm, doctor_phone: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Section 6: Login Credentials */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-[10px] text-blue-600 uppercase tracking-wider pb-1 border-b">6. Parent Portal Access</h4>
              <div>
                <label className={`font-bold ${textSecondary}`}>Portal Login Password</label>
                <input type="text" value={editForm.password || ''} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="w-full border rounded-xl px-3 py-2 outline-none font-mono font-bold bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-blue-500" />
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
          <div className="space-y-6 text-xs max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Program & Batch Overview Details Editor */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-xs text-green-600 uppercase tracking-wider pb-1 border-b">4. Program &amp; Batch Details Overview</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Registration Category</label>
                  <select
                    value={editForm.category || 'Child Activity'}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Child Activity">Child Activity 🧸</option>
                    <option value="Zumba & Yoga">Zumba &amp; Yoga</option>
                    <option value="Daycare">Daycare</option>
                    <option value="Events & Parties">Events & Parties</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Current Student Batch</label>
                  <select
                    value={editForm.batch_id || ''}
                    onChange={(e) => {
                      const selectedBt = allAvailableBatches?.find(b => b.id === e.target.value)
                      setEditForm({
                        ...editForm,
                        batch_id: e.target.value,
                        batch_name: selectedBt?.batch_name || editForm.batch_name
                      })
                      setBatchSelect(e.target.value)
                    }}
                    className={inputCls}
                  >
                    <option value="">-- Select Batch --</option>
                    {allAvailableBatches?.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_name} ({b.batch_time || '10:30 AM'}) — ₹{b.fee_amount || 3500} / 30 Days</option>
                    ))}
                    <option value="00000000-0000-0000-0000-000000000000" className="font-bold text-orange-600">
                      ⚙️ Customize class (Build Custom Schedule)
                    </option>
                  </select>
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Preferred Time Slot</label>
                  <select
                    value={editForm.preferred_time_slot || 'Morning (9:00 AM - 12:00 PM)'}
                    onChange={(e) => setEditForm({ ...editForm, preferred_time_slot: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</option>
                    <option value="Evening (3:00 PM - 6:00 PM)">Evening (3:00 PM - 6:00 PM)</option>
                    <option value="Full Day (Morning - Evening)">Full Day (Morning - Evening)</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Classes Consumed Already</label>
                  <input
                    type="number"
                    value={editForm.classes_consumed !== undefined ? editForm.classes_consumed : 0}
                    onChange={(e) => setEditForm({ ...editForm, classes_consumed: parseInt(e.target.value) || 0 })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Select Attendance Days Checkboxes */}
              <div className="col-span-2 md:col-span-3 pt-1">
                <label className={`block font-bold mb-1.5 ${textSecondary}`}>Select Attendance Days (Custom Plan):</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const isChecked = editForm.custom_days ? editForm.custom_days.split(', ').includes(day) : false
                    return (
                      <label key={day} className="flex items-center gap-1.5 font-semibold cursor-pointer p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600 rounded"
                          checked={isChecked}
                          onChange={(e) => {
                            let days = editForm.custom_days ? editForm.custom_days.split(', ') : []
                            if (e.target.checked) days.push(day)
                            else days = days.filter((d: string) => d !== day)
                            const totalCls = days.length * 4
                            setEditForm({
                              ...editForm,
                              custom_days: days.join(', '),
                              classes_total: totalCls > 0 ? totalCls : 12
                            })
                          }}
                        />
                        <span>{day.slice(0,3)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Program / Activity Interested Checkboxes */}
              <div className="col-span-2 md:col-span-3 pt-1">
                <label className={`block font-bold mb-1.5 ${textSecondary}`}>Program / Activity Interested In:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Playzone', 'Weekend Program', '3 Days Program', '5 Days Program', '6 Days Program', '7 Days Program', 'Mother Zumba'].map(prog => {
                    const isChecked = editForm.program_interested ? editForm.program_interested.split(', ').includes(prog) : false
                    return (
                      <label key={prog} className="flex items-center gap-1.5 font-semibold cursor-pointer p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600 rounded"
                          checked={isChecked}
                          onChange={(e) => {
                            let progs = editForm.program_interested ? editForm.program_interested.split(', ') : []
                            if (e.target.checked) progs.push(prog)
                            else progs = progs.filter((p: string) => p !== prog)
                            setEditForm({
                              ...editForm,
                              program_interested: progs.join(', ')
                            })
                          }}
                        />
                        <span>{prog}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await handleUpdateStudent(student.id, editForm)
                    if (ok) alert('✅ Program & Batch details updated successfully!')
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  💾 Save Program &amp; Batch Changes
                </button>
              </div>
            </div>

            {/* Primary Batch change */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-xs text-blue-600 uppercase tracking-wider pb-1 border-b">🔄 Switch Primary Batch</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Select New Batch</label>
                  <select
                    value={batchSelect || student.batch_id}
                    onChange={e => setBatchSelect(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">-- Choose Batch --</option>
                    {allAvailableBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Change Date</label>
                  <input
                    type="date"
                    value={changeDate}
                    onChange={e => setChangeDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSecondary}`}>Change Reason</label>
                  <input
                    type="text"
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                    placeholder="e.g. Schedule clash, upgrades"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="text-right pt-1">
                <button
                  onClick={async () => {
                    const targetBatchId = batchSelect || student.batch_id
                    const ok = await handleUpdateStudentBatch(student.id, 'change', targetBatchId, changeReason, changeDate)
                    if (ok) {
                      setChangeReason('General Change')
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Apply Batch Switch
                </button>
              </div>
            </div>

            {/* Additional Active Batch Assignment */}
            <div className="space-y-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-xs text-emerald-600 uppercase tracking-wider pb-1 border-b">➕ Assign Additional Active Batches</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <select
                    value={additionalBatchSelect}
                    onChange={e => setAdditionalBatchSelect(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">-- Select Extra Program (e.g. Skating, Chess) --</option>
                    {allAvailableBatches.filter(b => b.id !== student.batch_id).map(b => (
                      <option key={b.id} value={b.id}>{b.batch_name} (₹{b.fee_amount || 2500})</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={async () => {
                    if (!additionalBatchSelect) { alert('Please select a batch.'); return; }
                    const ok = await handleUpdateStudentBatch(student.id, 'add', additionalBatchSelect)
                    if (ok) setAdditionalBatchSelect('')
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl whitespace-nowrap cursor-pointer transition shadow-sm"
                >
                  Assign Batch
                </button>
              </div>

              {/* List of additional batches */}
              <div>
                <span className="block font-black text-[10px] uppercase text-slate-400 tracking-wider mb-2">Currently Assigned Extra Batches</span>
                {additionalBatches.length === 0 ? (
                  <p className="text-[11px] text-slate-450 italic pl-1">No additional batches assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {additionalBatches.map((b: any) => (
                      <div key={b.batch_id} className={`flex items-center justify-between p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                        <div>
                          <strong className={textPrimary}>{b.batch_name}</strong>
                          <span className="text-[10px] text-slate-400 ml-2">(Added on: {formatDateToDisplay(b.added_on)})</span>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to remove additional batch "${b.batch_name}"?`)) {
                              await handleUpdateStudentBatch(student.id, 'remove', b.batch_id)
                            }
                          }}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Batch Change Logs History */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-extrabold text-xs text-purple-600 uppercase tracking-wider pb-1 border-b">📜 Batch Switching History Trail</h4>
              {(() => {
                const history = Array.isArray(student.batch_history)
                  ? student.batch_history
                  : (() => { try { return JSON.parse(student.batch_history || '[]') } catch { return [] } })()

                if (history.length === 0) {
                  return <p className="text-[11px] text-slate-450 italic pl-1">No primary batch changes logged yet.</p>
                }

                return (
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-4 ml-2 mt-2">
                    {history.map((log: any, idx: number) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white dark:border-slate-950" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded">
                              {formatDateToDisplay(log.changed_at)}
                            </span>
                            <span className={`text-[10px] ${textSecondary}`}>
                              Changed from <strong className={textPrimary}>{log.from_batch_name}</strong> to <strong className={textPrimary}>{log.to_batch_name}</strong>
                            </span>
                          </div>
                          {log.reason && (
                            <p className="text-[10px] text-slate-400 font-medium italic mt-1 pl-1">Reason: {log.reason}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
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

      {/* MONEY EDIT POPUP MODAL */}
      {amountEditModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className={`${bgCard} rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 relative`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h4 className={`text-xs font-extrabold ${textPrimary}`}>{amountEditModal.title}</h4>
              <button onClick={() => setAmountEditModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className={`block font-bold text-[11px] mb-1.5 ${textSecondary}`}>Enter Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  autoFocus
                  value={amountEditModal.tempValue}
                  onChange={(e) => setAmountEditModal(prev => ({ ...prev, tempValue: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const val = Math.max(0, parseFloat(amountEditModal.tempValue) || 0)
                      updateFeeRow(amountEditModal.rowId, amountEditModal.field, val)
                      setAmountEditModal(prev => ({ ...prev, isOpen: false }))
                    }
                  }}
                  className={`w-full text-lg font-bold font-mono pl-8 pr-3 py-2 rounded-xl border outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAmountEditModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(0, parseFloat(amountEditModal.tempValue) || 0)
                  updateFeeRow(amountEditModal.rowId, amountEditModal.field, val)
                  setAmountEditModal(prev => ({ ...prev, isOpen: false }))
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-600/20"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTANT SAVED RECEIPT MODAL (Pops up right after saving fee) */}
      {savedReceiptModal.isOpen && savedReceiptModal.student && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-fadeIn overflow-y-auto">
          <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto`}>
            
            {/* Header Notification */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Fee Transaction Saved Successfully!</p>
                  <p className="text-[11px] font-mono font-bold">Receipt No: {savedReceiptModal.receiptNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSavedReceiptModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phulwari Branded Preview Card */}
            <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-black text-blue-600 dark:text-blue-400">🌸 Phulwari Mother &amp; Child Activity Centre</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Where Growth Meets Wellness</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Official Receipt</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Student Name</span><strong>{savedReceiptModal.student.full_name}</strong></div>
                <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Admission ID</span><strong className="font-mono text-blue-500">{savedReceiptModal.student.admission_id}</strong></div>
                <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Date</span><strong>{savedReceiptModal.date}</strong></div>
                <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Mode</span><strong>{savedReceiptModal.paymentMode}</strong></div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between text-xs font-bold border border-slate-200/60 dark:border-slate-800">
                <span>Total Amount Paid:</span>
                <span className="text-base font-black font-mono text-emerald-600">₹{savedReceiptModal.totalPaid.toLocaleString('en-IN')}</span>
              </div>
              {savedReceiptModal.totalDue > 0 && (
                <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-between border border-rose-200">
                  <span>Remaining Pending Due:</span>
                  <span className="font-mono">₹{savedReceiptModal.totalDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Instant Actions (Print, Download, Share) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handlePrintTransactionReceipt(savedReceiptModal.receiptNo)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>🖨️ Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrintTransactionReceipt(savedReceiptModal.receiptNo)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  const phone = (savedReceiptModal.student?.parent_phone || '').replace(/[^0-9]/g, '')
                  const text = `Dear Parent,\nThank you for your payment to Phulwari Mother & Child Activity Centre!\n\nReceipt No: ${savedReceiptModal.receiptNo}\nStudent: ${savedReceiptModal.student?.full_name} (${savedReceiptModal.student?.admission_id})\nAmount Paid: Rs. ${savedReceiptModal.totalPaid}\nRemaining Balance: Rs. ${savedReceiptModal.totalDue}\n\nView Centre Details: https://phulwari.co.in`
                  window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(text)}`, '_blank')
                }}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-green-600/20 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Share
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSavedReceiptModal(prev => ({ ...prev, isOpen: false }))
                  setErpModalTab('fee_history')
                }}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Done / View Ledger History
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
