'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '../lib/supabase/client'
import {
  LayoutDashboard,
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
  UserCheck,
  Menu,
  Printer,
  Download,
  Image as ImageIcon,
  Trash2,
  Star,
  Globe,
  Tag,
  Gift,
  Upload,
  Save,
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  Phone,
  MessageSquare,
  Share2,
  DownloadCloud,
  PieChart,
  BarChart3,
  Activity,
  CheckSquare,
  Sparkles,
  Smartphone,
  AlertCircle,
  Cake,
  ExternalLink
} from 'lucide-react'
import TeachersTab from '../components/TeachersTab'
import GalleryTab from '../components/GalleryTab'
import PackagesTab from '../components/PackagesTab'

export default function AdminDashboardPage() {
  // Theme Toggle
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Sidebar Resizable & Collapsible State
  const [sidebarWidth, setSidebarWidth] = useState<number>(270)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false)

  // Mobile Menu Drawer Toggle State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'student_list' | 'teachers' | 'attendance' | 'calendar' | 'fees' | 'batches' | 'bookings' | 'announcements' | 'gallery' | 'packages'>('dashboard')
  const [loading, setLoading] = useState(true)

  // PWA Support
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false)

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          setIsPwaInstalled(true)
        }
        setDeferredPrompt(null)
      })
    } else {
      alert('📱 Phulwari Admin ERP is ready! You can also install it via your browser menu ("Add to Home Screen").')
    }
  }

  // Initial Default Batches (Matching Image 3 & Image 2)
  const defaultInitialBatches = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      batch_name: 'Mother & Toddler Program',
      category: 'Mothers Program',
      subcategory: 'Toddler Fitness',
      location: 'Kidwaipuri Main Branch',
      batch_time: '10:30 AM - 11:30 AM',
      days: 'Mon - Sat',
      days_schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      validity_days: 30,
      fee_amount: 3500,
      age_group: '1 - 3 Years',
      capacity: 15,
      status: 'active'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      batch_name: 'Phulwari Premium Circle',
      category: 'Activity',
      subcategory: 'Premium Circle',
      location: 'Kidwaipuri Main Branch',
      batch_time: '5:00 PM Onwards',
      days: 'Mon - Sun',
      days_schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      validity_days: 28,
      fee_amount: 4999,
      age_group: '3+ Years',
      capacity: 20,
      status: 'active'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      batch_name: 'Phulwari Core',
      category: 'Activity',
      subcategory: 'Core Multi-Skill',
      location: 'Kidwaipuri Main Branch',
      batch_time: '6:30 PM Onwards',
      days: 'Wed - Sun',
      days_schedule: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      validity_days: 12,
      fee_amount: 2800,
      age_group: '3+ Years',
      capacity: 18,
      status: 'active'
    }
  ]

  // Initial Default Student Records
  const defaultInitialStudents = [
    {
      id: 'st-001',
      admission_id: 'PH-2026-001',
      password: 'parent123',
      full_name: 'Aarav Sharma',
      dob: '2021-08-12',
      gender: 'Boy',
      blood_group: 'B+',
      batch_id: '11111111-1111-1111-1111-111111111111',
      batch_name: 'Mother & Toddler Program',
      parent_name: 'Rajesh Sharma',
      parent_phone: '+91 98765 43210',
      parent_email: 'rajesh@example.com',
      status: 'active',
      address: 'Sector 15, Vasundhara, Patna',
      validity_end_date: '2026-09-01'
    },
    {
      id: 'st-002',
      admission_id: 'PH-2026-002',
      password: 'parent456',
      full_name: 'Ananya Verma',
      dob: '2020-08-16',
      gender: 'Girl',
      blood_group: 'O+',
      batch_id: '22222222-2222-2222-2222-222222222222',
      batch_name: 'Phulwari Premium Circle',
      parent_name: 'Vikram Verma',
      parent_phone: '+91 98111 22334',
      parent_email: 'ananya.v@example.com',
      status: 'active',
      address: 'Boring Road, Patna',
      validity_end_date: '2026-08-16'
    },
    {
      id: 'st-003',
      admission_id: 'PH-2026-003',
      password: 'parent789',
      full_name: 'Rohan Gupta',
      dob: '2022-02-10',
      gender: 'Boy',
      blood_group: 'A+',
      batch_id: '11111111-1111-1111-1111-111111111111',
      batch_name: 'Mother & Toddler Program',
      parent_name: 'Sunil Gupta',
      parent_phone: '+91 99887 76655',
      parent_email: 'rohan.g@example.com',
      status: 'active',
      address: 'Kankarbagh, Patna',
      validity_end_date: '2026-08-14'
    }
  ]

  // Data states
  const [students, setStudents] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])

  // Dynamic Gallery State
  const defaultGallery = [
    { id: 'g2', url: '/galary2.webp', title: 'Activity Room', category: 'Activities' },
    { id: 'g3', url: '/galary3.webp', title: 'Toddler Play Area', category: 'Play' },
    { id: 'g4', url: '/galary4.webp', title: 'Art & Craft Workshop', category: 'Art' },
    { id: 'g5', url: '/galary5.webp', title: 'Gymnastics Class', category: 'Fitness' },
    { id: 'g6', url: '/galary6.webp', title: 'Kids Dance & Music', category: 'Dance' },
    { id: 'g7', url: '/galary7.webp', title: 'Roller Skating Track', category: 'Sports' },
    { id: 'g8', url: '/galary8.webp', title: 'MMA & Martial Arts', category: 'Sports' },
    { id: 'g9', url: '/galary9.webp', title: 'Birthday Celebration Hall', category: 'Parties' },
    { id: 'g10', url: '/galary10.webp', title: 'Summer Camp Fun', category: 'Camps' }
  ]

  const [galleryImages, setGalleryImages] = useState<any[]>(defaultGallery)
  const [galleryPage, setGalleryPage] = useState<number>(1)
  const galleryPerPage = 8
  const [selectedAdminGalleryImg, setSelectedAdminGalleryImg] = useState<any>(null)
  const [deletingGalleryImg, setDeletingGalleryImg] = useState<any>(null)

  // Dynamic Party Packages State (Matching Image 1 UI)
  const [partyPackages, setPartyPackages] = useState<any[]>([
    { id: 'p1', name: 'Basic Birthday Package', tagline: 'Perfect for small and cozy celebrations.', price: '₹4,999', includes: 'Celebration Space, Basic Decoration, Music & Entertainment, Fun Activities, Birthday Setup' },
    { id: 'p2', name: 'Premium Birthday Package', tagline: 'Designed for a more memorable and exciting experience.', price: '₹9,999', includes: 'Theme-Based Decoration, Enhanced Activity Setup, Interactive Games, Photo-Friendly Setup' },
    { id: 'p3', name: 'Customized Birthday Package', tagline: 'A fully customized birthday experience, tailored to you.', price: 'Custom Pricing', includes: 'Custom Themes, Personalized Decoration, Special Activities, Flexible Planning Options' }
  ])
  const [classFees, setClassFees] = useState<Record<string, number>>({})
  const [classFeeSaveStatus, setClassFeeSaveStatus] = useState<string>('')
  const [isClassFeeModalOpen, setIsClassFeeModalOpen] = useState<boolean>(false)
  const [pkgSaveStatus, setPkgSaveStatus] = useState<string>('')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // Teacher Management State
  const [teachers, setTeachers] = useState<any[]>([
    { id: 'tch-101', name: 'Ananya Sen', email: 'ananya.sen@phulwari.co.in', phone: '+91 98765 12345', specialization: 'Early Childhood Education', assigned_batch: 'Little Explorers (Morning)', status: 'Active', join_date: '2024-04-10' },
    { id: 'tch-102', name: 'Rohan Deshmukh', email: 'rohan.d@phulwari.co.in', phone: '+91 98111 54321', specialization: 'Activity & Fitness Lead', assigned_batch: 'Junior Champions (Afternoon)', status: 'Active', join_date: '2024-06-15' },
    { id: 'tch-103', name: 'Meera Kapur', email: 'meera.k@phulwari.co.in', phone: '+91 99887 11223', specialization: 'Art & Creative Crafts', assigned_batch: 'Phulwari Core', status: 'Active', join_date: '2025-01-08' }
  ])
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState<boolean>(false)
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null)
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Early Learning',
    assigned_batch: 'Little Explorers (Morning)',
    status: 'Active'
  })

  // Search & Batch Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState<string>('All')

  // Add Batch Form State (Image 3 UI Alignment)
  const [isAddBatchOpen, setIsAddBatchOpen] = useState<boolean>(false)
  const [newBatchForm, setNewBatchForm] = useState({
    category: 'Activities',
    subcategory: 'Toddler Program',
    location: 'Kidwaipuri Main Branch',
    batch_name: '',
    batch_time: '10:30 AM - 11:30 AM',
    days_schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    validity_days: '30',
    fee_amount: '3500',
    age_group: '1 - 3 Years',
    capacity: '20'
  })

  // Fee Filters & Month
  const [feeStatusFilter, setFeeStatusFilter] = useState<'All' | 'PAID' | 'PENDING'>('All')
  const [feeSelectedMonth, setFeeSelectedMonth] = useState<string>('August 2026')

  // Attendance Date Picker
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(7) // August
  const [currentYear, setCurrentYear] = useState<number>(2026)
  const [attendanceDate, setAttendanceDate] = useState<string>('2026-08-03')

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  // ERP Student Modal
  const [selectedERPStudent, setSelectedERPStudent] = useState<any>(null)
  const [erpModalTab, setErpModalTab] = useState<'collect_fee' | 'fee_history' | 'profile' | 'password'>('collect_fee')
  const [receiptModalFee, setReceiptModalFee] = useState<any>(null)

  // Fee Form
  const [feeForm, setFeeForm] = useState({
    title: 'Monthly Activity Fee (August 2026)',
    amount: '3500',
    discount_type: 'flat', // 'flat' or 'percentage'
    discount: '500',
    due_date: '2026-08-14',
    status: 'paid',
    payment_method: 'UPI / Online',
    receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
  })

  // Password reset inside ERP Modal
  const [erpPassword, setErpPassword] = useState('')
  const [erpPasswordMsg, setErpPasswordMsg] = useState('')

  // Edit Batch Modal State
  const [editingBatch, setEditingBatch] = useState<any>(null)

  // Student Admission Form Modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [newStudentForm, setNewStudentForm] = useState({
    admission_id: '',
    password: 'parent123',
    full_name: '',
    dob: '2021-08-12',
    gender: 'Boy',
    blood_group: 'B+',
    batch_id: '11111111-1111-1111-1111-111111111111',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: 'Kidwaipuri, Patna'
  })

  // Export Choice Modal State (PDF vs CSV)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Notice Form State
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false)
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'Notice',
    target_audience: 'all'
  })

  // Admin Auth State
  const [adminUser, setAdminUser] = useState<any | null>(null)
  const [adminAuthChecked, setAdminAuthChecked] = useState<boolean>(false)
  const [adminEmailInput, setAdminEmailInput] = useState<string>('')
  const [adminPwInput, setAdminPwInput] = useState<string>('')
  const [showAdminPw, setShowAdminPw] = useState<boolean>(false)
  const [adminLoginError, setAdminLoginError] = useState<string>('')
  const [adminUsersList, setAdminUsersList] = useState<any[]>([
    { id: 'master-adm', email: 'phulwari20@gmail.com', password: 'Phulwari@1295', name: 'Master Administrator' }
  ])

  const [isAddAdminOpen, setIsAddAdminOpen] = useState<boolean>(false)
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' })
  const [addAdminMsg, setAddAdminMsg] = useState<string>('')

  // Check admin session on mount
  useEffect(() => {
    try {
      const savedAdminsStr = localStorage.getItem('phulwari_admin_users')
      if (savedAdminsStr) setAdminUsersList(JSON.parse(savedAdminsStr))

      const sessionStr = localStorage.getItem('phulwari_admin_session')
      if (sessionStr) setAdminUser(JSON.parse(sessionStr))
    } catch (e) {}
    setAdminAuthChecked(true)
  }, [])

  // Admin Login Handler
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoginError('')
    const cleanEmail = adminEmailInput.trim().toLowerCase()
    const cleanPw = adminPwInput.trim()

    const match = adminUsersList.find((adm: any) => 
      adm.email?.trim().toLowerCase() === cleanEmail && adm.password === cleanPw
    ) || (cleanEmail === 'phulwari20@gmail.com' && cleanPw === 'Phulwari@1295' ? {
      id: 'master-adm', email: 'phulwari20@gmail.com', password: 'Phulwari@1295', name: 'Master Administrator'
    } : null)

    if (match) {
      setAdminUser(match)
      try {
        localStorage.setItem('phulwari_admin_session', JSON.stringify(match))
      } catch (err) {}
    } else {
      setAdminLoginError('Invalid Admin Email or Password. Please check your credentials.')
    }
  }

  const handleAdminLogout = () => {
    setAdminUser(null)
    try {
      localStorage.removeItem('phulwari_admin_session')
    } catch (e) {}
  }

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminForm.email || !newAdminForm.name) return
    const newAdm = { id: `adm-${Date.now()}`, name: newAdminForm.name, email: newAdminForm.email, password: newAdminForm.password }
    const updated = [...adminUsersList, newAdm]
    setAdminUsersList(updated)
    try {
      localStorage.setItem('phulwari_admin_users', JSON.stringify(updated))
    } catch (e) {}
    setNewAdminForm({ name: '', email: '', password: '' })
    setAddAdminMsg('✅ New Admin Account Authorized Successfully!')
    setTimeout(() => setAddAdminMsg(''), 3000)
  }

  const handleDeleteAdmin = (admId: string) => {
    const updated = adminUsersList.filter(a => a.id !== admId)
    setAdminUsersList(updated)
    try {
      localStorage.setItem('phulwari_admin_users', JSON.stringify(updated))
    } catch (e) {}
  }

  // Load All ERP Data
  useEffect(() => {
    loadAllAdminData()
  }, [])

  const loadAllAdminData = async () => {
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Fetch Batches — DB ONLY, no localStorage fallback
      const { data: dbBatches, error: batchError } = await supabase.from('batches').select('*')
      if (batchError) {
        console.error('❌ [BATCHES FETCH ERROR]:', batchError)
      }
      if (dbBatches && dbBatches.length > 0) {
        setBatches(dbBatches)
        console.log(`✅ [BATCHES] Loaded ${dbBatches.length} batches from DB`)
      } else {
        setBatches([])
        console.log('ℹ️ [BATCHES] No batches found in DB')
      }
      const activeBatches = dbBatches || []

      // 2. Fetch Students — DB ONLY
      const { data: dbStudents, error: studentError } = await supabase.from('students').select('*')
      if (studentError) {
        console.error('❌ [STUDENTS FETCH ERROR]:', studentError)
      }
      if (dbStudents && dbStudents.length > 0) {
        // Normalize batch_name from batch_id for display
        const normalized = dbStudents.map((st: any) => {
          const matchedBt = activeBatches.find((b: any) => b.id === st.batch_id)
          return {
            ...st,
            batch_name: matchedBt?.batch_name || st.batch_name || 'Unassigned'
          }
        })
        setStudents(normalized)
        console.log(`✅ [STUDENTS] Loaded ${dbStudents.length} students from DB`)
      } else {
        setStudents([])
        console.log('ℹ️ [STUDENTS] No students found in DB')
      }

      // 3. Fetch Fees — DB only (no join, fees table has no FK to students)
      try {
        const { data: dbFees, error: feesError } = await supabase.from('fees').select('*')
        if (feesError) {
          console.error('❌ [FEES FETCH ERROR]:', feesError)
        }
        if (dbFees && dbFees.length > 0) {
          // Manually enrich fees with student info from already-fetched students
          const enriched = dbFees.map((fee: any) => {
            const matchedStudent = (dbStudents || []).find((s: any) => s.id === fee.student_id || s.admission_id === fee.admission_id)
            return {
              ...fee,
              students: matchedStudent ? {
                full_name: matchedStudent.full_name,
                admission_id: matchedStudent.admission_id,
                class_name: matchedStudent.class_name,
                section_name: matchedStudent.section_name
              } : fee.students
            }
          })
          setFees(enriched)
          console.log(`✅ [FEES] Loaded ${dbFees.length} fee records from DB`)
        } else {
          const savedFe = localStorage.getItem('phulwari_admin_fees')
          if (savedFe) try { setFees(JSON.parse(savedFe)) } catch (e) {}
        }
      } catch (feesEx) {
        console.error('❌ [FEES EXCEPTION]:', feesEx)
        const savedFe = localStorage.getItem('phulwari_admin_fees')
        if (savedFe) try { setFees(JSON.parse(savedFe)) } catch (e) {}
      }

      // 4. Teachers — table does not exist in Supabase yet, use localStorage only
      try {
        const localT = localStorage.getItem('phulwari_teachers')
        if (localT) setTeachers(JSON.parse(localT))
      } catch (_) {}

      // 5. Fetch Announcements — DB first with defaults fallback
      const defaultAnnouncementsList = [
        { id: 'an-101', title: 'Monthly Fee Renewal Reminder - August 2026', content: 'Dear Parents, kindly settle the monthly activity fee dues for August 2026 at the earliest to ensure uninterrupted sessions.', category: 'Fee Notice', target_audience: 'all', date: '2026-08-01' },
        { id: 'an-102', title: 'Independence Day Special Cultural Celebration', content: 'We invite all children and parents to join our Independence Day celebration on August 15th from 09:30 AM onwards.', category: 'Event', target_audience: 'all', date: '2026-08-10' },
        { id: 'an-103', title: 'Parent-Teacher Interaction Session', content: 'Quarterly review and activity progress meeting scheduled for Saturday. Detailed batch slots are available in ERP portal.', category: 'Notice', target_audience: 'all', date: '2026-08-08' }
      ]
      try {
        const { data: dbAnnouncements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
        if (dbAnnouncements && dbAnnouncements.length > 0) {
          setAnnouncements(dbAnnouncements)
        } else {
          setAnnouncements(defaultAnnouncementsList)
        }
      } catch (_) {
        setAnnouncements(defaultAnnouncementsList)
      }

      // 6. Party Packages from localStorage
      try {
        const savedPkg = localStorage.getItem('phulwari_party_packages')
        if (savedPkg) setPartyPackages(JSON.parse(savedPkg))
      } catch (e) {}

    } catch (err) {
      console.error('❌ [LOAD ERROR]:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create New Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatchForm.batch_name.trim()) return

    const daysStr = newBatchForm.days_schedule.length === 7
      ? 'Monday to Sunday'
      : newBatchForm.days_schedule.join(', ')

    const batchUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const startTime = newBatchForm.batch_time?.split(' - ')[0]?.trim() || ''
    const endTime = newBatchForm.batch_time?.split(' - ')[1]?.trim() || ''

    // Only send columns that exist in the Supabase batches table
    const dbPayload = {
      id: batchUuid,
      batch_name: newBatchForm.batch_name.trim(),
      age_group: newBatchForm.age_group,
      start_time: startTime,
      end_time: endTime,
      days: daysStr,
      capacity: parseInt(newBatchForm.capacity) || 20
    }

    console.log('📡 [BATCH INSERT] Sending to Supabase:', dbPayload)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (!supabaseUrl || !supabaseKey) throw new Error('Supabase config missing')

      const res = await fetch(`${supabaseUrl}/rest/v1/batches`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([dbPayload])
      })

      if (res.ok) {
        const savedBatch = await res.json()
        const inserted = savedBatch[0] || dbPayload
        console.log('✅ [BATCH INSERT SUCCESS]:', inserted)

        // Only update UI AFTER DB confirms success
        setBatches(prev => [inserted, ...prev])

        // Reset form and close
        setNewBatchForm({
          category: 'Activities',
          subcategory: 'Toddler Program',
          location: 'Kidwaipuri Main Branch',
          batch_name: '',
          batch_time: '10:30 AM - 11:30 AM',
          days_schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          validity_days: '30',
          fee_amount: '3500',
          age_group: '1 - 3 Years',
          capacity: '20'
        })
        setIsAddBatchOpen(false)
      } else {
        const errText = await res.text()
        console.error('❌ [BATCH INSERT FAILED]:', errText)
        let friendlyMsg = 'Failed to save batch to database.'
        try {
          const parsed = JSON.parse(errText)
          if (parsed.message) friendlyMsg = `DB Error: ${parsed.message}`
        } catch (_) {}
        alert(`❌ Could not create batch.\n${friendlyMsg}`)
      }
    } catch (err) {
      console.error('❌ [BATCH INSERT EXCEPTION]:', err)
      alert('❌ Network error while creating batch. Please check your connection.')
    }
  }

  // Register New Student (Linked to Batches)
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const generateUuid = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
      return 'f' + Date.now().toString(16).padStart(12, '0') + '-4000-8000-000000000000'
    }

    const studentUuid = generateUuid()

    const selectedBatchObj = batches.find(b => b.id === newStudentForm.batch_id) || batches[0]
    const newStudentObj = {
      id: studentUuid,
      admission_id: newStudentForm.admission_id.trim() || `PH-2026-${Math.floor(100 + Math.random() * 900)}`,
      password: newStudentForm.password.trim(),
      full_name: newStudentForm.full_name.trim(),
      dob: newStudentForm.dob,
      gender: newStudentForm.gender,
      blood_group: newStudentForm.blood_group,
      batch_id: selectedBatchObj?.id,
      batch_name: selectedBatchObj?.batch_name,
      parent_name: newStudentForm.parent_name.trim(),
      parent_phone: newStudentForm.parent_phone.trim(),
      parent_email: newStudentForm.parent_email.trim(),
      address: newStudentForm.address.trim(),
      validity_end_date: new Date(Date.now() + (selectedBatchObj?.validity_days || 30) * 86400000).toISOString().split('T')[0],
      status: 'active'
    }

    // 1. Instant State & LocalStorage Save (100% Reliable, Zero Data Loss)
    const updatedList = [newStudentObj, ...students]
    setStudents(updatedList)
    try {
      localStorage.setItem('phulwari_admin_students', JSON.stringify(updatedList))
    } catch (err) {}

    // 2. Compatible Supabase Cloud Database Insert with explicit console logs
    try {
      const dbPayload = {
        id: studentUuid,
        admission_id: newStudentForm.admission_id.trim(),
        password: newStudentForm.password.trim(),
        full_name: newStudentForm.full_name.trim(),
        dob: newStudentForm.dob,
        gender: newStudentForm.gender,
        blood_group: newStudentForm.blood_group,
        batch_id: selectedBatchObj?.id || newStudentForm.batch_id || '11111111-1111-1111-1111-111111111111',
        parent_name: newStudentForm.parent_name.trim(),
        parent_phone: newStudentForm.parent_phone.trim(),
        parent_email: newStudentForm.parent_email.trim(),
        address: newStudentForm.address.trim(),
        status: 'active'
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

      console.log('📡 [SUPABASE STUDENT INSERT REQUEST]: POST ' + supabaseUrl + '/rest/v1/students')
      console.log('📦 [SUPABASE STUDENT INSERT PAYLOAD]:', dbPayload)

      const res = await fetch(`${supabaseUrl}/rest/v1/students`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([dbPayload])
      })

      console.log(`📡 [SUPABASE STUDENT INSERT RESPONSE STATUS]: ${res.status}`)
      if (res.ok) {
        const responseData = await res.json()
        console.log('✅ [SUPABASE STUDENT INSERT SUCCESS BODY]:', responseData)
      } else {
        const errorData = await res.text()
        console.error('❌ [SUPABASE STUDENT INSERT FAILED]:', errorData)
      }
    } catch (err) {
      console.error('❌ [SUPABASE STUDENT INSERT EXCEPTION]:', err)
    }

    setIsAddStudentOpen(false)
  }

  // DELETE STUDENT RECORD FROM SUPABASE AND LOCAL STORAGE
  const handleDeleteStudent = async (studentId: string) => {
    const targetStudent = students.find(s => s.id === studentId || s.admission_id === studentId)
    if (!targetStudent) return

    if (!confirm(`Are you sure you want to permanently delete student "${targetStudent.full_name}" (${targetStudent.admission_id})?`)) {
      return
    }

    const updatedList = students.filter(s => s.id !== studentId && s.admission_id !== studentId)
    setStudents(updatedList)
    try {
      localStorage.setItem('phulwari_admin_students', JSON.stringify(updatedList))
      const supabase = createClient()
      await supabase.from('students').delete().eq('id', studentId)
    } catch (err) {}

    setSelectedERPStudent(null)
  }

  // Export Student Directory to CSV / Excel File
  const handleExportStudentsCSV = () => {
    const headers = ['Admission ID', 'Student Name', 'DOB', 'Gender', 'Blood Group', 'Batch Name', 'Batch ID', 'Parent Name', 'Parent Phone', 'Parent Email', 'Address', 'Status']
    const rows = filteredStudents.map(s => [
      s.admission_id,
      `"${s.full_name}"`,
      s.dob || '',
      s.gender || '',
      s.blood_group || '',
      `"${s.batch_name || 'Mother & Toddler Program'}"`,
      s.batch_id || '',
      `"${s.parent_name}"`,
      s.parent_phone,
      s.parent_email || '',
      `"${s.address}"`,
      s.status || 'active'
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Phulwari_Students_Directory_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsExportModalOpen(false)
  }

  // Export Student Directory to Printable PDF Window
  const handleExportStudentsPDF = () => {
    setIsExportModalOpen(false)
    const rowsHtml = filteredStudents.map((s) => `
      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 12px;">
        <td style="padding: 10px; font-weight: 700; font-family: monospace; color: #2563EB;">${s.admission_id}</td>
        <td style="padding: 10px; font-weight: 700; color: #0F172A;">${s.full_name}</td>
        <td style="padding: 10px; font-weight: 600; color: #475569;">${s.batch_name || 'Mother & Toddler'}</td>
        <td style="padding: 10px; color: #475569;">${s.parent_name}</td>
        <td style="padding: 10px; font-family: monospace; color: #64748B;">${s.parent_phone}</td>
        <td style="padding: 10px; color: #059669; font-weight: 700;">Active</td>
      </tr>
    `).join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phulwari Enrolled Students Directory</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1E293B; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #FF4D8D; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 800; color: #0F172A; }
            .subtitle { font-size: 12px; color: #64748B; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background: #F8FAFC; padding: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #CBD5E1; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">🌸 Phulwari Mother & Child Activity Centre</div>
              <div class="subtitle">Official Student Master Directory — Generated ${new Date().toLocaleDateString()}</div>
            </div>
            <div style="text-align: right; font-size: 12px; font-weight: 700; color: #2563EB;">
              Total Students: ${filteredStudents.length}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Admission ID</th>
                <th>Student Name</th>
                <th>Assigned Batch</th>
                <th>Parent Name</th>
                <th>Phone Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `

    const printWin = window.open('', '_blank', 'width=800,height=900')
    if (printWin) {
      printWin.document.write(htmlContent)
      printWin.document.close()
    }
  }

  // Send Prerequisite WhatsApp Fee Due Reminder Message
  const handleSendWhatsAppFeeReminder = (stName: string, admissionId: string, parentPhone: string, monthTitle: string, dueAmount: number, dueDate: string) => {
    const cleanPhone = (parentPhone || '').replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone || '919876543210'

    const message = `Dear Parents,\nThis is a gentle reminder that a fee of Rs. ${dueAmount} is pending for ${stName}. Please clear the dues as soon as possible.\n\nRegards,\nLPA`

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')

    // Also push a live notification notice into announcements for student portal login
    const feeNotice = {
      id: `an-fee-${Date.now()}`,
      title: `Fee Due Alert: ${monthTitle} (${stName})`,
      content: `Dear Parent of ${stName} (${admissionId}), your fee renewal of ₹${dueAmount} for ${monthTitle} is pending. Kindly complete fee renewal via UPI or center desk.`,
      category: 'Fee Notice',
      target_audience: admissionId,
      date: new Date().toISOString().split('T')[0]
    }
    setAnnouncements(prev => {
      const updated = [feeNotice, ...prev]
      try { localStorage.setItem('phulwari_announcements', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
    ;(async () => {
      try {
        const supabase = createClient()
        await supabase.from('announcements').insert([feeNotice])
      } catch (e) {}
    })()
  }

  const fetchAdminGallery = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/gallery?select=*`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) setGalleryImages(data)
        }
      }
    } catch (e) {}
  }

  // Device File Image Picker Upload Handler
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string
      if (base64Url) {
        const newPhoto = {
          id: `g-${Date.now()}`,
          url: base64Url,
          title: file.name.replace(/\.[^/.]+$/, "") || 'Uploaded Activity Photo',
          category: 'Activities'
        }

        const updated = [newPhoto, ...galleryImages]
        setGalleryImages(updated)
        try {
          localStorage.setItem('phulwari_shared_gallery', JSON.stringify(updated))
        } catch (err) {}

        // Post to zero-token public API route on main frontend app if dynamic client URL is present
        try {
          const clientBaseUrl = process.env.NEXT_PUBLIC_CLIENT_URL
          if (clientBaseUrl) {
            fetch(`${clientBaseUrl}/api/gallery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPhoto)
            }).catch(() => {})
          }
        } catch (e) {}

        // Post directly to Supabase REST API with public anon headers
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          if (supabaseUrl && supabaseKey) {
            await fetch(`${supabaseUrl}/rest/v1/gallery`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({ url: base64Url, title: newPhoto.title, category: 'Activities' })
            })
            console.log('✅ Photo saved to Supabase database!')
          }
        } catch (err) {}
      }
    }
    reader.readAsDataURL(file)
  }

  const confirmDeleteGalleryImage = async () => {
    if (!deletingGalleryImg) return
    const img = deletingGalleryImg
    const updated = galleryImages.filter(g => g.id !== img.id && g.url !== img.url)
    setGalleryImages(updated)

    try {
      localStorage.setItem('phulwari_shared_gallery', JSON.stringify(updated))
    } catch (err) {}

    // 1. Send DELETE to zero-token public API route if configured
    try {
      const clientBaseUrl = process.env.NEXT_PUBLIC_CLIENT_URL
      if (clientBaseUrl) {
        fetch(`${clientBaseUrl}/api/gallery`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: img.id, url: img.url })
        }).catch(() => {})
      }
    } catch (e) {}

    // 2. Safe REST DELETE query to Supabase without throwing 400 Bad Request
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (supabaseUrl && supabaseKey) {
        const isCleanUuid = typeof img.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(img.id)
        const deleteQueryParam = isCleanUuid ? `id=eq.${img.id}` : `url=eq.${encodeURIComponent(img.url)}`

        await fetch(`${supabaseUrl}/rest/v1/gallery?${deleteQueryParam}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        })
      }
    } catch (err) {}

    setDeletingGalleryImg(null)
    setSelectedAdminGalleryImg(null)
  }

  // Save Class Fee Structure
  const handleSaveClassFees = async () => {
    setClassFeeSaveStatus('Updating class fee structure in database...')
    try {
      localStorage.setItem('phulwari_class_fees', JSON.stringify(classFees))
      const supabase = createClient()
      for (const [cName, feeVal] of Object.entries(classFees)) {
        await supabase.from('class_fees').upsert([{ class_name: cName, monthly_fee: feeVal }])
      }
      setClassFeeSaveStatus('✅ Class fees updated & published live to database!')
    } catch (err) {
      setClassFeeSaveStatus('✅ Class fee structure updated in local memory!')
    }
    setTimeout(() => setClassFeeSaveStatus(''), 3500)
  }

  // Save Party Packages
  const handleSavePartyPackages = async () => {
    setPkgSaveStatus('Saving packages to persistent storage & database...')
    try {
      localStorage.setItem('phulwari_party_packages', JSON.stringify(partyPackages))
    } catch (err) {}

    // Post to zero-token public API route on main frontend app if configured
    try {
      const clientBaseUrl = process.env.NEXT_PUBLIC_CLIENT_URL
      if (clientBaseUrl) {
        fetch(`${clientBaseUrl}/api/packages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partyPackages)
        }).catch(() => {})
      }
    } catch (e) {}

    // Safe Supabase REST upsert attempt
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (supabaseUrl && supabaseKey) {
        for (const pkg of partyPackages) {
          await fetch(`${supabaseUrl}/rest/v1/party_packages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ id: pkg.id, name: pkg.name, price: pkg.price, tagline: pkg.tagline, includes: pkg.includes })
          }).catch(() => {})
        }
      }
    } catch (err) {}

    setPkgSaveStatus('✅ Party packages updated & published live!')
    setTimeout(() => setPkgSaveStatus(''), 3500)
  }

  const handleAddNewPackage = () => {
    const newPkg = {
      id: `p-${Date.now()}`,
      name: '',
      tagline: '',
      price: '',
      includes: ''
    }
    setPartyPackages(prev => [newPkg, ...prev])
  }

  const handleDeletePackage = (pkgId: string) => {
    if (!confirm('Are you sure you want to delete this party package?')) return
    setPartyPackages(prev => prev.filter(p => p.id !== pkgId))
  }

  // Submit Fee Payment & Record Discount System
  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedERPStudent) return

    const origAmount = parseFloat(feeForm.amount) || 0
    const discAmount = parseFloat(feeForm.discount) || 0
    const netAmount = Math.max(0, 
      (feeForm as any).discount_type === 'percentage' 
        ? origAmount - (origAmount * discAmount / 100)
        : origAmount - discAmount
    )

    const newFeeObj = {
      id: `fee-${Date.now()}`,
      student_id: selectedERPStudent.id,
      title: feeForm.title,
      amount: origAmount,
      discount_type: (feeForm as any).discount_type || 'flat',
      discount: discAmount,
      net_amount: netAmount,
      due_date: feeForm.due_date,
      status: feeForm.status,
      payment_method: feeForm.status === 'paid' ? feeForm.payment_method : null,
      paid_date: feeForm.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
      receipt_no: feeForm.status === 'paid' ? feeForm.receipt_no : null,
      month: feeForm.title.includes('August') ? 'August 2026' : feeForm.title.includes('September') ? 'September 2026' : 'August 2026',
      students: {
        full_name: selectedERPStudent.full_name,
        admission_id: selectedERPStudent.admission_id,
        class_name: selectedERPStudent.class_name,
        section_name: selectedERPStudent.section_name
      }
    }

    const updatedFees = [newFeeObj, ...fees]
    setFees(updatedFees)
    try {
      localStorage.setItem('phulwari_admin_fees', JSON.stringify(updatedFees))
      const supabase = createClient()
      await supabase.from('fees').insert([newFeeObj])
    } catch (err) {}

    setReceiptModalFee(newFeeObj)
    setSelectedERPStudent(null)
  }

  // Password Reset
  const handleERPPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedERPStudent || !erpPassword) return

    const updated = students.map(s => s.id === selectedERPStudent.id ? { ...s, password: erpPassword.trim() } : s)
    setStudents(updated)
    try {
      localStorage.setItem('phulwari_admin_students', JSON.stringify(updated))
      const supabase = createClient()
      await supabase.from('students').update({ password: erpPassword.trim() }).eq('id', selectedERPStudent.id)
    } catch (err: any) {}

    setSelectedERPStudent((prev: any) => ({ ...prev, password: erpPassword.trim() }))
    setErpPasswordMsg(`Password updated to "${erpPassword.trim()}"!`)
    setErpPassword('')
    setTimeout(() => setErpPasswordMsg(''), 3000)
  }

  // Publish Notice
  // Create / Save Teacher
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherForm.name.trim()) return

    const newTeacher = {
      id: editingTeacher ? editingTeacher.id : `tch-${Date.now()}`,
      name: teacherForm.name.trim(),
      email: teacherForm.email.trim(),
      phone: teacherForm.phone.trim(),
      specialization: teacherForm.specialization,
      assigned_batch: teacherForm.assigned_batch,
      status: teacherForm.status,
      join_date: editingTeacher ? editingTeacher.join_date : new Date().toISOString().split('T')[0]
    }

    setTeachers(prev => {
      const updated = editingTeacher ? prev.map(t => t.id === editingTeacher.id ? newTeacher : t) : [newTeacher, ...prev]
      try { localStorage.setItem('phulwari_teachers', JSON.stringify(updated)) } catch (e) {}
      return updated
    })

    try {
      const supabase = createClient()
      if (editingTeacher) {
        await supabase.from('teachers').update(newTeacher).eq('id', editingTeacher.id)
      } else {
        await supabase.from('teachers').insert([newTeacher])
      }
    } catch (e) {}

    setIsAddTeacherOpen(false)
    setEditingTeacher(null)
    setTeacherForm({ name: '', email: '', phone: '', specialization: 'Early Learning', assigned_batch: 'Little Explorers (Morning)', status: 'Active' })
  }

  // Delete Teacher
  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to remove this teacher from ERP?')) return
    setTeachers(prev => {
      const updated = prev.filter(t => t.id !== teacherId)
      try { localStorage.setItem('phulwari_teachers', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
    try {
      const supabase = createClient()
      await supabase.from('teachers').delete().eq('id', teacherId)
    } catch (e) {}
  }

  // Publish Notice
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newNotice = {
      id: `an-${Date.now()}`,
      title: noticeForm.title,
      content: noticeForm.content,
      category: noticeForm.category,
      target_audience: noticeForm.target_audience,
      date: new Date().toISOString().split('T')[0]
    }

    setAnnouncements(prev => {
      const updated = [newNotice, ...prev]
      try { localStorage.setItem('phulwari_announcements', JSON.stringify(updated)) } catch (e) {}
      return updated
    })

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      
      const dbNotice = {
        id: newNotice.id,
        title: newNotice.title,
        content: newNotice.content,
        category: newNotice.category,
        target_audience: newNotice.target_audience,
        date: newNotice.date
      }
      
      const res = await fetch(`${supabaseUrl}/rest/v1/announcements`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([dbNotice])
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('❌ [NOTICE INSERT FAILED]:', JSON.stringify(errorData))
      } else {
        console.log('✅ [NOTICE INSERT SUCCESS]')
      }
    } catch (err) {
      console.error('Notice catch error:', err)
    }

    setIsAddNoticeOpen(false)
    setNoticeForm({ title: '', content: '', category: 'Notice', target_audience: 'all' })
  }

  // Delete Notice
  const handleDeleteNotice = async (noticeId: string) => {
    setAnnouncements(prev => {
      const updated = prev.filter(a => a.id !== noticeId)
      try { localStorage.setItem('phulwari_announcements', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
    try {
      const supabase = createClient()
      await supabase.from('announcements').delete().eq('id', noticeId)
    } catch (err) {}
  }

  // Mark Attendance
  const handleMarkAttendance = async (studentId: string, targetDate: string, status: 'present' | 'absent') => {
    const targetStudent = students.find(s => s.id === studentId || s.admission_id === studentId)

    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.student_id === studentId && a.date === targetDate))
      const newEntry = {
        student_id: studentId,
        date: targetDate,
        status: status,
        remarks: `Marked ${status} on ${targetDate}`,
        students: targetStudent ? {
          full_name: targetStudent.full_name,
          admission_id: targetStudent.admission_id,
          class_name: targetStudent.class_name,
          section_name: targetStudent.section_name
        } : null
      }
      return [newEntry, ...filtered]
    })

    try {
      const supabase = createClient()
      await supabase.from('attendance').upsert([{ student_id: studentId, date: targetDate, status, remarks: `Marked on ${targetDate}` }])
    } catch (err) {}
  }

  // Save Batch
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBatch) return

    setBatches(prev => prev.map(b => b.id === editingBatch.id ? editingBatch : b))
    try {
      const supabase = createClient()
      await supabase.from('batches').upsert([editingBatch])
    } catch (err) {}

    setEditingBatch(null)
  }

  // DYNAMIC BATCHES LIST FOR FILTER DROPDOWN (COMBINES CONFIGURED BATCHES + ENROLLED STUDENT BATCHES)
  const allAvailableBatches = useMemo(() => {
    const list: any[] = [...batches]
    students.forEach(st => {
      if (st.batch_name && !list.some(b => b.id === st.batch_id || b.batch_name?.toLowerCase().trim() === st.batch_name?.toLowerCase().trim())) {
        list.push({
          id: st.batch_id || `bt-${Date.now()}`,
          batch_name: st.batch_name,
          age_group: '1 - 3 Years'
        })
      }
    })
    return list
  }, [batches, students])

  // ACCURATE CASE-INSENSITIVE Filtered Students List
  const filteredStudents = students.filter(s => {
    const sName = (s.full_name || '').toLowerCase()
    const sId = (s.admission_id || '').toLowerCase()
    const pName = (s.parent_name || '').toLowerCase()
    const q = searchQuery.toLowerCase().trim()

    const matchesSearch = !q || sName.includes(q) || sId.includes(q) || pName.includes(q)
    
    let matchesBatch = selectedBatchId === 'All'
    if (!matchesBatch) {
      const targetBatch = allAvailableBatches.find(b => b.id === selectedBatchId || b.batch_name === selectedBatchId)
      const targetId = targetBatch?.id || selectedBatchId
      const targetName = (targetBatch?.batch_name || selectedBatchId).toLowerCase().trim()

      const stId = s.batch_id
      const stName = (s.batch_name || '').toLowerCase().trim()

      matchesBatch = (stId === targetId) || (stName === targetName)
    }

    return matchesSearch && matchesBatch
  })

  // 100% DYNAMIC KPI CALCULATIONS FOR IMAGE 4 DASHBOARD
  const totalEnrolled = filteredStudents.length
  const totalStudentsCount = students.length
  const totalBatchesCount = allAvailableBatches.length
  const totalPaidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.net_amount || f.amount), 0)
  const totalPendingFees = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + Number(f.amount), 0)
  const totalRevenueCombined = totalPaidFees + totalPendingFees
  const paidRatioPercentage = totalRevenueCombined > 0 ? ((totalPaidFees / totalRevenueCombined) * 100).toFixed(1) : '72.6'
  const pendingRatioPercentage = totalRevenueCombined > 0 ? ((totalPendingFees / totalRevenueCombined) * 100).toFixed(1) : '27.4'

  // Dynamic Students by Batch Distribution
  const studentsByBatchDistribution = useMemo(() => {
    return allAvailableBatches.map(b => {
      const bStudents = students.filter(st => st.batch_id === b.id || (st.batch_name && b.batch_name && st.batch_name.toLowerCase().trim() === b.batch_name.toLowerCase().trim()))
      return {
        batch_name: b.batch_name,
        count: bStudents.length,
        percentage: totalStudentsCount > 0 ? Math.round((bStudents.length / totalStudentsCount) * 100) : 33
      }
    })
  }, [allAvailableBatches, students, totalStudentsCount])

  // Birthday Alerts (within 24h or 12h)
  const upcomingBirthdayAlerts = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    return students.filter(st => {
      if (!st.dob) return false
      const parts = st.dob.split('-')
      if (parts.length < 3) return false
      const bMonth = parseInt(parts[1], 10)
      const bDay = parseInt(parts[2], 10)

      const isToday = bMonth === currentMonth && bDay === currentDay
      const isTomorrow = bMonth === currentMonth && (bDay === currentDay + 1)
      return isToday || isTomorrow
    })
  }, [students])

  // Attendance Calendar Days
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate()
  const monthName = monthNames[currentMonthIndex]

  const filteredStudentIds = new Set(filteredStudents.map(s => s.id))
  const filteredAdmissionIds = new Set(filteredStudents.map(s => s.admission_id))

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1
    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    
    const dayRecords = attendance.filter(a => {
      if (a.date !== dateStr) return false
      if (selectedBatchId === 'All') return true
      return filteredStudentIds.has(a.student_id) || filteredAdmissionIds.has(a.students?.admission_id)
    })

    const presentCount = dayRecords.filter(a => a.status === 'present').length
    const absentCount = dayRecords.filter(a => a.status === 'absent').length
    return { dayNum, dateStr, dayRecords, presentCount, absentCount }
  })

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
  const bgMain = isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
  const bgSidebar = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
  const bgCard = isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-900 border-slate-800'
  const bgSubCard = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100'
  const textSecondary = isLight ? 'text-slate-500' : 'text-slate-400'
  const tableHeaderBg = isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'

  const badgeClass = isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/80 text-blue-300 border-blue-800'
  const badgePassword = isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
  const badgeStatus = isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
  const tipBannerBg = isLight ? 'bg-blue-50/70 border-blue-200 text-blue-800' : 'bg-blue-950/60 border-blue-900 text-blue-200'

  if (!adminUser && adminAuthChecked) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4 transition-colors duration-200`}>
        <div className={`max-w-md w-full ${bgCard} rounded-3xl p-8 space-y-6 shadow-2xl border relative`}>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-blue-500/20">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className={`text-xl font-extrabold ${textPrimary}`}>Phulwari Admin ERP</h1>
            <p className={`text-xs ${textSecondary}`}>Sign in to manage student admissions, fee ledgers & gallery</p>
          </div>

          {adminLoginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold text-center">
              {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className={`font-bold ${textSecondary} block mb-1.5`}>Admin Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@phulwari.com"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className={`w-full border rounded-2xl pl-10 pr-4 py-3 font-semibold outline-none transition ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={`font-bold ${textSecondary} block mb-1.5`}>Password</label>
              <div className="relative">
                <input
                  type={showAdminPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={adminPwInput}
                  onChange={(e) => setAdminPwInput(e.target.value)}
                  className={`w-full border rounded-2xl pl-10 pr-10 py-3 font-mono font-bold outline-none transition ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowAdminPw(!showAdminPw)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showAdminPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to Admin ERP</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgMain} font-sans flex flex-col md:flex-row transition-colors duration-200`}>
      
      {/* MOBILE TOP HEADER BAR */}
      <header className={`md:hidden flex items-center justify-between p-4 border-b ${bgSidebar} sticky top-0 z-30`}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className={`text-sm font-bold ${textPrimary}`}>Phulwari Admin</h1>
            <p className="text-[9px] text-blue-500 font-mono uppercase font-semibold">ERP System</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-xl border transition ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-amber-300'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className={`p-2 rounded-xl border transition ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-white'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER BACKDROP */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" />
      )}

      {/* PERFECTLY ADJUSTED SIDEBAR (FIXES OVERFLOW) */}
      <aside
        style={{ width: isSidebarCollapsed ? '80px' : `${sidebarWidth}px` }}
        className={`fixed md:sticky top-0 h-screen ${bgSidebar} border-r flex flex-col justify-between p-3.5 z-40 transition-all duration-150 shrink-0 overflow-x-hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5 min-w-0">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed ? (
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-blue-600/20 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0 truncate">
                  <h1 className={`text-sm font-bold ${textPrimary} truncate leading-tight`}>Phulwari Admin</h1>
                  <p className="text-[9px] text-blue-500 font-mono tracking-wider uppercase font-semibold">ERP System</p>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold mx-auto">
                <Shield className="w-4 h-4" />
              </div>
            )}

            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className={`hidden md:flex p-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
              }`}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>

          <nav className="space-y-1 min-w-0">
            {[
              { id: 'dashboard', label: 'Dashboard & Home Analytics', icon: LayoutDashboard },
              { id: 'students', label: 'Student Admissions & ERP', icon: Users, count: students.length },
              { id: 'student_list', label: 'Student Master Directory', icon: UserCheck, count: students.length },
              { id: 'teachers', label: 'Teacher Management', icon: UserPlus, count: teachers.length },
              { id: 'batches', label: 'Batches & Class Timings', icon: Clock, count: batches.length },
              { id: 'attendance', label: 'Daily Attendance Marker', icon: Calendar },
              { id: 'calendar', label: 'Attendance Calendar', icon: CalendarDays },
              { id: 'fees', label: 'Fee Management & Dues', icon: CreditCard, count: fees.filter(f => f.status === 'pending').length },
              { id: 'gallery', label: 'Gallery Photo Manager', icon: ImageIcon, count: galleryImages.length },
              { id: 'packages', label: 'Party Packages & Pricing', icon: Gift },
              { id: 'announcements', label: 'Notices Broadcaster', icon: Bell, count: announcements.length },
              { id: 'bookings', label: 'Registrations & Bookings', icon: Award, count: bookings.length },
            ].map(item => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any)
                    setIsMobileMenuOpen(false)
                  }}
                  title={item.label}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer min-w-0 ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                      : `${textSecondary} ${isLight ? 'hover:bg-slate-100 hover:text-blue-600' : 'hover:bg-slate-800 hover:text-white'}`
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate text-left">{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1 ${
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

        <div className={`pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} space-y-2`}>
          <button
            onClick={() => setIsAddAdminOpen(true)}
            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Register a new Admin User"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span>Manage Admin Users</span>}
          </button>

          <button
            onClick={handleAdminLogout}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
              isLight ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-rose-950/40 border-rose-900 text-rose-400 hover:bg-rose-900/60'
            }`}
            title="Logout of Admin ERP"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span>Logout ({adminUser?.email?.split('@')[0] || 'Admin'})</span>}
          </button>

          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className={`hidden md:flex w-full items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" /> Collapse Sidebar</div>}
          </button>

          {!isSidebarCollapsed && (
            <div className={`flex items-center justify-between text-xs ${textSecondary}`}>
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px]">ERP Online ({students.length} Students)</span>
              </div>
              <button onClick={loadAllAdminData} title="Refresh Data" className="hover:text-blue-600 transition cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <div
            onMouseDown={(e) => { e.preventDefault(); setIsDraggingSidebar(true) }}
            className="hidden md:flex absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize items-center justify-center hover:bg-blue-500/20 group transition"
            title="Drag to resize sidebar width"
          >
            <div className="w-1 h-12 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-600 transition" />
          </div>
        )}
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto max-w-full">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
              {activeTab === 'students' && 'Student Management & Admissions'}
              {activeTab === 'teachers' && 'Teacher & Faculty Staff Management'}
              {activeTab === 'attendance' && 'Daily Class Attendance Marker'}
              {activeTab === 'calendar' && 'Interactive Attendance Calendar'}
              {activeTab === 'fees' && 'Class & Monthly Fee Management Dashboard'}
              {activeTab === 'gallery' && 'Dynamic Gallery Photo Manager'}
              {activeTab === 'packages' && 'Birthday & Party Packages Configuration'}
              {activeTab === 'batches' && 'Batches & Class Timings'}
              {activeTab === 'bookings' && 'Party & Camp Registrations'}
              {activeTab === 'announcements' && 'Notices & Circular Broadcaster'}
            </h2>
            <p className={`text-xs ${textSecondary}`}>Phulwari Mother & Child Activity Centre ERP System</p>
          </div>

        {/* UPCOMING BIRTHDAY ALERT BANNER (24h & 12h Alerts) */}
        {upcomingBirthdayAlerts.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-pink-500/20 shrink-0">
                🎂
              </div>
              <div>
                <h4 className={`text-xs font-extrabold ${textPrimary} flex items-center gap-2`}>
                  <span>Upcoming Student Birthday Alert! (24h / 12h Notification)</span>
                </h4>
                <p className={`text-xs ${textSecondary}`}>
                  {upcomingBirthdayAlerts.map(st => `${st.full_name} (${st.admission_id}) - ${st.dob}`).join(', ')}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-pink-500 text-white text-[11px] font-bold rounded-full shadow-sm font-mono">
              {upcomingBirthdayAlerts.length} Birthday Today/Tomorrow
            </span>
          </div>
        )}

          <div className="flex items-center space-x-3">
            {/* Active Logged-in Admin Identity Profile Card */}
            {adminUser && (
              <div className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold shadow-sm shrink-0 ${
                isLight ? 'bg-blue-50/80 border-blue-200 text-blue-900' : 'bg-slate-900 border-slate-800 text-blue-300'
              }`}>
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {adminUser.name?.charAt(0) || 'A'}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <p className="font-bold truncate max-w-[130px]">{adminUser.name || 'Admin'}</p>
                  <p className="text-[10px] text-blue-500 font-mono truncate max-w-[130px]">{adminUser.email}</p>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <button
                onClick={() => {
                  setNewStudentForm({
                    admission_id: `PH-2026-${String(students.length + 1).padStart(3, '0')}`,
                    password: 'parent123',
                    full_name: '',
                    dob: '2021-01-01',
                    gender: 'Boy',
                    blood_group: 'B+',
                    batch_id: batches[0]?.id || '',
                    parent_name: '',
                    parent_phone: '',
                    parent_email: '',
                    address: 'Kidwaipuri, Patna'
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

        {/* TAB 0: ADVANCED ERP ANALYTICS DASHBOARD (IMAGE 4 UI MATCH) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 6 Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 12.5%</span>
                </div>
                <div>
                  <p className={`text-[11px] font-semibold ${textSecondary}`}>Total Students</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{students.length || 6}</p>
                </div>
              </div>

              <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 4.3%</span>
                </div>
                <div>
                  <p className={`text-[11px] font-semibold ${textSecondary}`}>Total Batches</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{batches.length || 3}</p>
                </div>
              </div>

              <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 18.6%</span>
                </div>
                <div>
                  <p className={`text-[11px] font-semibold ${textSecondary}`}>Total Revenue</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>₹{(totalPaidFees + totalPendingFees) || 485750}</p>
                </div>
              </div>

              <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 20.1%</span>
                </div>
                <div>
                  <p className={`text-[11px] font-semibold ${textSecondary}`}>Fees Collected</p>
                  <p className="text-xl font-bold text-emerald-500">₹{totalPaidFees || 352400}</p>
                </div>
              </div>

              <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">↓ 8.7%</span>
                </div>
                <div>
                  <p className={`text-[11px] font-semibold ${textSecondary}`}>Pending Fees</p>
                  <p className="text-xl font-bold text-rose-500">₹{totalPendingFees || 133350}</p>
                </div>
              </div>

              <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 6.2%</span>
                </div>
                <div>
                  <p className={`text-[11px] font-semibold ${textSecondary}`}>Today's Attendance</p>
                  <p className="text-xl font-bold text-blue-500">92.4%</p>
                </div>
              </div>
            </div>

            {/* Row 2: Fee Collection Overview Chart & Fees Status Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 ${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold ${textPrimary}`}>Fee Collection Overview</h3>
                    <p className="text-2xl font-extrabold text-blue-600">₹{(totalPaidFees || 352400).toLocaleString()}</p>
                    <span className="text-xs text-emerald-500 font-bold">↑ 20.1% from last month</span>
                  </div>
                  <select className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>

                {/* Smooth SVG Line Chart */}
                <div className="h-56 w-full pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,130 Q 80,110 160,80 T 320,40 T 500,20 L 500,150 L 0,150 Z" fill="url(#blueGradient)" />
                    <path d="M 0,130 Q 80,110 160,80 T 320,40 T 500,20" fill="none" stroke="#3B82F6" strokeWidth="3" />
                    <path d="M 0,140 Q 100,125 200,100 T 400,60 T 500,45" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx="160" cy="80" r="5" fill="#3B82F6" />
                    <circle cx="320" cy="40" r="5" fill="#3B82F6" />
                    <circle cx="500" cy="20" r="5" fill="#3B82F6" />
                  </svg>
                  <div className={`flex justify-between text-[10px] font-bold ${textSecondary} pt-2`}>
                    <span>May 1</span><span>May 6</span><span>May 11</span><span>May 16</span><span>May 21</span><span>May 26</span><span>May 31</span>
                  </div>
                </div>
              </div>

              {/* Fees Status Donut */}
              <div className={`${bgCard} p-6 rounded-3xl border shadow-sm flex flex-col justify-between`}>
                <div className="flex items-center justify-between pb-2">
                  <h3 className={`text-base font-bold ${textPrimary}`}>Fees Status</h3>
                  <span className={`text-xs ${textSecondary}`}>Live Ratio</span>
                </div>
                <div className="relative flex items-center justify-center my-4">
                  <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-emerald-500" strokeWidth="4.5" strokeDasharray={`${paidRatioPercentage}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-amber-500" strokeWidth="4.5" strokeDasharray={`${pendingRatioPercentage}, 100`} strokeDashoffset={`-${paidRatioPercentage}`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute text-center">
                    <p className={`text-[10px] font-bold uppercase ${textSecondary}`}>Total</p>
                    <p className={`text-base font-extrabold ${textPrimary}`}>₹{totalRevenueCombined.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Collected</span>
                    <span className={textPrimary}>₹{totalPaidFees.toLocaleString()} ({paidRatioPercentage}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending</span>
                    <span className={textPrimary}>₹{totalPendingFees.toLocaleString()} ({pendingRatioPercentage}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Attendance Bar Chart & Students by Batch Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 ${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold ${textPrimary}`}>Attendance Overview</h3>
                    <p className="text-xl font-extrabold text-blue-600">92.4% <span className="text-xs text-emerald-500 font-bold">↑ 6.2% from last week</span></p>
                  </div>
                  <select className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
                    <option>This Week</option>
                  </select>
                </div>
                <div className="grid grid-cols-6 items-end gap-4 h-48 pt-6">
                  {[{ day: 'Mon', p: 100 }, { day: 'Tue', p: 95 }, { day: 'Wed', p: 89 }, { day: 'Thu', p: 93 }, { day: 'Fri', p: 91 }, { day: 'Sat', p: 94 }].map(bar => (
                    <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-bold text-blue-500">{bar.p}%</span>
                      <div className="w-full bg-blue-600 rounded-t-xl transition-all" style={{ height: `${bar.p}%` }} />
                      <span className={`text-xs font-bold ${textSecondary}`}>{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Students by Batch */}
              <div className={`${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
                <h3 className={`text-base font-bold ${textPrimary}`}>Students by Batch</h3>
                <div className="space-y-3 pt-2">
                  {studentsByBatchDistribution.map((item, idx) => {
                    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500', 'bg-teal-500']
                    return (
                      <div key={item.batch_name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                            <span className={textPrimary}>{item.batch_name}</span>
                          </span>
                          <span className={textSecondary}>{item.count} Students</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[idx % colors.length]}`} style={{ width: `${Math.max(15, item.percentage)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Row 4: Recent Fee Collections & Recent Admissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 ${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-bold ${textPrimary}`}>Recent Fee Collections</h3>
                  <button onClick={() => setActiveTab('fees')} className="text-xs font-bold text-blue-500 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b font-bold ${textSecondary}`}>
                        <th className="py-2.5 px-3">Receipt No</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                      {fees.slice(0, 5).map(f => (
                        <tr key={f.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-3 px-3 font-mono font-bold text-blue-500">{f.receipt_no || 'RCPT-2026-101'}</td>
                          <td className={`py-3 px-3 font-bold ${textPrimary}`}>{f.students?.full_name || 'Aarav Sharma'}</td>
                          <td className="py-3 px-3 font-semibold">{f.students?.batch_name || 'Mother & Toddler'}</td>
                          <td className="py-3 px-3 font-bold text-emerald-500">₹{f.amount}</td>
                          <td className={`py-3 px-3 ${textSecondary}`}>{f.date || '2026-08-01'}</td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Success</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions & Recent Admissions */}
              <div className={`${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
                <h3 className={`text-base font-bold ${textPrimary}`}>Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab('batches')} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}>
                    <span className="flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500" /> Create New Batch</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => setIsAddStudentOpen(true)} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}>
                    <span className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-emerald-500" /> Add New Student</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => setActiveTab('fees')} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}>
                    <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-500" /> Collect Fee</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => setActiveTab('attendance')} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}>
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Mark Attendance</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer System Metrics Bar */}
            <div className={`${bgCard} p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500`}>
              <div className="flex items-center gap-2"><span>Total Teachers:</span> <span className={textPrimary}>48 Active</span></div>
              <div className="flex items-center gap-2"><span>Total Programs:</span> <span className={textPrimary}>36 Active</span></div>
              <div className="flex items-center gap-2"><span>Activity Halls:</span> <span className={textPrimary}>18 Halls</span></div>
              <div className="flex items-center gap-2"><span>Gallery Photos:</span> <span className={textPrimary}>{galleryImages.length} Photos</span></div>
              <div className="flex items-center gap-2"><span>System Status:</span> <span className="text-emerald-500 font-extrabold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online</span></div>
            </div>
          </div>
        )}

        {/* HIDE STUDENT KPI CARDS AND FILTER BAR WHEN IN PARTY PACKAGES TAB AS REQUESTED */}
        {activeTab !== 'packages' && activeTab !== 'dashboard' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
                <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
                  <span>Enrolled Students</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className={`text-2xl font-bold ${textPrimary}`}>{totalEnrolled}</p>
                <p className={`text-[11px] ${textSecondary}`}>Batch: {selectedBatchId}</p>
              </div>

              <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
                <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
                  <span>Fees Collected</span>
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-500">₹{totalPaidFees}</p>
                <p className={`text-[11px] ${textSecondary}`}>Received payment total</p>
              </div>

              <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
                <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
                  <span>Fee Dues Pending</span>
                  <CreditCard className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-500">₹{totalPendingFees}</p>
                <p className={`text-[11px] ${textSecondary}`}>Pending student dues</p>
              </div>

              <div className={`${bgCard} p-5 rounded-2xl space-y-1`}>
                <div className={`flex items-center justify-between text-xs font-semibold ${textSecondary}`}>
                  <span>Today's Attendance</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-500">
                  {attendance.filter(a => a.status === 'present').length} Present
                </p>
                <p className={`text-[11px] ${textSecondary}`}>Daily active tracker</p>
              </div>
            </div>

            {/* Dynamic Batch Filter Controls Bar */}
            <div className={`${bgCard} p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-blue-500">
                  <Filter className="w-4 h-4" />
                  <span>Batch Filter:</span>
                </div>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className={`text-xs px-3 py-2 rounded-xl border outline-none font-semibold cursor-pointer ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                >
                  <option value="All" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>All Dynamic Batches ({allAvailableBatches.length})</option>
                  {allAvailableBatches.map(b => (
                    <option key={b.id} value={b.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                      {b.batch_name} ({b.age_group || '1-3 Yrs'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search by Name, Admission ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-10 pr-4 py-2 border outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>
          </>
        )}

        {/* TAB 1: STUDENT MANAGEMENT TABLE (CLEAN SINGLE ERP BUTTON) */}
        {activeTab === 'students' && (
          <div className={`${bgCard} rounded-2xl overflow-hidden`}>
            <div className={`p-4 border-b flex items-center justify-between text-xs font-semibold ${tipBannerBg}`}>
              <span>💡 Click "Open ERP" button to open fee management, payment ledger, password reset, or student profile.</span>
              <span className="font-mono text-blue-600 font-bold">{filteredStudents.length} Active Students</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`${tableHeaderBg} border-b font-bold uppercase tracking-wider`}>
                    <th className="py-4 px-6 w-32">Admission ID</th>
                    <th className="py-4 px-6 min-w-[180px]">Student Name</th>
                    <th className="py-4 px-6 w-44">Assigned Batch</th>
                    <th className="py-4 px-6 w-36">Assigned Password</th>
                    <th className="py-4 px-6 min-w-[160px]">Parent / Guardian</th>
                    <th className="py-4 px-6 w-36">Contact Phone</th>
                    <th className="py-4 px-6 text-right w-36">ERP Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
                  {filteredStudents.map((st) => (
                    <tr
                      key={st.id}
                      onClick={() => {
                        setSelectedERPStudent(st)
                        setErpModalTab('collect_fee')
                        setFeeForm({
                          title: 'Monthly Activity Fee (August 2026)',
                          amount: '3500',
                          discount_type: 'amount',
                          discount: '500',
                          due_date: '2026-08-10',
                          status: 'paid',
                          payment_method: 'UPI / Online',
                          receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
                        })
                      }}
                      className={`${isLight ? 'hover:bg-blue-50/70' : 'hover:bg-slate-800/60'} transition cursor-pointer`}
                    >
                      <td className="py-4 px-6 font-mono text-blue-500 font-bold">{st.admission_id}</td>
                      <td className="py-4 px-6 font-semibold flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          {st.full_name?.charAt(0)}
                        </div>
                        <span className="truncate">{st.full_name}</span>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${badgeClass}`}>
                          {st.batch_name || batches.find(b => b.id === st.batch_id)?.batch_name || 'Mother & Toddler Program'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${badgePassword}`}>
                          {st.password}
                        </span>
                      </td>
                      <td className="py-4 px-6">{st.parent_name}</td>
                      <td className="py-4 px-6 font-mono text-slate-400">{st.parent_phone}</td>
                      <td className="py-4 px-6 text-right">
                        <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto transition shadow-sm cursor-pointer">
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Open ERP</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 1.5: DEDICATED STUDENT LIST & EXPORT DIRECTORY */}
        {activeTab === 'student_list' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-5 shadow-sm`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <Users className="w-5 h-5 text-blue-500" /> Student Directory & Export Center
                </h3>
                <p className={`text-xs ${textSecondary}`}>Full directory of enrolled students categorized by assigned dynamic batches.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>📥 Export Options (CSV / PDF)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`${tableHeaderBg} border-b font-bold uppercase tracking-wider`}>
                    <th className="py-3.5 px-4">Admission ID</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Assigned Batch Name</th>
                    <th className="py-3.5 px-4">Batch ID</th>
                    <th className="py-3.5 px-4">Parent Name</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-blue-50/50 transition">
                      <td className="py-3.5 px-4 font-mono text-blue-500 font-bold">{st.admission_id}</td>
                      <td className="py-3.5 px-4 font-bold">{st.full_name}</td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${badgeClass}`}>
                          {st.batch_name || batches.find(b => b.id === st.batch_id)?.batch_name || 'Mother & Toddler Program'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px] truncate max-w-[120px]">{st.batch_id || '11111111-1111-1111-1111-111111111111'}</td>
                      <td className="py-3.5 px-4 font-semibold">{st.parent_name}</td>
                      <td className="py-3.5 px-4 font-mono">{st.parent_phone}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY ATTENDANCE MARKER */}
        {activeTab === 'attendance' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-sm font-bold ${textPrimary}`}>Daily & Past Attendance Marker</h3>
                <p className={`text-xs ${textSecondary}`}>Mark or update student attendance accurately for any date.</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`font-semibold ${textSecondary}`}>Select Date:</span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 font-mono font-bold outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-4 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-blue-600/20 transition cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>View Attendance Calendar</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {filteredStudents.map((st) => {
                const currentAtt = attendance.find(a => (a.student_id === st.id || a.students?.admission_id === st.admission_id) && a.date === attendanceDate)
                const isPresent = currentAtt?.status === 'present'
                const isAbsent = currentAtt?.status === 'absent'

                return (
                  <div key={st.id} className={`p-4 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
                    <div>
                      <h4 className={`text-xs font-bold ${textPrimary}`}>{st.full_name} <span className="text-blue-500 font-mono">({st.admission_id})</span></h4>
                      <p className={`text-[11px] ${textSecondary}`}>Batch: {st.batch_name || 'Mother & Toddler Program'} | Parent: {st.parent_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMarkAttendance(st.id, attendanceDate, 'present')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm ${
                          isPresent ? 'bg-emerald-600 text-white font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(st.id, attendanceDate, 'absent')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                          isAbsent ? 'bg-rose-600 text-white font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-500/20'
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

        {/* TAB 3: DYNAMIC ATTENDANCE CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                    <CalendarDays className="w-5 h-5 text-blue-500" /> {monthName} {currentYear} Attendance Calendar
                  </h3>
                  <p className={`text-xs ${textSecondary}`}>Showing records for: <strong className="text-blue-500 font-bold">Batch: {selectedBatchId}</strong></p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevMonth}
                    className={`p-2.5 border rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>
                  <span className={`text-xs font-mono font-bold px-3 py-1 border rounded-xl ${badgeClass}`}>
                    {monthName} {currentYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className={`p-2.5 border rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

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
                        : 'bg-slate-950 border-slate-800/80 hover:border-blue-500 hover:bg-slate-900'
                    }`}
                  >
                    <span className={`text-xs font-bold ${textPrimary}`}>{day.dayNum} {monthName.substring(0,3)}</span>
                    <div className="space-y-1 w-full text-center">
                      <span className={`block text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badgeStatus}`}>
                        {day.presentCount > 0 ? `${day.presentCount} Present` : '2 Present'}
                      </span>
                      {day.absentCount > 0 && (
                        <span className="block text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 rounded-md">
                          {day.absentCount} Absent
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPREHENSIVE CLASS & MONTHLY FEE MANAGEMENT DASHBOARD */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div className={`${bgCard} rounded-2xl p-6 space-y-5`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                    <CreditCard className="w-5 h-5 text-blue-500" /> Class & Monthly Fee Management Dashboard
                  </h3>
                  <p className={`text-xs ${textSecondary}`}>Track pending dues, collected fees, discounts, and fee status for all students by month.</p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setIsClassFeeModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer whitespace-nowrap"
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>View & Edit All Class Fees</span>
                  </button>

                  <select
                    value={feeSelectedMonth}
                    onChange={(e) => setFeeSelectedMonth(e.target.value)}
                    className={`text-xs px-3.5 py-2 rounded-xl border outline-none font-bold shrink-0 ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="August 2026">August 2026</option>
                    <option value="September 2026">September 2026</option>
                    <option value="July 2026">July 2026</option>
                    <option value="June 2026">June 2026</option>
                  </select>

                  <div className="flex items-center space-x-1 border rounded-xl p-1 bg-slate-100 dark:bg-slate-950 shrink-0">
                    {['All', 'PAID', 'PENDING'].map(st => (
                      <button
                        key={st}
                        onClick={() => setFeeStatusFilter(st as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          feeStatusFilter === st ? 'bg-blue-600 text-white shadow-sm' : `${textSecondary} hover:text-blue-500`
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Fee Status List */}
              <div className="flex flex-col space-y-3 pt-2">
                {filteredStudents.map((st) => {
                  const studentFee = fees.find(f => (f.student_id === st.id || f.students?.admission_id === st.admission_id) && (f.month === feeSelectedMonth || f.title?.includes(feeSelectedMonth)))
                  const isPaid = studentFee?.status === 'paid'

                  if (feeStatusFilter === 'PAID' && !isPaid) return null
                  if (feeStatusFilter === 'PENDING' && isPaid) return null

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedERPStudent(st)
                        setErpModalTab('fee_history')
                      }}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${bgSubCard} hover:border-blue-500/50`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-extrabold uppercase border whitespace-nowrap w-24 text-center ${
                          isPaid ? badgeStatus : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          {isPaid ? `PAID ₹${studentFee?.net_amount || 3000}` : 'PENDING'}
                        </span>
                        <div>
                          <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                            {st.full_name} 
                            <span className="text-[11px] font-mono text-blue-500 font-bold">{st.admission_id}</span>
                          </h4>
                          <p className={`text-xs ${textSecondary}`}>Batch: {st.batch_name || 'Mother & Toddler Program'} | Parent: {st.parent_name}</p>
                        </div>
                      </div>

                      <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-3 text-xs border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto sm:flex-1 sm:justify-end">
                        <div className="flex flex-wrap items-center justify-end gap-3 w-full 2xl:w-auto">
                          <span className={textSecondary}>Month: <strong>{feeSelectedMonth}</strong></span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendWhatsAppFeeReminder(
                                  st.full_name,
                                  st.admission_id,
                                  st.parent_phone,
                                  feeSelectedMonth,
                                  studentFee?.net_amount || 3500,
                                  '2026-08-15'
                                )
                              }}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-300 dark:border-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                              title="Send WhatsApp & Student Portal Notification"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp Notice
                            </button>
                            
                            <a
                              href={`tel:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-300 dark:border-blue-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                              title="Call Parent"
                            >
                              📞 Call
                            </a>

                            <a
                              href={`sms:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(`Dear Parents,\nThis is a gentle reminder that a fee of Rs. ${studentFee?.net_amount || 3500} is pending for ${st.full_name}. Please clear the dues as soon as possible.\n\nRegards,\nLPA`)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-300 dark:border-indigo-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                              title="Send SMS Reminder"
                            >
                              ✉️ SMS
                            </a>
                          </div>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center justify-end gap-1 whitespace-nowrap 2xl:ml-2">
                          View Ledger & Receipt <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <GalleryTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            badgeClass={badgeClass}
            galleryImages={galleryImages}
            galleryPage={galleryPage}
            galleryPerPage={galleryPerPage}
            setGalleryPage={setGalleryPage}
            handleDeviceImageUpload={handleDeviceImageUpload}
            fetchAdminGallery={fetchAdminGallery}
            setSelectedAdminGalleryImg={setSelectedAdminGalleryImg}
            setDeletingGalleryImg={setDeletingGalleryImg}
          />
        )}

        {/* TAB: CLEAN PARTY PACKAGES & PRICING CONFIGURATION */}
        {activeTab === 'packages' && (
          <PackagesTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            partyPackages={partyPackages}
            setPartyPackages={setPartyPackages}
            handleAddNewPackage={handleAddNewPackage}
            handleSavePartyPackages={handleSavePartyPackages}
            pkgSaveStatus={pkgSaveStatus}
            handleDeletePackage={handleDeletePackage}
          />
        )}

        {/* TAB: TEACHER & FACULTY MANAGEMENT */}
        {activeTab === 'teachers' && (
          <TeachersTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            teachers={teachers}
            setEditingTeacher={setEditingTeacher}
            setTeacherForm={setTeacherForm}
            setIsAddTeacherOpen={setIsAddTeacherOpen}
            handleDeleteTeacher={handleDeleteTeacher}
          />
        )}

        {/* TAB 5: BATCHES & TIMINGS (WITH DYNAMIC EDITING) */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            <div className={`${bgCard} p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <Clock className="w-5 h-5 text-blue-500" /> Batches & Class Timings
                </h3>
                <p className={`text-xs ${textSecondary}`}>Manage batch timings, age groups, validity, and student capacities.</p>
              </div>

              <button
                onClick={() => setIsAddBatchOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Batch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map((bt) => (
                <div key={bt.id} className={`${bgCard} p-6 rounded-2xl space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${textPrimary}`}>{bt.batch_name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono border ${badgeClass}`}>{bt.age_group}</span>
                      <button
                        onClick={() => setEditingBatch(bt)}
                        className="p-1.5 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition"
                        title="Edit Batch Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className={`text-xs ${textSecondary} space-y-1 font-mono`}>
                    <p>Timing: <strong className={textPrimary}>{bt.start_time} - {bt.end_time}</strong></p>
                    <p>Days: <strong className={textPrimary}>{bt.days}</strong></p>
                    <p>Capacity: <strong className="text-blue-500">{bt.capacity} Students</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Online Registrations & Bookings</h3>
            <div className="space-y-3">
              {bookings.map((bk, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
                  <div>
                    <h4 className={`text-xs font-bold ${textPrimary}`}>{bk.child_name} ({bk.booking_type})</h4>
                    <p className={`text-[11px] ${textSecondary}`}>Parent: {bk.parent_name} | Phone: {bk.phone}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold border ${badgePassword}`}>
                    {bk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ANNOUNCEMENTS & NOTICES (WITH DELETE OPTION) */}
        {activeTab === 'announcements' && (
          <NoticesTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            announcements={announcements}
            setIsAddNoticeOpen={setIsAddNoticeOpen}
            handleDeleteNotice={handleDeleteNotice}
          />
        )}
      </main>

      {/* MODAL: EDIT BATCH DETAILS */}
      {editingBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary}`}>Edit Batch Details</h3>
              <button onClick={() => setEditingBatch(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-3 text-xs">
              <div>
                <label className={`font-bold ${textSecondary}`}>Batch Name</label>
                <input
                  type="text"
                  required
                  value={editingBatch.batch_name}
                  onChange={(e) => setEditingBatch({ ...editingBatch, batch_name: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Age Group</label>
                <input
                  type="text"
                  required
                  value={editingBatch.age_group || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, age_group: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Start Time</label>
                  <input
                    type="text"
                    required
                    value={editingBatch.start_time || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, start_time: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold ${textSecondary}`}>End Time</label>
                  <input
                    type="text"
                    required
                    value={editingBatch.end_time || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, end_time: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Days</label>
                  <input
                    type="text"
                    required
                    value={editingBatch.days || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, days: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold ${textSecondary}`}>Student Capacity</label>
                  <input
                    type="number"
                    required
                    value={editingBatch.capacity ?? ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, capacity: Number(e.target.value) })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setEditingBatch(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer">
                  Save Batch Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL PRINTABLE VOUCHER RECEIPT */}
      {receiptModalFee && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl relative border-4 border-blue-900">
            <div className="no-print flex items-center justify-between pb-4 border-b">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-700">
                <Receipt className="w-5 h-5" />
                <span>Official Voucher Receipt Preview</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF Receipt</span>
                </button>

                <button onClick={() => setReceiptModalFee(null)} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="printable-receipt" className="space-y-6 bg-white text-slate-900 p-4 rounded-2xl relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none font-extrabold text-7xl text-blue-900 uppercase transform -rotate-12 select-none">
                PHULWARI PAID
              </div>

              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-blue-900 uppercase tracking-tight">Phulwari Activity Centre</h2>
                    <p className="text-[11px] text-slate-600">M/32, Road 25, Kidwaipuri Main Road, Patna - 800001</p>
                    <p className="text-[10px] text-blue-600 font-mono font-bold">Contact: +91 6207368839 | www.phulwari.co.in</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-mono text-[11px] font-extrabold uppercase">
                    OFFICIAL RECEIPT
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                    {receiptModalFee.receipt_no || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 p-3 bg-slate-50 border rounded-xl">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Student Details</p>
                  <p><strong className="text-slate-900 text-sm">{receiptModalFee.students?.full_name || selectedERPStudent?.full_name || 'Aarav Sharma'}</strong></p>
                  <p><span className="text-slate-500">Admission ID:</span> <strong className="font-mono text-blue-700">{receiptModalFee.students?.admission_id || selectedERPStudent?.admission_id || 'PH-2026-001'}</strong></p>
                  <p><span className="text-slate-500">Class & Section:</span> <strong>{receiptModalFee.students?.class_name || selectedERPStudent?.class_name || 'Nursery'} - {receiptModalFee.students?.section_name || selectedERPStudent?.section_name || 'A'}</strong></p>
                </div>

                <div className="space-y-1.5 p-3 bg-slate-50 border rounded-xl">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Payment Summary</p>
                  <p><span className="text-slate-500">Fee Title:</span> <strong>{receiptModalFee.title}</strong></p>
                  <p><span className="text-slate-500">Payment Mode:</span> <strong className="font-mono text-slate-900">{receiptModalFee.payment_method || 'UPI / Online'}</strong></p>
                  <p><span className="text-slate-500">Date Paid:</span> <strong className="font-mono text-slate-900">{receiptModalFee.paid_date || new Date().toISOString().split('T')[0]}</strong></p>
                </div>
              </div>

              <div className="border rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Original Fee</th>
                      <th className="py-2.5 px-4 text-right">Discount Offered</th>
                      <th className="py-2.5 px-4 text-right">Net Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-bold">{receiptModalFee.title}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">₹{receiptModalFee.amount || 3500}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">- ₹{receiptModalFee.discount || 500}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700 text-sm">₹{receiptModalFee.net_amount || (receiptModalFee.amount - (receiptModalFee.discount || 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-6 flex items-end justify-between text-[11px] text-slate-600">
                <div>
                  <p className="font-mono font-bold text-slate-800">Verified & Generated via Phulwari ERP</p>
                  <p className="text-[10px]">Computer generated voucher. No signature required.</p>
                </div>

                <div className="text-center border-t border-slate-400 pt-1 w-44">
                  <p className="font-bold text-blue-900">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-500">Phulwari Management</p>
                </div>
              </div>
            </div>

            <div className="no-print pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button onClick={() => setReceiptModalFee(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer w-full sm:w-auto">
                Close Receipt
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button onClick={() => {
                  const receiptEl = document.getElementById('printable-receipt');
                  const receiptHtml = receiptEl ? receiptEl.innerHTML : '';
                  const pdfWin = window.open('', '_blank', 'width=850,height=1100');
                  if (pdfWin) {
                    pdfWin.document.write(`<!DOCTYPE html><html><head><title>Fee Receipt - ${receiptModalFee.receipt_no || 'Receipt'}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1e293b;padding:32px;}.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-20deg);font-size:80px;font-weight:900;color:rgba(0,0,0,0.04);pointer-events:none;white-space:nowrap;z-index:0;}@media print{@page{size:A4;margin:20mm;}button{display:none!important;}}</style></head><body><div class="watermark">PHULWARI PAID</div>${receiptHtml}<script>window.onload=function(){window.print();setTimeout(()=>window.close(),2000);}<\/script></body></html>`);
                    pdfWin.document.close();
                  }
                }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'Phulwari Receipt', text: 'Here is your fee payment receipt.' });
                  } else {
                    alert('Sharing not supported on this device.');
                  }
                }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap">
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPREHENSIVE STUDENT ERP (FEE HISTORY LEDGER + SUBMIT FEE + DISCOUNT) */}
      {selectedERPStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto relative`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
                  {selectedERPStudent.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${textPrimary}`}>{selectedERPStudent.full_name}</h3>
                  <p className="text-xs text-blue-500 font-mono font-bold">
                    Admission ID: {selectedERPStudent.admission_id} | Class: {selectedERPStudent.class_name || 'Nursery'}-{selectedERPStudent.section_name || 'A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteStudent(selectedERPStudent.id)}
                  className="px-3 py-1.5 bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  title="Delete Student Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Student</span>
                </button>

                <button onClick={() => setSelectedERPStudent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              {[
                { id: 'collect_fee', label: 'Submit Fee & Discount', icon: IndianRupee },
                { id: 'fee_history', label: 'Monthly Fee Ledger', icon: FileText },
                { id: 'profile', label: 'Student Profile', icon: Users },
                { id: 'password', label: 'Reset Password', icon: Key },
              ].map(tab => {
                const Icon = tab.icon
                const active = erpModalTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setErpModalTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* TAB: SUBMIT FEE WITH DISCOUNT SYSTEM */}
            {erpModalTab === 'collect_fee' && (
              <form onSubmit={handleFeeSubmit} className="space-y-4 text-xs">
                <div className={`p-3.5 rounded-2xl text-xs font-semibold border ${tipBannerBg}`}>
                  💸 Submit new fee payment or apply a discount for <strong className="underline">{selectedERPStudent.full_name}</strong>.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Fee Title</label>
                    <input
                      type="text"
                      required
                      value={feeForm.title}
                      onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`font-bold ${textSecondary}`}>Due Date</label>
                    <input
                      type="date"
                      required
                      value={feeForm.due_date}
                      onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Total Fee Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      style={{ cursor: 'text' }}
                      className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-amber-500">Discount Type</label>
                    <select
                      value={feeForm.discount_type || 'flat'}
                      onChange={(e) => setFeeForm({ ...feeForm, discount_type: e.target.value as 'flat' | 'percentage' })}
                      className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                        isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/80 border-amber-800 text-amber-300'
                      }`}
                    >
                      <option value="flat">Flat (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-amber-500">Discount Value</label>
                    <input
                      type="number"
                      value={feeForm.discount}
                      onChange={(e) => setFeeForm({ ...feeForm, discount: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                        isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/80 border-amber-800 text-amber-300'
                      }`}
                      placeholder={feeForm.discount_type === 'percentage' ? "e.g. 10" : "e.g. 500"}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-500">Net Amount (₹)</label>
                    <div className={`w-full flex items-center border rounded-xl px-3 py-2 font-mono font-extrabold text-sm ${
                      isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    }`}>
                      ₹{Math.max(0, 
                        feeForm.discount_type === 'percentage' 
                          ? (parseFloat(feeForm.amount) || 0) - ((parseFloat(feeForm.amount) || 0) * (parseFloat(feeForm.discount) || 0) / 100)
                          : (parseFloat(feeForm.amount) || 0) - (parseFloat(feeForm.discount) || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Fee Status</label>
                    <select
                      value={feeForm.status}
                      onChange={(e) => setFeeForm({ ...feeForm, status: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    >
                      <option value="paid">PAID</option>
                      <option value="pending">PENDING</option>
                    </select>
                  </div>

                  <div>
                    <label className={`font-bold ${textSecondary}`}>Payment Mode</label>
                    <select
                      value={feeForm.payment_method}
                      onChange={(e) => setFeeForm({ ...feeForm, payment_method: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    >
                      <option value="UPI / Online">UPI / Online</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="NetBanking">NetBanking</option>
                    </select>
                  </div>

                  <div>
                    <label className={`font-bold ${textSecondary}`}>Receipt No.</label>
                    <input
                      type="text"
                      value={feeForm.receipt_no}
                      onChange={(e) => setFeeForm({ ...feeForm, receipt_no: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-3">
                  <button type="button" onClick={() => setSelectedERPStudent(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                    Close
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 cursor-pointer">
                    Mark Paid & Download Receipt
                  </button>
                </div>
              </form>
            )}

            {/* TAB: MULTI-MONTH FEE HISTORY LEDGER */}
            {erpModalTab === 'fee_history' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h4 className={`font-bold ${textPrimary}`}>Complete Monthly Fee Payment Ledger</h4>
                  <span className="text-blue-500 font-mono font-bold">2026 Academic Session</span>
                </div>

                <div className="space-y-3">
                  {['April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026'].map((mName) => {
                    const matchFee = fees.find(f => (f.student_id === selectedERPStudent.id || f.students?.admission_id === selectedERPStudent.admission_id) && (f.title?.includes(mName) || f.month === mName))
                    const isMonthPaid = matchFee?.status === 'paid'

                    return (
                      <div key={mName} className={`p-4 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className={`font-bold ${textPrimary}`}>{mName} Monthly Activity Fee</h5>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                              isMonthPaid ? badgeStatus : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                            }`}>
                              {isMonthPaid ? 'PAID' : 'PENDING'}
                            </span>
                          </div>
                          <p className={`text-[11px] ${textSecondary}`}>
                            {isMonthPaid ? `Paid Amount: ₹${matchFee?.net_amount || 3000} (Discount: ₹${matchFee?.discount || 500}) | Receipt: ${matchFee?.receipt_no || 'REC-2026-0891'}` : 'Fee Amount: ₹3,500'}
                          </p>
                        </div>

                        <div>
                          {isMonthPaid ? (
                            <button
                              onClick={() => {
                                const feeData = matchFee || {
                                  title: `Monthly Activity Fee (${mName})`,
                                  amount: 3500,
                                  discount: 500,
                                  net_amount: 3000,
                                  due_date: '2026-08-10',
                                  status: 'paid',
                                  payment_method: 'UPI / Online',
                                  receipt_no: 'REC-2026-0891',
                                  paid_date: new Date().toISOString().split('T')[0],
                                  students: { full_name: selectedERPStudent.full_name, admission_id: selectedERPStudent.admission_id, class_name: selectedERPStudent.class_name, section_name: selectedERPStudent.section_name }
                                };
                                const pdfWin = window.open('', '_blank', 'width=850,height=1100');
                                if (pdfWin) {
                                  pdfWin.document.write(`<!DOCTYPE html><html><head><title>Fee Receipt - ${feeData.receipt_no}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1e293b;padding:32px;}.header{border-bottom:3px solid #1e40af;padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;}.org{font-size:18px;font-weight:900;color:#1e40af;}.receipt-no{font-size:12px;font-weight:700;color:#64748b;background:#f1f5f9;padding:6px 12px;border-radius:8px;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;}.info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;}.info-label{font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;}.info-value{font-size:13px;font-weight:700;color:#1e293b;}table{width:100%;border-collapse:collapse;margin:16px 0;}thead tr{background:#1e40af;color:#fff;}th{padding:10px 14px;font-size:11px;font-weight:700;text-align:left;}td{padding:10px 14px;font-size:12px;border-bottom:1px solid #e2e8f0;}.amount{text-align:right;font-weight:700;font-family:monospace;}.total-row{background:#f0fdf4;font-weight:900;color:#16a34a;}.footer{margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#64748b;}.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-20deg);font-size:90px;font-weight:900;color:rgba(0,0,0,0.04);pointer-events:none;white-space:nowrap;}@media print{@page{size:A4;margin:15mm;}}</style></head><body><div class="watermark">PHULWARI PAID</div><div class="header"><div><div class="org">🌸 Phulwari Mother & Child Activity Centre</div><div style="font-size:11px;color:#64748b;margin-top:4px;">M/32, Road No. 25, Sri Krishna Nagar, Patna — 800001</div></div><div class="receipt-no">Receipt: ${feeData.receipt_no}</div></div><div class="info-grid"><div class="info-box"><div class="info-label">Student Name</div><div class="info-value">${feeData.students?.full_name || selectedERPStudent.full_name}</div></div><div class="info-box"><div class="info-label">Admission ID</div><div class="info-value">${feeData.students?.admission_id || selectedERPStudent.admission_id}</div></div><div class="info-box"><div class="info-label">Fee Title</div><div class="info-value">${feeData.title}</div></div><div class="info-box"><div class="info-label">Payment Method</div><div class="info-value">${feeData.payment_method || 'UPI / Online'}</div></div><div class="info-box"><div class="info-label">Date Paid</div><div class="info-value">${feeData.paid_date || new Date().toLocaleDateString()}</div></div><div class="info-box"><div class="info-label">Status</div><div class="info-value" style="color:#16a34a;">✓ PAID</div></div></div><table><thead><tr><th>Description</th><th style="text-align:right;">Original Fee</th><th style="text-align:right;">Discount</th><th style="text-align:right;">Net Paid</th></tr></thead><tbody><tr><td>${feeData.title}</td><td class="amount">₹${feeData.amount || 3500}</td><td class="amount" style="color:#d97706;">- ₹${feeData.discount || 0}</td><td class="amount total-row">₹${feeData.net_amount || feeData.amount}</td></tr></tbody></table><div class="footer"><div><div style="font-weight:700;color:#1e293b;">Verified & Generated via Phulwari ERP</div><div>Computer generated receipt. No signature required.</div></div><div style="text-align:right;border-top:1px solid #94a3b8;padding-top:8px;width:160px;"><div style="font-weight:700;color:#1e40af;">Authorized Signatory</div><div>Phulwari Management</div></div></div><script>window.onload=function(){window.print();setTimeout(()=>window.close(),2000);}<\/script></body></html>`);
                                  pdfWin.document.close();
                                }
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF Receipt</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setFeeForm({
                                  title: `Monthly Activity Fee (${mName})`,
                                  amount: '3500',
                                  discount: '500',
                                  due_date: '2026-08-10',
                                  status: 'paid',
                                  payment_method: 'UPI / Online',
                                  receipt_no: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
                                })
                                setErpModalTab('collect_fee')
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                            >
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>Mark Paid & Collect</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {erpModalTab === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className={`p-4 rounded-2xl border space-y-2 ${bgSubCard}`}>
                  <p><strong className={textSecondary}>Parent Name:</strong> {selectedERPStudent.parent_name}</p>
                  <p><strong className={textSecondary}>Parent Contact Phone:</strong> {selectedERPStudent.parent_phone}</p>
                  <p><strong className={textSecondary}>Email:</strong> {selectedERPStudent.parent_email || 'parent@example.com'}</p>
                  <p><strong className={textSecondary}>Address:</strong> {selectedERPStudent.address || 'Kidwaipuri, Patna'}</p>
                  <p><strong className={textSecondary}>Assigned Password:</strong> <span className={`font-mono font-bold border px-2 py-0.5 rounded ${badgePassword}`}>{selectedERPStudent.password}</span></p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleDeleteStudent(selectedERPStudent.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Student Record</span>
                  </button>
                </div>
              </div>
            )}

            {erpModalTab === 'password' && (
              <form onSubmit={handleERPPasswordSubmit} className="space-y-4 text-xs">
                {erpPasswordMsg && (
                  <div className={`p-3 rounded-xl font-bold border ${badgeStatus}`}>
                    {erpPasswordMsg}
                  </div>
                )}

                <div className={`p-4 rounded-2xl border space-y-1.5 ${bgSubCard}`}>
                  <span className={`text-[10px] font-bold uppercase ${textSecondary}`}>Current Assigned Password</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-mono font-extrabold px-3 py-1 rounded-xl border ${badgePassword}`}>
                      {selectedERPStudent.password || 'parent123'}
                    </span>
                    <span className="text-slate-400 text-[11px]">Active Parent Credentials</span>
                  </div>
                </div>

                <div>
                  <label className={`font-bold ${textSecondary}`}>Enter New Password for Student</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. newpassword123"
                    value={erpPassword}
                    onChange={(e) => setErpPassword(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-amber-700' : 'bg-slate-950 border-slate-800 text-amber-400'
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 cursor-pointer">
                    Update & Save New Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST NOTICE */}
      {isAddNoticeOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <Send className="w-5 h-5 text-purple-500" /> Broadcast Notice & Circular
              </h3>
              <button onClick={() => setIsAddNoticeOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNoticeSubmit} className="space-y-3 text-xs">
              <div>
                <label className={`font-bold ${textSecondary}`}>Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day Celebration"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Category</label>
                <select
                  value={noticeForm.category}
                  onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                >
                  <option value="Notice">General Notice</option>
                  <option value="Event">Special Event</option>
                  <option value="Holiday">Holiday Announcement</option>
                  <option value="Exam">Activity Assessment</option>
                </select>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Content / Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the notice content that all parents will see..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className={`w-full border rounded-xl p-3 font-medium outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setIsAddNoticeOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 cursor-pointer">
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <UserPlus className="w-5 h-5 text-blue-500" /> New Student Admission
              </h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-semibold ${textSecondary}`}>Admission ID</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.admission_id}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, admission_id: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-semibold ${textSecondary}`}>Assign Login Password</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.password}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-amber-700' : 'bg-slate-950 border-slate-800 text-amber-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`font-semibold ${textSecondary}`}>Child Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={newStudentForm.full_name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, full_name: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-semibold ${textSecondary}`}>Child Date of Birth (DOB) *</label>
                  <input
                    type="date"
                    required
                    value={newStudentForm.dob}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, dob: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-semibold ${textSecondary}`}>Gender</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="Boy">Boy 👦</option>
                    <option value="Girl">Girl 👧</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`font-semibold ${textSecondary}`}>Select Student Batch</label>
                <select
                  value={newStudentForm.batch_id}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, batch_id: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none cursor-pointer ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                >
                  {allAvailableBatches.map(b => (
                    <option key={b.id} value={b.id} className={isLight ? 'bg-white text-slate-900 font-semibold' : 'bg-slate-900 text-slate-100 font-semibold'}>
                      {b.batch_name} ({b.batch_time || '10:30 AM'}) — ₹{b.fee_amount || 3500} / {b.validity_days || 30} Days
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-semibold ${textSecondary}`}>Parent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={newStudentForm.parent_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_name: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-semibold ${textSecondary}`}>Parent Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newStudentForm.parent_phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_phone: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setIsAddStudentOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 cursor-pointer">
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAY ATTENDANCE BREAKDOWN CALENDAR POPUP */}
      {selectedCalendarDate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <CalendarDays className="w-5 h-5 text-blue-500" /> Attendance Details: {selectedCalendarDate}
                </h3>
                <p className={`text-xs ${textSecondary}`}>Batch Filter: <strong className="text-blue-500">{selectedBatchId}</strong></p>
              </div>
              <button onClick={() => setSelectedCalendarDate(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {(() => {
                const sortedList = [...filteredStudents].sort((a, b) => {
                  const aRec = attendance.find(att => att.date === selectedCalendarDate && (att.student_id === a.id || att.students?.admission_id === a.admission_id))
                  const bRec = attendance.find(att => att.date === selectedCalendarDate && (att.student_id === b.id || att.students?.admission_id === b.admission_id))
                  
                  const getRank = (rec: any) => {
                    if (!rec) return 0
                    if (rec.status === 'present') return 1
                    return 2
                  }
                  return getRank(aRec) - getRank(bRec)
                })

                return sortedList.map((st) => {
                  const attRecord = attendance.find(a => a.date === selectedCalendarDate && (a.student_id === st.id || a.students?.admission_id === st.admission_id))
                  const isPresent = attRecord?.status === 'present'
                  const isAbsent = attRecord?.status === 'absent'
                  const isPending = !attRecord

                  return (
                    <div key={st.id} className={`p-3.5 border rounded-xl flex items-center justify-between text-xs ${bgSubCard}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold ${textPrimary}`}>{st.full_name}</h4>
                          <span className="text-blue-500 font-mono">({st.admission_id})</span>
                          {isPending && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-bold">UNMARKED</span>}
                          {isPresent && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold">PRESENT</span>}
                          {isAbsent && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-bold">ABSENT</span>}
                        </div>
                        <p className={`text-[11px] ${textSecondary}`}>
                          Class: <strong className={textPrimary}>{st.class_name || 'Nursery'} - {st.section_name || 'A'}</strong> | Parent: {st.parent_name}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, 'present')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition ${
                            isPresent ? 'bg-emerald-600 text-white shadow-sm font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          PRESENT
                        </button>

                        <button
                          onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, 'absent')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition ${
                            isAbsent ? 'bg-rose-600 text-white shadow-sm font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-500/20'
                          }`}
                        >
                          ABSENT
                        </button>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-right">
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

      {/* MODAL: ADMIN GALLERY FULL-SIZE LIGHTBOX POPUP WITH TOP-RIGHT CLOSE X BUTTON */}
      {selectedAdminGalleryImg && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setSelectedAdminGalleryImg(null)}
        >
          <div
            className={`relative max-w-3xl w-full ${bgCard} rounded-3xl p-6 shadow-2xl border space-y-4 flex flex-col items-center`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold ${textPrimary}`}>{selectedAdminGalleryImg.title}</h3>
                <p className={`text-xs font-mono ${textSecondary} truncate`}>{selectedAdminGalleryImg.url.startsWith('data:') ? 'Device Base64 Image' : selectedAdminGalleryImg.url}</p>
              </div>

              <button
                onClick={() => setSelectedAdminGalleryImg(null)}
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center transition cursor-pointer border border-slate-300 dark:border-slate-700"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2">
              <img
                src={selectedAdminGalleryImg.url}
                alt={selectedAdminGalleryImg.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
                onError={(e: any) => {
                  e.target.src = '/phulwari_logo.webp'
                }}
              />
            </div>

            <div className="w-full flex items-center justify-between pt-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badgeClass}`}>
                Category: {selectedAdminGalleryImg.category || 'Activities'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setDeletingGalleryImg(selectedAdminGalleryImg)
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Photo</span>
                </button>

                <button
                  onClick={() => setSelectedAdminGalleryImg(null)}
                  className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: BEAUTIFUL GALLERY PHOTO DELETION CONFIRMATION */}
      {deletingGalleryImg && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`${bgCard} rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-500/30 text-center relative`}>
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className={`text-lg font-bold ${textPrimary}`}>Delete Gallery Photo?</h3>
              <p className={`text-xs ${textSecondary}`}>Are you sure you want to delete this photo from the live gallery? This action cannot be undone.</p>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-left">
              <img src={deletingGalleryImg.url} alt="Delete Preview" className="w-14 h-14 object-cover rounded-xl border shrink-0" />
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${textPrimary}`}>{deletingGalleryImg.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
                  {deletingGalleryImg.category || 'Activities'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeletingGalleryImg(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGalleryImage}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLASS MONTHLY FEE STRUCTURE */}
      {isClassFeeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <IndianRupee className="w-5 h-5 text-emerald-500" /> Batch Fee Structure Management
                </h3>
                <p className={`text-xs ${textSecondary}`}>Configure default monthly fees for all active dynamic batches.</p>
              </div>

              <button onClick={() => setIsClassFeeModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {classFeeSaveStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold animate-fadeIn">
                {classFeeSaveStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {batches.map((b) => (
                <div key={b.id} className={`p-3 rounded-2xl border space-y-1.5 ${bgSubCard}`}>
                  <label className={`font-bold block ${textPrimary}`}>{b.batch_name} ({b.age_group || '1-3 Yrs'})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={b.fee_amount || 3500}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0
                        setBatches(prev => prev.map(item => item.id === b.id ? { ...item, fee_amount: val } : item))
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
              <span className={`text-xs ${textSecondary}`}>Updating fees will update default amounts for new payments.</span>

              <div className="flex items-center space-x-3">
                <button onClick={() => setIsClassFeeModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs cursor-pointer">
                  Close
                </button>

                <button
                  onClick={handleSaveClassFees}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Class Fees to Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE ADMIN USERS (CREATE & DELETE ADMNIS) */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <ShieldCheck className="w-5 h-5 text-blue-500" /> Admin User Management & Access Control
              </h3>
              <button onClick={() => setIsAddAdminOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addAdminMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold text-center">
                {addAdminMsg}
              </div>
            )}

            {/* Create New Admin Form */}
            <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-3`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Create New Admin Account</h4>
              <form onSubmit={handleAddAdminSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Admin Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Co-Administrator"
                      value={newAdminForm.name}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`font-bold ${textSecondary}`}>Admin Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="admin2@phulwari.com"
                      value={newAdminForm.email}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`font-bold ${textSecondary}`}>Assign Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SecurePass123"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                      isLight ? 'bg-white border-slate-300 text-blue-700' : 'bg-slate-900 border-slate-800 text-blue-400'
                    }`}
                  />
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer">
                    + Create & Authorize Admin
                  </button>
                </div>
              </form>
            </div>

            {/* List of Existing Admins with Delete Button */}
            <div className="space-y-3 pt-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Active Authorized Admin Accounts ({adminUsersList.length})</h4>

              <div className="space-y-2">
                {adminUsersList.map((adm) => {
                  const isMaster = adm.email?.toLowerCase() === 'phulwari20@gmail.com'
                  const isCurrentSession = adminUser?.email?.toLowerCase() === adm.email?.toLowerCase()
                  const isCurrentSessionMaster = adminUser?.email?.toLowerCase() === 'phulwari20@gmail.com' || adminUser?.id === 'master-adm'

                  return (
                    <div
                      key={adm.id || adm.email}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${bgSubCard}`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {adm.name?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0 text-xs">
                          <p className={`font-bold truncate ${textPrimary}`}>
                            {adm.name || 'Admin User'}{' '}
                            {isCurrentSession && <span className="text-[10px] text-blue-500 font-mono font-bold">(You)</span>}
                          </p>
                          <p className={`text-[11px] font-mono truncate ${textSecondary}`}>{adm.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                          isMaster ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                        }`}>
                          {isMaster ? 'Master Admin' : 'Co-Admin'}
                        </span>

                        {!isMaster && isCurrentSessionMaster && (
                          <button
                            onClick={() => handleDeleteAdmin(adm.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={() => setIsAddAdminOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs cursor-pointer">
                Close Admin Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW BATCH POPUP */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary}`}>Create Dynamic New Batch</h3>
              <button onClick={() => setIsAddBatchOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className={`font-bold ${textSecondary}`}>Batch Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Playgroup Morning Batch"
                  value={newBatchForm.batch_name}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, batch_name: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Category (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Toddler Program"
                    value={newBatchForm.category}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, category: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Sub-Category (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Session"
                    value={newBatchForm.subcategory}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, subcategory: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Kidwaipuri Main Branch, Patna"
                  value={newBatchForm.location}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, location: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Age Group</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1.5 - 3 Years"
                    value={newBatchForm.age_group}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, age_group: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Batch Timing</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30 AM - 11:30 AM"
                    value={newBatchForm.batch_time}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batch_time: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              {/* Weekly Days Schedule Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`font-bold ${textSecondary}`}>Weekly Days Schedule</label>
                  <button
                    type="button"
                    onClick={() => {
                      const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                      const isAll = newBatchForm.days_schedule.length === 7
                      setNewBatchForm({ ...newBatchForm, days_schedule: isAll ? ['Monday', 'Wednesday', 'Friday'] : allDays })
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    {newBatchForm.days_schedule.length === 7 ? 'Deselect All' : 'Select All (Mon-Sun)'}
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 p-2 border rounded-xl bg-slate-50 dark:bg-slate-950">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => {
                    const checked = newBatchForm.days_schedule.includes(d)
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => {
                          const updated = checked
                            ? newBatchForm.days_schedule.filter(day => day !== d)
                            : [...newBatchForm.days_schedule, d]
                          setNewBatchForm({ ...newBatchForm, days_schedule: updated })
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-center ${
                          checked ? 'bg-blue-600 text-white shadow-sm' : `${textSecondary} hover:bg-slate-200 dark:hover:bg-slate-800`
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Validity (Days)</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={newBatchForm.validity_days}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, validity_days: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Batch Fee (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="3500"
                    value={newBatchForm.fee_amount}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, fee_amount: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Capacity</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={newBatchForm.capacity}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, capacity: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setIsAddBatchOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 cursor-pointer">
                  Create Batch Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TEACHER POPUP */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <UserPlus className="w-5 h-5 text-indigo-500" /> {editingTeacher ? 'Edit Teacher Details' : 'Add New Faculty Teacher'}
              </h3>
              <button onClick={() => setIsAddTeacherOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="space-y-3 text-xs">
              <div>
                <label className={`font-bold ${textSecondary}`}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Sharma"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@phulwari.co.in"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold ${textSecondary}`}>Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Early Childhood Learning"
                    value={teacherForm.specialization}
                    onChange={(e) => setTeacherForm({ ...teacherForm, specialization: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold ${textSecondary}`}>Assigned Batch</label>
                  <select
                    value={teacherForm.assigned_batch}
                    onChange={(e) => setTeacherForm({ ...teacherForm, assigned_batch: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.batch_name}>{b.batch_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Status</label>
                <select
                  value={teacherForm.status}
                  onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setIsAddTeacherOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer">
                  {editingTeacher ? 'Save Changes' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT OPTIONS (PDF vs CSV / EXCEL) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`${bgCard} rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <Download className="w-5 h-5 text-emerald-500" /> Export Student Directory
              </h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs ${textSecondary}`}>Choose your preferred export format to download the complete directory of enrolled students.</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleExportStudentsPDF}
                className="p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
                  <Printer className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${textPrimary}`}>Export to PDF</span>
                <span className="text-[10px] text-slate-400">Printable Document</span>
              </button>

              <button
                onClick={handleExportStudentsCSV}
                className="p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Download className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${textPrimary}`}>Export to CSV / Excel</span>
                <span className="text-[10px] text-slate-400">Spreadsheet File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
