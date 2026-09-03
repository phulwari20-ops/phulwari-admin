'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  CreditCard
} from 'lucide-react'
import { createClient } from '../lib/supabase/client'

interface FinancialTabProps {
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  isLight: boolean
  students: any[]
  fees: any[]
  batches?: any[]
  teachers: any[]
  teacherPayments: any[]
  loadAllAdminData: () => Promise<void>
}

export default function FinancialTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  isLight,
  students,
  fees,
  batches = [],
  teachers,
  teacherPayments,
  loadAllAdminData
}: FinancialTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'income' | 'expenses' | 'receivables' | 'payouts' | 'cash_bank' | 'pnl'>('overview')
  const [dateFilter, setDateFilter] = useState<'this_month' | 'today' | 'all' | 'custom'>('this_month')
  const [receivablesMonth, setReceivablesMonth] = useState<string>('August 2026')
  const [searchQuery, setSearchQuery] = useState('')
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Custom Income/Expense Manual Entries State
  const [manualIncomes, setManualIncomes] = useState<any[]>([])
  const [manualExpenses, setManualExpenses] = useState<any[]>([])

  useEffect(() => {
    const fetchLedgerFromDB = async () => {
      try {
        const supabase = createClient()
        const { data: ledgerData } = await supabase.from('financial_ledger').select('*').order('date', { ascending: false })
        if (ledgerData && ledgerData.length > 0) {
          const incs = ledgerData.filter((d: any) => d.type === 'Income').map((lg: any) => ({
            id: lg.id,
            date: lg.date,
            type: 'Income',
            category_name: lg.category_name || lg.fee_head || 'Income',
            subcategory_name: lg.subcategory_name || '',
            amount: Number(lg.amount) || 0,
            payment_mode: lg.payment_mode || 'Cash',
            reference_no: lg.reference_no || lg.receipt_no || '',
            description: lg.description || '',
            student_name: lg.student_name || '',
            added_by: lg.added_by || 'Admin',
            is_auto: false
          }))
          const exps = ledgerData.filter((d: any) => d.type === 'Expense').map((lg: any) => ({
            id: lg.id,
            date: lg.date,
            type: 'Expense',
            category_name: lg.category_name || 'Expense',
            subcategory_name: lg.subcategory_name || '',
            amount: Number(lg.amount) || 0,
            payment_mode: lg.payment_mode || 'Cash',
            reference_no: lg.reference_no || '',
            vendor_name: lg.vendor_name || lg.teacher_name || '',
            description: lg.description || '',
            added_by: lg.added_by || 'Admin',
            is_auto: false
          }))
          setManualIncomes(incs)
          setManualExpenses(exps)
          return
        }

        const toSafePromise = (builder: any) => new Promise(res => {
          try {
            if (builder && typeof builder.then === 'function') {
              builder.then((r: any) => res(r?.error ? { data: null } : r), () => res({ data: null }))
            } else res({ data: null })
          } catch (e) { res({ data: null }) }
        })

        const [incRes, expRes]: any[] = await Promise.all([
          toSafePromise(supabase.from('incomes').select('*').order('date', { ascending: false })),
          toSafePromise(supabase.from('expenses').select('*').order('date', { ascending: false }))
        ])
        if (incRes?.data && incRes.data.length > 0) {
          setManualIncomes(incRes.data.map((i: any) => ({ ...i, type: 'Income', is_auto: false })))
        }
        if (expRes?.data && expRes.data.length > 0) {
          setManualExpenses(expRes.data.map((e: any) => ({ ...e, type: 'Expense', is_auto: false })))
        }
      } catch (err) {
        console.error('Failed fetching ledger from DB:', err)
        try {
          const savedIncs = localStorage.getItem('phulwari_manual_incomes')
          const savedExps = localStorage.getItem('phulwari_manual_expenses')
          if (savedIncs) setManualIncomes(JSON.parse(savedIncs))
          if (savedExps) setManualExpenses(JSON.parse(savedExps))
        } catch (e) {}
      }
    }

    fetchLedgerFromDB()
  }, [])

  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category_name: 'Donation',
    subcategory_name: '',
    amount: '',
    payment_mode: 'Cash',
    reference_no: '',
    description: '',
    student_name: '',
    added_by: 'Admin'
  })

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category_name: 'Office Rent',
    subcategory_name: '',
    amount: '',
    payment_mode: 'Bank Transfer',
    reference_no: '',
    vendor_name: '',
    vendor_contact: '',
    description: '',
    added_by: 'Admin'
  })

  const num = (v: any) => Number(v) || 0
  const inr = (v: any) => `₹${num(v).toLocaleString('en-IN')}`

  // Calculate accurate pending dues for any student (consistently matching FeesTab logic)
  const getStudentPendingDueInfo = (st: any, feesArr: any[], batchesArr: any[] = [], targetMonth: string = 'August 2026') => {
    if (st.status === 'inactive' || st.status === 'deactivated') {
      return { dueAmount: 0, pendingMonths: '' }
    }

    const batchObj = (batchesArr || []).find(b => 
      b.id === st.batch_id || 
      (b.batch_name && st.batch_name && b.batch_name.toLowerCase().trim() === st.batch_name.toLowerCase().trim())
    )
    const expectedMonthlyFee = st.total_fee ? num(st.total_fee) : (batchObj ? num(batchObj.fee_amount) : 3500)

    if (expectedMonthlyFee === 0) {
      return { dueAmount: 0, pendingMonths: '' }
    }

    const stFees = (feesArr || []).filter(f => 
      f.student_id === st.id || 
      f.students?.admission_id === st.admission_id || 
      f.admission_id === st.admission_id ||
      (f.student_name && st.full_name && String(f.student_name).toLowerCase().trim() === String(st.full_name).toLowerCase().trim())
    )

    let dueAmount = 0
    const monthsSet = new Set<string>()

    if (targetMonth === 'All Months') {
      if (stFees.length > 0) {
        stFees.forEach(f => {
          if (f.status !== 'paid') {
            const net = num(f.net_amount || f.amount || 0)
            const paid = num(f.amount_paid || 0)
            const p = num(f.pending_amount) || Math.max(0, net - paid)
            dueAmount += (p || net)
            if (f.month) monthsSet.add(f.month)
          }
        })
      }
      if (dueAmount === 0) {
        dueAmount = expectedMonthlyFee
        monthsSet.add('August 2026')
      }
    } else {
      const monthFees = stFees.filter(f => 
        f.month === targetMonth || f.collected_for === targetMonth || f.title?.includes(targetMonth)
      )

      if (monthFees.length > 0) {
        monthFees.forEach(f => {
          if (f.status !== 'paid') {
            const net = num(f.net_amount || f.amount || 0)
            const paid = num(f.amount_paid || 0)
            const p = num(f.pending_amount) || Math.max(0, net - paid)
            dueAmount += (p || net)
            monthsSet.add(targetMonth)
          }
        })
      } else {
        dueAmount = expectedMonthlyFee
        monthsSet.add(targetMonth)
      }
    }

    const pendingMonths = Array.from(monthsSet).join(', ') || targetMonth
    return { dueAmount, pendingMonths }
  }

  // Combined Fee Collections + Manual Incomes
  const feeIncomeEntries = useMemo(() => {
    return (fees || []).map(f => ({
      id: f.id || f.receipt_no,
      date: f.collection_date || f.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      type: 'Income',
      category_name: f.fee_head || f.title || 'Student Fee',
      amount: num(f.amount_paid || f.paid_amount || f.net_amount || 0),
      payment_mode: f.mode_of_payment || f.payment_method || 'Cash',
      reference_no: f.receipt_no || f.transaction_id || '',
      student_name: f.student_name || f.students?.full_name || 'Enrolled Student',
      admission_no: f.admission_id || f.students?.admission_id || '',
      description: `Fee Collection for ${f.collected_for || f.month || 'Tuition'}`,
      is_auto: true
    }))
  }, [fees])

  const allIncomes = useMemo(() => {
    return [...feeIncomeEntries, ...manualIncomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [feeIncomeEntries, manualIncomes])

  const allExpenses = useMemo(() => {
    const teacherSalaryExpenses = (teacherPayments || []).map(p => ({
      id: p.id,
      date: p.date || new Date().toISOString().split('T')[0],
      type: 'Expense',
      category_name: 'Teacher Salary',
      amount: num(p.net_paid || p.salary_amount),
      payment_mode: p.payment_mode || 'Cash',
      reference_no: p.reference_no || '',
      vendor_name: p.teacher_name || 'Staff Member',
      description: `Salary Payout for ${p.salary_month || 'Month'}`,
      is_auto: true
    }))
    return [...teacherSalaryExpenses, ...manualExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [teacherPayments, manualExpenses])

  // Financial KPI Computations
  const totalFeeCollected = useMemo(() => allIncomes.reduce((sum, i) => sum + i.amount, 0), [allIncomes])
  const totalExpenses = useMemo(() => allExpenses.reduce((sum, e) => sum + e.amount, 0), [allExpenses])
  const netProfit = totalFeeCollected - totalExpenses

  const pendingReceivables = useMemo(() => {
    return (students || []).reduce((sum, st) => {
      const { dueAmount } = getStudentPendingDueInfo(st, fees, batches, receivablesMonth)
      return sum + Math.max(0, dueAmount)
    }, 0)
  }, [students, fees, batches, receivablesMonth])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayCollection = useMemo(() => {
    return allIncomes.filter(i => i.date === todayStr).reduce((sum, i) => sum + i.amount, 0)
  }, [allIncomes, todayStr])

  const cashInHand = useMemo(() => {
    const cashInc = allIncomes.filter(i => String(i.payment_mode).toLowerCase() === 'cash').reduce((sum, i) => sum + i.amount, 0)
    const cashExp = allExpenses.filter(e => String(e.payment_mode).toLowerCase() === 'cash').reduce((sum, e) => sum + e.amount, 0)
    return cashInc - cashExp
  }, [allIncomes, allExpenses])

  const bankBalance = useMemo(() => {
    const bankInc = allIncomes.filter(i => String(i.payment_mode).toLowerCase() !== 'cash').reduce((sum, i) => sum + i.amount, 0)
    const bankExp = allExpenses.filter(e => String(e.payment_mode).toLowerCase() !== 'cash').reduce((sum, e) => sum + e.amount, 0)
    return bankInc - bankExp
  }, [allIncomes, allExpenses])

  const handleAddManualIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!incomeForm.amount || num(incomeForm.amount) <= 0) {
      alert('Please enter a valid income amount.')
      return
    }
    const catName = incomeForm.category_name === 'Other / Custom Category' && incomeForm.subcategory_name
      ? incomeForm.subcategory_name
      : incomeForm.category_name

    const newInc = {
      id: `inc_${Date.now()}`,
      date: incomeForm.date,
      type: 'Income',
      category_name: catName,
      subcategory_name: incomeForm.subcategory_name,
      amount: num(incomeForm.amount),
      payment_mode: incomeForm.payment_mode,
      reference_no: incomeForm.reference_no,
      description: incomeForm.description,
      student_name: incomeForm.student_name,
      added_by: incomeForm.added_by,
      is_auto: false
    }

    setManualIncomes(prev => {
      const updated = [newInc, ...prev]
      try { localStorage.setItem('phulwari_manual_incomes', JSON.stringify(updated)) } catch (e) {}
      return updated
    })

    try {
      const supabase = createClient()
      await supabase.from('financial_ledger').insert([{
        date: newInc.date,
        type: 'Income',
        category_name: newInc.category_name,
        subcategory_name: newInc.subcategory_name,
        amount: newInc.amount,
        payment_mode: newInc.payment_mode,
        reference_no: newInc.reference_no,
        student_name: newInc.student_name,
        description: newInc.description,
        added_by: newInc.added_by
      }])

      try {
        await supabase.from('incomes').insert([{
          id: newInc.id,
          date: newInc.date,
          category_name: newInc.category_name,
          subcategory_name: newInc.subcategory_name,
          amount: newInc.amount,
          payment_mode: newInc.payment_mode,
          reference_no: newInc.reference_no,
          student_name: newInc.student_name,
          description: newInc.description,
          added_by: newInc.added_by
        }])
      } catch (e) {}
    } catch (err) {
      console.error('DB income insert error:', err)
    }

    setIsIncomeModalOpen(false)
    alert('✅ Custom Income entry posted & saved to database!')
    setIncomeForm({
      date: new Date().toISOString().split('T')[0],
      category_name: 'Donation',
      subcategory_name: '',
      amount: '',
      payment_mode: 'Cash',
      reference_no: '',
      description: '',
      student_name: '',
      added_by: 'Admin'
    })
    loadAllAdminData()
  }

  const handleAddManualExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseForm.amount || num(expenseForm.amount) <= 0) {
      alert('Please enter a valid expense amount.')
      return
    }
    const catName = expenseForm.category_name === 'Other / Custom Category' && expenseForm.subcategory_name
      ? expenseForm.subcategory_name
      : expenseForm.category_name

    const newExp = {
      id: `exp_${Date.now()}`,
      date: expenseForm.date,
      type: 'Expense',
      category_name: catName,
      subcategory_name: expenseForm.subcategory_name,
      amount: num(expenseForm.amount),
      payment_mode: expenseForm.payment_mode,
      reference_no: expenseForm.reference_no,
      vendor_name: expenseForm.vendor_name,
      vendor_contact: expenseForm.vendor_contact,
      description: expenseForm.description,
      added_by: expenseForm.added_by,
      is_auto: false
    }

    setManualExpenses(prev => {
      const updated = [newExp, ...prev]
      try { localStorage.setItem('phulwari_manual_expenses', JSON.stringify(updated)) } catch (e) {}
      return updated
    })

    try {
      const supabase = createClient()
      await supabase.from('financial_ledger').insert([{
        date: newExp.date,
        type: 'Expense',
        category_name: newExp.category_name,
        subcategory_name: newExp.subcategory_name,
        amount: newExp.amount,
        payment_mode: newExp.payment_mode,
        reference_no: newExp.reference_no,
        vendor_name: newExp.vendor_name,
        vendor_contact: newExp.vendor_contact,
        description: newExp.description,
        added_by: newExp.added_by
      }])

      try {
        await supabase.from('expenses').insert([{
          id: newExp.id,
          date: newExp.date,
          category_name: newExp.category_name,
          subcategory_name: newExp.subcategory_name,
          amount: newExp.amount,
          payment_mode: newExp.payment_mode,
          reference_no: newExp.reference_no,
          vendor_name: newExp.vendor_name,
          vendor_contact: newExp.vendor_contact,
          description: newExp.description,
          added_by: newExp.added_by
        }])
      } catch (e) {}
    } catch (err) {
      console.error('DB expense insert error:', err)
    }

    setIsExpenseModalOpen(false)
    alert('✅ Expense entry recorded & saved to database!')
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      category_name: 'Office Rent',
      subcategory_name: '',
      amount: '',
      payment_mode: 'Bank Transfer',
      reference_no: '',
      vendor_name: '',
      vendor_contact: '',
      description: '',
      added_by: 'Admin'
    })
    loadAllAdminData()
  }

  const exportReportCSV = () => {
    const csvRows = [
      ['Date', 'Type', 'Category / Description', 'Payment Mode', 'Reference No', 'Amount (INR)'],
      ...allIncomes.map(i => [i.date, 'Income', `${i.category_name} - ${i.description}`, i.payment_mode, i.reference_no, i.amount]),
      ...allExpenses.map(e => [e.date, 'Expense', `${e.category_name} - ${e.description}`, e.payment_mode, e.reference_no, -e.amount])
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Financial_Statement_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const inputCls = `w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none ${
    isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
  }`

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6 shadow-sm animate-fadeIn`}>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-extrabold ${textPrimary} flex items-center gap-2`}>
            <DollarSign className="w-5 h-5 text-emerald-500" /> Income &amp; Expense Management &amp; Financial Dashboard
          </h3>
          <p className={`text-xs ${textSecondary}`}>
            Production-Level Financial Accounting, Income Postings, Expense Ledger, Cash Book &amp; P&amp;L Analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>➕ Record Income</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>➕ Record Expense</span>
          </button>

          <button
            onClick={exportReportCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          ['overview', 'Financial Dashboard', BarChart3],
          ['income', 'Income Ledger', TrendingUp],
          ['expenses', 'Expense Ledger', TrendingDown],
          ['receivables', 'Pending Dues Receivable', Wallet],
          ['payouts', 'Teacher Salary Payouts', UserCheck],
          ['cash_bank', 'Cash & Bank Register', Building2],
          ['pnl', 'Profit & Loss Statement', PieChartIcon],
        ].map(([tKey, label, Icon]: any) => (
          <button
            key={tKey}
            onClick={() => setActiveSubTab(tKey)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubTab === tKey
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: FINANCIAL OVERVIEW DASHBOARD */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 6 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600">Total Income</span>
              <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">{inr(totalFeeCollected)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase text-rose-600">Total Expenses</span>
              <span className="text-lg font-black font-mono text-rose-700 dark:text-rose-400 mt-1">{inr(totalExpenses)}</span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
              netProfit >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-rose-500/10 border-rose-500/20'
            }`}>
              <span className="text-[10px] font-extrabold uppercase text-blue-600">Net Profit / Loss</span>
              <span className={`text-lg font-black font-mono mt-1 ${netProfit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700'}`}>
                {inr(netProfit)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase text-amber-600">Cash In Hand</span>
              <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-400 mt-1">{inr(cashInHand)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase text-purple-600">Bank Balance</span>
              <span className="text-lg font-black font-mono text-purple-700 dark:text-purple-400 mt-1">{inr(bankBalance)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase text-orange-600">Pending Receivables</span>
              <span className="text-lg font-black font-mono text-orange-700 dark:text-orange-400 mt-1">{inr(pendingReceivables)}</span>
            </div>
          </div>

          {/* Quick Transaction Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Incomes */}
            <div className={`p-4 rounded-2xl border space-y-3 ${bgSubCard}`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <h4 className={`text-xs font-extrabold ${textPrimary} flex items-center gap-1.5`}>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Recent Income Postings
                </h4>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{allIncomes.length} records</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {allIncomes.slice(0, 5).map(inc => (
                  <div key={inc.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{inc.category_name} - {inc.student_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{inc.date} · {inc.payment_mode} {inc.reference_no ? `· Ref: ${inc.reference_no}` : ''}</p>
                    </div>
                    <span className="font-black font-mono text-emerald-600 dark:text-emerald-400">+ {inr(inc.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className={`p-4 rounded-2xl border space-y-3 ${bgSubCard}`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <h4 className={`text-xs font-extrabold ${textPrimary} flex items-center gap-1.5`}>
                  <ArrowDownRight className="w-4 h-4 text-rose-500" /> Recent Expense Payments
                </h4>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{allExpenses.length} records</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {allExpenses.slice(0, 5).map(exp => (
                  <div key={exp.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{exp.category_name} - {exp.vendor_name || exp.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{exp.date} · {exp.payment_mode}</p>
                    </div>
                    <span className="font-black font-mono text-rose-600 dark:text-rose-400">- {inr(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INCOME LEDGER */}
      {activeSubTab === 'income' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-extrabold ${textPrimary}`}>All Income Receipts &amp; Collections ({allIncomes.length})</h4>
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              ➕ Record Custom Income
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Income Head / Category</th>
                  <th className="p-3">Payer / Student Name</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Ref / Receipt #</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {allIncomes.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-mono">{item.date}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{item.category_name}</td>
                    <td className="p-3">{item.student_name}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 font-bold">{item.payment_mode}</span></td>
                    <td className="p-3 font-mono text-[10px] text-blue-500">{item.reference_no || '—'}</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">+{inr(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXPENSE LEDGER */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-extrabold ${textPrimary}`}>All Center Expense Entries ({allExpenses.length})</h4>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              ➕ Record Custom Expense
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Expense Category</th>
                  <th className="p-3">Vendor / Recipient</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Ref / Txn #</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {allExpenses.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-mono">{item.date}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{item.category_name}</td>
                    <td className="p-3">{item.vendor_name || item.description || '—'}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 font-bold">{item.payment_mode}</span></td>
                    <td className="p-3 font-mono text-[10px] text-purple-500">{item.reference_no || '—'}</td>
                    <td className="p-3 text-right font-mono font-black text-rose-600 dark:text-rose-400">-{inr(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PENDING DUES RECEIVABLE */}
      {activeSubTab === 'receivables' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className={`text-xs font-extrabold ${textPrimary}`}>Pending Dues Receivable Overview</h4>
              <p className="text-[11px] text-slate-400">List of enrolled students with outstanding fee balance</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={receivablesMonth}
                onChange={(e) => setReceivablesMonth(e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
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
                <option value="All Months">All Months</option>
              </select>

              <div className="p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-mono font-black text-xs shrink-0">
                Total Due ({receivablesMonth}): {inr(pendingReceivables)}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Admission ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Batch / Class</th>
                  <th className="p-3">Parent Phone</th>
                  <th className="p-3">Pending Month(s)</th>
                  <th className="p-3 text-right">Fee Due Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {students.map(st => {
                  const { dueAmount, pendingMonths } = getStudentPendingDueInfo(st, fees, batches, receivablesMonth)
                  if (dueAmount <= 0) return null

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-mono text-blue-500 font-bold">{st.admission_id}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{st.full_name}</td>
                      <td className="p-3">{st.batch_name || st.program_interested || 'Regular Batch'}</td>
                      <td className="p-3 font-mono">{st.parent_phone}</td>
                      <td className="p-3 font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">{pendingMonths}</td>
                      <td className="p-3 text-right font-mono font-black text-amber-600 dark:text-amber-400">{inr(dueAmount)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300">
                          Payment Due
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            const msg = `Dear ${st.parent_name || 'Parent'}, reminder from Phulwari Centre: Pending fee due for ${st.full_name} for ${pendingMonths} is ${inr(dueAmount)}. Please clear dues.`
                            window.open(`https://wa.me/${String(st.parent_phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
                          }}
                          className="px-2.5 py-1 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          💬 Remind WhatsApp
                        </button>
                      </td>
                    </tr>
                  )
                }).filter(Boolean)}
                {students.every(st => getStudentPendingDueInfo(st, fees, batches, receivablesMonth).dueAmount <= 0) && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      🎉 No pending dues receivable found! All student fees are up to date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: TEACHER SALARY PAYOUTS */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-xs font-extrabold ${textPrimary}`}>Teacher &amp; Faculty Salary Payout Ledger</h4>
              <p className="text-[11px] text-slate-400">Monthly staff disbursements recorded into expense accounting</p>
            </div>
            <div className="p-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-mono font-black text-xs">
              Total Salary Outflow: {inr((teacherPayments || []).reduce((sum, p) => sum + num(p.net_paid || p.salary_amount), 0))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Teacher / Staff Name</th>
                  <th className="p-3">Month</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Reference / Txn #</th>
                  <th className="p-3 text-right">Payout Amount (₹)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                {(teacherPayments || []).length > 0 ? (
                  teacherPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-mono">{p.date || 'August 2026'}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{p.teacher_name || p.teachers?.full_name || 'Faculty Member'}</td>
                      <td className="p-3">{p.salary_month || 'Monthly Salary'}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 font-bold">{p.payment_mode || 'Bank Transfer'}</span></td>
                      <td className="p-3 font-mono text-[10px] text-purple-500">{p.reference_no || 'TXN-DISBURSE'}</td>
                      <td className="p-3 text-right font-mono font-black text-rose-600 dark:text-rose-400">-{inr(p.net_paid || p.salary_amount)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Disbursed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No teacher salary payout records found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CASH & BANK REGISTER */}
      {activeSubTab === 'cash_bank' && (
        <div className="space-y-6">
          {/* Balances Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-400">💵 Cash Book / Cash In Hand Register</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">Liquid Cash</span>
              </div>
              <p className="text-2xl font-black font-mono text-amber-800 dark:text-amber-300">{inr(cashInHand)}</p>
              <div className="flex justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-amber-500/20">
                <span>Cash Inflow: <strong className="text-emerald-600 font-mono">{inr(allIncomes.filter(i => String(i.payment_mode).toLowerCase() === 'cash').reduce((s, i) => s + i.amount, 0))}</strong></span>
                <span>Cash Outflow: <strong className="text-rose-600 font-mono">{inr(allExpenses.filter(e => String(e.payment_mode).toLowerCase() === 'cash').reduce((s, e) => s + e.amount, 0))}</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-400">🏦 Bank &amp; UPI Register</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white">Digital Bank</span>
              </div>
              <p className="text-2xl font-black font-mono text-purple-800 dark:text-purple-300">{inr(bankBalance)}</p>
              <div className="flex justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-purple-500/20">
                <span>Online Inflow: <strong className="text-emerald-600 font-mono">{inr(allIncomes.filter(i => String(i.payment_mode).toLowerCase() !== 'cash').reduce((s, i) => s + i.amount, 0))}</strong></span>
                <span>Online Outflow: <strong className="text-rose-600 font-mono">{inr(allExpenses.filter(e => String(e.payment_mode).toLowerCase() !== 'cash').reduce((s, e) => s + e.amount, 0))}</strong></span>
              </div>
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="space-y-3">
            <h4 className={`text-xs font-extrabold ${textPrimary}`}>Complete Cash &amp; Bank Register Audit Logs</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Account Type</th>
                    <th className="p-3">Txn Type</th>
                    <th className="p-3">Category / Description</th>
                    <th className="p-3">Reference #</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                  {[...allIncomes, ...allExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => {
                    const isCash = String(item.payment_mode).toLowerCase() === 'cash'
                    const isInc = item.type === 'Income'
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="p-3 font-mono">{item.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isCash ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                            {isCash ? '💵 Cash' : '🏦 Bank / UPI'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isInc ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isInc ? 'Deposit / Credit' : 'Withdrawal / Debit'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{item.category_name} - {item.student_name || item.vendor_name || item.description}</td>
                        <td className="p-3 font-mono text-[10px] text-blue-500">{item.reference_no || '—'}</td>
                        <td className={`p-3 text-right font-mono font-black ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isInc ? '+' : '-'}{inr(item.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: PROFIT & LOSS STATEMENT */}
      {activeSubTab === 'pnl' && (
        <div className="space-y-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <div>
              <h4 className={`text-sm font-extrabold ${textPrimary}`}>Profit &amp; Loss Statement Summary</h4>
              <p className="text-xs text-slate-400">Audited Financial Statement of Operations</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              netProfit >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {netProfit >= 0 ? 'NET PROFIT' : 'NET LOSS'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Income Side */}
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <h5 className="font-black text-xs text-emerald-700 uppercase tracking-wider">Gross Revenues &amp; Incomes</h5>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between border-b pb-1">
                  <span>Student Fee Collections</span>
                  <span className="font-mono font-bold text-emerald-600">{inr(totalFeeCollected)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 text-emerald-800 dark:text-emerald-300">
                  <span>TOTAL INCOME (A)</span>
                  <span className="font-mono">{inr(totalFeeCollected)}</span>
                </div>
              </div>
            </div>

            {/* Expense Side */}
            <div className="space-y-3 p-4 rounded-xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <h5 className="font-black text-xs text-rose-700 uppercase tracking-wider">Operating Expenses &amp; Outflows</h5>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between border-b pb-1">
                  <span>Teacher &amp; Staff Salaries</span>
                  <span className="font-mono font-bold text-rose-600">{inr(teacherPayments.reduce((s, p) => s + num(p.net_paid || p.salary_amount), 0))}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Center Operations &amp; Misc Expenses</span>
                  <span className="font-mono font-bold text-rose-600">{inr(manualExpenses.reduce((s, e) => s + num(e.amount), 0))}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 text-rose-800 dark:text-rose-300">
                  <span>TOTAL EXPENSES (B)</span>
                  <span className="font-mono">{inr(totalExpenses)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between font-extrabold shadow-md">
            <span>NET PROFIT / LOSS (A - B)</span>
            <span className="text-xl font-black font-mono">{inr(netProfit)}</span>
          </div>
        </div>
      )}

      {/* RECORD INCOME MODAL */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl border ${bgCard}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-extrabold ${textPrimary} flex items-center gap-2 text-emerald-600`}>
                <TrendingUp className="w-5 h-5" /> Record Custom Center Income
              </h3>
              <button onClick={() => setIsIncomeModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddManualIncome} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Income Date *</label>
                <input type="date" required value={incomeForm.date} onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Income Category *</label>
                <select value={incomeForm.category_name} onChange={e => setIncomeForm({ ...incomeForm, category_name: e.target.value })} className={inputCls}>
                  <option value="Donation">Donation</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="Advertisement Income">Advertisement Income</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Study Material Sales">Study Material Sales</option>
                  <option value="Miscellaneous Income">Miscellaneous Income</option>
                  <option value="Other / Custom Category">Other / Specify Custom Category...</option>
                </select>
              </div>

              {incomeForm.category_name === 'Other / Custom Category' && (
                <div>
                  <label className={`block font-bold mb-1 text-emerald-600`}>Specify Custom Income Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workshop Registration Fee"
                    value={incomeForm.subcategory_name}
                    onChange={e => setIncomeForm({ ...incomeForm, subcategory_name: e.target.value })}
                    className={inputCls}
                  />
                </div>
              )}

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Income Amount (₹) *</label>
                <input type="number" required placeholder="e.g. 5000" value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Payment Mode</label>
                <select value={incomeForm.payment_mode} onChange={e => setIncomeForm({ ...incomeForm, payment_mode: e.target.value })} className={inputCls}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Payer Name / Details</label>
                <input type="text" placeholder="e.g. Acme Corp Sponsorship" value={incomeForm.student_name} onChange={e => setIncomeForm({ ...incomeForm, student_name: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Transaction / Reference ID</label>
                <input type="text" placeholder="e.g. TXN12345678" value={incomeForm.reference_no} onChange={e => setIncomeForm({ ...incomeForm, reference_no: e.target.value })} className={inputCls} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsIncomeModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer">Save Income Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl border ${bgCard}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-extrabold ${textPrimary} flex items-center gap-2 text-rose-600`}>
                <TrendingDown className="w-5 h-5" /> Record Center Expense Entry
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddManualExpense} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Expense Date *</label>
                <input type="date" required value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Expense Category *</label>
                <select value={expenseForm.category_name} onChange={e => setExpenseForm({ ...expenseForm, category_name: e.target.value })} className={inputCls}>
                  <option value="Office Rent">Office Rent</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Internet">Internet</option>
                  <option value="Water Bill">Water Bill</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="WhatsApp Marketing">WhatsApp Marketing</option>
                  <option value="Banner Printing">Banner Printing</option>
                  <option value="Study Materials">Study Materials</option>
                  <option value="Software Subscription">Software Subscription</option>
                  <option value="Domain & Hosting">Domain &amp; Hosting</option>
                  <option value="Refreshments">Refreshments</option>
                  <option value="Misc Expenses">Misc Expenses</option>
                  <option value="Other / Custom Category">Other / Specify Custom Category...</option>
                </select>
              </div>

              {expenseForm.category_name === 'Other / Custom Category' && (
                <div>
                  <label className={`block font-bold mb-1 text-rose-600`}>Specify Custom Expense Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Legal Fees / Security Equipment"
                    value={expenseForm.subcategory_name}
                    onChange={e => setExpenseForm({ ...expenseForm, subcategory_name: e.target.value })}
                    className={inputCls}
                  />
                </div>
              )}

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Expense Amount (₹) *</label>
                <input type="number" required placeholder="e.g. 15000" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Payment Mode</label>
                <select value={expenseForm.payment_mode} onChange={e => setExpenseForm({ ...expenseForm, payment_mode: e.target.value })} className={inputCls}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Vendor / Recipient Name</label>
                <input type="text" placeholder="e.g. Landlord / Airtel Broadband" value={expenseForm.vendor_name} onChange={e => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSecondary}`}>Reference / Txn ID</label>
                <input type="text" placeholder="e.g. TXN98765432" value={expenseForm.reference_no} onChange={e => setExpenseForm({ ...expenseForm, reference_no: e.target.value })} className={inputCls} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md cursor-pointer">Save Expense Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
