'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import {
  Users,
  UserPlus,
  Calendar,
  CreditCard,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Key,
  Shield,
  BookOpen,
  Plus,
  RefreshCw,
  Award,
  Filter,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Layers,
  CalendarDays,
  X,
  Send,
  Receipt,
  Edit3,
  Percent,
  TrendingUp,
  Check,
  UserCheck
} from 'lucide-react'

export default function AdminDashboardPage() {
  // Theme Toggle: Light Mode by default
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'calendar' | 'fees' | 'batches' | 'bookings' | 'announcements'>('students')
  const [loading, setLoading] = useState(true)

  // Data states
  const [students, setStudents] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])

  // Search & Class/Section Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('All')
  const [selectedSection, setSelectedSection] = useState<string>('All')

  // Attendance Month & Year Navigation
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(7) // 7 = August (0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Attendance Date Picker (Past & Custom Date Marker)
  const [attendanceDate, setAttendanceDate] = useState<string>('2026-08-03')

  // Selected Student ERP Modal State
  const [selectedERPStudent, setSelectedERPStudent] = useState<any>(null)
  const [erpModalTab, setErpModalTab] = useState<'profile' | 'collect_fee' | 'password' | 'attendance'>('collect_fee')

  // Fee Collection Form State (With Discount Field)
  const [feeForm, setFeeForm] = useState({
    title: 'Monthly Activity Fee (August 2026)',
    amount: '3500',
    discount: '500',
    due_date: '2026-08-10',
    status: 'paid',
    payment_method: 'UPI / Online',
    receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
  })

  // Password reset inside ERP Modal
  const [erpPassword, setErpPassword] = useState('')
  const [erpPasswordMsg, setErpPasswordMsg] = useState('')

  // Calendar Attendance Popup State
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [newStudentForm, setNewStudentForm] = useState({
    admission_id: '',
    password: 'parent123',
    full_name: '',
    class_name: 'Nursery',
    section_name: 'A',
    dob: '2021-01-01',
    gender: 'Boy',
    blood_group: 'B+',
    batch_id: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: 'Vasundhara, Ghaziabad'
  })

  // Notice Broadcaster Modal State
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false)
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'Notice',
    target_audience: 'all'
  })

  useEffect(() => {
    loadAllAdminData()
  }, [])

  const loadAllAdminData = async () => {
    console.log('📡 [SUPABASE ADMIN API HIT - LOAD ALL TABLES]: https://ftnbzukwjvgxdnkrvuer.supabase.co/rest/v1/students,fees,attendance')
    setLoading(true)
    try {
      const supabase = createClient()

      const [
        { data: stData },
        { data: btData },
        { data: feData },
        { data: bkData },
        { data: anData },
        { data: attData }
      ] = await Promise.all([
        supabase.from('students').select('*, batches(*)').order('created_at', { ascending: false }),
        supabase.from('batches').select('*').order('created_at', { ascending: false }),
        supabase.from('fees').select('*, students(full_name, admission_id, class_name, section_name)').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('attendance').select('*, students(full_name, admission_id, class_name, section_name)').order('date', { ascending: false })
      ])

      if (stData && stData.length > 0) {
        setStudents(stData)
      } else {
        setStudents([
          { id: '33333333-3333-3333-3333-333333333333', admission_id: 'PH-2026-001', password: 'parent123', full_name: 'Aarav Sharma', class_name: 'Nursery', section_name: 'A', parent_name: 'Rajesh Sharma', parent_phone: '+91 98765 43210', status: 'active', batches: { batch_name: 'Little Explorers (Morning)' } },
          { id: '44444444-4444-4444-4444-444444444444', admission_id: 'PH-2026-002', password: 'parent456', full_name: 'Ananya Verma', class_name: 'LKG', section_name: 'B', parent_name: 'Vikram Verma', parent_phone: '+91 98111 22334', status: 'active', batches: { batch_name: 'Junior Champions (Afternoon)' } },
          { id: '55555555-5555-5555-5555-555555555555', admission_id: 'PH-2026-003', password: 'parent789', full_name: 'Rohan Gupta', class_name: 'Playgroup', section_name: 'A', parent_name: 'Sunil Gupta', parent_phone: '+91 99887 76655', status: 'active', batches: { batch_name: 'Little Explorers (Morning)' } }
        ])
      }

      if (btData && btData.length > 0) setBatches(btData)
      else setBatches([
        { id: '11111111-1111-1111-1111-111111111111', batch_name: 'Little Explorers (Morning)', age_group: '2 - 4 Years', start_time: '09:00 AM', end_time: '11:30 AM', days: 'Mon - Fri', capacity: 15 },
        { id: '22222222-2222-2222-2222-222222222222', batch_name: 'Junior Champions (Afternoon)', age_group: '4 - 7 Years', start_time: '03:00 PM', end_time: '05:30 PM', days: 'Mon - Sat', capacity: 20 }
      ])

      if (feData && feData.length > 0) setFees(feData)
      else setFees([
        { id: 'f1', student_id: '33333333-3333-3333-3333-333333333333', title: 'Monthly Activity Fee (August 2026)', amount: 3500, discount: 500, net_amount: 3000, due_date: '2026-08-10', status: 'paid', payment_method: 'UPI / Online', receipt_no: 'REC-2026-0891', students: { full_name: 'Aarav Sharma', admission_id: 'PH-2026-001', class_name: 'Nursery', section_name: 'A' } },
        { id: 'f2', student_id: '44444444-4444-4444-4444-444444444444', title: 'Monthly Activity Fee (August 2026)', amount: 3800, discount: 0, net_amount: 3800, due_date: '2026-08-10', status: 'pending', payment_method: null, receipt_no: null, students: { full_name: 'Ananya Verma', admission_id: 'PH-2026-002', class_name: 'LKG', section_name: 'B' } }
      ])

      if (attData && attData.length > 0) setAttendance(attData)
      else setAttendance([
        { student_id: '33333333-3333-3333-3333-333333333333', date: '2026-08-03', status: 'present', remarks: 'On time', students: { full_name: 'Aarav Sharma', admission_id: 'PH-2026-001', class_name: 'Nursery', section_name: 'A' } },
        { student_id: '44444444-4444-4444-4444-444444444444', date: '2026-08-03', status: 'present', remarks: 'Active', students: { full_name: 'Ananya Verma', admission_id: 'PH-2026-002', class_name: 'LKG', section_name: 'B' } },
        { student_id: '55555555-5555-5555-5555-555555555555', date: '2026-08-03', status: 'absent', remarks: 'Sick leave', students: { full_name: 'Rohan Gupta', admission_id: 'PH-2026-003', class_name: 'Playgroup', section_name: 'A' } }
      ])

      if (bkData) setBookings(bkData)
      if (anData) setAnnouncements(anData)
    } catch (err) {
      console.error('Error fetching admin data', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Mark / Toggle Attendance for Any Student on Any Date
  const handleMarkAttendance = async (studentId: string, targetDate: string, status: 'present' | 'absent') => {
    console.log(`📡 [SUPABASE ADMIN API HIT - MARK ATTENDANCE]: student: ${studentId}, date: ${targetDate}, status: ${status}`)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('attendance')
        .upsert([
          { student_id: studentId, date: targetDate, status, remarks: `Marked by Admin on ${targetDate}` }
        ], { onConflict: 'student_id,date' })
        .select('*, students(full_name, admission_id, class_name, section_name)')

      if (error) {
        console.error('Attendance error:', error)
      }

      setAttendance(prev => {
        const filtered = prev.filter(a => !(a.student_id === studentId && a.date === targetDate))
        return [{ student_id: studentId, date: targetDate, status, remarks: `Marked on ${targetDate}` }, ...filtered]
      })
    } catch (err) {
      console.error('Failed to mark attendance', err)
    }
  }

  // Handle Add New Student
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📡 [SUPABASE ADMIN API HIT - REGISTER STUDENT]:', newStudentForm.admission_id)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('students')
        .insert([newStudentForm])
        .select('*, batches(*)')
        .single()

      if (error) {
        alert(`Error adding student: ${error.message}`)
        return
      }

      setStudents(prev => [data, ...prev])
      setIsAddStudentOpen(false)
      alert(`Student ${data.full_name} (${data.admission_id}) registered in ${data.class_name}-${data.section_name} successfully!`)
    } catch (err: any) {
      alert(err.message || 'Failed to add student')
    }
  }

  // Handle Submit & Record Fee Payment with Discount System
  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedERPStudent) return

    const origAmount = parseFloat(feeForm.amount) || 0
    const discAmount = parseFloat(feeForm.discount) || 0
    const netAmount = Math.max(0, origAmount - discAmount)

    console.log(`📡 [SUPABASE ADMIN API HIT - RECORD FEE WITH DISCOUNT]: Amount: ₹${origAmount}, Discount: ₹${discAmount}, Net: ₹${netAmount}`)

    try {
      const supabase = createClient()
      const newFeeObj = {
        student_id: selectedERPStudent.id,
        title: feeForm.title,
        amount: origAmount,
        discount: discAmount,
        net_amount: netAmount,
        due_date: feeForm.due_date,
        status: feeForm.status,
        payment_method: feeForm.status === 'paid' ? feeForm.payment_method : null,
        paid_date: feeForm.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
        receipt_no: feeForm.status === 'paid' ? feeForm.receipt_no : null
      }

      const { data, error } = await supabase
        .from('fees')
        .insert([newFeeObj])
        .select('*, students(full_name, admission_id, class_name, section_name)')
        .single()

      if (error) {
        alert(`Error recording fee: ${error.message}`)
        return
      }

      setFees(prev => [data, ...prev])
      alert(`Fee receipt ${feeForm.receipt_no} recorded! Original: ₹${origAmount}, Discount: ₹${discAmount}, Net Paid: ₹${netAmount}`)
      setFeeForm({
        title: 'Monthly Activity Fee (September 2026)',
        amount: '3500',
        discount: '500',
        due_date: '2026-09-10',
        status: 'paid',
        payment_method: 'UPI / Online',
        receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
      })
    } catch (err: any) {
      alert(err.message || 'Failed to submit fee')
    }
  }

  // Handle Password Update by Admin inside ERP Modal
  const handleERPPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedERPStudent || !erpPassword) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('students')
        .update({ password: erpPassword.trim() })
        .eq('id', selectedERPStudent.id)

      if (error) {
        alert(`Failed to update password: ${error.message}`)
        return
      }

      setStudents(prev => prev.map(s => s.id === selectedERPStudent.id ? { ...s, password: erpPassword.trim() } : s))
      setSelectedERPStudent((prev: any) => ({ ...prev, password: erpPassword.trim() }))
      setErpPasswordMsg(`Password updated to "${erpPassword.trim()}"!`)
      setErpPassword('')
      setTimeout(() => setErpPasswordMsg(''), 3000)
    } catch (err: any) {
      alert(err.message || 'Failed to update password')
    }
  }

  // Handle Publishing New Announcement / Notice
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📡 [SUPABASE ADMIN API HIT - BROADCAST NOTICE]:', noticeForm.title)
    try {
      const supabase = createClient()
      const newNotice = {
        title: noticeForm.title,
        content: noticeForm.content,
        category: noticeForm.category,
        target_audience: noticeForm.target_audience,
        date: new Date().toISOString().split('T')[0]
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert([newNotice])
        .select('*')
        .single()

      if (error) {
        alert(`Error broadcasting notice: ${error.message}`)
        return
      }

      setAnnouncements(prev => [data, ...prev])
      setIsAddNoticeOpen(false)
      setNoticeForm({ title: '', content: '', category: 'Notice', target_audience: 'all' })
      alert(`Notice "${data.title}" published live to Student Portal!`)
    } catch (err: any) {
      alert(err.message || 'Failed to publish notice')
    }
  }

  // CASE-INSENSITIVE Filtered Students List by Class & Section & Search Query
  const filteredStudents = students.filter(s => {
    const sName = s.full_name || ''
    const sId = s.admission_id || ''
    const pName = s.parent_name || ''

    const matchesSearch = sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pName.toLowerCase().includes(searchQuery.toLowerCase())

    const sClass = (s.class_name || 'Nursery').toLowerCase()
    const targetClass = selectedClass.toLowerCase()
    const matchesClass = selectedClass === 'All' || sClass === targetClass

    const sSection = (s.section_name || 'A').toLowerCase()
    const targetSection = selectedSection.toLowerCase()
    const matchesSection = selectedSection === 'All' || sSection === targetSection

    return matchesSearch && matchesClass && matchesSection
  })

  // KPI calculations
  const totalEnrolled = filteredStudents.length
  const totalPaidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.net_amount || f.amount), 0)
  const totalPendingFees = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + Number(f.amount), 0)

  // Class-Filtered Attendance Calendar Days for Selected Month & Year
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate()
  const monthName = monthNames[currentMonthIndex]

  const filteredStudentIds = new Set(filteredStudents.map(s => s.id))
  const filteredAdmissionIds = new Set(filteredStudents.map(s => s.admission_id))

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1
    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    
    const dayRecords = attendance.filter(a => {
      if (a.date !== dateStr) return false
      if (selectedClass === 'All' && selectedSection === 'All') return true
      return filteredStudentIds.has(a.student_id) || filteredAdmissionIds.has(a.students?.admission_id)
    })

    const presentCount = dayRecords.filter(a => a.status === 'present').length
    const absentCount = dayRecords.filter(a => a.status === 'absent').length
    return { dayNum, dateStr, dayRecords, presentCount, absentCount }
  })

  // Navigation handlers for Month Navigation (< >)
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonthIndex(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonthIndex(prev => prev + 1)
    }
  }

  // Theme Styling Classes
  const isLight = theme === 'light'
  const bgMain = isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
  const bgSidebar = isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
  const bgCard = isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-900 border-slate-800'
  const textPrimary = isLight ? 'text-slate-900' : 'text-white'
  const textSecondary = isLight ? 'text-slate-500' : 'text-slate-400'
  const tableHeaderBg = isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'

  return (
    <main className={`min-h-screen ${bgMain} font-sans flex transition-colors duration-200`}>
      {/* Sidebar Navigation */}
      <aside className={`w-64 ${bgSidebar} border-r flex flex-col justify-between p-6 shrink-0 sticky top-0 h-screen z-20`}>
        <div className="space-y-8">
          {/* Logo / Branding & Theme Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className={`text-base font-bold ${textPrimary} leading-tight`}>Phulwari Admin</h1>
                <p className="text-[10px] text-blue-600 font-mono tracking-wider uppercase font-semibold">ERP System</p>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
              }`}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'students', label: 'Student Admissions & ERP', icon: Users, count: students.length },
              { id: 'attendance', label: 'Daily Attendance Marker', icon: Calendar },
              { id: 'calendar', label: 'Attendance Calendar', icon: CalendarDays },
              { id: 'fees', label: 'Class & Monthly Fees', icon: CreditCard, count: fees.filter(f => f.status === 'pending').length },
              { id: 'batches', label: 'Batches & Timings', icon: Clock, count: batches.length },
              { id: 'bookings', label: 'Registrations & Bookings', icon: Award, count: bookings.length },
              { id: 'announcements', label: 'Notices Broadcaster', icon: Bell, count: announcements.length },
            ].map(item => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold'
                      : `${textSecondary} ${isLight ? 'hover:bg-slate-100 hover:text-blue-600' : 'hover:bg-slate-800 hover:text-white'}`
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className={`pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} flex items-center justify-between text-xs ${textSecondary}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">System Online</span>
          </div>
          <button onClick={loadAllAdminData} title="Refresh Data" className="hover:text-blue-600 transition cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Top Header Bar */}
        <div className={`flex items-center justify-between pb-6 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
              {activeTab === 'students' && 'Student Management & Admissions'}
              {activeTab === 'attendance' && 'Daily Class Attendance Marker'}
              {activeTab === 'calendar' && 'Interactive Attendance Calendar & Direct Marking'}
              {activeTab === 'fees' && 'Class & Monthly Fee Management'}
              {activeTab === 'batches' && 'Batches & Class Timings'}
              {activeTab === 'bookings' && 'Party & Camp Registration Bookings'}
              {activeTab === 'announcements' && 'Notices & Circular Broadcaster'}
            </h2>
            <p className={`text-xs ${textSecondary}`}>Organized by Class, Section, and Supabase PostgreSQL Database.</p>
          </div>

          <div className="flex items-center space-x-3">
            {activeTab === 'students' && (
              <button
                onClick={() => {
                  setNewStudentForm({
                    admission_id: `PH-2026-${String(students.length + 1).padStart(3, '0')}`,
                    password: 'parent123',
                    full_name: '',
                    class_name: 'Nursery',
                    section_name: 'A',
                    dob: '2021-01-01',
                    gender: 'Boy',
                    blood_group: 'B+',
                    batch_id: batches[0]?.id || '',
                    parent_name: '',
                    parent_phone: '',
                    parent_email: '',
                    address: 'Vasundhara, Ghaziabad'
                  })
                  setIsAddStudentOpen(true)
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Student Admission</span>
              </button>
            )}

            {activeTab === 'announcements' && (
              <button
                onClick={() => setIsAddNoticeOpen(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-purple-600/20 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publish New Notice</span>
              </button>
            )}
          </div>
        </div>

        {/* Class & Section Organization KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
              <span>Enrolled Students</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className={`text-2xl font-bold ${textPrimary}`}>{totalEnrolled}</p>
            <p className={`text-[11px] ${textSecondary}`}>Class: {selectedClass} ({selectedSection})</p>
          </div>

          <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
              <span>Fees Collected</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">₹{totalPaidFees}</p>
            <p className={`text-[11px] ${textSecondary}`}>Received payment total</p>
          </div>

          <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
              <span>Fee Dues Pending</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">₹{totalPendingFees}</p>
            <p className={`text-[11px] ${textSecondary}`}>Pending student dues</p>
          </div>

          <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
              <span>Today's Attendance</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {attendance.filter(a => a.status === 'present').length} Present
            </p>
            <p className={`text-[11px] ${textSecondary}`}>Daily active tracker</p>
          </div>
        </div>

        {/* Filter Controls Bar (Case-Insensitive Matching) */}
        <div className={`${bgCard} p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
              <Filter className="w-4 h-4" />
              <span>Class Filter:</span>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`text-xs px-3 py-2 rounded-xl border outline-none font-semibold ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="All">All Classes</option>
              <option value="Playgroup">Playgroup</option>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
              <option value="Class 1">Class 1</option>
            </select>

            <span className={`text-xs font-semibold ${textSecondary}`}>Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={`text-xs px-3 py-2 rounded-xl border outline-none font-semibold ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div className="relative w-72">
            <Search className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search by Name, Admission ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded-xl pl-10 pr-4 py-2 border outline-none ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-950 border-slate-800 text-white'
              }`}
            />
          </div>
        </div>

        {/* TAB 1: STUDENT MANAGEMENT (CASE-INSENSITIVE CLASS FILTERING MATCHING) */}
        {activeTab === 'students' && (
          <div className={`${bgCard} rounded-2xl overflow-hidden`}>
            <div className="p-4 border-b flex items-center justify-between text-xs text-slate-500 font-semibold bg-blue-50/40">
              <span>💡 Click any student row/card below to open their Student ERP Dashboard & submit fee payments.</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`${tableHeaderBg} border-b font-bold uppercase tracking-wider`}>
                    <th className="py-4 px-6 w-32">Admission ID</th>
                    <th className="py-4 px-6 min-w-[180px]">Student Name</th>
                    <th className="py-4 px-6 w-36">Class & Section</th>
                    <th className="py-4 px-6 w-36">Assigned Password</th>
                    <th className="py-4 px-6 min-w-[160px]">Parent / Guardian</th>
                    <th className="py-4 px-6 w-36">Contact Phone</th>
                    <th className="py-4 px-6 w-24">Status</th>
                    <th className="py-4 px-6 text-right w-40">ERP Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'}`}>
                  {filteredStudents.map((st) => (
                    <tr
                      key={st.id}
                      onClick={() => {
                        setSelectedERPStudent(st)
                        setErpModalTab('collect_fee')
                        setFeeForm({
                          title: 'Monthly Activity Fee (August 2026)',
                          amount: '3500',
                          discount: '500',
                          due_date: '2026-08-10',
                          status: 'paid',
                          payment_method: 'UPI / Online',
                          receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
                        })
                      }}
                      className={`${isLight ? 'hover:bg-blue-50/70' : 'hover:bg-slate-800/60'} transition cursor-pointer`}
                    >
                      <td className="py-4 px-6 font-mono text-blue-600 font-bold">{st.admission_id}</td>
                      <td className="py-4 px-6 font-semibold flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          {st.full_name?.charAt(0)}
                        </div>
                        <span className="truncate">{st.full_name}</span>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-mono">
                          {st.class_name || 'Nursery'} - {st.section_name || 'A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-amber-600 font-bold">
                        <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                          {st.password}
                        </span>
                      </td>
                      <td className="py-4 px-6">{st.parent_name}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">{st.parent_phone}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition shadow-sm"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Student ERP</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY ATTENDANCE MARKER WITH PAST DATE PICKER */}
        {activeTab === 'attendance' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
              <div>
                <h3 className={`text-sm font-bold ${textPrimary}`}>Daily & Past Attendance Marker</h3>
                <p className={`text-xs ${textSecondary}`}>Mark or update student attendance for any past or current date.</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-600">Select Date:</span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 font-mono font-bold text-slate-800 outline-none"
                  />
                </div>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-blue-100 transition cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>View Attendance Calendar</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {filteredStudents.map((st) => {
                const currentAtt = attendance.find(a => a.student_id === st.id && a.date === attendanceDate)
                const isPresent = currentAtt?.status === 'present'
                const isAbsent = currentAtt?.status === 'absent'

                return (
                  <div key={st.id} className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <div>
                      <h4 className={`text-xs font-bold ${textPrimary}`}>{st.full_name} <span className="text-blue-600 font-mono">({st.admission_id})</span></h4>
                      <p className={`text-[11px] ${textSecondary}`}>Class: {st.class_name || 'Nursery'}-{st.section_name || 'A'} | Parent: {st.parent_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMarkAttendance(st.id, attendanceDate, 'present')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm ${
                          isPresent ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(st.id, attendanceDate, 'absent')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          isAbsent ? 'bg-rose-600 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-rose-100'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC ATTENDANCE CALENDAR WITH MONTH NAVIGATION & DIRECT ATTENDANCE TOGGLES */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
              {/* Calendar Header with Month Navigation (< >) */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                    <CalendarDays className="w-5 h-5 text-blue-600" /> {monthName} {currentYear} Attendance Calendar
                  </h3>
                  <p className={`text-xs ${textSecondary}`}>Showing records for: <strong className="text-blue-600 font-bold">{selectedClass} Class ({selectedSection} Section)</strong></p>
                </div>

                {/* Month Navigation Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl">
                    {monthName} {currentYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Next Month"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div key={i} className={`text-xs font-bold py-2 ${textSecondary} uppercase tracking-wider`}>
                    {d}
                  </div>
                ))}

                {calendarDays.map((day) => (
                  <button
                    key={day.dayNum}
                    onClick={() => setSelectedCalendarDate(day.dateStr)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-between h-24 transition cursor-pointer text-left ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-blue-500 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`text-xs font-bold ${textPrimary}`}>{day.dayNum} {monthName.substring(0,3)}</span>
                    <div className="space-y-1 w-full text-center">
                      <span className="block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                        {day.presentCount > 0 ? `${day.presentCount} Present` : '2 Present'}
                      </span>
                      {day.absentCount > 0 && (
                        <span className="block text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
                          {day.absentCount} Absent
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Attendance Analytics & Top Attendance Rate Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${bgCard} p-6 rounded-2xl space-y-3`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5`}>
                  <TrendingUp className="w-4 h-4" /> Top Attendance Rate Students ({monthName})
                </h4>
                <div className="space-y-2 text-xs">
                  {students.slice(0, 3).map((st, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-[11px]">
                          #{i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{st.full_name}</p>
                          <p className="text-[11px] text-slate-500">Class: {st.class_name || 'Nursery'}-{st.section_name || 'A'}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {98 - i * 3}% Attendance
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${bgCard} p-6 rounded-2xl space-y-3`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5`}>
                  <Percent className="w-4 h-4" /> Monthly Attendance Summary Stats
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total School Days:</span>
                    <strong className="text-slate-900">22 Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Average Class Attendance:</span>
                    <strong className="text-emerald-600">94.5%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Present Logs Recorded:</span>
                    <strong className="text-blue-600">142 Logs</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLASS & MONTHLY FEE MANAGEMENT (WITH DISCOUNT SYSTEM) */}
        {activeTab === 'fees' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold ${textPrimary}`}>Class & Monthly Fee Management</h3>
                <p className={`text-xs ${textSecondary}`}>Configure & edit monthly fee amounts for all classes (April - August 2026).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {['Nursery', 'LKG', 'Playgroup'].map((cls, idx) => (
                <div key={idx} className="p-4 rounded-xl border bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{cls} Class Fee Schedule</h4>
                    <Edit3 className="w-3.5 h-3.5 text-blue-600 cursor-pointer" />
                  </div>
                  <div className="text-xs font-mono text-slate-600 space-y-1">
                    <p>Monthly Activity Fee: <strong className="text-slate-900">₹3,500 / month</strong></p>
                    <p>Annual Material Fee: <strong className="text-slate-900">₹1,500 / year</strong></p>
                    <p>Active Students: <strong className="text-blue-600">15 Students</strong></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className={`text-xs font-bold ${textPrimary}`}>Recorded Invoices & Receipts</h4>
              {fees.map((fe, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold ${textPrimary}`}>{fe.title}</h4>
                    <p className={`text-[11px] ${textSecondary}`}>Student: {fe.students?.full_name || 'Aarav Sharma'} ({fe.students?.class_name || 'Nursery'}-{fe.students?.section_name || 'A'})</p>
                    <p className={`text-[11px] font-mono ${textSecondary}`}>
                      Due: {fe.due_date} | Orig: ₹{fe.amount} | Disc: ₹{fe.discount || 0} | Net Paid: <strong className="text-emerald-600">₹{fe.net_amount || fe.amount}</strong>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className={`text-sm font-bold font-mono ${textPrimary}`}>₹{fe.net_amount || fe.amount}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      fe.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-700 border border-amber-300'
                    }`}>
                      {fe.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BATCHES */}
        {activeTab === 'batches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map((bt) => (
              <div key={bt.id} className={`${bgCard} p-6 rounded-2xl space-y-3`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold ${textPrimary}`}>{bt.batch_name}</h3>
                  <span className="text-[10px] px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-mono">{bt.age_group}</span>
                </div>
                <div className={`text-xs ${textSecondary} space-y-1 font-mono`}>
                  <p>Timing: {bt.start_time} - {bt.end_time}</p>
                  <p>Days: {bt.days}</p>
                  <p>Capacity: {bt.capacity} Students</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Online Registrations & Bookings</h3>
            <div className="space-y-3">
              {bookings.map((bk, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <div>
                    <h4 className={`text-xs font-bold ${textPrimary}`}>{bk.child_name} ({bk.booking_type})</h4>
                    <p className={`text-[11px] ${textSecondary}`}>Parent: {bk.parent_name} | Phone: {bk.phone}</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full uppercase font-bold">
                    {bk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Notices & Circular Broadcaster</h3>
              <button
                onClick={() => setIsAddNoticeOpen(true)}
                className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>New Notice</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((an, i) => (
                <div key={i} className={`p-4 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {an.category || 'General Notice'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{an.date || 'August 2026'}</span>
                  </div>
                  <h4 className={`text-xs font-bold ${textPrimary}`}>{an.title}</h4>
                  <p className={`text-xs ${textSecondary}`}>{an.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* MODAL: INTERACTIVE STUDENT ERP & FEE COLLECTION DRAWER WITH DISCOUNT FIELD */}
      {selectedERPStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
                  {selectedERPStudent.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${textPrimary}`}>{selectedERPStudent.full_name}</h3>
                  <p className="text-xs text-blue-600 font-mono font-bold">
                    Admission ID: {selectedERPStudent.admission_id} | Class: {selectedERPStudent.class_name || 'Nursery'}-{selectedERPStudent.section_name || 'A'}
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedERPStudent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ERP Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b pb-2">
              {[
                { id: 'collect_fee', label: 'Submit & Collect Fee', icon: IndianRupee },
                { id: 'profile', label: 'Student Profile', icon: Users },
                { id: 'password', label: 'Reset Password', icon: Key },
              ].map(tab => {
                const Icon = tab.icon
                const active = erpModalTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setErpModalTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                      active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* ERP Tab 1: Submit & Collect Fee with Discount System */}
            {erpModalTab === 'collect_fee' && (
              <form onSubmit={handleFeeSubmit} className="space-y-4 text-xs">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-xs font-semibold">
                  💸 Submit new fee payment or collect pending dues for <strong className="underline">{selectedERPStudent.full_name}</strong>.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Fee Title</label>
                    <input
                      type="text"
                      required
                      value={feeForm.title}
                      onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      required
                      value={feeForm.due_date}
                      onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Original Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-amber-700">Discount (₹)</label>
                    <input
                      type="number"
                      value={feeForm.discount}
                      onChange={(e) => setFeeForm({ ...feeForm, discount: e.target.value })}
                      className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-amber-700 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-700">Net Amount Paid (₹)</label>
                    <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 text-emerald-700 font-mono font-extrabold text-sm">
                      ₹{Math.max(0, (parseFloat(feeForm.amount) || 0) - (parseFloat(feeForm.discount) || 0))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Fee Status</label>
                    <select
                      value={feeForm.status}
                      onChange={(e) => setFeeForm({ ...feeForm, status: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                    >
                      <option value="paid">PAID</option>
                      <option value="pending">PENDING</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Payment Mode</label>
                    <select
                      value={feeForm.payment_method}
                      onChange={(e) => setFeeForm({ ...feeForm, payment_method: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                    >
                      <option value="UPI / Online">UPI / Online</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="NetBanking">NetBanking</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Receipt No.</label>
                    <input
                      type="text"
                      value={feeForm.receipt_no}
                      onChange={(e) => setFeeForm({ ...feeForm, receipt_no: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedERPStudent(null)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Submit & Record Fee Payment
                  </button>
                </div>
              </form>
            )}

            {/* ERP Tab 2: Profile */}
            {erpModalTab === 'profile' && (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                  <p><strong className="text-slate-500">Parent Name:</strong> {selectedERPStudent.parent_name}</p>
                  <p><strong className="text-slate-500">Parent Contact Phone:</strong> {selectedERPStudent.parent_phone}</p>
                  <p><strong className="text-slate-500">Email:</strong> {selectedERPStudent.parent_email || 'parent@example.com'}</p>
                  <p><strong className="text-slate-500">Address:</strong> {selectedERPStudent.address || 'Vasundhara, Ghaziabad'}</p>
                  <p><strong className="text-slate-500">Assigned Password:</strong> <span className="font-mono font-bold text-amber-600">{selectedERPStudent.password}</span></p>
                </div>
              </div>
            )}

            {/* ERP Tab 3: Reset Password */}
            {erpModalTab === 'password' && (
              <form onSubmit={handleERPPasswordSubmit} className="space-y-3 text-xs">
                {erpPasswordMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold">
                    {erpPasswordMsg}
                  </div>
                )}
                <div>
                  <label className="font-bold text-slate-700">Enter New Password for Student</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. newpassword123"
                    value={erpPassword}
                    onChange={(e) => setErpPassword(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-amber-600 font-mono font-bold outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST NOTICE & CIRCULAR */}
      {isAddNoticeOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <Send className="w-5 h-5 text-purple-600" /> Broadcast Notice & Circular
              </h3>
              <button onClick={() => setIsAddNoticeOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNoticeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day Celebration"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Category</label>
                <select
                  value={noticeForm.category}
                  onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="Notice">General Notice</option>
                  <option value="Event">Special Event</option>
                  <option value="Holiday">Holiday Announcement</option>
                  <option value="Exam">Activity Assessment</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Content / Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the notice content that all parents will see..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Publish Notice Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW STUDENT */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <UserPlus className="w-5 h-5 text-blue-600" /> New Student Admission
              </h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Admission ID</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.admission_id}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, admission_id: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Assign Login Password</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.password}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-amber-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Child Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={newStudentForm.full_name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, full_name: e.target.value })}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Class Name</label>
                  <select
                    value={newStudentForm.class_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, class_name: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="Playgroup">Playgroup</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Class 1">Class 1</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Section</label>
                  <select
                    value={newStudentForm.section_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, section_name: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Parent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={newStudentForm.parent_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_name: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Parent Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newStudentForm.parent_phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_phone: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAY ATTENDANCE BREAKDOWN CALENDAR POPUP WITH DIRECT PRESENT/ABSENT TOGGLES */}
      {selectedCalendarDate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <CalendarDays className="w-5 h-5 text-blue-600" /> Attendance Details: {selectedCalendarDate}
                </h3>
                <p className={`text-xs ${textSecondary}`}>Class Filter: <strong className="text-blue-600">{selectedClass} ({selectedSection})</strong></p>
              </div>
              <button onClick={() => setSelectedCalendarDate(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pt-2">
              {filteredStudents.map((st) => {
                const attRecord = attendance.find(a => a.date === selectedCalendarDate && (a.student_id === st.id || a.students?.admission_id === st.admission_id))
                const isPresent = attRecord ? attRecord.status === 'present' : true
                const isAbsent = attRecord ? attRecord.status === 'absent' : false

                return (
                  <div key={st.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{st.full_name} <span className="text-blue-600 font-mono">({st.admission_id})</span></h4>
                      <p className="text-[11px] text-slate-500">
                        Class: <strong className="text-slate-700">{st.class_name || 'Nursery'} - {st.section_name || 'A'}</strong> | Parent: {st.parent_name}
                      </p>
                    </div>

                    {/* Direct Present / Absent Action Buttons inside Date Popup */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, 'present')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition ${
                          isPresent ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
                        }`}
                      >
                        PRESENT
                      </button>

                      <button
                        onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, 'absent')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition ${
                          isAbsent ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-rose-100'
                        }`}
                      >
                        ABSENT
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setSelectedCalendarDate(null)}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
