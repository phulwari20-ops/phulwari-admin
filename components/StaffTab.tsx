'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, UserPlus, Trash2, CheckSquare, Square, Eye, EyeOff, Edit, UserX, UserCheck, X as XIcon, AlertTriangle } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  roleName: string
  permissions: string[]
  password?: string
  status: 'active' | 'deactivated'
}

interface ConfirmDialogState {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
}

interface StaffTabProps {
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  isLight: boolean
}

// Predefined staff designations. Anything not in this list is a custom "Other" role.
const PRESET_ROLES = [
  'Front Desk Executive',
  'ERP Manager',
  'Coaching Instructor',
  'Receptionist',
  'Administrator Support'
]

// Available tabs list for custom permissions
const AVAILABLE_TABS = [
  { id: 'dashboard', label: 'Dashboard & Home Analytics' },
  { id: 'students', label: 'Student Admissions & ERP' },
  { id: 'student_list', label: 'Student Master Directory' },
  { id: 'deactivated', label: 'Deactivated Students' },
  { id: 'teachers', label: 'Teacher Management' },
  { id: 'batches', label: 'Batches & Class Timings' },
  { id: 'attendance', label: 'Daily Attendance Marker' },
  { id: 'fees', label: 'Fee Management & Dues' },
  { id: 'gallery', label: 'Gallery Photo Manager' },
  { id: 'packages', label: 'Party Packages & Pricing' },
  { id: 'birthday_page', label: 'Birthday Landing Page' },
  { id: 'announcements', label: 'Notices Broadcaster' },
  { id: 'bookings', label: 'Registrations & Bookings' },
  { id: 'blogs', label: 'Blogs CMS Editor' },
  { id: 'reviews', label: 'Parent Reviews & Ratings' },
  { id: 'birthdays', label: 'Birthday Alerts' },
  { id: 'renewals', label: 'Renewal Alerts' },
  { id: 'fee_alerts', label: 'Fee Alerts' },
  { id: 'enquiries', label: 'Lead & Enquiry Manager' }
]

export default function StaffTab({ bgCard, bgSubCard, textPrimary, textSecondary, isLight }: StaffTabProps) {
  const supabase = createClient()
  
  // State variables
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [savingPermStaffId, setSavingPermStaffId] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmDialogState>({
    open: false, title: '', message: '', confirmLabel: 'Confirm',
    confirmClass: 'bg-rose-600 hover:bg-rose-700', onConfirm: () => {}
  })

  // Form states
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleName, setRoleName] = useState('Front Desk Executive')
  const [isOtherRole, setIsOtherRole] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['dashboard', 'enquiries'])
  const [showPassword, setShowPassword] = useState(false)

  // Fetch staff members from Supabase bookings table
  const fetchStaff = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'Staff Account')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const formatted: StaffMember[] = data.map((rec: any) => {
          let notesObj: any = {}
          try {
            notesObj = JSON.parse(rec.notes || '{}')
          } catch (e) {}

          return {
            id: rec.id,
            name: rec.parent_name,
            email: rec.email,
            phone: rec.phone,
            roleName: rec.child_name || 'Staff Member',
            permissions: notesObj.permissions || [],
            password: notesObj.password || '',
            status: rec.status === 'deactivated' ? 'deactivated' : 'active'
          }
        })
        setStaffList(formatted)
      }
    } catch (err: any) {
      setErrorMsg('Failed to load staff accounts: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  // Toggle permission checkbox
  const handleTogglePermission = (tabId: string) => {
    if (selectedPermissions.includes(tabId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== tabId))
    } else {
      setSelectedPermissions([...selectedPermissions, tabId])
    }
  }

  // Toggle all permissions
  const handleToggleSelectAll = () => {
    if (selectedPermissions.length === AVAILABLE_TABS.length) {
      setSelectedPermissions([])
    } else {
      setSelectedPermissions(AVAILABLE_TABS.map(t => t.id))
    }
  }

  // Save or update staff account
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name || !email || !password || !phone) {
      setErrorMsg('Please fill in all the required fields.')
      return
    }

    if (!roleName.trim()) {
      setErrorMsg('Please specify the staff designation / role.')
      return
    }

    if (selectedPermissions.length === 0) {
      setErrorMsg('Please select at least one permission/tab for this staff account.')
      return
    }

    setLoading(true)
    try {
      const notesJson = {
        password: password,
        permissions: selectedPermissions,
        created_by: 'Master Admin'
      }

      if (editingStaff) {
        // Update staff
        const emailExists = staffList.some(s => s.id !== editingStaff.id && s.email.toLowerCase() === email.toLowerCase().trim())
        if (emailExists) {
          throw new Error('A staff account with this email/username already exists.')
        }

        const { error } = await supabase
          .from('bookings')
          .update({
            parent_name: name.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            child_name: roleName.trim(), // Designation
            notes: JSON.stringify(notesJson)
          })
          .eq('id', editingStaff.id)

        if (error) throw error

        setSuccessMsg(`Staff account for ${name} updated successfully!`)
        setEditingStaff(null)
      } else {
        // Create new staff
        const emailExists = staffList.some(s => s.email.toLowerCase() === email.toLowerCase().trim())
        if (emailExists) {
          throw new Error('A staff account with this email/username already exists.')
        }

        const { error } = await supabase.from('bookings').insert([
          {
            booking_type: 'Staff Account',
            parent_name: name.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            child_name: roleName.trim(), // designation
            child_age: null,
            event_date: null,
            status: 'active',
            notes: JSON.stringify(notesJson)
          }
        ])

        if (error) throw error

        setSuccessMsg(`Staff account for ${name} created successfully!`)
      }

      // Reset form
      setName('')
      setEmail('')
      setPhone('')
      setRoleName('Front Desk Executive')
      setIsOtherRole(false)
      setPassword('')
      setSelectedPermissions(['dashboard', 'enquiries'])

      // Reload staff
      fetchStaff()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save staff account.')
    } finally {
      setLoading(false)
    }
  }

  // ── INLINE: Remove a permission from a staff card and save to DB ──
  const handleRemovePermissionInline = async (staff: StaffMember, permId: string) => {
    const updatedPerms = staff.permissions.filter(p => p !== permId)
    setSavingPermStaffId(staff.id)
    setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, permissions: updatedPerms } : s))
    try {
      const { data: rec } = await supabase.from('bookings').select('notes').eq('id', staff.id).single()
      let notesObj: any = {}
      try { notesObj = JSON.parse(rec?.notes || '{}') } catch (e) {}
      notesObj.permissions = updatedPerms
      const { error } = await supabase.from('bookings').update({ notes: JSON.stringify(notesObj) }).eq('id', staff.id)
      if (error) throw error
      setSuccessMsg(`Permission removed for ${staff.name}`)
    } catch (err: any) {
      setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, permissions: staff.permissions } : s))
      setErrorMsg('Failed to update permissions: ' + err.message)
    } finally { setSavingPermStaffId(null) }
  }

  // ── INLINE: Restore a revoked permission on a staff card ──
  const handleAddPermissionInline = async (staff: StaffMember, permId: string) => {
    if (staff.permissions.includes(permId)) return
    const updatedPerms = [...staff.permissions, permId]
    setSavingPermStaffId(staff.id)
    setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, permissions: updatedPerms } : s))
    try {
      const { data: rec } = await supabase.from('bookings').select('notes').eq('id', staff.id).single()
      let notesObj: any = {}
      try { notesObj = JSON.parse(rec?.notes || '{}') } catch (e) {}
      notesObj.permissions = updatedPerms
      const { error } = await supabase.from('bookings').update({ notes: JSON.stringify(notesObj) }).eq('id', staff.id)
      if (error) throw error
      setSuccessMsg(`Permission granted for ${staff.name}`)
    } catch (err: any) {
      setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, permissions: staff.permissions } : s))
      setErrorMsg('Failed to update permissions: ' + err.message)
    } finally { setSavingPermStaffId(null) }
  }

  // ── DEACTIVATE / REACTIVATE staff ──
  const handleToggleDeactivateStaff = (staff: StaffMember) => {
    const isActive = staff.status === 'active'
    setConfirmState({
      open: true,
      title: isActive ? '⚠️ Deactivate Staff Account?' : '✅ Reactivate Staff Account?',
      message: isActive
        ? `This will block "${staff.name}" from logging in. Their data and permissions are preserved.`
        : `This will restore login access for "${staff.name}" with all their permissions.`,
      confirmLabel: isActive ? 'Yes, Deactivate' : 'Yes, Reactivate',
      confirmClass: isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, open: false }))
        setLoading(true)
        try {
          const newStatus = isActive ? 'deactivated' : 'active'
          const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', staff.id)
          if (error) throw error
          setSuccessMsg(`Staff account "${staff.name}" ${isActive ? 'deactivated' : 'reactivated'} successfully!`)
          setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, status: newStatus as 'active' | 'deactivated' } : s))
        } catch (err: any) {
          setErrorMsg('Failed to update status: ' + err.message)
        } finally { setLoading(false) }
      }
    })
  }

  // ── DELETE staff account ──
  const handleDeleteStaff = (staff: StaffMember) => {
    setConfirmState({
      open: true,
      title: '🗑️ Delete Staff Account?',
      message: `This will permanently delete "${staff.name}" (${staff.email}). This cannot be undone.`,
      confirmLabel: 'Yes, Delete Permanently',
      confirmClass: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, open: false }))
        setErrorMsg('')
        setSuccessMsg('')
        setLoading(true)
        try {
          const { error } = await supabase.from('bookings').delete().eq('id', staff.id)
          if (error) throw error
          setSuccessMsg(`Staff account "${staff.name}" deleted permanently!`)
          if (editingStaff?.id === staff.id) {
            setEditingStaff(null)
            setName('')
            setEmail('')
            setPhone('')
            setRoleName('Front Desk Executive')
            setIsOtherRole(false)
        setPassword('')
            setPassword('')
            setSelectedPermissions(['dashboard', 'enquiries'])
          }
          fetchStaff()
        } catch (err: any) {
          setErrorMsg('Failed to delete staff: ' + err.message)
        } finally { setLoading(false) }
      }
    })
  }

  const handleDeleteStaffLegacy = async (_id: string, _staffName: string) => { /* kept for reference */ }

  return (
    <div className="space-y-6">
      {/* ── Confirm Dialog ── */}
      {confirmState.open && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">{confirmState.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{confirmState.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmState(prev => ({ ...prev, open: false }))}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmState.onConfirm}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl text-xs cursor-pointer transition ${confirmState.confirmClass}`}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Notices */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 rounded-2xl text-xs font-bold font-mono flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="ml-3 cursor-pointer shrink-0"><XIcon className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-2xl text-xs font-bold font-mono flex items-center justify-between">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-3 cursor-pointer shrink-0"><XIcon className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CREATE / EDIT STAFF ACCOUNT FORM */}
        <div className={`${bgCard} p-6 rounded-3xl border border-slate-200/50 shadow-sm col-span-1 h-fit`}>
          <div className="flex items-center gap-2 mb-5">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className={`font-black text-sm ${textPrimary}`}>{editingStaff ? 'Edit Staff Account' : 'Create Staff Account'}</h3>
          </div>

          <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
            <div>
              <label className={`block font-bold mb-1 ${textSecondary}`}>Staff Full Name *</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${textSecondary}`}>Username / Email *</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="staff@phulwari.co.in"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-semibold text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${textSecondary}`}>Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-blue-500 font-semibold text-slate-800 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${textSecondary}`}>WhatsApp Number *</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-semibold text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${textSecondary}`}>Designation / Role *</label>
              <select
                value={isOtherRole ? '__other__' : roleName}
                onChange={e => {
                  if (e.target.value === '__other__') {
                    setIsOtherRole(true)
                    setRoleName('')
                  } else {
                    setIsOtherRole(false)
                    setRoleName(e.target.value)
                  }
                }}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-semibold text-slate-800"
              >
                {PRESET_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="__other__">Other (Specify / Mention)</option>
              </select>

              {isOtherRole && (
                <input
                  type="text"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="Please specify designation / role"
                  className="w-full mt-2 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-semibold text-slate-800"
                  autoFocus
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : editingStaff ? 'Update Account' : 'Create Account'}</span>
            </button>

            {editingStaff && (
              <button
                type="button"
                onClick={() => {
                  setEditingStaff(null)
                  setName('')
                  setEmail('')
                  setPhone('')
                  setRoleName('Front Desk Executive')
                  setIsOtherRole(false)
                  setPassword('')
                  setSelectedPermissions(['dashboard', 'enquiries'])
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-center cursor-pointer transition"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* ACCESS PERMISSIONS CONFIGURATOR */}
        <div className={`${bgCard} p-6 rounded-3xl border border-slate-200/50 shadow-sm col-span-1 flex flex-col h-full max-h-[580px]`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className={`font-black text-sm ${textPrimary}`}>Staff Permissions</h3>
            </div>
            <button 
              type="button" 
              onClick={handleToggleSelectAll} 
              className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-bold text-slate-600 cursor-pointer"
            >
              {selectedPermissions.length === AVAILABLE_TABS.length ? 'Clear All' : 'Select All'}
            </button>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 space-y-2 text-xs">
            {AVAILABLE_TABS.map(tab => {
              const isChecked = selectedPermissions.includes(tab.id)
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTogglePermission(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-bold transition cursor-pointer ${
                    isChecked 
                      ? 'bg-indigo-500/5 border-indigo-200 text-indigo-700' 
                      : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ACTIVE STAFF DIRECTORY */}
        <div className={`${bgCard} p-6 rounded-3xl border border-slate-200/50 shadow-sm col-span-1 flex flex-col h-full max-h-[580px]`}>
          <h3 className={`font-black text-sm mb-4 ${textPrimary}`}>Active Staff Directory</h3>

          <div className="overflow-y-auto flex-1 space-y-3">
            {loading && staffList.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono">Loading directory...</p>
            ) : staffList.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono">No staff accounts registered yet.</p>
            ) : (
              staffList.map(staff => {
                const isDeactivated = staff.status === 'deactivated'
                const isSavingPerm = savingPermStaffId === staff.id

                return (
                  <div
                    key={staff.id}
                    className={`p-4 rounded-2xl border text-xs space-y-3 ${
                      isDeactivated
                        ? 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/10 dark:border-amber-900/40 opacity-80'
                        : isLight ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* Name + Status + Action Buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className={`shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                          isDeactivated
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        }`}>
                          {isDeactivated ? '⛔ Suspended' : '✅ Active'}
                        </span>
                        <p className={`font-extrabold truncate ${textPrimary}`}>{staff.name}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingStaff(staff)
                            setName(staff.name)
                            setEmail(staff.email)
                            setPhone(staff.phone)
                            setRoleName(staff.roleName)
                            setIsOtherRole(!PRESET_ROLES.includes(staff.roleName))
                            setPassword(staff.password || '')
                            setSelectedPermissions(staff.permissions)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                          title="Edit Staff"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Deactivate / Reactivate */}
                        <button
                          onClick={() => handleToggleDeactivateStaff(staff)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isDeactivated
                              ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800'
                              : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-slate-800'
                          }`}
                          title={isDeactivated ? 'Reactivate Staff' : 'Deactivate Staff'}
                        >
                          {isDeactivated ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteStaff(staff)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition cursor-pointer"
                          title="Delete Staff Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Email + Role + Phone */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-blue-500 font-mono truncate">{staff.email}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-bold">{staff.roleName}</span>
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] rounded font-mono font-bold">📲 {staff.phone}</span>
                      </div>
                    </div>

                    {/* ─── Permission chips with inline remove/add ─── */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <p className="font-extrabold text-[10px] text-slate-400">
                          Permissions ({staff.permissions.length}/{AVAILABLE_TABS.length}):
                        </p>
                        {isSavingPerm && <span className="text-[9px] text-blue-400 font-semibold animate-pulse">saving…</span>}
                      </div>

                      {/* Active permissions */}
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions.length === 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold italic">No permissions granted</span>
                        )}
                        {AVAILABLE_TABS.filter(t => staff.permissions.includes(t.id)).map(tab => (
                          <span
                            key={tab.id}
                            className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] rounded-full font-bold"
                          >
                            <span>{tab.label.split(' ')[0]}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePermissionInline(staff, tab.id)}
                              disabled={isSavingPerm}
                              title={`Remove "${tab.label}"`}
                              className="w-3.5 h-3.5 flex items-center justify-center text-indigo-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full cursor-pointer transition disabled:opacity-40"
                            >
                              <XIcon className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Revoked permissions */}
                      {AVAILABLE_TABS.filter(t => !staff.permissions.includes(t.id)).length > 0 && (
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Revoked — click to restore:</p>
                          <div className="flex flex-wrap gap-1">
                            {AVAILABLE_TABS.filter(t => !staff.permissions.includes(t.id)).map(tab => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleAddPermissionInline(staff, tab.id)}
                                disabled={isSavingPerm}
                                title={`Grant "${tab.label}"`}
                                className="flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] rounded-full font-bold hover:bg-emerald-100 hover:text-emerald-700 cursor-pointer transition disabled:opacity-40"
                              >
                                + {tab.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
