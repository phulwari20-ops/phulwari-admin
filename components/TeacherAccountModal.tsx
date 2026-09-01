'use client'

import React, { useState, useEffect } from 'react'
import { X, ShieldCheck, UserCheck, Lock, Eye, EyeOff, Trash2, Power, Edit3 } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

interface TeacherAccountModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: any
  isLight: boolean
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
}

const AVAILABLE_TABS = [
  { id: 'dashboard', label: 'Dashboard & Home Analytics' },
  { id: 'students', label: 'Student Admissions & ERP' },
  { id: 'student_list', label: 'Student Master Directory' },
  { id: 'teachers', label: 'Teacher Management' },
  { id: 'attendance', label: 'Daily Attendance Marker' },
  { id: 'fees', label: 'Fee Management & Dues' },
  { id: 'gallery', label: 'Gallery Photo Manager' },
  { id: 'bookings', label: 'Registrations & Bookings' },
  { id: 'blogs', label: 'Blogs CMS Editor' }
]

export default function TeacherAccountModal({
  isOpen, onClose, teacher, isLight, bgCard, bgSubCard, textPrimary, textSecondary
}: TeacherAccountModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [accountId, setAccountId] = useState<string | null>(null)
  const [email, setEmail] = useState(teacher?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['dashboard', 'attendance'])
  const [status, setStatus] = useState<'active' | 'deactivated'>('active')

  useEffect(() => {
    if (isOpen && teacher) {
      checkExistingAccount()
      setEmail(teacher.email || '')
    }
  }, [isOpen, teacher])

  const checkExistingAccount = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'Staff Account')
        .order('created_at', { ascending: false })

      if (data) {
        const existing = data.find(r => {
          try {
            const notes = JSON.parse(r.notes || '{}')
            return notes.linked_teacher_id === teacher.id
          } catch(e) {
            return r.email === teacher.email
          }
        })
        if (existing) {
          setAccountId(existing.id)
          setEmail(existing.email)
          setStatus(existing.status === 'deactivated' ? 'deactivated' : 'active')
          try {
            const notes = JSON.parse(existing.notes || '{}')
            setPassword(notes.password || '')
            if (notes.permissions) setSelectedPermissions(notes.permissions)
          } catch(e) {}
        } else {
          setAccountId(null)
          setPassword('')
        }
      }
    } catch (err: any) {
      setErrorMsg('Failed to fetch existing account.')
    }
    setLoading(false)
  }

  const handleTogglePermission = (tabId: string) => {
    if (selectedPermissions.includes(tabId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== tabId))
    } else {
      setSelectedPermissions([...selectedPermissions, tabId])
    }
  }

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email || !password) {
      setErrorMsg('Email and Password are required.')
      return
    }

    setLoading(true)
    try {
      const notesJson = {
        password: password,
        permissions: selectedPermissions,
        linked_teacher_id: teacher.id,
        created_by: 'Master Admin'
      }

      if (accountId) {
        // Update existing
        const { error } = await supabase
          .from('bookings')
          .update({
            parent_name: teacher.name,
            phone: teacher.phone || '0000000000',
            email: email.trim().toLowerCase(),
            child_name: 'Teacher',
            notes: JSON.stringify(notesJson),
            status: status
          })
          .eq('id', accountId)
        if (error) throw error
        setSuccessMsg('Account updated successfully!')
      } else {
        // Create new
        const { error } = await supabase
          .from('bookings')
          .insert([{
            booking_type: 'Staff Account',
            parent_name: teacher.name,
            phone: teacher.phone || '0000000000',
            email: email.trim().toLowerCase(),
            child_name: 'Teacher',
            notes: JSON.stringify(notesJson),
            status: status
          }])
        if (error) throw error
        setSuccessMsg('Teacher Account created successfully!')
        checkExistingAccount()
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    }
    setLoading(false)
  }

  const handleToggleStatus = async () => {
    if (!accountId) return
    const nextStatus = status === 'active' ? 'deactivated' : 'active'
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: nextStatus })
        .eq('id', accountId)
      if (error) throw error
      setStatus(nextStatus)
      setSuccessMsg(`Account status changed to ${nextStatus.toUpperCase()}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update status.')
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (!accountId) return
    if (!confirm(`Are you sure you want to delete login credentials for ${teacher.name}?`)) return
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', accountId)
      if (error) throw error
      setAccountId(null)
      setPassword('')
      setSuccessMsg('Account credentials permanently deleted.')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete account.')
    }
    setLoading(false)
  }

  if (!isOpen || !teacher) return null

  const inputCls = "w-full px-4 py-2.5 rounded-xl border outline-none font-semibold text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-slate-400"

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
      <div className={`${bgCard} rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Teacher Portal Account
            </h3>
            <p className={`text-xs ${textSecondary}`}>Manage login credentials for {teacher.name}</p>
          </div>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-6 h-6" /></button>
        </div>

        {/* Existing Account Status & Quick Actions Bar */}
        {accountId && (
          <div className="mt-4 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-slate-600 dark:text-slate-300">Credentials Active:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${status === 'active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  status === 'active' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{status === 'active' ? 'Deactivate' : 'Activate'}</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveAccount} className="space-y-6 mt-4">
          {errorMsg && <div className="p-3 bg-rose-500/10 text-rose-600 text-xs font-bold rounded-xl">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-xl">{successMsg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>Login Email (Username)</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                placeholder="teacher@phulwari.co.in"
                className={inputCls}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  placeholder="••••••••"
                  className={inputCls}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-500 cursor-pointer">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>Account Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                className={inputCls}
              >
                <option value="active">Active (Can Login)</option>
                <option value="deactivated">Deactivated (Login Blocked)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>Role</label>
              <input 
                type="text" 
                value="Teacher / Faculty" 
                disabled
                className={`${inputCls} opacity-70 bg-slate-100 dark:bg-slate-800 cursor-not-allowed`}
              />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${bgSubCard}`}>
            <h4 className={`text-sm font-bold mb-3 ${textPrimary}`}>Access Permissions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_TABS.map(tab => (
                <label key={tab.id} onClick={(e) => { e.preventDefault(); handleTogglePermission(tab.id) }} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedPermissions.includes(tab.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400 group-hover:border-indigo-500'}`}>
                    {selectedPermissions.includes(tab.id) && <UserCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-xs font-semibold ${selectedPermissions.includes(tab.id) ? textPrimary : textSecondary}`}>{tab.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              {accountId && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Account configured (Click Update to save changes)
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="w-4 h-4" /> {accountId ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
