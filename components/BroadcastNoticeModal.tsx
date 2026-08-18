'use client'

import React from 'react'
import { X, Send } from 'lucide-react'

interface BroadcastNoticeModalProps {
  isOpen: boolean
  onClose: () => void
  noticeForm: any
  setNoticeForm: (val: any) => void
  handleNoticeSubmit: (e: React.FormEvent) => void
  isLight: boolean
  bgCard: string
  textPrimary: string
  textSecondary: string
}

export default function BroadcastNoticeModal({
  isOpen,
  onClose,
  noticeForm,
  setNoticeForm,
  handleNoticeSubmit,
  isLight,
  bgCard,
  textPrimary,
  textSecondary
}: BroadcastNoticeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Send className="w-5 h-5 text-purple-500" /> Broadcast Notice & Circular
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 cursor-pointer">
              Publish Notice Live
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
