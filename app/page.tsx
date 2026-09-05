'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'
import { getSupabaseKey, getSupabaseUrl } from '../lib/supabase/env'
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
  DollarSign,
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
  ExternalLink,
  PhoneCall,
  UserX,
  HelpCircle,
  ShieldAlert
} from 'lucide-react'
import TeachersTab from '../components/TeachersTab'
import EnquiriesTab from '../components/EnquiriesTab'
import DeactivatedTab from '../components/DeactivatedTab'
import GalleryTab from '../components/GalleryTab'
import PackagesTab from '../components/PackagesTab'
import BirthdayLandingTab from '../components/BirthdayLandingTab'
import NoticesTab from '../components/NoticesTab'
import DashboardTab from '../components/DashboardTab'
import StudentsTab from '../components/StudentsTab'
import StudentListTab from '../components/StudentListTab'
import AttendanceTab from '../components/AttendanceTab'
import CalendarTab from '../components/CalendarTab'
import FeesTab from '../components/FeesTab'
import BatchesTab from '../components/BatchesTab'
import BookingsTab from '../components/BookingsTab'
import BlogsTab from '../components/BlogsTab'
import ReviewsTab from '../components/ReviewsTab'
import BirthdayAlertsTab from '../components/BirthdayAlertsTab'
import RenewalAlertsTab from '../components/RenewalAlertsTab'
import FeeAlertsTab from '../components/FeeAlertsTab'
import StaffTab from '../components/StaffTab'
import BannersTab, { BannerItem } from '../components/BannersTab'
import FinancialTab from '../components/FinancialTab'
import AddStudentModal from '../components/AddStudentModal'
import StudentErpModal from '../components/StudentErpModal'
import BroadcastNoticeModal from '../components/BroadcastNoticeModal'
import AddTeacherModal from '../components/AddTeacherModal'
import TeacherProfileModal from '../components/TeacherProfileModal'
import ExportModal from '../components/ExportModal'
import {
  handleExportStudentsCSV,
  handleExportStudentsPDF,
  handleExportBulkRegistrationForms,
  handlePrintRegistrationForm
} from '../lib/printUtils'

export default function AdminDashboardPage() {
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

  // Theme Toggle
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Restore the operator's chosen theme. Read in an effect rather than in the
  // initial state so the server and first client render agree.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('phulwari_admin_theme')
      if (saved === 'light' || saved === 'dark') setTheme(saved)
    } catch (_) {}
  }, [])

  // The `.dark` class on <html> is what every `dark:` utility keys off, so the
  // toggle — not the device's OS setting — decides how the panel renders.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    try {
      localStorage.setItem('phulwari_admin_theme', theme)
    } catch (_) {}
  }, [theme])

  // Sidebar Resizable & Collapsible State
  const [sidebarWidth, setSidebarWidth] = useState<number>(270)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false)

  // Mobile Menu Drawer Toggle State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'student_list' | 'teachers' | 'attendance' | 'calendar' | 'fees' | 'batches' | 'bookings' | 'announcements' | 'gallery' | 'packages' | 'birthday_page' | 'blogs' | 'reviews' | 'birthdays' | 'enquiries' | 'deactivated' | 'staff_mgmt' | 'renewals' | 'fee_alerts' | 'banners' | 'financial'>('dashboard')
  const [banners, setBanners] = useState<BannerItem[]>([])
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
  // ERP upgrades & enhancements state
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [adminRole, setAdminRole] = useState<'Admin' | 'Staff'>('Admin')
  const [categories, setCategories] = useState<any[]>(() => [
    { id: 'cat-1', name: 'Child Activity', emoji: '🧸' },
    { id: 'cat-2', name: 'Zumba & Yoga', emoji: '🧘' }
  ])
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All')
  const [waReminderModal, setWaReminderModal] = useState({ isOpen: false, phone: '', message: '' })
  const [leadAlert, setLeadAlert] = useState<{ name: string; phone: string; service: string; id: string } | null>(null)

  const [batches, setBatches] = useState<any[]>([])
  const [batchSchedules, setBatchSchedules] = useState<any[]>([])
  const [studentCustomSchedules, setStudentCustomSchedules] = useState<any[]>([])
  const [holidays, setHolidays] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  // Class Master drives every "which class" dropdown (batch schedules, custom
  // student schedules). Falls back to the built-in list until the `classes`
  // table is populated so the UI is never left with an empty select.
  const DEFAULT_CLASS_NAMES = ['Skating', 'Cricket', 'Gymnastics', 'Dance', 'Zumba', 'Yoga', 'Karate', 'Other']
  const classMasterNames = useMemo(() => {
    const fromDb = classes
      .map((c: any) => c?.class_name)
      .filter((n: any): n is string => typeof n === 'string' && n.trim() !== '')
    const merged = fromDb.length > 0 ? [...fromDb, 'Other'] : DEFAULT_CLASS_NAMES
    return Array.from(new Set(merged))
  }, [classes])

  // Dynamic category list combining DB categories + registered student categories + batch categories
  const dynamicCategoriesList = useMemo(() => {
    const fromStudents = students.map((s: any) => s.category).filter((c: any): c is string => typeof c === 'string' && c.trim() !== '')
    const fromBatches = batches.map((b: any) => b.category).filter((c: any): c is string => typeof c === 'string' && c.trim() !== '')
    const fromDb = (categories || []).map((c: any) => (typeof c === 'string' ? c : c?.name)).filter((c: any): c is string => typeof c === 'string' && c.trim() !== '')
    
    const merged = Array.from(new Set(['Child Activity', 'Zumba & Yoga', ...fromDb, ...fromStudents, ...fromBatches]))
    return merged
  }, [students, batches, categories])

  const handleCreateCategory = async (rawCatName: string) => {
    if (!rawCatName || !rawCatName.trim()) return
    const catName = rawCatName.trim()
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('categories').insert([{ name: catName, emoji: '🏷️' }]).select()
      if (data && data.length > 0) {
        setCategories(prev => [...prev.filter((c: any) => (typeof c === 'string' ? c : c.name).toLowerCase() !== catName.toLowerCase()), data[0]])
      }
    } catch (err) {
      console.error('Failed to save category to DB:', err)
    }
    setCategories(prev => {
      const exists = prev.some((c: any) => (typeof c === 'string' ? c : c.name).toLowerCase() === catName.toLowerCase())
      if (exists) return prev
      return [...prev, { name: catName, emoji: '🏷️' }]
    })
  }
  const [incomeCategories, setIncomeCategories] = useState<any[]>([])
  const [expenseCategories, setExpenseCategories] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [feeHeads, setFeeHeads] = useState<any[]>(() => {
    return [
      { id: 'fh-1', name: 'Registration Fee', default_amount: 1000, is_system: true },
      { id: 'fh-2', name: 'Monthly Fee', default_amount: 3500, is_system: true },
      { id: 'fh-3', name: 'Exam Fee', default_amount: 500, is_system: false },
      { id: 'fh-4', name: 'Sports Fee', default_amount: 300, is_system: false },
      { id: 'fh-5', name: 'Library Fee', default_amount: 200, is_system: false },
      { id: 'fh-6', name: 'Development Fee', default_amount: 500, is_system: false }
    ]
  })
  const [attendance, setAttendance] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])

  const [galleryImages, setGalleryImages] = useState<any[]>([])
  const [galleryPage, setGalleryPage] = useState<number>(1)
  const galleryPerPage = 8
  const [selectedAdminGalleryImg, setSelectedAdminGalleryImg] = useState<any>(null)
  const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false)
  const [deletingGalleryImg, setDeletingGalleryImg] = useState<any>(null)

  // Dynamic Party Packages State
  const [partyPackages, setPartyPackages] = useState<any[]>([])
  // Class fee states moved to FeesTab
  const [pkgSaveStatus, setPkgSaveStatus] = useState<string>('')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // Teacher Management State — Initialized empty; populated strictly from Supabase DB / user actions
  const [teachers, setTeachers] = useState<any[]>([])
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState<boolean>(false)
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null)
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Early Learning',
    assigned_batch: 'Little Explorers (Morning)',
    status: 'Active',
    // Extended profile / payroll fields
    photo_url: '',
    address: '',
    qualification: '',
    subject: '',
    designation: '',
    join_date: '',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    monthly_salary: '',
    salary_effective_from: '',
    bank_details: '',
    emergency_contact: '',
    documents: ''
  })
  // Teacher payroll & attendance state (persisted to localStorage + Supabase)
  const [teacherPayments, setTeacherPayments] = useState<any[]>([])
  const [teacherAttendance, setTeacherAttendance] = useState<any[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null)

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
    capacity: '20',
    schedules: [] as Array<{ day_of_week: string; start_time: string; end_time: string; class_name: string }>
  })

  // Fee Filters & Month
  const [feeStatusFilter, setFeeStatusFilter] = useState<'All' | 'PAID' | 'PENDING'>('All')
  const [feeSelectedMonth, setFeeSelectedMonth] = useState<string>('August 2026')

  // Attendance Date Picker
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [attendanceDate, setAttendanceDate] = useState<string>(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })

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
  const [batchEditTab, setBatchEditTab] = useState<'core' | 'landing'>('core')

  // Student Admission Form Modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [newStudentForm, setNewStudentForm] = useState({
    admission_id: '',
    password: 'parent123',
    full_name: '',
    dob: '',
    gender: 'Boy',
    blood_group: 'B+',
    batch_id: '11111111-1111-1111-1111-111111111111',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    city: 'Patna',
    state: 'Bihar',
    pin_code: '800001',
    parent_relationship: 'Father',
    parent_occupation: '',
    parent_address_same: true,
    parent_alt_phone: '',
    emergency_contact_name: '',
    emergency_relationship: '',
    emergency_phone: '',
    emergency_alt_phone: '',
    program_interested: '',
    preferred_time_slot: 'Morning',
    has_medical_condition: false,
    medical_condition_details: '',
    regular_medication: '',
    doctor_name: '',
    doctor_phone: '',
    hospital_preference: '',
    consent_accepted: true,
    custom_days: '',
    custom_schedules: [] as Array<{ day_of_week: string; start_time: string; end_time: string; class_name: string }>,
    classes_total: 12,
    classes_consumed: 0,
    category: 'Child Activity',
    status: 'active',
    payment_for: '',
    payment_mode: 'Cash',
    amount_paid: '',
    total_fee: '',
    plan_validity_date: '',
    remarks: '',
    admission_date: new Date().toISOString().split('T')[0]
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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false)
  const [adminUsersList, setAdminUsersList] = useState<any[]>([
    { id: 'master-adm', email: 'phulwari20@gmail.com', password: 'Phulwari@1295', name: 'Master Administrator' }
  ])

  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' })
  const [addAdminMsg, setAddAdminMsg] = useState<string>('')

  // Check admin session on mount
  useEffect(() => {
    try {
      const savedAdminsStr = localStorage.getItem('phulwari_admin_users')
      if (savedAdminsStr) setAdminUsersList(JSON.parse(savedAdminsStr))

      const sessionStr = localStorage.getItem('phulwari_admin_session')
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr)
        setAdminUser(parsed)
        const isStaff = parsed.role === 'Staff' || parsed.role === 'Management' || (parsed.role && parsed.role !== 'Admin')
        setAdminRole(isStaff ? 'Staff' : (parsed.role || 'Admin'))
        if (isStaff && parsed.permissions && parsed.permissions.length > 0) {
          setActiveTab(parsed.permissions[0])
        }
      }
    } catch (e) {}
    setAdminAuthChecked(true)
  }, [])

  // Admin Login Handler
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoginError('')
    const cleanEmail = adminEmailInput.trim().toLowerCase()
    const cleanPw = adminPwInput.trim()
    const supabase = createClient()

    // 1. Query Supabase bookings table first for Staff Account matching this email
    try {
      const { data: staffRec, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'Staff Account')
        .eq('email', cleanEmail)
      
      if (staffRec && staffRec.length > 0) {
        const staff = staffRec[0]
        let notesData: any = {}
        try { notesData = JSON.parse(staff.notes || '{}') } catch (ex) {}
        
        if (notesData.password === cleanPw) {
          const matchedRole = notesData.role || 'Staff'
          const match = {
            id: staff.id,
            email: staff.email,
            name: staff.parent_name || 'Administrator',
            role: matchedRole,
            permissions: matchedRole === 'Admin' 
              ? ['dashboard', 'students', 'attendance', 'fees', 'schedule', 'teachers', 'expenses', 'enquiries', 'bookings', 'gallery', 'announcements', 'website', 'staff'] 
              : (notesData.permissions || [])
          }
          setAdminUser(match)
          setAdminRole(matchedRole)
          if (match.permissions && match.permissions.length > 0) {
            setActiveTab(match.permissions[0])
          }
          try {
            localStorage.setItem('phulwari_admin_session', JSON.stringify(match))
          } catch (err) {}
          return
        } else {
          // Record exists, but password mismatch
          setAdminLoginError('Incorrect password. Please try again.')
          return
        }
      }
    } catch (err) {
      console.error('Database auth check error:', err)
    }

    // 2. Try to match master admin hardcoded fallback
    if (cleanEmail === 'phulwari20@gmail.com' && cleanPw === 'Phulwari@1295') {
      const match = { id: 'master-adm', email: 'phulwari20@gmail.com', password: 'Phulwari@1295', name: 'Master Administrator', role: 'Admin' }
      setAdminUser(match)
      setAdminRole('Admin')
      try {
        localStorage.setItem('phulwari_admin_session', JSON.stringify(match))
      } catch (err) {}
      return
    }

    // 3. Try to match local state (saved admins in local storage)
    const localMatch = adminUsersList.find((adm: any) => 
      adm.email?.trim().toLowerCase() === cleanEmail && adm.password === cleanPw
    )
    if (localMatch) {
      const match = { ...localMatch, role: localMatch.role || 'Admin' }
      setAdminUser(match)
      setAdminRole(match.role || 'Admin')
      try {
        localStorage.setItem('phulwari_admin_session', JSON.stringify(match))
      } catch (err) {}
      return
    }

    setAdminLoginError('Invalid Admin Email or Password. Please check your credentials.')
  }

  const handleAdminLogout = () => {
    setAdminUser(null)
    try {
      localStorage.removeItem('phulwari_admin_session')
    } catch (e) {}
  }

  const handleAdminPasswordChangeSubmit = async (currentPw: string, newPw: string): Promise<boolean> => {
    if (!adminUser) return false;
    const cleanEmail = adminUser.email.trim().toLowerCase();
    const supabase = createClient();

    try {
      // Query database first
      const { data: staffRec, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'Staff Account')
        .eq('email', cleanEmail);

      if (error) {
        alert(`❌ Database error: ${error.message}`);
        return false;
      }

      if (staffRec && staffRec.length > 0) {
        const staff = staffRec[0];
        let notesData: any = {};
        try { notesData = JSON.parse(staff.notes || '{}'); } catch (e) {}

        if (notesData.password !== currentPw) {
          alert('❌ Incorrect current password! Please try again.');
          return false;
        }

        // Update password in notes
        const updatedNotes = JSON.stringify({
          ...notesData,
          password: newPw
        });

        const { error: updateErr } = await supabase
          .from('bookings')
          .update({ notes: updatedNotes })
          .eq('id', staff.id);

        if (updateErr) {
          alert(`❌ Could not update password: ${updateErr.message}`);
          return false;
        }

        alert('🎉 Password changed successfully!');
        return true;
      } else {
        // Fallback for master admin
        if (cleanEmail === 'phulwari20@gmail.com' && currentPw === 'Phulwari@1295') {
          const payload = {
            booking_type: 'Staff Account',
            parent_name: 'Master Administrator',
            email: 'phulwari20@gmail.com',
            phone: '6207368839',
            notes: JSON.stringify({
              password: newPw,
              role: 'Admin',
              permissions: ['dashboard', 'students', 'attendance', 'fees', 'schedule', 'teachers', 'expenses', 'enquiries', 'bookings', 'gallery', 'announcements', 'website', 'staff']
            })
          };

          const { error: insertErr } = await supabase
            .from('bookings')
            .insert([payload]);

          if (insertErr) {
            alert(`❌ Could not insert password record: ${insertErr.message}`);
            return false;
          }

          alert('🎉 Password changed successfully!');
          return true;
        } else {
          alert('❌ Incorrect current password! Please try again.');
          return false;
        }
      }
    } catch (e: any) {
      alert(`❌ An error occurred: ${e.message || e}`);
      return false;
    }
  };

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

  // ---------------------------------------------------------------------------
  // Lead / Enquiry push notifications.
  // When a new enquiry row is inserted, the admin gets an immediate alert:
  //   • a browser push notification (Name, Mobile, Service) that, when clicked,
  //     jumps straight to the Lead & Enquiry Manager, and
  //   • an in-app banner (leadAlert) as a fallback when notifications are off.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }

    const supabase = createClient()
    const channel = supabase
      .channel('enquiries-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'enquiries' },
        (payload: any) => {
          const lead = payload.new || {}
          const name = lead.parent_name || lead.child_name || 'New lead'
          const phone = lead.phone || ''
          const service = lead.program_interested || 'General Inquiry'

          // Keep the enquiries list live
          setEnquiries(prev => (prev.some(e => e.id === lead.id) ? prev : [lead, ...prev]))

          // In-app banner
          setLeadAlert({ name, phone, service, id: lead.id })

          // Browser push notification
          try {
            if ('Notification' in window && Notification.permission === 'granted') {
              const n = new Notification('🔔 New Lead Enquiry', {
                body: `${name}${phone ? ` • ${phone}` : ''}\nInterested in: ${service}`,
                tag: `lead-${lead.id}`,
              })
              n.onclick = () => { window.focus(); setActiveTab('enquiries'); n.close() }
            }
          } catch (e) { /* notifications unavailable */ }
        }
      )
      .subscribe()

    return () => { try { supabase.removeChannel(channel) } catch (e) {} }
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

      // 3b. Fetch Fee Heads — prefer Supabase, fall back to localStorage
      try {
        const { data: dbHeads } = await supabase.from('fee_heads').select('*')
        if (dbHeads && dbHeads.length > 0) {
          setFeeHeads(dbHeads)
          localStorage.setItem('phulwari_fee_heads', JSON.stringify(dbHeads))
        } else {
          const savedHeads = localStorage.getItem('phulwari_fee_heads')
          if (savedHeads) setFeeHeads(JSON.parse(savedHeads))
        }
      } catch (err) {
        const savedHeads = localStorage.getItem('phulwari_fee_heads')
        if (savedHeads) setFeeHeads(JSON.parse(savedHeads))
      }

      // 4. Teachers — prefer Supabase, fall back to sanitized localStorage
      try {
        const { data: dbTeachers } = await supabase.from('teachers').select('*')
        if (dbTeachers) {
          const cleanTeachers = dbTeachers.filter((t: any) => !['tch-101', 'tch-102', 'tch-103'].includes(t.id) && t.name !== 'Ananya Sen' && t.name !== 'Rohan Deshmukh' && t.name !== 'Meera Kapur')
          setTeachers(cleanTeachers)
          try { localStorage.setItem('phulwari_teachers', JSON.stringify(cleanTeachers)) } catch (_) {}
        } else {
          const localT = localStorage.getItem('phulwari_teachers')
          if (localT) {
            try {
              const parsed = JSON.parse(localT)
              const cleanLocal = parsed.filter((t: any) => !['tch-101', 'tch-102', 'tch-103'].includes(t.id) && t.name !== 'Ananya Sen' && t.name !== 'Rohan Deshmukh' && t.name !== 'Meera Kapur')
              setTeachers(cleanLocal)
            } catch (e) { setTeachers([]) }
          } else {
            setTeachers([])
          }
        }
      } catch (_) {
        const localT = localStorage.getItem('phulwari_teachers')
        if (localT) {
          try {
            const parsed = JSON.parse(localT)
            const cleanLocal = parsed.filter((t: any) => !['tch-101', 'tch-102', 'tch-103'].includes(t.id) && t.name !== 'Ananya Sen' && t.name !== 'Rohan Deshmukh' && t.name !== 'Meera Kapur')
            setTeachers(cleanLocal)
          } catch (e) { setTeachers([]) }
        } else {
          setTeachers([])
        }
      }

      // 4b. Teacher payroll & attendance — Supabase with localStorage fallback
      try {
        const { data: dbPay } = await supabase.from('teacher_payments').select('*').order('created_at', { ascending: false })
        if (dbPay && dbPay.length > 0) setTeacherPayments(dbPay)
        else { const l = localStorage.getItem('phulwari_teacher_payments'); if (l) setTeacherPayments(JSON.parse(l)) }
      } catch (_) {
        try { const l = localStorage.getItem('phulwari_teacher_payments'); if (l) setTeacherPayments(JSON.parse(l)) } catch (__) {}
      }
      try {
        const { data: dbAtt } = await supabase.from('teacher_attendance').select('*')
        if (dbAtt && dbAtt.length > 0) setTeacherAttendance(dbAtt)
        else { const l = localStorage.getItem('phulwari_teacher_attendance'); if (l) setTeacherAttendance(JSON.parse(l)) }
      } catch (_) {
        try { const l = localStorage.getItem('phulwari_teacher_attendance'); if (l) setTeacherAttendance(JSON.parse(l)) } catch (__) {}
      }

      // 5. Fetch Announcements — DB first with defaults fallback
      const defaultAnnouncementsList = [
        { id: 'an-101', title: 'Monthly Fee Renewal Reminder - August 2026', content: 'Dear Parents, kindly settle the monthly activity fee dues for August 2026 at the earliest to ensure uninterrupted sessions.', category: 'Fee Notice', target_audience: 'all', date: '2026-08-01' },
        { id: 'an-102', title: 'Independence Day Special Cultural Celebration', content: 'We invite all children and parents to join our Independence Day celebration on August 15th from 09:30 AM onwards.', category: 'Event', target_audience: 'all', date: '2026-08-10' },
        { id: 'an-103', title: 'Parent-Teacher Interaction Session', content: 'Quarterly review and activity progress meeting scheduled for Saturday. Detailed batch slots are available in ERP portal.', category: 'Notice', target_audience: 'all', date: '2026-08-08' }
      ]
      try {
        const { data: dbAnnouncements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
        if (dbAnnouncements) {
          setAnnouncements(dbAnnouncements)
          try { localStorage.setItem('phulwari_announcements', JSON.stringify(dbAnnouncements)) } catch (e) {}
        } else {
          const l = localStorage.getItem('phulwari_announcements')
          if (l) setAnnouncements(JSON.parse(l))
          else setAnnouncements(defaultAnnouncementsList)
        }
      } catch (_) {
        const l = localStorage.getItem('phulwari_announcements')
        if (l) setAnnouncements(JSON.parse(l))
        else setAnnouncements(defaultAnnouncementsList)
      }

      // 6. Fetch Party Packages from Supabase DB (instead of only localStorage)
      try {
        const { data: dbPackages, error: pkgErr } = await supabase
          .from('party_packages')
          .select('*')
          .order('name', { ascending: true })
        if (dbPackages && dbPackages.length > 0) {
          setPartyPackages(dbPackages)
          try { localStorage.setItem('phulwari_party_packages', JSON.stringify(dbPackages)) } catch (e) {}
        } else {
          const savedPkg = localStorage.getItem('phulwari_party_packages')
          if (savedPkg) {
            const parsed = JSON.parse(savedPkg)
            setPartyPackages(parsed.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '')))
          }
        }
      } catch (e) {
        console.error('❌ [PACKAGES FETCH EXCEPTION]:', e)
        const savedPkg = localStorage.getItem('phulwari_party_packages')
        if (savedPkg) {
          const parsed = JSON.parse(savedPkg)
          setPartyPackages(parsed.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '')))
        }
      }

      // 7. Load Gallery Images from DB
      await fetchAdminGallery()

      // 8. Fetch Enquiries
      try {
        const { data: dbEnquiries } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
        if (dbEnquiries && dbEnquiries.length > 0) {
          setEnquiries(dbEnquiries)
        } else {
          setEnquiries([])
        }
      } catch (e) {
        console.error('❌ [ENQUIRIES FETCH ERROR]:', e)
      }

      // 9. Fetch Bookings/Registrations from DB (excluding Staff Account)
      try {
        const { data: dbBookings, error: bookingsErr } = await supabase
          .from('bookings')
          .select('*')
          .neq('booking_type', 'Staff Account')
          .order('created_at', { ascending: false })
        if (dbBookings) {
          setBookings(dbBookings)
          console.log(`✅ [BOOKINGS] Loaded ${dbBookings.length} bookings from DB`)
        }
      } catch (e) {
        console.error('❌ [BOOKINGS FETCH EXCEPTION]:', e)
      }

      // Fetch batch schedules, student customized schedules, holidays, classes, and attendance
      try {
        const { data: dbBatchSch } = await supabase.from('batch_schedules').select('*')
        if (dbBatchSch) setBatchSchedules(dbBatchSch)
        
        const { data: dbCustSch } = await supabase.from('student_custom_schedules').select('*')
        if (dbCustSch) setStudentCustomSchedules(dbCustSch)
        
        const { data: dbHolidays } = await supabase.from('holidays').select('*')
        if (dbHolidays) setHolidays(dbHolidays)
        
        const { data: dbClasses } = await supabase.from('classes').select('*')
        if (dbClasses) setClasses(dbClasses)

        const { data: dbAttendance } = await supabase.from('attendance').select('*')
        if (dbAttendance) setAttendance(dbAttendance)

        // Fetch categories (income_categories & expense_categories)
        try {
          const { data: dbCategories, error: catError } = await supabase.from('categories').select('*')
          if (!catError && dbCategories && dbCategories.length > 0) {
            setCategories(dbCategories)
            try { localStorage.setItem('phulwari_admin_categories', JSON.stringify(dbCategories)) } catch (e) {}
          } else {
            const localCats = localStorage.getItem('phulwari_admin_categories')
            if (localCats) setCategories(JSON.parse(localCats))
          }

          const { data: dbIncomeCats } = await supabase.from('income_categories').select('*').order('name', { ascending: true })
          if (dbIncomeCats && dbIncomeCats.length > 0) {
            setIncomeCategories(dbIncomeCats)
          }

          const { data: dbExpenseCats } = await supabase.from('expense_categories').select('*').order('name', { ascending: true })
          if (dbExpenseCats && dbExpenseCats.length > 0) {
            setExpenseCategories(dbExpenseCats)
          }
        } catch (catErr) {
          const localCats = localStorage.getItem('phulwari_admin_categories')
          if (localCats) setCategories(JSON.parse(localCats))
        }

        // Fetch Banners — Supabase DB Direct Connection
        try {
          const { data: dbBanners, error: bannerErr } = await supabase.from('banners').select('*').order('priority', { ascending: true })
          if (!bannerErr && dbBanners) {
            setBanners(dbBanners)
            try { localStorage.setItem('phulwari_banners', JSON.stringify(dbBanners)) } catch (e) {}
          } else {
            const localBanners = localStorage.getItem('phulwari_banners')
            if (localBanners) setBanners(JSON.parse(localBanners))
          }
        } catch (bErr) {
          const localBanners = localStorage.getItem('phulwari_banners')
          if (localBanners) setBanners(JSON.parse(localBanners))
        }
      } catch (e) {
        console.error('❌ [SCHEDULES/HOLIDAYS/ATTENDANCE FETCH EXCEPTION]:', e)
      }

    } catch (err) {
      console.error('❌ [LOAD ERROR]:', err)
    } finally {
      setLoading(false)
    }
  }

  // lead & enquiries handlers
  const handleAddEnquiry = async (form: any) => {
    const supabase = createClient()
    const newEnq = {
      child_name: form.child_name,
      age: form.age,
      parent_name: form.parent_name,
      phone: form.phone,
      email: form.email,
      program_interested: form.program_interested,
      notes: form.notes,
      status: 'New'
    }
    const { data, error } = await supabase.from('enquiries').insert([newEnq]).select()
    if (!error && data) {
      setEnquiries([data[0], ...enquiries])
      alert('🎉 Enquiry logged successfully!')
    }
  }

  const handleUpdateEnquiryStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id)
    if (!error) {
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e))
    }
  }

  // Save the "Next Follow-up Date" for a lead so the admin can schedule and
  // later update the next call. Degrades gracefully if the column is missing.
  const handleUpdateFollowUpDate = async (id: string, next_follow_up_date: string) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, next_follow_up_date } : e))
    try {
      const supabase = createClient()
      const { error } = await supabase.from('enquiries').update({ next_follow_up_date }).eq('id', id)
      if (error) console.warn('⚠️ next_follow_up_date could not persist (column may be missing):', error.message)
    } catch (err) { /* keep optimistic local state */ }
  }

  const handleUpdateEnquiryNotes = async (id: string, notes: string) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, notes } : e))
    try {
      const supabase = createClient()
      const { error } = await supabase.from('enquiries').update({ notes }).eq('id', id)
      if (error) console.error('❌ [UPDATE ENQUIRY NOTES ERROR]:', error.message)
    } catch (err) {}
  }

  // Auto-generate the next Admission No. so the admin never types it. Numbering
  // is sequential from 1: the next number is one past the highest trailing
  // number already used (deleting a student never reuses their number).
  const generateNextAdmissionId = () => {
    const maxNum = students.reduce((max, s) => {
      const m = String(s.admission_id || '').match(/(\d+)\s*$/)
      const n = m ? parseInt(m[1], 10) : 0
      return n > max ? n : max
    }, 0)
    return `PH-2026-${String(maxNum + 1).padStart(3, '0')}`
  }

  const handleConvertToAdmission = (enquiry: any) => {
    setNewStudentForm({
      ...newStudentForm,
      admission_id: generateNextAdmissionId(),
      password: '',
      full_name: enquiry.child_name,
      parent_name: enquiry.parent_name,
      parent_phone: enquiry.phone,
      parent_email: enquiry.email || '',
      program_interested: enquiry.program_interested || 'Gymnastics & MMA',
      custom_days: '',
      classes_total: 12,
      classes_consumed: 0,
      category: 'Child Activity',
      status: 'active',
      custom_schedules: []
    })
    setActiveTab('students')
    setIsAddStudentOpen(true)
  }

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return
    const supabase = createClient()
    const { error } = await supabase.from('enquiries').delete().eq('id', id)
    if (!error) {
      setEnquiries(enquiries.filter(e => e.id !== id))
    }
  }

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (!error) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
    }
  }

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this registration/booking?')) return
    const supabase = createClient()
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (!error) {
      setBookings(bookings.filter(b => b.id !== id))
    }
  }

  const handleReactivateStudent = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('students').update({ status: 'active' }).eq('id', id)
    if (!error) {
      setStudents(students.map(s => s.id === id ? { ...s, status: 'active' } : s))
      alert('🎉 Student reactivated successfully!')
    }
  }

  const handlePermanentDeleteDeactivated = async (id: string, name: string) => {
    try {
      const supabase = createClient()
      await supabase.from('students').delete().eq('id', id)
      setStudents(prev => prev.filter(s => s.id !== id))
      alert(`✅ "${name}" has been permanently deleted.`)
    } catch (err) {
      alert('❌ Error deleting student. Please try again.')
    }
  }

  const handleDeactivateStudent = async (id: string) => {
    if (!confirm('⚠️ Are you sure you want to deactivate this student? They will be hidden from attendance & dues lists.')) return
    const supabase = createClient()
    const { error } = await supabase.from('students').update({ status: 'deactivated' }).eq('id', id)
    if (!error) {
      setStudents(students.map(s => s.id === id ? { ...s, status: 'deactivated' } : s))
      setSelectedERPStudent(null)
      alert('⚠️ Student deactivated successfully!')
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
      capacity: parseInt(newBatchForm.capacity) || 20,
      is_visible: true
    }

    console.log('📡 [BATCH INSERT] Sending to Supabase:', dbPayload)

    try {
      const supabaseUrl = getSupabaseUrl()
      const supabaseKey = getSupabaseKey()
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

        // Insert schedules to batch_schedules table
        if (newBatchForm.schedules && newBatchForm.schedules.length > 0) {
          const supabase = createClient()
          const schedulesPayload = newBatchForm.schedules.map(sch => ({
            batch_id: batchUuid,
            day_of_week: sch.day_of_week,
            start_time: sch.start_time,
            end_time: sch.end_time,
            class_name: sch.class_name
          }))
          const { data: schData, error: schErr } = await supabase.from('batch_schedules').insert(schedulesPayload).select()
          if (schErr) {
            console.error('❌ [BATCH SCHEDULES INSERT ERROR]:', schErr)
          } else if (schData) {
            setBatchSchedules(prev => [...prev, ...schData])
          }
        }

        // Auto sync batch fee to dynamic fee heads table
        ;(async () => {
          try {
            const supabase = createClient()
            const batchFeeHead = {
              id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              name: `${inserted.batch_name} Fee`,
              default_amount: parseFloat(newBatchForm.fee_amount) || 3500,
              is_system: false
            }
            const { data: headData, error: headErr } = await supabase.from('fee_heads').insert([batchFeeHead]).select()
            if (!headErr && headData) {
              setFeeHeads(prev => [...prev, headData[0]])
            }
          } catch (headSyncErr) {
            console.error('Failed to sync new batch fee to fee_heads:', headSyncErr)
          }
        })()

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
          capacity: '20',
          schedules: []
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

    // 1. Prevent duplicate active students
    const isDuplicate = students.some(s => s.admission_id === newStudentForm.admission_id.trim() && s.status === 'active')
    if (isDuplicate) {
      alert('❌ Error: A student with this Admission ID is already active!')
      return
    }

    const generateUuid = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
      return 'f' + Date.now().toString(16).padStart(12, '0') + '-4000-8000-000000000000'
    }

    const studentUuid = generateUuid()

    const selectedBatchObj = newStudentForm.batch_id === '00000000-0000-0000-0000-000000000000'
      ? { id: '00000000-0000-0000-0000-000000000000', batch_name: 'Customized Batch', validity_days: 30 }
      : batches.find(b => b.id === newStudentForm.batch_id) || batches[0]

    const targetBatchId = selectedBatchObj?.id
    // Only send batch_id if it's a real batch ID present in the DB batches table
    const isRealDbBatch = !!(targetBatchId &&
      targetBatchId !== '00000000-0000-0000-0000-000000000000' &&
      targetBatchId !== '11111111-1111-1111-1111-111111111111' &&
      batches.some(b => b.id === targetBatchId))

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
      city: newStudentForm.city.trim(),
      state: newStudentForm.state.trim(),
      pin_code: newStudentForm.pin_code.trim(),
      parent_relationship: newStudentForm.parent_relationship.trim(),
      parent_occupation: newStudentForm.parent_occupation.trim(),
      parent_address_same: newStudentForm.parent_address_same,
      parent_alt_phone: newStudentForm.parent_alt_phone.trim(),
      emergency_contact_name: newStudentForm.emergency_contact_name.trim(),
      emergency_relationship: newStudentForm.emergency_relationship.trim(),
      emergency_phone: newStudentForm.emergency_phone.trim(),
      emergency_alt_phone: newStudentForm.emergency_alt_phone.trim(),
      program_interested: newStudentForm.program_interested.trim(),
      preferred_time_slot: newStudentForm.preferred_time_slot,
      has_medical_condition: newStudentForm.has_medical_condition,
      medical_condition_details: newStudentForm.medical_condition_details.trim(),
      regular_medication: newStudentForm.regular_medication.trim(),
      doctor_name: newStudentForm.doctor_name.trim(),
      doctor_phone: newStudentForm.doctor_phone.trim(),
      hospital_preference: newStudentForm.hospital_preference.trim(),
      consent_accepted: newStudentForm.consent_accepted,
      validity_end_date: new Date(Date.now() + (selectedBatchObj?.validity_days || 30) * 86400000).toISOString().split('T')[0],
      status: 'active',
      custom_days: newStudentForm.custom_days,
      classes_total: newStudentForm.classes_total,
      classes_consumed: newStudentForm.classes_consumed || 0,
      category: newStudentForm.category || 'Child Activity',
      admission_date: newStudentForm.admission_date || new Date().toISOString().split('T')[0]
    }

    const dbPayload = {
      id: studentUuid,
      admission_id: newStudentObj.admission_id,
      password: newStudentObj.password,
      full_name: newStudentObj.full_name,
      dob: newStudentObj.dob,
      gender: newStudentObj.gender,
      blood_group: newStudentObj.blood_group,
      batch_id: isRealDbBatch ? targetBatchId : null,
      parent_name: newStudentObj.parent_name,
      parent_phone: newStudentObj.parent_phone,
      parent_email: newStudentObj.parent_email,
      address: newStudentObj.address,
      city: newStudentObj.city,
      state: newStudentObj.state,
      pin_code: newStudentObj.pin_code,
      parent_relationship: newStudentObj.parent_relationship,
      parent_occupation: newStudentObj.parent_occupation,
      parent_address_same: newStudentObj.parent_address_same,
      parent_alt_phone: newStudentObj.parent_alt_phone,
      emergency_contact_name: newStudentObj.emergency_contact_name,
      emergency_relationship: newStudentObj.emergency_relationship,
      emergency_phone: newStudentObj.emergency_phone,
      emergency_alt_phone: newStudentObj.emergency_alt_phone,
      program_interested: newStudentObj.program_interested,
      preferred_time_slot: newStudentObj.preferred_time_slot,
      has_medical_condition: newStudentObj.has_medical_condition,
      medical_condition_details: newStudentObj.medical_condition_details,
      regular_medication: newStudentObj.regular_medication,
      doctor_name: newStudentObj.doctor_name,
      doctor_phone: newStudentObj.doctor_phone,
      hospital_preference: newStudentObj.hospital_preference,
      consent_accepted: newStudentObj.consent_accepted,
      status: 'active',
      custom_days: newStudentObj.custom_days,
      classes_total: newStudentObj.classes_total,
      classes_consumed: newStudentObj.classes_consumed,
      category: newStudentObj.category,
      validity_end_date: newStudentObj.validity_end_date || null,
      admission_date: newStudentObj.admission_date || null
    }

    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseKey()

    try {
      let res = await fetch(`${supabaseUrl}/rest/v1/students`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([dbPayload])
      })

      if (!res.ok) {
        const errJson = await res.clone().json().catch(() => ({}));
        const errStr = JSON.stringify(errJson);

        const isFkError = errJson.code === '23503' || errStr.includes('students_batch_id_fkey') || (errJson.message && errJson.message.includes('foreign key constraint'));
        const isMissingCol = errJson.message && (errJson.message.includes('column') || errJson.message.includes('schema cache') || errJson.code === 'PGRST204');

        if (isFkError || isMissingCol) {
          console.warn('⚠️ Retrying Supabase student insert with fallback payload (FK/schema correction)...');
          const fallbackPayload = { ...dbPayload };
          if (isFkError) {
            fallbackPayload.batch_id = null;
          }
          if (isMissingCol) {
            delete (fallbackPayload as any).category;
            delete (fallbackPayload as any).custom_days;
            delete (fallbackPayload as any).classes_total;
            delete (fallbackPayload as any).classes_consumed;
            delete (fallbackPayload as any).validity_end_date;
          }

          res = await fetch(`${supabaseUrl}/rest/v1/students`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify([fallbackPayload])
          });
        }
      }

      if (res.ok) {
        const responseData = await res.json()
        const inserted = responseData[0] || newStudentObj
        const enriched = {
          ...newStudentObj,
          ...inserted,
          category: newStudentObj.category || inserted.category || 'Child Activity',
          batch_name: selectedBatchObj?.batch_name || inserted.batch_name
        }

        // If Customized Batch is selected, insert schedules to student_custom_schedules table
        if (selectedBatchObj?.id === '00000000-0000-0000-0000-000000000000' && newStudentForm.custom_schedules && newStudentForm.custom_schedules.length > 0) {
          const supabase = createClient()
          const customSchedulesPayload = newStudentForm.custom_schedules.map((sch: any) => ({
            student_id: studentUuid,
            day_of_week: sch.day_of_week,
            start_time: sch.start_time,
            end_time: sch.end_time,
            class_name: sch.class_name
          }))
          const { data: custSchData, error: custSchErr } = await supabase.from('student_custom_schedules').insert(customSchedulesPayload).select()
          if (custSchErr) {
            console.error('❌ [STUDENT CUSTOM SCHEDULES INSERT ERROR]:', custSchErr)
          } else if (custSchData) {
            setStudentCustomSchedules(prev => [...prev, ...custSchData])
          }
        }

        const updatedList = [enriched, ...students]
        setStudents(updatedList)
        try {
          localStorage.setItem('phulwari_admin_students', JSON.stringify(updatedList))
        } catch (err) {}

        // Find matching enquiry and mark as Admission Done
        const supabase = createClient()
        const matchingEnq = enquiries.find(e => e.child_name.toLowerCase() === newStudentObj.full_name.toLowerCase() || e.phone === newStudentObj.parent_phone)
        if (matchingEnq) {
          await supabase.from('enquiries').update({ status: 'Admission Done' }).eq('id', matchingEnq.id)
          setEnquiries(enquiries.map(e => e.id === matchingEnq.id ? { ...e, status: 'Admission Done' } : e))
        }

        setIsAddStudentOpen(false)
        alert('Student created successfully!')
      } else {
        const errorText = await res.text()
        let errMsg = 'Failed to save student record to database.'
        try {
          const parsed = JSON.parse(errorText)
          if (parsed.message) {
            errMsg = parsed.message
            if (parsed.code === '23505') {
              errMsg = `Admission ID '${newStudentObj.admission_id}' already exists. Please choose a different ID.`
            }
          }
        } catch (_) {}
        alert(errMsg)
      }
    } catch (err: any) {
      alert(`Network error: ${err.message || err}`)
    }
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

  // Wrappers for exported print and PDF functions
  const triggerExportCSV = () => {
    handleExportStudentsCSV(filteredStudents)
    setIsExportModalOpen(false)
  }

  const triggerExportPDF = () => {
    handleExportStudentsPDF(filteredStudents)
    setIsExportModalOpen(false)
  }

  const triggerExportBulk = () => {
    // Print & export helpers moved to ../lib/printUtils
    handleExportBulkRegistrationForms(filteredStudents.map(enrichStudentForPrint))
    setIsExportModalOpen(false)
  }

  // Attach the payment, plan-validity, consumed and (for a customised batch) the
  // resolved schedule to a student so the printed Registration form shows real
  // values instead of blank boxes. Missing student columns fall back to the
  // latest fee record so existing students still print sensibly.
  const enrichStudentForPrint = (st: any) => {
    const studentFees = fees.filter((f: any) => f.student_id === st.id || f.students?.admission_id === st.admission_id)
    const latestFee = [...studentFees].sort((a, b) =>
      new Date(b.paid_date || b.created_at || 0).getTime() - new Date(a.paid_date || a.created_at || 0).getTime()
    )[0]

    const customList = st.batch_id === '00000000-0000-0000-0000-000000000000'
      ? studentCustomSchedules.filter((s: any) => s.student_id === st.id)
      : []

    const fmt = (d: any) => {
      if (!d) return ''
      const dt = new Date(d)
      return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('en-GB')
    }

    const regDate = st.created_at ? new Date(st.created_at) : new Date()
    const endDateRaw = st.plan_validity_date || st.validity_end_date || latestFee?.due_date || ''

    // Fee breakdown: Collected = paid ledger (or amount_paid), Due = Total - Collected
    const collectedFromLedger = studentFees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (parseFloat(f.net_amount ?? f.amount) || 0), 0)
    const collected = collectedFromLedger > 0 ? collectedFromLedger : (parseFloat(st.amount_paid) || 0)
    const totalFee = parseFloat(st.total_fee) || collected || 0
    const due = Math.max(0, totalFee - collected)

    return {
      ...st,
      print_date: st.created_at ? fmt(st.created_at) : new Date().toLocaleDateString('en-GB'),
      amount_paid: (st.amount_paid ?? '') !== '' ? st.amount_paid : (latestFee?.net_amount ?? latestFee?.amount ?? ''),
      total_fee_display: totalFee,
      fee_collected_display: collected,
      fee_due_display: due,
      payment_mode: st.payment_mode || latestFee?.payment_method || '',
      payment_for: st.payment_for || latestFee?.title || '',
      remarks: st.remarks || latestFee?.remarks || '',
      plan_start_date: fmt(regDate),
      plan_end_date: fmt(endDateRaw),
      custom_schedules_list: customList,
    }
  }

  const printRegistrationFormEnriched = (st: any) => handlePrintRegistrationForm(enrichStudentForPrint(st))

  // EDIT / UPDATE a student's basic details (name, phone, email, address,
  // guardian, etc.). Used by the Student ERP modal's "Edit Details" tab so a
  // wrong phone number entered at admission can be corrected later and reflects
  // everywhere the student is read.
  const handleUpdateStudent = async (studentId: string, updates: Record<string, any>) => {
    // 1. Separate custom_schedules from main students table updates
    const { custom_schedules, ...studentTableUpdates } = updates

    // Define valid database column names for the 'students' table in Supabase
    const VALID_STUDENT_COLUMNS = new Set([
      'id', 'admission_id', 'password', 'full_name', 'dob', 'gender', 'blood_group', 'photo_url', 
      'batch_id', 'parent_name', 'parent_phone', 'parent_email', 'address', 'status', 'created_at', 
      'city', 'state', 'pin_code', 'parent_relationship', 'parent_occupation', 'parent_address_same', 
      'parent_alt_phone', 'emergency_contact_name', 'emergency_relationship', 'emergency_phone', 
      'emergency_alt_phone', 'program_interested', 'preferred_time_slot', 'has_medical_condition', 
      'medical_condition_details', 'regular_medication', 'doctor_name', 'doctor_phone', 
      'hospital_preference', 'consent_accepted', 'age', 'occupation', 'alternate_phone', 
      'classes_assigned', 'category', 'custom_days', 'classes_total', 'classes_consumed', 
      'validity_end_date', 'additional_batches', 'batch_history', 'admission_date', 'valid_until', 
      'plan_start_date'
    ]);

    const dbPayload: Record<string, any> = {};
    Object.keys(studentTableUpdates).forEach(key => {
      if (VALID_STUDENT_COLUMNS.has(key)) {
        dbPayload[key] = studentTableUpdates[key];
      }
    });

    if (studentTableUpdates.print_date && !dbPayload.admission_date) {
      dbPayload.admission_date = studentTableUpdates.print_date;
    }

    // Sanitize all date fields in dbPayload to ensure empty strings become null and formatted strings are converted to YYYY-MM-DD
    const DATE_COLUMNS = new Set(['dob', 'validity_end_date', 'admission_date', 'valid_until', 'plan_start_date', 'created_at']);
    Object.keys(dbPayload).forEach(col => {
      if (DATE_COLUMNS.has(col)) {
        let val = dbPayload[col];
        if (val === '' || val === 'null' || val === 'undefined' || val === undefined || val === null) {
          dbPayload[col] = null;
        } else if (typeof val === 'string') {
          let trimmed = val.trim();
          if (trimmed === '' || trimmed.toLowerCase() === 'n/a') {
            dbPayload[col] = null;
          } else if (trimmed.includes('/')) {
            const parts = trimmed.split('/');
            if (parts.length === 3) {
              const [d, m, y] = parts;
              if (y && y.length === 4) {
                dbPayload[col] = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
              }
            }
          }
        }
      }
    });

    // Sanitize batch_id in dbPayload to prevent foreign key constraint violations
    if (dbPayload.batch_id !== undefined) {
      const bId = dbPayload.batch_id;
      if (!bId || bId === '00000000-0000-0000-0000-000000000000' || bId === '11111111-1111-1111-1111-111111111111' || !batches.some(b => b.id === bId)) {
        dbPayload.batch_id = null;
      }
    }

    // Optimistic local update + persist
    setStudents(prev => {
      const next = prev.map(s => (s.id === studentId ? { ...s, ...studentTableUpdates } : s))
      try { localStorage.setItem('phulwari_admin_students', JSON.stringify(next)) } catch (e) {}
      return next
    })
    setSelectedERPStudent((prev: any) => (prev && prev.id === studentId ? { ...prev, ...studentTableUpdates } : prev))

    try {
      const supabase = createClient()
      let { error } = await supabase.from('students').update(dbPayload).eq('id', studentId)
      if (error && (error.code === '23503' || error.message?.includes('students_batch_id_fkey') || error.message?.includes('foreign key constraint'))) {
        console.warn('⚠️ Foreign key constraint on batch_id failed during student update. Retrying with batch_id = null...');
        const retryPayload = { ...dbPayload, batch_id: null };
        const { error: retryErr } = await supabase.from('students').update(retryPayload).eq('id', studentId);
        error = retryErr;
      }

      if (error) {
        console.error('❌ [STUDENT UPDATE ERROR]:', error)
        alert(`Could not save to database: ${error.message}`)
        return false
      }

      // Handle customized batch schedule updates
      if (updates.batch_id === '00000000-0000-0000-0000-000000000000') {
        // Delete existing schedules
        await supabase.from('student_custom_schedules').delete().eq('student_id', studentId)
        
        // Insert new ones if available
        if (custom_schedules && custom_schedules.length > 0) {
          const customSchedulesPayload = custom_schedules.map((sch: any) => ({
            student_id: studentId,
            day_of_week: sch.day_of_week,
            start_time: sch.start_time,
            end_time: sch.end_time,
            class_name: sch.class_name
          }))
          const { data: custSchData, error: custSchErr } = await supabase.from('student_custom_schedules').insert(customSchedulesPayload).select()
          if (!custSchErr && custSchData) {
            setStudentCustomSchedules(prev => [
              ...prev.filter(sch => sch.student_id !== studentId),
              ...custSchData
            ])
          }
        }
      } else if (updates.batch_id && updates.batch_id !== '00000000-0000-0000-0000-000000000000') {
        // Switched from customized to regular batch: delete any custom schedules
        await supabase.from('student_custom_schedules').delete().eq('student_id', studentId)
        setStudentCustomSchedules(prev => prev.filter(sch => sch.student_id !== studentId))
      }

    } catch (err: any) {
      alert(`Network error while saving: ${err.message || err}`)
      return false
    }
    await loadAllAdminData()
    return true
  }

  // CHANGE the student's batch, or ADD an additional active batch. A student can
  // hold multiple active batches (e.g. Skating + Chess). The primary batch stays
  // on students.batch_id; extra batches are stored as a JSON list in
  // students.additional_batches so fee/plan/schedule for each reflects here.
  const handleUpdateStudentBatch = async (
    studentId: string,
    mode: 'change' | 'add' | 'remove',
    batchId: string,
    reason: string = 'General Change',
    changeDate: string = new Date().toISOString().split('T')[0]
  ) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return false
    const batch = batches.find(b => b.id === batchId)
    if (!batch && mode !== 'remove') { alert('Please select a valid batch.'); return false }

    let updates: Record<string, any> = {}
    let extras: any[] = Array.isArray(student.additional_batches)
      ? [...student.additional_batches]
      : (() => { try { return JSON.parse(student.additional_batches || '[]') } catch { return [] } })()

    const supabase = createClient()

    if (mode === 'change' && batch) {
      let history = Array.isArray(student.batch_history)
        ? [...student.batch_history]
        : (() => { try { return JSON.parse(student.batch_history || '[]') } catch { return [] } })()

      history.push({
        changed_at: changeDate,
        from_batch_id: student.batch_id,
        from_batch_name: student.batch_name || 'N/A',
        to_batch_id: batch.id,
        to_batch_name: batch.batch_name,
        reason: reason
      })

      updates = {
        batch_id: batch.id,
        batch_name: batch.batch_name,
        classes_total: batch.classes_total || student.classes_total || 12,
        validity_end_date: new Date(new Date(changeDate).getTime() + (batch.validity_days || 30) * 86400000).toISOString().split('T')[0],
        batch_history: history
      }

      // Generate Auto Ledger Fee entry
      const ledgerEntry = {
        id: generateUUID(),
        student_id: studentId,
        title: `Monthly Fee - ${batch.batch_name}`,
        amount: Number(batch.fee_amount || 3500),
        discount_type: 'flat',
        discount: 0,
        net_amount: Number(batch.fee_amount || 3500),
        due_date: changeDate,
        status: 'pending',
        payment_method: null,
        paid_date: null,
        receipt_no: `AUTO-${Math.floor(100000 + Math.random() * 900000)}`,
        month: new Date(changeDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        amount_paid: 0,
        pending_amount: Number(batch.fee_amount || 3500)
      }
      
      try {
        await supabase.from('fees').insert([ledgerEntry])
        setFees(prev => [ledgerEntry, ...prev])
      } catch (feeErr) {
        console.error('Failed to auto-generate fee ledger entry:', feeErr)
      }

    } else if (mode === 'add' && batch) {
      if (student.batch_id === batchId || extras.some((e: any) => e.batch_id === batchId)) {
        alert('Student is already enrolled in this batch.'); return false
      }
      extras.push({ batch_id: batch.id, batch_name: batch.batch_name, fee_amount: batch.fee_amount || null, added_on: new Date().toISOString().split('T')[0] })
      updates = { additional_batches: extras }

      // Generate Auto Ledger Fee entry for additional batch
      const ledgerEntry = {
        id: generateUUID(),
        student_id: studentId,
        title: `Batch Fee - ${batch.batch_name}`,
        amount: Number(batch.fee_amount || 2500),
        discount_type: 'flat',
        discount: 0,
        net_amount: Number(batch.fee_amount || 2500),
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        payment_method: null,
        paid_date: null,
        receipt_no: `AUTO-${Math.floor(100000 + Math.random() * 900000)}`,
        month: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        amount_paid: 0,
        pending_amount: Number(batch.fee_amount || 2500)
      }
      
      try {
        await supabase.from('fees').insert([ledgerEntry])
        setFees(prev => [ledgerEntry, ...prev])
      } catch (feeErr) {
        console.error('Failed to auto-generate additional fee ledger entry:', feeErr)
      }

    } else if (mode === 'remove') {
      extras = extras.filter((e: any) => e.batch_id !== batchId)
      updates = { additional_batches: extras }
    }

    setStudents(prev => {
      const next = prev.map(s => (s.id === studentId ? { ...s, ...updates } : s))
      try { localStorage.setItem('phulwari_admin_students', JSON.stringify(next)) } catch (e) {}
      return next
    })
    setSelectedERPStudent((prev: any) => (prev && prev.id === studentId ? { ...prev, ...updates } : prev))

    try {
      // additional_batches is a jsonb column — send the array as-is.
      const dbUpdates = { ...updates };
      if (dbUpdates.batch_id && (dbUpdates.batch_id === '00000000-0000-0000-0000-000000000000' || dbUpdates.batch_id === '11111111-1111-1111-1111-111111111111' || !batches.some(b => b.id === dbUpdates.batch_id))) {
        dbUpdates.batch_id = null;
      }
      let { error } = await supabase.from('students').update(dbUpdates).eq('id', studentId)
      if (error && (error.code === '23503' || error.message?.includes('students_batch_id_fkey') || error.message?.includes('foreign key constraint'))) {
        console.warn('⚠️ Batch update FK violation, retrying with batch_id = null...');
        await supabase.from('students').update({ ...dbUpdates, batch_id: null }).eq('id', studentId);
      } else if (error) {
        console.warn('⚠️ Batch update could not persist:', error.message)
      }
    } catch (err) { /* keep optimistic local state */ }

    alert(mode === 'add' ? '✅ Batch added to student.' : mode === 'remove' ? '✅ Batch removed.' : '✅ Batch changed successfully.')
    return true
  }

  // Send Prerequisite WhatsApp Fee Due Reminder Message
  const handleSendWhatsAppFeeReminder = (stName: string, admissionId: string, parentPhone: string, monthTitle: string, dueAmount: number, dueDate: string) => {
    const cleanPhone = (parentPhone || '').replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone || '919876543210'

    const message = `Dear Parent,
We are pleased to inform you that ${stName} is completed month of classes at Phulwari Mother and Child Activity Centre. It has been a pleasure watching him learn and grow with us during this period.
To ensure a smooth transition into the next month and to continue their progress, we kindly request you to complete the fee payment for the upcoming session by tomorrow.
Thank you for your continued trust in us.

Best Regards,
Management Phulwari Mother and Child Activity Centre`
    setWaReminderModal({ isOpen: true, phone: targetPhone, message })

    // Open WhatsApp directly (chat with the parent, message pre-filled).
    // The reminder previously only set modal state that was never rendered, so
    // the button appeared to do nothing while Call/SMS worked.
    if (typeof window !== 'undefined') {
      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    }

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

  // --- GALLERY REORDERING ---
  const handleUpdateGalleryOrder = async (reorderedImages: any[]) => {
    try {
      setGalleryImages(reorderedImages)
      const supabase = createClient()
      const updatePromises = reorderedImages.map((img, idx) => {
        const newOrder = img.sort_order ?? (idx + 1)
        return supabase.from('gallery').update({ sort_order: newOrder }).eq('id', img.id)
      })
      const results = await Promise.all(updatePromises)
      const firstErr = results.find(r => r.error)?.error
      if (firstErr) throw firstErr
      console.log('✅ Gallery display order updated successfully!')
    } catch (err: any) {
      console.error('Error updating gallery order:', err)
      alert('Failed to update gallery order: ' + err.message)
      fetchAdminGallery()
    }
  }

  const fetchAdminGallery = async () => {
    try {
      const supabaseUrl = getSupabaseUrl()
      const supabaseKey = getSupabaseKey()
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/gallery?select=*&order=sort_order.asc,created_at.desc`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setGalleryImages(data.map((item: any) => ({
              ...item,
              url: item.image_url || item.url
            })))
          } else {
            setGalleryImages([])
          }
        }
      }
    } catch (e) {}
  }

  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        } else {
          resolve(base64Str)
        }
      }
      img.onerror = () => {
        resolve(base64Str)
      }
    })
  }

  // Device File Image Picker Upload Handler
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingGallery(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string
      if (base64Url) {
        const titleText = file.name.replace(/\.[^/.]+$/, "") || 'Uploaded Activity Photo';

        try {
          const compressedBase64 = await compressImage(base64Url)

          // Post directly to Supabase REST API with public anon headers
          const supabaseUrl = getSupabaseUrl()
          const supabaseKey = getSupabaseKey()
          if (supabaseUrl && supabaseKey) {
            const res = await fetch(`${supabaseUrl}/rest/v1/gallery`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({ image_url: compressedBase64, title: titleText, category: 'Activities' })
            })
            if (res.ok) {
              console.log('✅ Photo saved to Supabase database!')
              await fetchAdminGallery();
            }
          }
        } catch (err) {
          console.error(err)
        } finally {
          setIsUploadingGallery(false)
        }
      } else {
        setIsUploadingGallery(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const confirmDeleteGalleryImage = async () => {
    if (!deletingGalleryImg) return
    const img = deletingGalleryImg

    // Safe REST DELETE query to Supabase
    try {
      const supabaseUrl = getSupabaseUrl()
      const supabaseKey = getSupabaseKey()
      if (supabaseUrl && supabaseKey) {
        const isCleanUuid = typeof img.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(img.id)
        const deleteQueryParam = isCleanUuid ? `id=eq.${img.id}` : `image_url=eq.${encodeURIComponent(img.url || img.image_url)}`

        const res = await fetch(`${supabaseUrl}/rest/v1/gallery?${deleteQueryParam}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        })
        if (res.ok) {
          console.log('✅ Photo deleted from Supabase database!')
          await fetchAdminGallery();
        }
      }
    } catch (err) {}

    setDeletingGalleryImg(null)
    setSelectedAdminGalleryImg(null)
  }

  // Save Party Packages
  const handleSavePartyPackages = async () => {
    setPkgSaveStatus('Saving packages to database...')

    try {
      const supabase = createClient()

      // Build clean rows for database upsert
      const rows = partyPackages.map((pkg, idx) => {
        const row: any = {
          name: pkg.name || `Package ${idx + 1}`,
          price: pkg.price || '',
          tagline: pkg.tagline || '',
          includes: pkg.includes || '',
          is_visible: pkg.is_visible !== false
        }
        
        // If the ID is a valid number, it's an existing database record
        const isDbId = pkg.id !== undefined && pkg.id !== null && !String(pkg.id).startsWith('new-') && !isNaN(Number(pkg.id))
        if (isDbId) {
          row.id = Number(pkg.id)
        }
        return row
      })

      // Explicitly specify onConflict: 'id' to guarantee updates on existing keys
      const { data, error } = await supabase
        .from('party_packages')
        .upsert(rows, { onConflict: 'id' })
        .select()

      if (error) throw error

      if (data) {
        // Sort returning data by name to guarantee stable sorting on frontend
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
        setPartyPackages(sorted)
        try { localStorage.setItem('phulwari_party_packages', JSON.stringify(sorted)) } catch (e) {}
      }

      // Also embed into birthday_landing_config as a backup for the frontend
      try {
        const { data: cfgData } = await supabase.from('birthday_landing_config').select('*').eq('id', 1).single()
        if (cfgData) {
          const sortedList = (data || rows).map((r: any) => ({
            id: r.id,
            name: r.name,
            price: r.price,
            tagline: r.tagline,
            includes: r.includes,
            is_visible: r.is_visible
          })).sort((a: any, b: any) => a.name.localeCompare(b.name))

          await supabase.from('birthday_landing_config').update({
            hero_section: { ...cfgData.hero_section, packages: sortedList }
          }).eq('id', 1)
        }
      } catch (_) {}

      setPkgSaveStatus('✅ Party packages saved & published live!')
    } catch (err: any) {
      console.error('Failed to save party packages to DB:', err)
      setPkgSaveStatus(`❌ Failed to save: ${err?.message || 'unknown error'}`)
    }

    setTimeout(() => setPkgSaveStatus(''), 4000)
  }

  const handleCreateNewPackage = async (newPkgData: { name: string; tagline: string; price: string; includes: string; is_visible: boolean }) => {
    try {
      const supabase = createClient()
      
      // Fetch existing packages to find max ID
      const { data: dbPkgs, error: fetchErr } = await supabase.from('party_packages').select('id')
      if (fetchErr) throw fetchErr

      let maxId = 0
      if (dbPkgs && dbPkgs.length > 0) {
        maxId = Math.max(...dbPkgs.map(p => Number(p.id)))
      }
      const nextId = maxId + 1

      const payload = {
        id: nextId,
        name: newPkgData.name || 'New Package',
        tagline: newPkgData.tagline || '',
        price: newPkgData.price || '',
        includes: newPkgData.includes || '',
        is_visible: newPkgData.is_visible !== false
      }

      const { data, error } = await supabase
        .from('party_packages')
        .insert([payload])
        .select()

      if (error) throw error

      if (data && data[0]) {
        // Prepend or append to state
        setPartyPackages(prev => {
          const updated = [...prev, data[0]]
          return updated.sort((a, b) => a.name.localeCompare(b.name))
        })
        try {
          const local = localStorage.getItem('phulwari_party_packages')
          const currentLocal = local ? JSON.parse(local) : []
          localStorage.setItem('phulwari_party_packages', JSON.stringify([...currentLocal, data[0]].sort((a, b) => a.name.localeCompare(b.name))))
        } catch (_) {}

        // Also update birthday_landing_config
        try {
          const { data: cfgData } = await supabase.from('birthday_landing_config').select('*').eq('id', 1).single()
          if (cfgData) {
            const currentPackages = cfgData.hero_section?.packages || []
            const updatedPackagesList = [...currentPackages.filter((p: any) => p.id !== nextId), data[0]]
              .sort((a: any, b: any) => a.name.localeCompare(b.name))

            await supabase.from('birthday_landing_config').update({
              hero_section: { ...cfgData.hero_section, packages: updatedPackagesList }
            }).eq('id', 1)
          }
        } catch (_) {}
      }
      return true
    } catch (err: any) {
      console.error('Failed to create new package:', err)
      alert(`❌ Failed to create package: ${err.message || err}`)
      return false
    }
  }

  const handleDeletePackage = async (pkgId: string | number) => {
    if (!confirm('Are you sure you want to delete this party package?')) return
    const isDbId = pkgId !== undefined && pkgId !== null && !String(pkgId).startsWith('new-') && !isNaN(Number(pkgId))
    if (isDbId) {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('party_packages').delete().eq('id', Number(pkgId))
        if (error) throw error
        console.log('✅ Package deleted from database')

        // Keep the birthday_landing_config backup copy in sync so the public
        // site never shows a package that was deleted from the master table.
        try {
          const { data: cfgData } = await supabase.from('birthday_landing_config').select('*').eq('id', 1).single()
          if (cfgData) {
            const currentPackages = cfgData.hero_section?.packages || []
            const updatedPackagesList = currentPackages.filter((p: any) => Number(p.id) !== Number(pkgId))
            await supabase.from('birthday_landing_config').update({
              hero_section: { ...cfgData.hero_section, packages: updatedPackagesList }
            }).eq('id', 1)
          }
        } catch (_) {}
      } catch (err: any) {
        console.error('Failed to delete package from DB:', err)
        alert(`❌ Failed to delete from DB: ${err.message || err}`)
        return
      }
    }
    setPartyPackages(prev => prev.filter(p => p.id !== pkgId))
    try {
      const local = localStorage.getItem('phulwari_party_packages')
      if (local) {
        const parsed = JSON.parse(local).filter((p: any) => p.id !== pkgId)
        localStorage.setItem('phulwari_party_packages', JSON.stringify(parsed))
      }
    } catch (_) {}
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
      id: generateUUID(),
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
      const dbRow = { ...newFeeObj }
      delete (dbRow as any).students
      await supabase.from('fees').insert([dbRow])
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
      join_date: teacherForm.join_date || (editingTeacher ? editingTeacher.join_date : new Date().toISOString().split('T')[0]),
      // Extended payroll / profile fields
      photo_url: teacherForm.photo_url || '',
      address: teacherForm.address || '',
      qualification: teacherForm.qualification || '',
      subject: teacherForm.subject || '',
      designation: teacherForm.designation || '',
      employment_type: teacherForm.employment_type || 'Full Time',
      salary_type: teacherForm.salary_type || 'Monthly',
      monthly_salary: teacherForm.monthly_salary ? Number(teacherForm.monthly_salary) : 0,
      salary_effective_from: teacherForm.salary_effective_from || '',
      bank_details: teacherForm.bank_details || '',
      emergency_contact: teacherForm.emergency_contact || '',
      documents: teacherForm.documents || ''
    }

    setTeachers(prev => {
      const cleanPrev = prev.filter(t => !['tch-101', 'tch-102', 'tch-103'].includes(t.id) && t.name !== 'Ananya Sen' && t.name !== 'Rohan Deshmukh' && t.name !== 'Meera Kapur')
      const updated = editingTeacher ? cleanPrev.map(t => t.id === editingTeacher.id ? newTeacher : t) : [newTeacher, ...cleanPrev]
      try { localStorage.setItem('phulwari_teachers', JSON.stringify(updated)) } catch (e) {}
      return updated
    })

    try {
      const supabase = createClient()
      const persist = async (payload: any) => (
        editingTeacher
          ? supabase.from('teachers').update(payload).eq('id', editingTeacher.id)
          : supabase.from('teachers').insert([payload])
      )
      let { error } = await persist(newTeacher)
      if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
        // DB is missing the extended columns — persist just the core fields.
        const core = {
          id: newTeacher.id, name: newTeacher.name, email: newTeacher.email,
          phone: newTeacher.phone, specialization: newTeacher.specialization,
          assigned_batch: newTeacher.assigned_batch, status: newTeacher.status,
          join_date: newTeacher.join_date
        }
        await persist(core)
      }
    } catch (e) {}

    setIsAddTeacherOpen(false)
    setEditingTeacher(null)
    setTeacherForm({ name: '', email: '', phone: '', specialization: 'Early Learning', assigned_batch: 'Little Explorers (Morning)', status: 'Active', photo_url: '', address: '', qualification: '', subject: '', designation: '', join_date: '', employment_type: 'Full Time', salary_type: 'Monthly', monthly_salary: '', salary_effective_from: '', bank_details: '', emergency_contact: '', documents: '' })
  }

  // --- Teacher payroll: record a salary / advance / bonus payment ---
  const handleTeacherPaymentSubmit = (payment: any) => {
    const record = { id: `tpay-${Date.now()}`, created_at: new Date().toISOString(), ...payment }
    setTeacherPayments(prev => {
      const updated = [record, ...prev]
      try { localStorage.setItem('phulwari_teacher_payments', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
    ;(async () => {
      try { await createClient().from('teacher_payments').insert([record]) } catch (e) { /* localStorage fallback */ }
    })()
  }

  const handleDeleteTeacherPayment = (id: string) => {
    setTeacherPayments(prev => {
      const updated = prev.filter(p => p.id !== id)
      try { localStorage.setItem('phulwari_teacher_payments', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
    ;(async () => { try { await createClient().from('teacher_payments').delete().eq('id', id) } catch (e) {} })()
  }

  // --- Teacher attendance: mark/replace a day's status ---
  const handleMarkTeacherAttendance = (teacherId: string, date: string, status: string, reason?: string) => {
    setTeacherAttendance(prev => {
      const filtered = prev.filter(a => !(a.teacher_id === teacherId && a.date === date))
      if (status === 'unmarked' || !status) {
        try { localStorage.setItem('phulwari_teacher_attendance', JSON.stringify(filtered)) } catch (e) {}
        ;(async () => { try { await createClient().from('teacher_attendance').delete().match({ teacher_id: teacherId, date }) } catch (e) {} })()
        return filtered
      }
      const record = { id: `tatt-${teacherId}-${date}`, teacher_id: teacherId, date, status, reason: reason || null }
      const updated = [record, ...filtered]
      try { localStorage.setItem('phulwari_teacher_attendance', JSON.stringify(updated)) } catch (e) {}
      ;(async () => { try { await createClient().from('teacher_attendance').upsert([record], { onConflict: 'id' }) } catch (e) {} })()
      return updated
    })
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
      const supabaseUrl = getSupabaseUrl()
      const supabaseKey = getSupabaseKey()
      
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
    if (!confirm('Are you sure you want to delete this notice?')) return
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

  // ---- Class Master (the `classes` table) ----
  // The Class Master is the catalogue of activities the centre runs. It feeds
  // every Day -> Time -> Class dropdown, including the Customized Batch builder
  // used during student registration.
  const handleAddClass = async (rawName: string) => {
    const className = rawName.trim()
    if (!className) return false

    const exists = classes.some(
      (c: any) => (c.class_name || '').trim().toLowerCase() === className.toLowerCase()
    )
    if (exists) {
      alert(`"${className}" is already in the Class Master.`)
      return false
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('classes')
        .insert([{ class_name: className }])
        .select()
      if (error) throw error
      if (data) setClasses(prev => [...prev, ...data])
      return true
    } catch (err: any) {
      console.error('❌ [CLASS MASTER INSERT ERROR]:', err)
      alert(`Could not add the class: ${err?.message || 'unknown error'}`)
      return false
    }
  }

  const handleDeleteClass = async (classId: string, className: string) => {
    // A class still referenced by a batch schedule would leave that schedule
    // pointing at an activity that no longer exists, so block it.
    const inUse = batchSchedules.filter((sch: any) => sch.class_name === className)
    if (inUse.length > 0) {
      alert(
        `"${className}" is used by ${inUse.length} batch schedule entr${inUse.length === 1 ? 'y' : 'ies'}. ` +
          'Remove those schedule entries first.'
      )
      return
    }

    if (!confirm(`Remove "${className}" from the Class Master?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('classes').delete().eq('id', classId)
      if (error) throw error
      setClasses(prev => prev.filter((c: any) => c.id !== classId))
    } catch (err: any) {
      console.error('❌ [CLASS MASTER DELETE ERROR]:', err)
      alert(`Could not remove the class: ${err?.message || 'unknown error'}`)
    }
  }

  // Re-read attendance from the database. Used to undo an optimistic update
  // when the write turns out to have failed.
  const refreshAttendanceFromDb = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('attendance').select('*')
      if (data) setAttendance(data)
    } catch (err) {
      console.error('❌ [ATTENDANCE REFRESH ERROR]:', err)
    }
  }

  // Mark Attendance
  const handleMarkAttendance = async (
    studentId: string,
    targetDate: string,
    status: 'present' | 'absent' | 'halfday' | 'leave' | 'holiday' | 'unmarked',
    className: string = 'General',
    classTime: string = 'General',
    reason: string = ''
  ) => {
    const targetStudent = students.find(s => s.id === studentId || s.admission_id === studentId)

    // Find previous status of this student's attendance on this date/class/time slot
    const prevAtt = attendance.find(
      a => a.student_id === studentId && a.date === targetDate && a.class_name === className && a.class_time === classTime
    )
    const prevStatus = prevAtt?.status || null

    let consumedDiff = 0
    if (status === 'present' && prevStatus !== 'present') {
      consumedDiff = 1
    } else if (status !== 'present' && prevStatus === 'present') {
      consumedDiff = -1
    }

    const supabase = createClient()

    if (status === 'unmarked') {
      // Optimistic local state update
      setAttendance(prev => prev.filter(
        a => !(a.student_id === studentId && a.date === targetDate && a.class_name === className && a.class_time === classTime)
      ))

      if (consumedDiff !== 0 && targetStudent) {
        const currentConsumed = Number(targetStudent.classes_consumed || 0)
        const newConsumed = Math.max(0, currentConsumed + consumedDiff)
        setStudents(prev => prev.map(s => s.id === targetStudent.id ? { ...s, classes_consumed: newConsumed } : s))
        try {
          await supabase.from('students').update({ classes_consumed: newConsumed }).eq('id', targetStudent.id)
        } catch (_) {}
      }

      try {
        const { error } = await supabase.from('attendance')
          .delete()
          .eq('student_id', studentId)
          .eq('date', targetDate)
          .eq('class_name', className)
          .eq('class_time', classTime)
        if (error) throw error
      } catch (err) {
        console.error('❌ [ATTENDANCE DELETE ERROR]:', err)
        await refreshAttendanceFromDb()
      }
      return
    }

    setAttendance(prev => {
      const filtered = prev.filter(
        a => !(a.student_id === studentId && a.date === targetDate && a.class_name === className && a.class_time === classTime)
      )
      const newEntry = {
        student_id: studentId,
        date: targetDate,
        status: status,
        class_name: className,
        class_time: classTime,
        remarks: status === 'leave' ? `Leave: ${reason}` : status === 'holiday' ? `Holiday: ${reason}` : `Marked ${status} for ${className} on ${targetDate}`,
        leave_reason: status === 'leave' ? reason : null,
        holiday_reason: status === 'holiday' ? reason : null,
        students: targetStudent ? {
          full_name: targetStudent.full_name,
          admission_id: targetStudent.admission_id,
          class_name: targetStudent.class_name,
          section_name: targetStudent.section_name
        } : null
      }
      return [newEntry, ...filtered]
    })

    if (consumedDiff !== 0 && targetStudent) {
      const currentConsumed = Number(targetStudent.classes_consumed || 0)
      const newConsumed = Math.max(0, currentConsumed + consumedDiff)

      // Update student local state optimistically
      setStudents(prev => prev.map(s => s.id === targetStudent.id ? { ...s, classes_consumed: newConsumed } : s))

      // Persist to database students table
      ;(async () => {
        try {
          const { error: studentErr } = await supabase
            .from('students')
            .update({ classes_consumed: newConsumed })
            .eq('id', targetStudent.id)
          if (studentErr) {
            console.error('Failed to sync classes_consumed:', studentErr.message)
          }
        } catch (e) {
          console.error(e)
        }
      })()
    }

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert(
          [
            {
              student_id: studentId,
              date: targetDate,
              status,
              class_name: className,
              class_time: classTime,
              remarks: status === 'leave' ? `Leave: ${reason}` : status === 'holiday' ? `Holiday: ${reason}` : `Marked on ${targetDate}`,
              leave_reason: status === 'leave' ? reason : null,
              holiday_reason: status === 'holiday' ? reason : null
            }
          ],
          { onConflict: 'student_id,date,class_name,class_time' }
        )

      if (error) throw error
    } catch (err: any) {
      console.error('❌ [ATTENDANCE UPSERT ERROR]:', err)
      alert(
        `Attendance could not be saved to the database: ${err?.message || JSON.stringify(err)}. Please check your connection and mark it again.`
      )
      // Roll back to what the database actually holds.
      await refreshAttendanceFromDb()
    }
  }

  // Toggle Holiday Mark
  const handleToggleHoliday = async (date: string, description: string = 'Public Holiday / Center Closed') => {
    const currentHoliday = holidays.find(h => h.date === date)
    const supabase = createClient()
    
    if (currentHoliday) {
      try {
        const { error } = await supabase.from('holidays').delete().eq('date', date)
        if (error) throw error
        setHolidays(prev => prev.filter(h => h.date !== date))
      } catch (err) {
        console.error('Failed to remove holiday:', err)
        alert('Failed to remove holiday mark from database.')
      }
    } else {
      try {
        const payload = { date, description }
        const { data, error } = await supabase.from('holidays').insert([payload]).select()
        if (error) throw error
        if (data) {
          setHolidays(prev => [...prev, ...data])
        }
      } catch (err) {
        console.error('Failed to add holiday:', err)
        alert('Failed to save holiday mark to database.')
      }
    }
  }

  // Save Batch
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBatch) return

    // Every custom schedule row must have a start time (end time is optional)
    const blankSchedule = (editingBatch.schedules || []).find(
      (s: any) => !String(s.start_time || '').trim()
    )
    if (blankSchedule) {
      alert('⛔ Start Time cannot be blank in the class schedule. Please fill every row before saving.')
      return
    }

    // Create a version without schedules for batches table upsert
    const { schedules, ...dbBatchDetails } = editingBatch

    setBatches(prev => prev.map(b => b.id === editingBatch.id ? dbBatchDetails : b))
    try {
      const supabase = createClient()
      
      // Auto sync edited batch fee to fee_heads table
      ;(async () => {
        try {
          const oldBatch = batches.find(b => b.id === editingBatch.id)
          const oldHeadName = oldBatch ? `${oldBatch.batch_name} Fee` : `${editingBatch.batch_name} Fee`
          const newHeadName = `${editingBatch.batch_name} Fee`
          const newAmount = parseFloat(editingBatch.fee_amount) || 3500

          const { data: matchedHeads } = await supabase.from('fee_heads').select('*').eq('name', oldHeadName)
          if (matchedHeads && matchedHeads.length > 0) {
            const headId = matchedHeads[0].id
            const { error: headUpdateErr } = await supabase.from('fee_heads').update({
              name: newHeadName,
              default_amount: newAmount
            }).eq('id', headId)

            if (!headUpdateErr) {
              setFeeHeads(prev => prev.map(h => h.id === headId ? { ...h, name: newHeadName, default_amount: newAmount } : h))
            }
          } else {
            const newHead = {
              id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              name: newHeadName,
              default_amount: newAmount,
              is_system: false
            }
            const { data: insertedHead } = await supabase.from('fee_heads').insert([newHead]).select()
            if (insertedHead) {
              setFeeHeads(prev => [...prev, insertedHead[0]])
            }
          }
        } catch (feeSyncErr) {
          console.error('Failed to sync edited batch fee to fee_heads:', feeSyncErr)
        }
      })()

      await supabase.from('batches').upsert([dbBatchDetails])

      // Delete existing and insert new schedules
      await supabase.from('batch_schedules').delete().eq('batch_id', editingBatch.id)
      if (schedules && schedules.length > 0) {
        const schPayload = schedules.map((sch: any) => ({
          batch_id: editingBatch.id,
          day_of_week: sch.day_of_week,
          start_time: sch.start_time,
          end_time: sch.end_time,
          class_name: sch.class_name
        }))
        const { data: schData, error: schErr } = await supabase.from('batch_schedules').insert(schPayload).select()
        if (schErr) {
          console.error('❌ [BATCH SCHEDULES UPDATE ERROR]:', schErr)
        } else if (schData) {
          setBatchSchedules(prev => [...prev.filter(s => s.batch_id !== editingBatch.id), ...schData])
        }
      } else {
        setBatchSchedules(prev => prev.filter(s => s.batch_id !== editingBatch.id))
      }
    } catch (err) {
      console.error('❌ [BATCH SAVE EXCEPTION]:', err)
    }

    setEditingBatch(null)
  }

  const handleStartEditBatch = (batch: any) => {
    setBatchEditTab('core')
    const schedulesForBatch = batchSchedules.filter(s => s.batch_id === batch.id)
    setEditingBatch({
      ...batch,
      schedules: schedulesForBatch
    })
  }

  // Delete Batch
  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    // Check if students are enrolled in this batch
    const enrolledStudents = students.filter(s => s.batch_id === batchId)
    if (enrolledStudents.length > 0) {
      alert(`Cannot delete batch '${batchName}' because ${enrolledStudents.length} student(s) are currently enrolled in it. Please reassign or remove these students first.`)
      return
    }

    if (!confirm(`Are you sure you want to permanently delete the batch '${batchName}'?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId)
      
      if (error) throw error

      setBatches(prev => prev.filter(b => b.id !== batchId))
      alert('Batch deleted successfully.')
    } catch (err: any) {
      alert(`Failed to delete batch: ${err.message}`)
    }
  }

  // Toggle Batch Visibility
  const handleToggleBatchVisibility = async (batchId: string, currentVisibility: boolean) => {
    const newVisibility = !currentVisibility
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, is_visible: newVisibility } : b))

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('batches')
        .update({ is_visible: newVisibility })
        .eq('id', batchId)
      
      if (error) throw error
    } catch (err: any) {
      alert(`Failed to update batch visibility: ${err.message}`)
      setBatches(prev => prev.map(b => b.id === batchId ? { ...b, is_visible: currentVisibility } : b))
    }
  }

  const activeStudents = students.filter(s => s.status !== 'deactivated')
  const deactivatedStudents = students.filter(s => s.status === 'deactivated')

  // DYNAMIC BATCHES LIST FOR FILTER DROPDOWN (COMBINES CONFIGURED BATCHES + ENROLLED STUDENT BATCHES)
  const allAvailableBatches = useMemo(() => {
    const list: any[] = [...batches]
    activeStudents.forEach(st => {
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

  const birthdayAlertsCount = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const tDate = new Date(currentYear, today.getMonth(), today.getDate());
    
    let count = 0;
    activeStudents.forEach(st => {
      if (!st.dob) return;
      const dob = new Date(st.dob);
      if (isNaN(dob.getTime())) return;
      
      const bDate = new Date(currentYear, dob.getMonth(), dob.getDate());
      let diffTime = bDate.getTime() - tDate.getTime();
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        const bdayNextYear = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
        const tDateNext = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        diffTime = bdayNextYear.getTime() - tDateNext.getTime();
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      if (diffDays >= 0 && diffDays <= 7) {
        count++;
      }
    });
    return count;
  }, [students]);

  const renewalAlertsCount = useMemo(() => {
    let count = 0;
    activeStudents.forEach(st => {
      const totalClasses = Number(st.total_classes || st.package_classes || 0);
      const consumed = Number(st.classes_consumed || 0);
      const remaining = Math.max(0, totalClasses - consumed);
      if (remaining === 0) {
        count++;
        return;
      }
      const renewalDate = st.renewal_date || st.next_due_date;
      if (renewalDate) {
        const due = new Date(renewalDate);
        if (!isNaN(due.getTime())) {
          const today = new Date();
          const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
          const diff = Math.round((dueMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
          if (diff <= 7) {
            count++;
          }
        }
      }
    });
    return count;
  }, [students]);

  const feeAlertsCount = useMemo(() => {
    let count = 0;
    activeStudents.forEach(st => {
      const studentLedger = fees.filter((f: any) => f.student_id === st.id || f.students?.admission_id === st.admission_id);
      let pendingAmount = 0;
      let latestDueDate: string | null = null;

      if (studentLedger.length > 0) {
        studentLedger.forEach((f: any) => {
          if (f.status === 'pending' || f.status === 'due') {
            pendingAmount += Number(f.net_amount || f.amount || 0);
            if (!latestDueDate || (f.due_date && f.due_date > latestDueDate)) {
              latestDueDate = f.due_date;
            }
          }
        });
      } else {
        const paid = Number(st.amount_paid || 0);
        const batchObj = allAvailableBatches.find(b => b.id === st.batch_id || (b.batch_name && st.batch_name && b.batch_name.toLowerCase().trim() === st.batch_name?.toLowerCase().trim()));
        const total = st.total_fee ? Number(st.total_fee) : (batchObj ? Number(batchObj.fee_amount) : 3500);
        pendingAmount = Math.max(0, total - paid);
      }

      if (pendingAmount > 0) {
        if (!latestDueDate) {
          count++; // no due date but pending fee - alert is active
        } else {
          const due = new Date(latestDueDate);
          if (!isNaN(due.getTime())) {
            const today = new Date();
            const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
            const diff = Math.round((dueMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
            if (diff <= 7) {
              count++;
            }
          }
        }
      }
    });
    return count;
  }, [students, fees, allAvailableBatches]);



  // ACCURATE CASE-INSENSITIVE Filtered Students List

  const filteredStudents = activeStudents.filter(s => {
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
  const totalStudentsCount = activeStudents.length
  const totalBatchesCount = allAvailableBatches.length
  
  // Fees KPI: calculate dynamically per active student
  let totalPaidFees = 0
  let totalPendingFees = 0

  activeStudents.forEach(st => {
    const studentLedger = fees.filter(f => f.student_id === st.id || f.students?.admission_id === st.admission_id)
    if (studentLedger.length > 0) {
      // Sum from ledger
      studentLedger.forEach(f => {
        if (f.status === 'paid') {
          totalPaidFees += Number(f.net_amount || f.amount || 0)
        } else if (f.status === 'pending' || f.status === 'due') {
          totalPendingFees += Number(f.net_amount || f.amount || 0)
        }
      })
    } else {
      // Sum from student registration defaults
      const paid = Number(st.amount_paid || 0)
      const batchObj = allAvailableBatches.find(b => b.id === st.batch_id || (b.batch_name && st.batch_name && b.batch_name.trim().toLowerCase() === st.batch_name.trim().toLowerCase()))
      const total = st.total_fee ? Number(st.total_fee) : (batchObj ? Number(batchObj.fee_amount) : 3500)
      totalPaidFees += paid
      totalPendingFees += Math.max(0, total - paid)
    }
  })
  
  // For month-specific fee tab display
  const currentMonthFees = fees.filter(f => f.month === feeSelectedMonth || f.title?.includes(feeSelectedMonth))
  
  const totalRevenueCombined = totalPaidFees + totalPendingFees
  const paidRatioPercentage = totalRevenueCombined > 0 ? ((totalPaidFees / totalRevenueCombined) * 100).toFixed(1) : '0.0'
  const pendingRatioPercentage = totalRevenueCombined > 0 ? ((totalPendingFees / totalRevenueCombined) * 100).toFixed(1) : '0.0'

  // Dynamic Students by Batch Distribution
  const studentsByBatchDistribution = useMemo(() => {
    return allAvailableBatches.map(b => {
      const bStudents = activeStudents.filter(st => st.batch_id === b.id || (st.batch_name && b.batch_name && st.batch_name.toLowerCase().trim() === b.batch_name.toLowerCase().trim()))
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
    const halfdayCount = dayRecords.filter(a => a.status === 'halfday').length
    const leaveCount = dayRecords.filter(a => a.status === 'leave').length
    const holidayCount = dayRecords.filter(a => a.status === 'holiday').length
    return { dayNum, dateStr, dayRecords, presentCount, absentCount, halfdayCount, leaveCount, holidayCount }
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

  // Whether the currently logged-in account is a restricted Staff/Management account.
  // Staff/Management accounts must NEVER be able to unlock Admin-only tabs by toggling the
  // Role switch — their access is strictly bound to their granted permissions and the toggle is hidden.
  const isStaffAccount = (adminUser as any)?.role === 'Staff' || (adminUser as any)?.role === 'Management' || ((adminUser as any)?.role && (adminUser as any)?.role !== 'Admin')

  return (
    <div className={`min-h-screen ${bgMain} font-sans flex flex-col md:flex-row transition-colors duration-200`}>

      {/* NEW LEAD PUSH ALERT (in-app banner) */}
      {leadAlert && (
        <div className="fixed top-4 right-4 z-[90] max-w-sm w-[92vw] sm:w-96 animate-in slide-in-from-right">
          <div className="bg-white dark:bg-slate-900 border-2 border-pink-400 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center text-lg shrink-0">🔔</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-pink-700 dark:text-pink-300">New Lead Enquiry</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{leadAlert.name}{leadAlert.phone ? ` • ${leadAlert.phone}` : ''}</p>
              <p className="text-[11px] text-slate-500">Interested in: <strong>{leadAlert.service}</strong></p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => { setActiveTab('enquiries'); setLeadAlert(null) }}
                  className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  View Lead
                </button>
                {leadAlert.phone && (
                  <a href={`tel:${leadAlert.phone.replace(/[^0-9+]/g, '')}`} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer">📞 Call</a>
                )}
              </div>
            </div>
            <button onClick={() => setLeadAlert(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              { id: 'students', label: 'Student Admissions & ERP', icon: Users, count: activeStudents.length },
              { id: 'student_list', label: 'Student Master Directory', icon: UserCheck, count: activeStudents.length },
              { id: 'deactivated', label: 'Deactivated Students', icon: UserX, count: deactivatedStudents.length },
              { id: 'teachers', label: 'Teacher Management', icon: UserPlus, count: teachers.length },
              { id: 'batches', label: 'Batches & Class Timings', icon: Clock, count: batches.length },
              { id: 'attendance', label: 'Daily Attendance Marker', icon: Calendar },
              { id: 'calendar', label: 'Batch Attendance Calendar', icon: CalendarDays },
              { id: 'fees', label: 'Fee Management & Dues', icon: CreditCard, count: fees.filter((f: any) => f.status === 'pending').length },
              { id: 'financial', label: 'Financial ERP & P&L Dashboard', icon: DollarSign },
              { id: 'gallery', label: 'Gallery Photo Manager', icon: ImageIcon, count: galleryImages.length },
              { id: 'packages', label: 'Party Packages & Pricing', icon: Gift },
              { id: 'birthday_page', label: 'Birthday Landing Page', icon: Sparkles },
              { id: 'announcements', label: 'Notices Broadcaster', icon: Bell, count: announcements.length },
              { id: 'bookings', label: 'Registrations & Bookings', icon: Award, count: bookings.length },
              { id: 'blogs', label: 'Blogs CMS Editor', icon: FileText },
              { id: 'reviews', label: 'Parent Reviews & Ratings', icon: Star },
              { id: 'birthdays', label: 'Birthday Alerts', icon: Cake, count: birthdayAlertsCount },
              { id: 'renewals', label: 'Renewal Alerts', icon: RefreshCw, count: renewalAlertsCount },
              { id: 'fee_alerts', label: 'Fee Alerts', icon: IndianRupee, count: feeAlertsCount },
              { id: 'banners', label: 'Banners & Posters Manager', icon: ImageIcon, count: banners.length },
              { id: 'enquiries', label: 'Lead & Enquiry Manager', icon: PhoneCall, count: enquiries.filter((e: any) => e.status !== 'Admission Done').length },
              ...(!isStaffAccount ? [{ id: 'staff_mgmt', label: 'Staff Portal & Access Control', icon: ShieldCheck }] : [])
            ].filter(item => {
              // Restrict by granted permissions for real Staff accounts, regardless
              // of the Role toggle. Admin accounts may preview the Staff view.
              if (isStaffAccount || adminRole === 'Staff') {
                return (adminUser as any)?.permissions?.includes(item.id)
              }
              return true
            }).map(item => {
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
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold shrink-0 ml-auto shadow-xs border transition-colors ${
                      active
                        ? 'bg-white text-blue-700 font-black border-white/40'
                        : isLight
                        ? 'bg-blue-100/90 text-blue-800 border-blue-200 hover:bg-blue-200'
                        : 'bg-blue-950/80 text-blue-300 border-blue-800'
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
          {!isStaffAccount && (
            <button
              onClick={() => setIsAddAdminOpen(true)}
              className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Register a new Admin User"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Manage Admin Users</span>}
            </button>
          )}

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
              {activeTab === 'banners' && 'Banner & Poster Management System'}
              {activeTab === 'enquiries' && 'Lead & Enquiry Follow-up Manager'}
              {activeTab === 'deactivated' && 'Deactivated Students & Discontinued Logs'}
              {activeTab === 'students' && 'Student Management & Admissions'}
              {activeTab === 'teachers' && 'Teacher & Faculty Staff Management'}
              {activeTab === 'attendance' && 'Daily Class Attendance Marker'}
              {activeTab === 'fees' && 'Class & Monthly Fee Management Dashboard'}
              {activeTab === 'gallery' && 'Dynamic Gallery Photo Manager'}
              {activeTab === 'packages' && 'Birthday & Party Packages Configuration'}
              {activeTab === 'birthday_page' && 'Birthday Landing Page Editor'}
              {activeTab === 'batches' && 'Batches & Class Timings'}
              {activeTab === 'bookings' && 'Party & Camp Registrations'}
              {activeTab === 'announcements' && 'Notices & Circular Broadcaster'}
              {activeTab === 'blogs' && 'Blog Posts & Articles CMS Editor'}
              {activeTab === 'reviews' && 'Parent Reviews & Testimonials Manager'}
              {activeTab === 'birthdays' && 'Student Birthdays & Celebration Alerts'}
              {activeTab === 'renewals' && 'Student Package Renewal Alerts'}
              {activeTab === 'fee_alerts' && 'Student Fee Due Alerts'}
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

          <div className="flex flex-wrap items-center gap-3">


            {/* Active Logged-in Admin Identity Profile Card */}
            {adminUser && (
              <div className="flex items-center gap-2">
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
                {adminRole === 'Admin' && (
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                      isLight 
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600' 
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-850 text-amber-400'
                    }`}
                    title="Change Admin Password"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}



        {activeTab === 'students' && (
              <button
                onClick={() => {
                  setNewStudentForm({
                    admission_id: generateNextAdmissionId(),
                    password: '',
                    full_name: '',
                    dob: '2021-01-01',
                    gender: 'Boy',
                    blood_group: 'B+',
                    batch_id: batches[0]?.id || '',
                    parent_name: '',
                    parent_phone: '',
                    parent_email: '',
                    address: '',
                    city: 'Patna',
                    state: 'Bihar',
                    pin_code: '800001',
                    parent_relationship: 'Father',
                    parent_occupation: '',
                    parent_address_same: true,
                    parent_alt_phone: '',
                    emergency_contact_name: '',
                    emergency_relationship: '',
                    emergency_phone: '',
                    emergency_alt_phone: '',
                    program_interested: '',
                    preferred_time_slot: 'Morning',
                    has_medical_condition: false,
                    medical_condition_details: '',
                    regular_medication: '',
                    doctor_name: '',
                    doctor_phone: '',
                    hospital_preference: '',
                    consent_accepted: true,
                    custom_days: '',
                    classes_total: 12,
                    classes_consumed: 0,
                    category: 'Child Activity',
                    status: 'active',
                    payment_for: '',
                    payment_mode: 'Cash',
                    amount_paid: '',
                    total_fee: '',
                    plan_validity_date: '',
                    remarks: '',
                    custom_schedules: [],
                    admission_date: new Date().toISOString().split('T')[0]
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

        {/* TODAY'S LEAD FOLLOW-UP ALERT BANNER */}
        {(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const todaysFollowupsCount = enquiries.filter((enq: any) => {
            if (!enq.next_follow_up_date) return false;
            const fDate = String(enq.next_follow_up_date).split('T')[0];
            return fDate === todayStr && enq.status !== 'Admission Done';
          }).length;

          if (todaysFollowupsCount === 0) return null;

          return (
            <div
              onClick={() => setActiveTab('enquiries')}
              className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn cursor-pointer hover:from-blue-500/15 hover:to-indigo-500/15 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20 shrink-0">
                  📋
                </div>
                <div>
                  <h4 className={`text-xs font-extrabold ${textPrimary} flex items-center gap-2`}>
                    <span>Today's Follow-ups ({todaysFollowupsCount})</span>
                  </h4>
                  <p className={`text-xs ${textSecondary}`}>
                    You have {todaysFollowupsCount} lead follow-up{todaysFollowupsCount !== 1 ? 's' : ''} scheduled for today. Click here to view and manage them.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-550 shrink-0" />
            </div>
          );
        })()}

        {/* TAB 0: ADVANCED ERP ANALYTICS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            students={students}
            batches={batches}
            teachers={teachers}
            totalPaidFees={totalPaidFees}
            totalPendingFees={totalPendingFees}
            paidRatioPercentage={paidRatioPercentage}
            pendingRatioPercentage={pendingRatioPercentage}
            totalRevenueCombined={totalRevenueCombined}
            studentsByBatchDistribution={studentsByBatchDistribution}
            fees={fees}
            attendance={attendance}
            setActiveTab={setActiveTab}
            setIsAddStudentOpen={setIsAddStudentOpen}
            galleryImages={galleryImages}
          />
        )}

        {/* SHOW STUDENT KPI CARDS AND FILTER BAR ONLY ON STUDENT/FEE RELEVANT TABS */}
        {(activeTab === 'students' || activeTab === 'student_list') && (
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
                  {attendance.filter(a => a.status === 'present' && a.date === new Date().toISOString().split('T')[0]).length} Present
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

              <div className="relative w-full sm:w-72 flex items-center gap-2">
                <button 
                  onClick={() => loadAllAdminData()}
                  className={`p-2 rounded-xl transition font-bold flex items-center justify-center cursor-pointer shrink-0 border shadow-sm ${
                    isLight ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Refresh and sync data from Supabase DB"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="relative w-full">
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
            </div>
          </>
        )}

        {/* TAB: BIRTHDAY LANDING PAGE EDITOR */}
        {activeTab === 'birthday_page' && (
          <BirthdayLandingTab />
        )}

        {/* TAB 1: STUDENT MANAGEMENT */}
        {(activeTab === 'students' || activeTab === 'student_list') && (
          <div className={`flex items-center space-x-1.5 border rounded-xl p-1 shrink-0 text-xs w-fit mb-4 flex-wrap gap-1 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <span className={`font-semibold px-2 ${textSecondary}`}>Category Filter:</span>
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedCategoryFilter === 'All' ? 'bg-orange-600 text-white shadow-sm' : `${textSecondary} hover:text-orange-500`
              }`}
            >All Categories</button>
            {dynamicCategoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedCategoryFilter === cat ? 'bg-orange-600 text-white shadow-sm' : `${textSecondary} hover:text-orange-500`
                }`}
              >{cat}</button>
            ))}
          </div>
        )}

        {activeTab === 'students' && (
          <StudentsTab
            bgCard={bgCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            tipBannerBg={tipBannerBg}
            tableHeaderBg={tableHeaderBg}
            badgeClass={badgeClass}
            badgePassword={badgePassword}
            filteredStudents={filteredStudents.filter(s => {
              if (selectedCategoryFilter === 'All') return true;
              return (s.category || 'Child Activity').trim().toLowerCase() === selectedCategoryFilter.trim().toLowerCase();
            })}
            batches={batches}
            setSelectedERPStudent={setSelectedERPStudent}
            setErpModalTab={setErpModalTab}
            setFeeForm={setFeeForm}
            loadAllAdminData={loadAllAdminData}
          />
        )}

        {/* TAB: BANNERS & POSTERS MANAGER */}
        {activeTab === 'banners' && (
          <BannersTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            banners={banners}
            setBanners={setBanners}
            loadAllAdminData={loadAllAdminData}
          />
        )}

        {/* TAB: LEAD & ENQUIRY MANAGER */}
        {activeTab === 'enquiries' && (
          <EnquiriesTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            badgePassword={badgePassword}
            isLight={isLight}
            enquiries={enquiries}
            onUpdateStatus={handleUpdateEnquiryStatus}
            onUpdateFollowUpDate={handleUpdateFollowUpDate}
            onUpdateNotes={handleUpdateEnquiryNotes}
            onAddEnquiry={handleAddEnquiry}
            onConvertToAdmission={handleConvertToAdmission}
            onDeleteEnquiry={handleDeleteEnquiry}
          />
        )}

        {/* TAB: DEACTIVATED STUDENTS */}
        {activeTab === 'deactivated' && (
          <DeactivatedTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            deactivatedStudents={deactivatedStudents}
            onReactivate={handleReactivateStudent}
            onPermanentDelete={handlePermanentDeleteDeactivated}
          />
        )}

        {/* TAB 1.5: STUDENT LIST */}
        {activeTab === 'student_list' && (
          <StudentListTab
            bgCard={bgCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            tableHeaderBg={tableHeaderBg}
            badgeClass={badgeClass}
            filteredStudents={filteredStudents.filter(s => {
              if (selectedCategoryFilter === 'All') return true;
              return (s.category || 'Child Activity').trim().toLowerCase() === selectedCategoryFilter.trim().toLowerCase();
            })}
            students={students}
            batches={batches}
            setIsExportModalOpen={setIsExportModalOpen}
            onSelectStudent={(st: any) => {
              setSelectedERPStudent(st)
              setErpModalTab('collect_fee')
            }}
          />
        )}

        {/* TAB 2: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <AttendanceTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            filteredStudents={filteredStudents.filter(s => {
              if (selectedCategoryFilter === 'All') return true;
              return (s.category || 'Child Activity').trim().toLowerCase() === selectedCategoryFilter.trim().toLowerCase();
            })}
            attendance={attendance}
            attendanceDate={attendanceDate}
            setAttendanceDate={setAttendanceDate}
            setActiveTab={setActiveTab}
            handleMarkAttendance={handleMarkAttendance}
            searchQuery={searchQuery}
            batchSchedules={batchSchedules}
            studentCustomSchedules={studentCustomSchedules}
            holidays={holidays}
            handleToggleHoliday={handleToggleHoliday}
          />
        )}

        {/* TAB 3: MONTHLY BATCH ATTENDANCE CALENDAR */}
        {activeTab === 'calendar' && (
          <CalendarTab
            bgCard={bgCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            badgeClass={badgeClass}
            badgeStatus={badgeStatus}
            monthName={monthName}
            currentYear={currentYear}
            selectedBatchId={selectedBatchId}
            calendarDays={calendarDays}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            setSelectedCalendarDate={setSelectedCalendarDate}
          />
        )}

        {/* TAB 4: FEES MANAGEMENT */}
        {activeTab === 'fees' && (
          <FeesTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            badgeStatus={badgeStatus}
            filteredStudents={filteredStudents.filter(s => {
              if (selectedCategoryFilter === 'All') return true;
              return (s.category || 'Child Activity').trim().toLowerCase() === selectedCategoryFilter.trim().toLowerCase();
            })}
            fees={fees}
            feeSelectedMonth={feeSelectedMonth}
            setFeeSelectedMonth={setFeeSelectedMonth}
            feeStatusFilter={feeStatusFilter}
            setFeeStatusFilter={setFeeStatusFilter}
            // setIsClassFeeModalOpen handled locally
            setSelectedERPStudent={setSelectedERPStudent}
            setErpModalTab={setErpModalTab}
            handleSendWhatsAppFeeReminder={handleSendWhatsAppFeeReminder}
            batches={batches}
            feeHeads={feeHeads}
            setFeeHeads={setFeeHeads}
            loadAllAdminData={loadAllAdminData}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
          />
        )}

        {/* TAB: FINANCIAL ERP & P&L DASHBOARD */}
        {activeTab === 'financial' && (
          <FinancialTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            students={students}
            fees={fees}
            batches={batches}
            teachers={teachers}
            teacherPayments={teacherPayments}
            loadAllAdminData={loadAllAdminData}
          />
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
            isUploadingGallery={isUploadingGallery}
            handleUpdateGalleryOrder={handleUpdateGalleryOrder}
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
            handleCreateNewPackage={handleCreateNewPackage}
            handleSavePartyPackages={handleSavePartyPackages}
            pkgSaveStatus={pkgSaveStatus}
            handleDeletePackage={handleDeletePackage}
            adminRole={adminRole}
          />
        )}

        {/* TAB: TEACHER & FACULTY MANAGEMENT */}
        {activeTab === 'teachers' && (
          <TeachersTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            teachers={teachers}
            setEditingTeacher={setEditingTeacher}
            setTeacherForm={setTeacherForm}
            setIsAddTeacherOpen={setIsAddTeacherOpen}
            handleDeleteTeacher={handleDeleteTeacher}
            adminRole={adminRole}
            onViewProfile={(t: any) => setSelectedTeacher(t)}
          />
        )}

        {/* TAB: STAFF PORTAL & ACCESS CONTROL */}
        {activeTab === 'staff_mgmt' && (
          <StaffTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
          />
        )}

        {/* TAB 8: BATCHES & TIMINGS CONFIGURATION */}
        {activeTab === 'batches' && (
          <BatchesTab
            bgCard={bgCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            badgeClass={badgeClass}
            batches={batches}
            batchSchedules={batchSchedules}
            classes={classes}
            handleAddClass={handleAddClass}
            handleDeleteClass={handleDeleteClass}
            setIsAddBatchOpen={setIsAddBatchOpen}
            setEditingBatch={handleStartEditBatch}
            handleDeleteBatch={handleDeleteBatch}
            handleToggleBatchVisibility={handleToggleBatchVisibility}
          />
        )}

        {/* TAB: BIRTHDAY ALERTS */}
        {activeTab === 'birthdays' && (
          <BirthdayAlertsTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            students={activeStudents}
          />
        )}

        {/* TAB: RENEWAL ALERTS */}
        {activeTab === 'renewals' && (
          <RenewalAlertsTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            students={activeStudents}
            batches={batches}
          />
        )}

        {/* TAB: FEE ALERTS */}
        {activeTab === 'fee_alerts' && (
          <FeeAlertsTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            students={activeStudents}
            fees={fees}
            batches={batches}
          />
        )}

        {/* TAB 6: BOOKINGS */}
        {activeTab === 'bookings' && (
          <BookingsTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            badgePassword={badgePassword}
            bookings={bookings}
            handleUpdateBookingStatus={handleUpdateBookingStatus}
            handleDeleteBooking={handleDeleteBooking}
            partyPackages={partyPackages}
            isLight={isLight}
          />
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

        {/* TAB: BLOGS MANAGEMENT */}
        {activeTab === 'blogs' && (
          <BlogsTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            badgeClass={badgeClass}
          />
        )}

        {/* TAB: REVIEWS MANAGEMENT */}
        {activeTab === 'reviews' && (
          <ReviewsTab
            bgCard={bgCard}
            bgSubCard={bgSubCard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isLight={isLight}
            badgeClass={badgeClass}
          />
        )}
      </main>

      {/* MODAL: EDIT BATCH DETAILS */}
      {editingBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${textPrimary}`}>Edit Batch Details</h3>
              <button onClick={() => setEditingBatch(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Tab Toggles */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-1 text-xs">
              <button
                type="button"
                onClick={() => setBatchEditTab('core')}
                className={`flex-1 py-2 font-bold border-b-2 transition cursor-pointer ${
                  batchEditTab === 'core' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-500'
                }`}
              >
                1. Core Settings &amp; Pricing
              </button>
              <button
                type="button"
                onClick={() => setBatchEditTab('landing')}
                className={`flex-1 py-2 font-bold border-b-2 transition cursor-pointer ${
                  batchEditTab === 'landing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-500'
                }`}
              >
                2. Public Landing Details
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-4 text-xs">
              {batchEditTab === 'core' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Batch Name</label>
                      <input
                        type="text"
                        required
                        value={editingBatch.batch_name}
                        onChange={(e) => setEditingBatch({ ...editingBatch, batch_name: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Category</label>
                      <select
                        value={editingBatch.category || 'Child Activity'}
                        onChange={(e) => setEditingBatch({ ...editingBatch, category: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none cursor-pointer ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      >
                        <option value="Child Activity">Child Activity</option>
                        <option value="Zumba &amp; Yoga">Zumba &amp; Yoga</option>
                        <option value="Activities">Activities</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Subcategory</label>
                      <input
                        type="text"
                        placeholder="e.g. Toddler Program"
                        value={editingBatch.subcategory || ''}
                        onChange={(e) => setEditingBatch({ ...editingBatch, subcategory: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Branch Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Kidwaipuri Main Branch"
                        value={editingBatch.location || ''}
                        onChange={(e) => setEditingBatch({ ...editingBatch, location: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`font-bold ${textSecondary}`}>Age Group</label>
                      <input
                        type="text"
                        required
                        value={editingBatch.age_group || ''}
                        onChange={(e) => setEditingBatch({ ...editingBatch, age_group: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
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
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
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
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`font-bold ${textSecondary}`}>End Time (Optional)</label>
                      <input
                        type="text"
                        value={editingBatch.end_time || ''}
                        onChange={(e) => setEditingBatch({ ...editingBatch, end_time: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className={`font-bold ${textSecondary}`}>Days</label>
                      <input
                        type="text"
                        required
                        value={editingBatch.days || ''}
                        onChange={(e) => setEditingBatch({ ...editingBatch, days: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className={`font-bold ${textSecondary}`}>Plan Validity (Days)</label>
                      <input
                        type="number"
                        required
                        value={editingBatch.validity_days || 30}
                        onChange={(e) => setEditingBatch({ ...editingBatch, validity_days: Number(e.target.value) })}
                        className={`w-full border rounded-xl px-3 py-2 font-mono outline-none ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className={`font-bold text-orange-500`}>Fee Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={editingBatch.fee_amount || 0}
                        onChange={(e) => setEditingBatch({ ...editingBatch, fee_amount: Number(e.target.value) })}
                        className={`w-full border border-orange-500/30 rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                          isLight ? 'bg-orange-500/5 text-slate-900 focus:border-orange-550' : 'bg-orange-950/20 text-orange-200 focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

              {/* Class schedules sub-form for editing */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className={`font-bold ${textSecondary} block`}>Class Schedules (Day → Time → Class)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {(editingBatch.schedules || []).map((sch: any, schIdx: number) => (
                    <div key={schIdx} className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                      <select
                        value={sch.day_of_week}
                        onChange={(e) => {
                          const updated = [...editingBatch.schedules]
                          updated[schIdx].day_of_week = e.target.value
                          setEditingBatch({ ...editingBatch, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-semibold ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Start Time"
                        value={sch.start_time}
                        onChange={(e) => {
                          const updated = [...editingBatch.schedules]
                          updated[schIdx].start_time = e.target.value
                          setEditingBatch({ ...editingBatch, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-mono w-24 ${!sch.start_time?.trim() ? 'border-rose-400 bg-rose-50' : ''} ${isLight ? 'bg-white border-slate-300 text-slate-850' : 'bg-slate-950 border-slate-800 text-slate-150'}`}
                      />
                      <input
                        type="text"
                        required
                        placeholder="End Time"
                        value={sch.end_time}
                        onChange={(e) => {
                          const updated = [...editingBatch.schedules]
                          updated[schIdx].end_time = e.target.value
                          setEditingBatch({ ...editingBatch, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-mono w-24 ${!sch.end_time?.trim() ? 'border-rose-400 bg-rose-50' : ''} ${isLight ? 'bg-white border-slate-300 text-slate-850' : 'bg-slate-950 border-slate-800 text-slate-150'}`}
                      />
                      <select
                        value={sch.class_name}
                        onChange={(e) => {
                          const updated = [...editingBatch.schedules]
                          updated[schIdx].class_name = e.target.value
                          setEditingBatch({ ...editingBatch, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-semibold ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                      >
                        {classMasterNames.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingBatch.schedules.filter((_: any, idx: number) => idx !== schIdx)
                          setEditingBatch({ ...editingBatch, schedules: updated })
                        }}
                        className="p-1 bg-rose-600/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSch = { day_of_week: 'Monday', start_time: '4 PM', end_time: '5 PM', class_name: classMasterNames[0] || 'Skating' }
                    setEditingBatch({ ...editingBatch, schedules: [...(editingBatch.schedules || []), newSch] })
                  }}
                  className="px-3 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                >
                  + Add Schedule Entry
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className={`font-bold ${textSecondary}`}>Emoji Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. 🤸"
                    value={editingBatch.emoji || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, emoji: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={`font-bold ${textSecondary}`}>Tagline / Catchphrase</label>
                  <input
                    type="text"
                    placeholder="Tagline shown on public portal"
                    value={editingBatch.tagline || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, tagline: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Best For</label>
                <input
                  type="text"
                  placeholder="e.g. Kids aged 2-5 seeking developmental activity..."
                  value={editingBatch.best_for || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, best_for: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Program Description</label>
                <textarea
                  rows={3}
                  placeholder="Full description of the batch activities..."
                  value={editingBatch.description || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, description: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>What's Included (One item per line)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Standard Gym access&#10;Trainer Guidance&#10;Complimentary assessment"
                  value={Array.isArray(editingBatch.includes) ? editingBatch.includes.join('\n') : ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, includes: e.target.value.split('\n').filter(Boolean) })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Child Benefits (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Cognitive growth&#10;Physical flexibility"
                    value={Array.isArray(editingBatch.child_benefits) ? editingBatch.child_benefits.join('\n') : ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, child_benefits: e.target.value.split('\n').filter(Boolean) })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Mother Benefits (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Social connectivity&#10;Relaxed waiting zone"
                    value={Array.isArray(editingBatch.mother_benefits) ? editingBatch.mother_benefits.join('\n') : ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, mother_benefits: e.target.value.split('\n').filter(Boolean) })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none font-semibold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
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


      {/* MODAL: BROADCAST NOTICE */}
      <BroadcastNoticeModal
        isOpen={isAddNoticeOpen}
        onClose={() => setIsAddNoticeOpen(false)}
        noticeForm={noticeForm}
        setNoticeForm={setNoticeForm}
        handleNoticeSubmit={handleNoticeSubmit}
        isLight={isLight}
        bgCard={bgCard}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        newStudentForm={newStudentForm}
        setNewStudentForm={setNewStudentForm}
        allAvailableBatches={allAvailableBatches}
        setBatches={setBatches}
        handleAddStudentSubmit={handleAddStudentSubmit}
        batchSchedules={batchSchedules}
        categories={categories}
        setCategories={setCategories}
        feeHeads={feeHeads}
      />
      {selectedERPStudent && (
        <StudentErpModal
          isOpen={!!selectedERPStudent}
          onClose={() => setSelectedERPStudent(null)}
          student={selectedERPStudent}
          adminRole={adminRole}
          isLight={isLight}
          categories={categories}
          setCategories={setCategories}
          bgCard={bgCard}
          bgSubCard={bgSubCard}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          badgeStatus={badgeStatus}
          badgePassword={badgePassword}
          tipBannerBg={tipBannerBg}
          fees={fees}
          attendance={attendance}
          handlePrintRegistrationForm={printRegistrationFormEnriched}
          handleDeactivateStudent={handleDeactivateStudent}
          handleUpdateStudent={handleUpdateStudent}
          allAvailableBatches={allAvailableBatches}
          handleUpdateStudentBatch={handleUpdateStudentBatch}
          handleDeleteStudent={handleDeleteStudent}
          handleFeeSubmit={handleFeeSubmit}
          handleERPPasswordSubmit={handleERPPasswordSubmit}
          feeForm={feeForm}
          setFeeForm={setFeeForm}
          erpPassword={erpPassword}
          setErpPassword={setErpPassword}
          erpPasswordMsg={erpPasswordMsg}
          batchSchedules={batchSchedules}
          studentCustomSchedules={studentCustomSchedules}
          feeHeads={feeHeads}
          loadAllAdminData={loadAllAdminData}
        />
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
                  const currentStatus = attRecord?.status || 'unmarked'

                  return (
                    <div key={st.id} className={`p-3.5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${bgSubCard}`}>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold ${textPrimary}`}>{st.full_name}</h4>
                          <span className="text-blue-500 font-mono">({st.admission_id})</span>
                          {currentStatus === 'unmarked' && <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded text-[9px] font-bold">UNMARKED</span>}
                          {currentStatus === 'present' && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold">PRESENT</span>}
                          {currentStatus === 'absent' && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-bold">ABSENT</span>}
                          {currentStatus === 'halfday' && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-bold">HALF DAY</span>}
                          {currentStatus === 'leave' && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px] font-bold">LEAVE</span>}
                          {currentStatus === 'holiday' && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[9px] font-bold">HOLIDAY</span>}
                          {attRecord?.remarks && (
                            <span className="text-[9px] text-slate-400 italic">({attRecord.remarks})</span>
                          )}
                        </div>
                        <p className={`text-[11px] ${textSecondary} mt-1`}>
                          Class: <strong className={textPrimary}>{st.class_name || 'Nursery'} - {st.section_name || 'A'}</strong> | Parent: {st.parent_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 self-start sm:self-auto">
                        {/* P Button */}
                        <button
                          onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, currentStatus === 'present' ? 'unmarked' : 'present')}
                          className={`w-7 h-7 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                            currentStatus === 'present' ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                          title="Present"
                        >P</button>

                        {/* A Button */}
                        <button
                          onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, currentStatus === 'absent' ? 'unmarked' : 'absent')}
                          className={`w-7 h-7 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                            currentStatus === 'absent' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:bg-rose-500/10'
                          }`}
                          title="Absent"
                        >A</button>

                        {/* HD Button */}
                        <button
                          onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, currentStatus === 'halfday' ? 'unmarked' : 'halfday')}
                          className={`w-7 h-7 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                            currentStatus === 'halfday' ? 'bg-amber-500 text-white' : 'text-amber-505 hover:bg-amber-500/10'
                          }`}
                          title="Half Day"
                        >HD</button>

                        {/* L Button */}
                        <button
                          onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, currentStatus === 'leave' ? 'unmarked' : 'leave', 'General', 'General', 'Leave')}
                          className={`w-7 h-7 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                            currentStatus === 'leave' ? 'bg-blue-600 text-white' : 'text-blue-605 hover:bg-blue-500/10'
                          }`}
                          title="Leave"
                        >L</button>

                        {/* H Button */}
                        <button
                          onClick={() => handleMarkAttendance(st.id, selectedCalendarDate, currentStatus === 'holiday' ? 'unmarked' : 'holiday', 'General', 'General', 'Holiday')}
                          className={`w-7 h-7 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                            currentStatus === 'holiday' ? 'bg-purple-600 text-white' : 'text-purple-655 hover:bg-purple-500/10'
                          }`}
                          title="Student Holiday"
                        >H</button>
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

      {/* MODAL: EDIT CLASS MONTHLY FEE STRUCTURE — Moved to FeesTab */}

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

              {/* Class schedules sub-form */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className={`font-bold ${textSecondary} block`}>Class Schedules (Day → Time → Class)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {(newBatchForm.schedules || []).map((sch, schIdx) => (
                    <div key={schIdx} className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                      <select
                        value={sch.day_of_week}
                        onChange={(e) => {
                          const updated = [...newBatchForm.schedules]
                          updated[schIdx].day_of_week = e.target.value
                          setNewBatchForm({ ...newBatchForm, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-semibold ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Start Time (e.g. 4 PM)"
                        value={sch.start_time}
                        onChange={(e) => {
                          const updated = [...newBatchForm.schedules]
                          updated[schIdx].start_time = e.target.value
                          setNewBatchForm({ ...newBatchForm, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-mono w-24 ${isLight ? 'bg-white border-slate-300 text-slate-850' : 'bg-slate-950 border-slate-800 text-slate-150'}`}
                      />
                      <input
                        type="text"
                        placeholder="End Time (e.g. 5 PM)"
                        value={sch.end_time}
                        onChange={(e) => {
                          const updated = [...newBatchForm.schedules]
                          updated[schIdx].end_time = e.target.value
                          setNewBatchForm({ ...newBatchForm, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-mono w-24 ${isLight ? 'bg-white border-slate-300 text-slate-850' : 'bg-slate-950 border-slate-800 text-slate-150'}`}
                      />
                      <select
                        value={sch.class_name}
                        onChange={(e) => {
                          const updated = [...newBatchForm.schedules]
                          updated[schIdx].class_name = e.target.value
                          setNewBatchForm({ ...newBatchForm, schedules: updated })
                        }}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-semibold ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                      >
                        {classMasterNames.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newBatchForm.schedules.filter((_, idx) => idx !== schIdx)
                          setNewBatchForm({ ...newBatchForm, schedules: updated })
                        }}
                        className="p-1 bg-rose-600/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSch = { day_of_week: 'Monday', start_time: '4 PM', end_time: '5 PM', class_name: classMasterNames[0] || 'Skating' }
                    setNewBatchForm({ ...newBatchForm, schedules: [...(newBatchForm.schedules || []), newSch] })
                  }}
                  className="px-3 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                >
                  + Add Schedule Entry
                </button>
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
      <AddTeacherModal
        isOpen={isAddTeacherOpen}
        onClose={() => setIsAddTeacherOpen(false)}
        teacherForm={teacherForm}
        setTeacherForm={setTeacherForm}
        handleTeacherSubmit={handleTeacherSubmit}
        editingTeacher={editingTeacher}
        batches={batches}
        isLight={isLight}
        bgCard={bgCard}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      {selectedTeacher && (
        <TeacherProfileModal
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          teacher={selectedTeacher}
          isLight={isLight}
          bgCard={bgCard}
          bgSubCard={bgSubCard}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          teacherPayments={teacherPayments}
          teacherAttendance={teacherAttendance}
          onAddPayment={handleTeacherPaymentSubmit}
          onDeletePayment={handleDeleteTeacherPayment}
          onMarkAttendance={handleMarkTeacherAttendance}
        />
      )}

      {/* MODAL: EXPORT OPTIONS (PDF vs CSV / EXCEL) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        handleExportStudentsPDF={triggerExportPDF}
        handleExportStudentsCSV={triggerExportCSV}
        handleExportBulkRegistrationForms={triggerExportBulk}
        isLight={isLight}
        bgCard={bgCard}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      {/* MODAL: CHANGE ADMIN PASSWORD */}
      {isChangePasswordOpen && adminRole === 'Admin' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] text-xs">
          <div className={`p-6 max-w-md w-full rounded-3xl space-y-4 shadow-2xl ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100 border border-slate-800'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2 text-pink-600">
                <Key className="w-5 h-5" /> Change Admin Password
              </h3>
              <button onClick={() => setIsChangePasswordOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (adminRole !== 'Admin') {
                  alert('❌ Access Denied: Only Super Admin role can change admin password.');
                  setIsChangePasswordOpen(false);
                  return;
                }
                const currentPw = e.currentTarget.currentPassword.value.trim();
                const newPw = e.currentTarget.newPassword.value.trim();
                const confirmPw = e.currentTarget.confirmPassword.value.trim();

                if (!currentPw || !newPw || !confirmPw) {
                  alert('❌ Please fill in all fields.');
                  return;
                }
                if (newPw !== confirmPw) {
                  alert('❌ New passwords do not match.');
                  return;
                }

                const success = await handleAdminPasswordChangeSubmit(currentPw, newPw);
                if (success) {
                  setIsChangePasswordOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-bold text-slate-500 mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  placeholder="Enter current password"
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  placeholder="Enter new password"
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Confirm new password"
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
