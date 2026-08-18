'use client'

import React from 'react'
import { X, UserPlus } from 'lucide-react'

interface AddTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  teacherForm: any
  setTeacherForm: (val: any) => void
  handleTeacherSubmit: (e: React.FormEvent) => void
  editingTeacher: any
  batches: any[]
  isLight: boolean
  bgCard: string
  textPrimary: string
  textSecondary: string
}

export default function AddTeacherModal({
  isOpen,
  onClose,
  teacherForm,
  setTeacherForm,
  handleTeacherSubmit,
  editingTeacher,
  batches,
  isLight,
  bgCard,
  textPrimary,
  textSecondary
}: AddTeacherModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${bgCard} rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <UserPlus className="w-5 h-5 text-indigo-500" /> {editingTeacher ? 'Edit Teacher Details' : 'Add New Faculty Teacher'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer">
              {editingTeacher ? 'Save Changes' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
