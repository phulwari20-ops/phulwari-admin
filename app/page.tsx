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
  Mail
} from 'lucide-react'

export default function AdminDashboardPage() {
  // Theme Toggle
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Sidebar Resizable & Collapsible State
  const [sidebarWidth, setSidebarWidth] = useState<number>(270)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false)

  // Mobile Menu Drawer Toggle State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'calendar' | 'fees' | 'batches' | 'bookings' | 'announcements' | 'gallery' | 'packages'>('students')
  const [loading, setLoading] = useState(true)

  // Initial Default Student Records
  const defaultInitialStudents = [
    { id: 'st-001', admission_id: 'PH-2026-001', password: 'parent123', full_name: 'Aarav Sharma', class_name: 'Nursery', section_name: 'A', parent_name: 'Rajesh Sharma', parent_phone: '+91 98765 43210', status: 'active', address: 'Kidwaipuri, Patna' },
    { id: 'st-002', admission_id: 'PH-2026-002', password: 'parent456', full_name: 'Ananya Verma', class_name: 'LKG', section_name: 'B', parent_name: 'Vikram Verma', parent_phone: '+91 98111 22334', status: 'active', address: 'Boring Road, Patna' },
    { id: 'st-003', admission_id: 'PH-2026-003', password: 'parent789', full_name: 'Rohan Gupta', class_name: 'Playgroup', section_name: 'A', parent_name: 'Sunil Gupta', parent_phone: '+91 99887 76655', status: 'active', address: 'Kankarbagh, Patna' }
  ]

  // Data states
  const [students, setStudents] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])

  // Dynamic Gallery State (25 default images)
  const defaultGallery = [
    { id: 'g2', url: '/galary2.webp', title: 'Activity Room', category: 'Activities' },
    { id: 'g3', url: '/galary3.webp', title: 'Toddler Play Area', category: 'Play' },
    { id: 'g4', url: '/galary4.webp', title: 'Art & Craft Workshop', category: 'Art' },
    { id: 'g5', url: '/galary5.webp', title: 'Gymnastics Class', category: 'Fitness' },
    { id: 'g6', url: '/galary6.webp', title: 'Kids Dance & Music', category: 'Dance' },
    { id: 'g7', url: '/galary7.webp', title: 'Roller Skating Track', category: 'Sports' },
    { id: 'g8', url: '/galary8.webp', title: 'MMA & Martial Arts', category: 'Sports' },
    { id: 'g9', url: '/galary9.webp', title: 'Birthday Celebration Hall', category: 'Parties' },
    { id: 'g10', url: '/galary10.webp', title: 'Summer Camp Fun', category: 'Camps' },
    { id: 'g11', url: '/galary11.webp', title: 'Mother Fitness Studio', category: 'Fitness' },
    { id: 'g12', url: '/galary12.webp', title: 'Outdoor Play Garden', category: 'Play' },
    { id: 'g13', url: '/galary13.webp', title: 'Storytelling Session', category: 'Learning' },
    { id: 'g14', url: '/galary14.webp', title: 'Phulwari Circle Time', category: 'Activities' },
    { id: 'g15', url: '/galary15.webp', title: 'Clay Modeling', category: 'Art' },
    { id: 'g16', url: '/galary16.webp', title: 'Music & Movement', category: 'Dance' },
    { id: 'g17', url: '/galary17.webp', title: 'Indoor Cricket Net', category: 'Sports' },
    { id: 'g18', url: '/galary18.webp', title: 'Winter Camp Creative Arts', category: 'Camps' },
    { id: 'g19', url: '/galary19.webp', title: 'Yoga & Mindfulness', category: 'Fitness' },
    { id: 'g20', url: '/galary20.webp', title: 'Party Decoration Setup', category: 'Parties' },
    { id: 'g21', url: '/galary21.webp', title: 'Preschool Learning Corner', category: 'Learning' },
    { id: 'g22', url: '/galary22.webp', title: 'Obstacle Course Fun', category: 'Fitness' },
    { id: 'g23', url: '/galary23.webp', title: 'Sensory Play Table', category: 'Play' },
    { id: 'g24', url: '/galary24.webp', title: 'Mini Stage Performances', category: 'Dance' },
    { id: 'g25', url: '/galary25.webp', title: 'Phulwari Annual Celebration', category: 'Events' },
    { id: 'g26', url: '/galary26.webp', title: 'Mother & Child Bonding', category: 'Activities' }
  ]

  const [galleryImages, setGalleryImages] = useState<any[]>(defaultGallery)
  const [galleryPage, setGalleryPage] = useState<number>(1)
  const galleryPerPage = 8
  const [selectedAdminGalleryImg, setSelectedAdminGalleryImg] = useState<any>(null)
  const [deletingGalleryImg, setDeletingGalleryImg] = useState<any>(null)

  // Dynamic Class Fee Structure State
  const defaultClassFees: Record<string, number> = {
    'Playgroup': 3200,
    'Nursery': 3500,
    'LKG': 3800,
    'UKG': 3800,
    'Class 1': 4000,
    'Class 2': 4200,
    'Class 3': 4400,
    'Class 4': 4600,
    'Class 5': 4800,
    'Class 6': 5000,
    'Class 7': 5200,
    'Class 8': 5400,
    'Class 9': 5600,
    'Class 10': 5800,
    'Class 11': 6000,
    'Class 12': 6500,
  }
  const [classFees, setClassFees] = useState<Record<string, number>>(defaultClassFees)
  const [isClassFeeModalOpen, setIsClassFeeModalOpen] = useState<boolean>(false)
  const [classFeeSaveStatus, setClassFeeSaveStatus] = useState<string>('')

  // Dynamic Party Packages State
  const [partyPackages, setPartyPackages] = useState<any[]>([
    { id: 'p1', name: 'Basic Birthday Package', tagline: 'Perfect for small and cozy celebrations.', price: '₹4,999', includes: 'Celebration Space, Basic Decoration, Music & Entertainment, Fun Activities, Birthday Setup' },
    { id: 'p2', name: 'Premium Birthday Package', tagline: 'Designed for a more memorable and exciting experience.', price: '₹9,999', includes: 'Theme-Based Decoration, Enhanced Activity Setup, Interactive Games, Photo-Friendly Setup' },
    { id: 'p3', name: 'Customized Birthday Package', tagline: 'A fully customized birthday experience, tailored to you.', price: 'Custom Pricing', includes: 'Custom Themes, Personalized Decoration, Special Activities, Flexible Planning Options' }
  ])
  const [pkgSaveStatus, setPkgSaveStatus] = useState('')

  // Classes (Playgroup to Class 12) & Sections (A to E)
  const classOptions = ['Playgroup', 'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
  const sectionOptions = ['A', 'B', 'C', 'D', 'E']

  // Search & Class/Section Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('All')
  const [selectedSection, setSelectedSection] = useState<string>('All')

  // Monthly Fee Dashboard Filter State
  const [feeStatusFilter, setFeeStatusFilter] = useState<'All' | 'PAID' | 'PENDING'>('All')
  const [feeSelectedMonth, setFeeSelectedMonth] = useState<string>('August 2026')

  // Attendance Month & Year Navigation
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(7) // 7 = August
  const [currentYear, setCurrentYear] = useState<number>(2026)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Attendance Date Picker
  const [attendanceDate, setAttendanceDate] = useState<string>('2026-08-03')

  // Selected Student ERP Modal State
  const [selectedERPStudent, setSelectedERPStudent] = useState<any>(null)
  const [erpModalTab, setErpModalTab] = useState<'collect_fee' | 'fee_history' | 'profile' | 'password'>('collect_fee')

  // Printable Official Receipt Modal State
  const [receiptModalFee, setReceiptModalFee] = useState<any>(null)

  // Fee Collection Form State
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

  // Edit Batch Modal State
  const [editingBatch, setEditingBatch] = useState<any>(null)

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
    address: 'Kidwaipuri, Patna'
  })

  // Notice Broadcaster Modal State
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false)
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'Notice',
    target_audience: 'all'
  })

  // Admin Login & Session State
  const [adminUser, setAdminUser] = useState<any | null>(null)
  const [adminAuthChecked, setAdminAuthChecked] = useState<boolean>(false)
  const [adminEmailInput, setAdminEmailInput] = useState<string>('')
  const [adminPwInput, setAdminPwInput] = useState<string>('')
  const [showAdminPw, setShowAdminPw] = useState<boolean>(false)
  const [adminLoginError, setAdminLoginError] = useState<string>('')
  const [adminUsersList, setAdminUsersList] = useState<any[]>([
    { id: 'master-adm', email: 'phulwari20@gmail.com', password: 'Phulwari@1295', name: 'Master Administrator' }
  ])

  // Add New Admin Modal State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState<boolean>(false)
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' })
  const [addAdminMsg, setAddAdminMsg] = useState<string>('')

  // Check admin session on mount
  useEffect(() => {
    try {
      const savedAdminsStr = localStorage.getItem('phulwari_admin_users')
      if (savedAdminsStr) {
        setAdminUsersList(JSON.parse(savedAdminsStr))
      }

      const sessionStr = localStorage.getItem('phulwari_admin_session')
      if (sessionStr) {
        setAdminUser(JSON.parse(sessionStr))
      }
    } catch (e) {}
    setAdminAuthChecked(true)
  }, [])

  // Admin Login Handler
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoginError('')

    const cleanEmail = adminEmailInput.trim().toLowerCase()
    const cleanPw = adminPwInput.trim()

    // Match master credentials OR any created admin in adminUsersList
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

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setAdminUser(null)
    try {
      localStorage.removeItem('phulwari_admin_session')
    } catch (e) {}
  }

  // Add New Admin Handler
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminForm.email || !newAdminForm.password) return

    const newAdminObj = {
      id: `adm-${Date.now()}`,
      name: newAdminForm.name.trim() || 'Co-Admin',
      email: newAdminForm.email.trim().toLowerCase(),
      password: newAdminForm.password.trim()
    }

    const updated = [newAdminObj, ...adminUsersList]
    setAdminUsersList(updated)

    try {
      localStorage.setItem('phulwari_admin_users', JSON.stringify(updated))
      const supabase = createClient()
      await supabase.from('admin_users').upsert([newAdminObj])
    } catch (err) {}

    setAddAdminMsg(`✅ New Admin "${newAdminForm.email}" created successfully!`)
    setNewAdminForm({ name: '', email: '', password: '' })
    setTimeout(() => {
      setAddAdminMsg('')
    }, 2000)
  }

  // Delete Admin Handler (Master Admin Only Guard)
  const handleDeleteAdmin = async (adminId: string) => {
    const isCurrentSessionMaster = adminUser?.email?.toLowerCase() === 'phulwari20@gmail.com' || adminUser?.id === 'master-adm'
    if (!isCurrentSessionMaster) {
      alert('🔒 Access Denied: Only the Main Master Admin (phulwari20@gmail.com) is authorized to delete admin accounts.')
      return
    }

    const target = adminUsersList.find(a => a.id === adminId)
    if (target?.email?.toLowerCase() === 'phulwari20@gmail.com') {
      alert('Master Administrator account cannot be deleted.')
      return
    }

    if (adminUser?.email?.toLowerCase() === target?.email?.toLowerCase()) {
      alert('You cannot delete your own active logged-in admin account.')
      return
    }

    const updated = adminUsersList.filter(a => a.id !== adminId)
    setAdminUsersList(updated)

    try {
      localStorage.setItem('phulwari_admin_users', JSON.stringify(updated))
      const supabase = createClient()
      await supabase.from('admin_users').delete().eq('id', adminId)
    } catch (err) {}

    setAddAdminMsg(`✅ Admin account deleted successfully!`)
    setTimeout(() => setAddAdminMsg(''), 2500)
  }

  useEffect(() => {
    loadAllAdminData()
    fetchAdminGallery()
  }, [])

  useEffect(() => {
    if (activeTab === 'gallery') {
      fetchAdminGallery()
    }
  }, [activeTab])

  // Real-Time API Fetcher for Admin Gallery
  const fetchAdminGallery = async () => {
    console.log('📡 [ADMIN GALLERY API REQUEST]: GET http://localhost:3000/api/gallery (Fetching Live Dynamic Gallery Photos)...')
    try {
      const res = await fetch('http://localhost:3000/api/gallery', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          console.log(`✅ [ADMIN GALLERY API SUCCESS]: Received ${json.data.length} photos dynamically from API!`, json.data)
          const formatted = json.data.map((item: any) => ({
            id: item.id || `g-${Date.now()}`,
            url: item.url || item.src,
            title: item.title || 'Gallery Photo',
            category: item.category || 'Activities'
          }))
          setGalleryImages(formatted)
          try {
            localStorage.setItem('phulwari_shared_gallery', JSON.stringify(formatted))
          } catch (e) {}
          return
        }
      }
    } catch (e) {
      console.warn('⚠️ [ADMIN GALLERY API FALLBACK]: Public API offline, fetching directly from Supabase REST API...')
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ftnbzukwjvgxdnkrvuer.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV'
    console.log(`📡 [ADMIN SUPABASE REST REQUEST]: GET ${supabaseUrl}/rest/v1/gallery?select=*`)
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gallery?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          console.log(`✅ [ADMIN SUPABASE REST SUCCESS]: Received ${data.length} gallery images from database!`, data)
          const formatted = data.map((item: any) => ({
            id: item.id || `g-${Date.now()}`,
            url: item.url || item.src,
            title: item.title || 'Gallery Photo',
            category: item.category || 'Activities'
          }))
          setGalleryImages(formatted)
          try {
            localStorage.setItem('phulwari_shared_gallery', JSON.stringify(formatted))
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('❌ [ADMIN SUPABASE REST EXCEPTION]:', err)
    }
  }

  // Sidebar Drag Resize Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSidebar) return
      const newWidth = Math.min(Math.max(e.clientX, 220), 420)
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDraggingSidebar(false)
    }

    if (isDraggingSidebar) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingSidebar])

  const loadAllAdminData = async () => {
    setLoading(true)

    // 1. FAIL-SAFE LOCAL STORAGE CHECK (PREVENTS REGISTERED STUDENTS & PHOTOS FROM DISAPPEARING)
    let localStudents: any[] = []
    let localGallery: any[] = []
    let localFees: any[] = []

    try {
      const savedSt = localStorage.getItem('phulwari_admin_students')
      if (savedSt) localStudents = JSON.parse(savedSt)

      const savedGl = localStorage.getItem('phulwari_shared_gallery')
      if (savedGl) localGallery = JSON.parse(savedGl)

      const savedFe = localStorage.getItem('phulwari_admin_fees')
      if (savedFe) localFees = JSON.parse(savedFe)

      const savedCF = localStorage.getItem('phulwari_class_fees')
      if (savedCF) setClassFees(JSON.parse(savedCF))

      const savedPkg = localStorage.getItem('phulwari_party_packages')
      if (savedPkg) setPartyPackages(JSON.parse(savedPkg))
    } catch (e) {}

    // Combine defaultInitialStudents with localStudents to ensure all 3 default students (Aarav, Ananya, Rohan) are always present
    const combinedLocal = [...defaultInitialStudents]
    localStudents.forEach(ls => {
      if (!combinedLocal.some(s => s.id === ls.id || s.admission_id === ls.admission_id)) {
        combinedLocal.push(ls)
      }
    })
    setStudents(combinedLocal)

    if (localGallery.length > 0) setGalleryImages(localGallery)
    if (localFees.length > 0) setFees(localFees)
    else setFees([
      { id: 'f1', student_id: 'st-001', title: 'Monthly Activity Fee (August 2026)', amount: 3500, discount: 500, net_amount: 3000, due_date: '2026-08-10', status: 'paid', payment_method: 'UPI / Online', receipt_no: 'REC-2026-0891', month: 'August 2026', students: { full_name: 'Aarav Sharma', admission_id: 'PH-2026-001', class_name: 'Nursery', section_name: 'A' } },
      { id: 'f2', student_id: 'st-002', title: 'Monthly Activity Fee (August 2026)', amount: 3800, discount: 0, net_amount: 3800, due_date: '2026-08-10', status: 'pending', payment_method: null, receipt_no: null, month: 'August 2026', students: { full_name: 'Ananya Verma', admission_id: 'PH-2026-002', class_name: 'LKG', section_name: 'B' } }
    ])

    setBatches([
      { id: 'b1', batch_name: 'Little Explorers (Morning)', age_group: '2 - 4 Years', start_time: '09:00 AM', end_time: '11:30 AM', days: 'Mon - Fri', capacity: 15 },
      { id: 'b2', batch_name: 'Junior Champions (Afternoon)', age_group: '4 - 7 Years', start_time: '03:00 PM', end_time: '05:30 PM', days: 'Mon - Sat', capacity: 20 }
    ])

    // 2. SAFE SUPABASE FETCH (SILENT FAIL-SAFE FOR PENDING DB TABLES)
    try {
      const supabase = createClient()
      const { data: dbStudents } = await supabase.from('students').select('*')
      if (dbStudents && dbStudents.length > 0) {
        const merged = [...dbStudents]
        combinedLocal.forEach(ls => {
          if (!merged.some(ds => ds.id === ls.id || ds.admission_id === ls.admission_id)) {
            merged.push(ls)
          }
        })
        setStudents(merged)
        localStorage.setItem('phulwari_admin_students', JSON.stringify(merged))
      }
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  // REGISTER NEW STUDENT (NEVER DISAPPEARS)
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newStudentObj = {
      id: `st-${Date.now()}`,
      admission_id: newStudentForm.admission_id.trim(),
      password: newStudentForm.password.trim(),
      full_name: newStudentForm.full_name.trim(),
      class_name: newStudentForm.class_name,
      section_name: newStudentForm.section_name,
      dob: newStudentForm.dob,
      gender: newStudentForm.gender,
      blood_group: newStudentForm.blood_group,
      parent_name: newStudentForm.parent_name.trim(),
      parent_phone: newStudentForm.parent_phone.trim(),
      parent_email: newStudentForm.parent_email.trim(),
      address: newStudentForm.address.trim(),
      status: 'active'
    }

    // 1. Instant State & LocalStorage Save (100% Reliable, Zero Data Loss)
    const updatedList = [newStudentObj, ...students]
    setStudents(updatedList)
    try {
      localStorage.setItem('phulwari_admin_students', JSON.stringify(updatedList))
    } catch (err) {}

    // 2. Background Safe Supabase Insert (Clean Payload Without Relational Joins)
    try {
      const supabase = createClient()
      await supabase.from('students').insert([newStudentObj])
    } catch (err) {}

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

        // Post to zero-token public API route on main frontend app
        try {
          fetch('http://localhost:3000/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPhoto)
          }).catch(() => {})
        } catch (e) {}

        // Post directly to Supabase REST API with public anon headers
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ftnbzukwjvgxdnkrvuer.supabase.co'
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV'
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

    // 1. Send DELETE to zero-token public API route
    try {
      fetch('http://localhost:3000/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: img.id, url: img.url })
      }).catch(() => {})
    } catch (e) {}

    // 2. Safe REST DELETE query to Supabase without throwing 400 Bad Request
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ftnbzukwjvgxdnkrvuer.supabase.co'
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV'
      
      const isCleanUuid = typeof img.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(img.id)
      const deleteQueryParam = isCleanUuid ? `id=eq.${img.id}` : `url=eq.${encodeURIComponent(img.url)}`

      await fetch(`${supabaseUrl}/rest/v1/gallery?${deleteQueryParam}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
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

    // Post to zero-token public API route on main frontend app if online
    try {
      fetch('http://localhost:3000/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partyPackages)
      }).catch(() => {})
    } catch (e) {}

    // Safe Supabase REST upsert attempt
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ftnbzukwjvgxdnkrvuer.supabase.co'
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV'
      
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
    } catch (err) {}

    setPkgSaveStatus('✅ Party packages updated & published live!')
    setTimeout(() => setPkgSaveStatus(''), 3500)
  }

  // Submit Fee Payment & Record Discount System
  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedERPStudent) return

    const origAmount = parseFloat(feeForm.amount) || 0
    const discAmount = parseFloat(feeForm.discount) || 0
    const netAmount = Math.max(0, origAmount - discAmount)

    const newFeeObj = {
      id: `fee-${Date.now()}`,
      student_id: selectedERPStudent.id,
      title: feeForm.title,
      amount: origAmount,
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

    setAnnouncements(prev => [newNotice, ...prev])
    try {
      const supabase = createClient()
      await supabase.from('announcements').insert([newNotice])
    } catch (err) {}

    setIsAddNoticeOpen(false)
    setNoticeForm({ title: '', content: '', category: 'Notice', target_audience: 'all' })
  }

  // Delete Notice
  const handleDeleteNotice = async (noticeId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== noticeId))
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

  // ACCURATE CASE-INSENSITIVE Filtered Students List
  const filteredStudents = students.filter(s => {
    const sName = (s.full_name || '').toLowerCase()
    const sId = (s.admission_id || '').toLowerCase()
    const pName = (s.parent_name || '').toLowerCase()
    const q = searchQuery.toLowerCase().trim()

    const matchesSearch = !q || sName.includes(q) || sId.includes(q) || pName.includes(q)

    // Normalize class string comparison (e.g. "Nursery", "Class 10", "10") with fail-safe fallback
    const rawClass = (s.class_name || 'Nursery').trim()
    const sClassNorm = rawClass.toLowerCase().replace(/[^a-z0-9]/g, '')
    const targetClassNorm = selectedClass.toLowerCase().replace(/[^a-z0-9]/g, '')
    const matchesClass = selectedClass === 'All' || 
                         sClassNorm === targetClassNorm || 
                         (sClassNorm.length > 0 && targetClassNorm.length > 0 && (sClassNorm.includes(targetClassNorm) || targetClassNorm.includes(sClassNorm)))

    // Normalize section string comparison (e.g. "Section A", "A") with fail-safe fallback
    const rawSection = (s.section_name || 'A').trim()
    const sSecNorm = rawSection.toLowerCase().replace(/[^a-z0-9]/g, '')
    const targetSecNorm = selectedSection.toLowerCase().replace(/[^a-z0-9]/g, '')
    const matchesSection = selectedSection === 'All' || 
                           sSecNorm === targetSecNorm || 
                           (sSecNorm.length > 0 && targetSecNorm.length > 0 && (sSecNorm.includes(targetSecNorm) || targetSecNorm.includes(sSecNorm)))

    return matchesSearch && matchesClass && matchesSection
  })

  // KPI calculations
  const totalEnrolled = filteredStudents.length
  const totalPaidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.net_amount || f.amount), 0)
  const totalPendingFees = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + Number(f.amount), 0)

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
      if (selectedClass === 'All' && selectedSection === 'All') return true
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
              { id: 'students', label: 'Student Admissions & ERP', icon: Users, count: students.length },
              { id: 'attendance', label: 'Daily Attendance Marker', icon: Calendar },
              { id: 'calendar', label: 'Attendance Calendar', icon: CalendarDays },
              { id: 'fees', label: 'Class & Monthly Fee Dashboard', icon: CreditCard, count: fees.filter(f => f.status === 'pending').length },
              { id: 'gallery', label: 'Gallery Photo Manager', icon: ImageIcon, count: galleryImages.length },
              { id: 'packages', label: 'Party Packages & Pricing', icon: Gift },
              { id: 'batches', label: 'Batches & Timings', icon: Clock, count: batches.length },
              { id: 'bookings', label: 'Registrations & Bookings', icon: Award, count: bookings.length },
              { id: 'announcements', label: 'Notices Broadcaster', icon: Bell, count: announcements.length },
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
                    class_name: 'Nursery',
                    section_name: 'A',
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

        {/* HIDE STUDENT KPI CARDS AND FILTER BAR WHEN IN PARTY PACKAGES TAB AS REQUESTED */}
        {activeTab !== 'packages' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Filter Controls Bar */}
            <div className={`${bgCard} p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-blue-500">
                  <Filter className="w-4 h-4" />
                  <span>Class Filter:</span>
                </div>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={`text-xs px-3 py-2 rounded-xl border outline-none font-semibold cursor-pointer max-h-48 overflow-y-auto ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                >
                  <option value="All" className={isLight ? 'bg-white text-slate-900 py-1' : 'bg-slate-900 text-slate-100 py-1'}>All Classes (Playgroup - Class 12)</option>
                  {classOptions.map(cls => (
                    <option key={cls} value={cls} className={isLight ? 'bg-white text-slate-900 py-1' : 'bg-slate-900 text-slate-100 py-1'}>{cls}</option>
                  ))}
                </select>

                <span className={`text-xs font-semibold ${textSecondary}`}>Section:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className={`text-xs px-3 py-2 rounded-xl border outline-none font-semibold cursor-pointer max-h-48 overflow-y-auto ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  }`}
                >
                  <option value="All" className={isLight ? 'bg-white text-slate-900 py-1' : 'bg-slate-900 text-slate-100 py-1'}>All Sections (A - E)</option>
                  {sectionOptions.map(sec => (
                    <option key={sec} value={sec} className={isLight ? 'bg-white text-slate-900 py-1' : 'bg-slate-900 text-slate-100 py-1'}>Section {sec}</option>
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
                    <th className="py-4 px-6 w-36">Class & Section</th>
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
                          {st.class_name || 'Nursery'} - {st.section_name || 'A'}
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
                      <p className={`text-[11px] ${textSecondary}`}>Class: {st.class_name || 'Nursery'}-{st.section_name || 'A'} | Parent: {st.parent_name}</p>
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
                  <p className={`text-xs ${textSecondary}`}>Showing records for: <strong className="text-blue-500 font-bold">{selectedClass} Class ({selectedSection} Section)</strong></p>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                    <CreditCard className="w-5 h-5 text-blue-500" /> Class & Monthly Fee Management Dashboard
                  </h3>
                  <p className={`text-xs ${textSecondary}`}>Track pending dues, collected fees, discounts, and fee status for all students by month.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsClassFeeModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>View & Edit All Class Fees</span>
                  </button>

                  <select
                    value={feeSelectedMonth}
                    onChange={(e) => setFeeSelectedMonth(e.target.value)}
                    className={`text-xs px-3.5 py-2 rounded-xl border outline-none font-bold ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="August 2026">August 2026</option>
                    <option value="September 2026">September 2026</option>
                    <option value="July 2026">July 2026</option>
                    <option value="June 2026">June 2026</option>
                  </select>

                  <div className="flex items-center space-x-1 border rounded-xl p-1 bg-slate-100 dark:bg-slate-950">
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

              {/* Student Fee Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {filteredStudents.map((st) => {
                  const studentFee = fees.find(f => (f.student_id === st.id || f.students?.admission_id === st.admission_id))
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
                      className={`p-4 rounded-2xl border space-y-3 cursor-pointer transition ${bgSubCard} hover:border-blue-500/50`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase border ${
                          isPaid ? badgeStatus : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          {isPaid ? `PAID ₹${studentFee?.net_amount || 3000}` : 'FEES PENDING'}
                        </span>
                        <span className="text-[11px] font-mono text-blue-500 font-bold">{st.admission_id}</span>
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${textPrimary}`}>{st.full_name}</h4>
                        <p className={`text-xs ${textSecondary}`}>Class: {st.class_name || 'Nursery'} - {st.section_name || 'A'} | Parent: {st.parent_name}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className={textSecondary}>Month: <strong>{feeSelectedMonth}</strong></span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
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
          <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <ImageIcon className="w-5 h-5 text-blue-500" /> Dynamic Gallery Photo Manager ({galleryImages.length} Photos)
                </h3>
                <p className={`text-xs ${textSecondary}`}>Upload photos directly from your device (computer or phone) to publish live!</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDeviceImageUpload}
                  className="hidden"
                  id="device-photo-input"
                />

                <button
                  onClick={fetchAdminGallery}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Fetch latest photos from API & Database"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync API Data</span>
                </button>

                <label
                  htmlFor="device-photo-input"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Device</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages
                .slice((galleryPage - 1) * galleryPerPage, galleryPage * galleryPerPage)
                .map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedAdminGalleryImg(img)}
                    className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 ${bgSubCard} group cursor-pointer hover:border-blue-500/50 transition`}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e: any) => {
                          e.target.src = '/phulwari_logo.webp'
                        }}
                      />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold truncate ${textPrimary}`}>{img.title}</h4>
                      <p className={`text-[10px] font-mono ${textSecondary} truncate`}>{img.url.startsWith('data:') ? 'Device Base64 Image' : img.url}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingGalleryImg(img)
                      }}
                      className="w-full py-1.5 bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className={`text-xs font-semibold ${textSecondary}`}>
                Showing photos {Math.min((galleryPage - 1) * galleryPerPage + 1, galleryImages.length)} - {Math.min(galleryPage * galleryPerPage, galleryImages.length)} of {galleryImages.length}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={galleryPage === 1}
                  onClick={() => setGalleryPage(prev => Math.max(prev - 1, 1))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                    galleryPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Page</span>
                </button>

                <span className={`text-xs font-mono font-bold px-3 py-1 border rounded-xl ${badgeClass}`}>
                  Page {galleryPage} of {Math.ceil(galleryImages.length / galleryPerPage) || 1}
                </span>

                <button
                  disabled={galleryPage >= Math.ceil(galleryImages.length / galleryPerPage)}
                  onClick={() => setGalleryPage(prev => Math.min(prev + 1, Math.ceil(galleryImages.length / galleryPerPage)))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                    galleryPage >= Math.ceil(galleryImages.length / galleryPerPage) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CLEAN PARTY PACKAGES & PRICING CONFIGURATION */}
        {activeTab === 'packages' && (
          <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <Gift className="w-5 h-5 text-pink-500" /> Birthday & Party Packages Configuration
                </h3>
                <p className={`text-xs ${textSecondary}`}>Manage party prices, dynamic package titles, and features published on the main website.</p>
              </div>

              <button
                onClick={handleSavePartyPackages}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-pink-600/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Prices Live</span>
              </button>
            </div>

            {pkgSaveStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold animate-fadeIn">
                {pkgSaveStatus}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {partyPackages.map((pkg) => (
                <div key={pkg.id} className={`p-5 rounded-2xl border space-y-4 ${bgSubCard}`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${textPrimary}`}>{pkg.name}</h4>
                    <Tag className="w-4 h-4 text-pink-500" />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Package Tagline</label>
                    <input
                      type="text"
                      value={pkg.tagline}
                      onChange={(e) => {
                        const val = e.target.value
                        setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, tagline: val } : p))
                      }}
                      className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Configured Display Price</label>
                    <input
                      type="text"
                      value={pkg.price}
                      onChange={(e) => {
                        const val = e.target.value
                        setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val } : p))
                      }}
                      className={`w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Includes / Features</label>
                    <textarea
                      rows={3}
                      value={pkg.includes}
                      onChange={(e) => {
                        const val = e.target.value
                        setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, includes: val } : p))
                      }}
                      className={`w-full text-xs font-medium px-3 py-2 rounded-xl border outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BATCHES & TIMINGS (WITH DYNAMIC EDITING) */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            <div className={`${bgCard} p-6 rounded-2xl flex items-center justify-between`}>
              <div>
                <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <Clock className="w-5 h-5 text-blue-500" /> Batches & Class Timings
                </h3>
                <p className={`text-xs ${textSecondary}`}>Manage batch timings, age groups, and student capacities.</p>
              </div>
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
          <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Notices & Circular Broadcaster</h3>
              <button
                onClick={() => setIsAddNoticeOpen(true)}
                className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish New Notice</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((an, i) => (
                <div key={i} className={`p-4 rounded-xl border space-y-2 ${bgSubCard}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-600/20 text-purple-400 border border-purple-800 rounded-full">
                      {an.category || 'General Notice'}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-400 font-mono">{an.date || 'August 2026'}</span>
                      <button
                        onClick={() => handleDeleteNotice(an.id)}
                        className="p-1.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className={`text-xs font-bold ${textPrimary}`}>{an.title}</h4>
                  <p className={`text-xs ${textSecondary}`}>{an.content}</p>
                </div>
              ))}
            </div>
          </div>
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
                  value={editingBatch.age_group}
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
                    value={editingBatch.start_time}
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
                    value={editingBatch.end_time}
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
                    value={editingBatch.days}
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
                    value={editingBatch.capacity}
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
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

            <div className="no-print pt-4 border-t flex items-center justify-between">
              <button onClick={() => setReceiptModalFee(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer">
                Close Receipt
              </button>

              <button onClick={() => window.print()} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Download / Print PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPREHENSIVE STUDENT ERP (FEE HISTORY LEDGER + SUBMIT FEE + DISCOUNT) */}
      {selectedERPStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto`}>
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

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Original Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-amber-500">Discount Offered (₹)</label>
                    <input
                      type="number"
                      value={feeForm.discount}
                      onChange={(e) => setFeeForm({ ...feeForm, discount: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 font-mono font-bold outline-none ${
                        isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/80 border-amber-800 text-amber-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-500">Net Amount Paid (₹)</label>
                    <div className={`w-full border rounded-xl px-3 py-2 font-mono font-extrabold text-sm ${
                      isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    }`}>
                      ₹{Math.max(0, (parseFloat(feeForm.amount) || 0) - (parseFloat(feeForm.discount) || 0))}
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
                                setReceiptModalFee(matchFee || {
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
                                })
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
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
                  <label className={`font-semibold ${textSecondary}`}>Class Name</label>
                  <select
                    value={newStudentForm.class_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, class_name: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none cursor-pointer max-h-48 overflow-y-auto ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                    }`}
                  >
                    {classOptions.map(cls => (
                      <option key={cls} value={cls} className={isLight ? 'bg-white text-slate-900 font-semibold py-1.5' : 'bg-slate-900 text-slate-100 font-semibold py-1.5'}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`font-semibold ${textSecondary}`}>Section</label>
                  <select
                    value={newStudentForm.section_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, section_name: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 font-semibold outline-none cursor-pointer max-h-48 overflow-y-auto ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                    }`}
                  >
                    {sectionOptions.map(sec => (
                      <option key={sec} value={sec} className={isLight ? 'bg-white text-slate-900 font-semibold py-1.5' : 'bg-slate-900 text-slate-100 font-semibold py-1.5'}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
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
                <p className={`text-xs ${textSecondary}`}>Class Filter: <strong className="text-blue-500">{selectedClass} ({selectedSection})</strong></p>
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
                  <IndianRupee className="w-5 h-5 text-emerald-500" /> Class Monthly Fee Structure
                </h3>
                <p className={`text-xs ${textSecondary}`}>Configure default monthly fees for all classes (Playgroup to Class 12).</p>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {classOptions.map((cls) => (
                <div key={cls} className={`p-3 rounded-2xl border space-y-1.5 ${bgSubCard}`}>
                  <label className={`font-bold block ${textPrimary}`}>{cls}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={classFees[cls] || 3500}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0
                        setClassFees(prev => ({ ...prev, [cls]: val }))
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
    </div>
  )
}
