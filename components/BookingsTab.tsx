'use client'

import React, { useState } from 'react'
import { Award, Calendar, Users, Cake, Phone, MessageSquare, Trash2, Edit3, X, Save, ShieldCheck } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

interface BookingsTabProps {
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  badgePassword: string
  bookings: any[]
  handleUpdateBookingStatus: (id: string, status: string) => void
  handleDeleteBooking: (id: string) => void
  partyPackages: any[]
  isLight: boolean
  loadAllAdminData?: () => Promise<void>
}

export default function BookingsTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  badgePassword,
  bookings = [],
  handleUpdateBookingStatus,
  handleDeleteBooking,
  partyPackages = [],
  isLight,
  loadAllAdminData
}: BookingsTabProps) {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All')
  const [selectedPackageFilter, setSelectedPackageFilter] = useState<string>('All')

  // Edit Modal State
  const [editingBooking, setEditingBooking] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({
    parent_name: '',
    phone: '',
    email: '',
    event_date: '',
    child_age: '',
    status: 'New',
    package_selection: 'None',
    guests: '',
    requirements: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)

  // Available Booking Types
  const uniqueTypes = Array.from(new Set(bookings.map(b => b.booking_type).filter(Boolean)))

  // Available Packages listed from bookings
  const uniquePackages = Array.from(new Set(
    bookings.map(b => {
      try {
        const notesObj = JSON.parse(b.notes || '{}')
        return notesObj.package_selection
      } catch (_) {
        return null
      }
    }).filter(Boolean)
  ))

  // Filter Bookings List
  const filteredBookings = bookings.filter(b => {
    if (selectedTypeFilter !== 'All' && b.booking_type !== selectedTypeFilter) return false

    if (selectedPackageFilter !== 'All') {
      try {
        const notesObj = JSON.parse(b.notes || '{}')
        if (notesObj.package_selection !== selectedPackageFilter) return false
      } catch (_) {
        return false
      }
    }
    return true
  })

  // Prefilled WhatsApp handler for lead follow-up
  const handleWhatsAppFollowUp = (bk: any, pkgName: string) => {
    const text = `Hi ${bk.parent_name}! 🎈\nThis is Phulwari Centre Support. We received your booking inquiry for the *${pkgName}* birthday party celebration scheduled on *${bk.event_date || 'your selected date'}.*\n\nIs it a good time to connect and finalize your arrangements?`
    window.open(`https://wa.me/${bk.phone.replace(/[^0-9]/g, '') || '916207368839'}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const openEditModal = (bk: any) => {
    let notesObj: any = {}
    try {
      notesObj = JSON.parse(bk.notes || '{}')
    } catch (_) {}

    setEditingBooking(bk)
    setEditForm({
      parent_name: bk.parent_name || '',
      phone: bk.phone || '',
      email: bk.email || '',
      event_date: bk.event_date || '',
      child_age: bk.child_age !== null && bk.child_age !== undefined ? String(bk.child_age) : '',
      status: bk.status || 'New',
      package_selection: notesObj.package_selection || 'None',
      guests: notesObj.guests || '',
      requirements: notesObj.requirements || ''
    })
  }

  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBooking) return
    setSaveLoading(true)

    try {
      let notesObj: any = {}
      try {
        notesObj = JSON.parse(editingBooking.notes || '{}')
      } catch (_) {}

      notesObj.package_selection = editForm.package_selection
      notesObj.guests = editForm.guests
      notesObj.requirements = editForm.requirements

      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({
          parent_name: editForm.parent_name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim(),
          event_date: editForm.event_date || null,
          child_age: editForm.child_age !== '' ? Number(editForm.child_age) : null,
          status: editForm.status,
          notes: JSON.stringify(notesObj)
        })
        .eq('id', editingBooking.id)

      if (error) throw error

      if (loadAllAdminData) {
        await loadAllAdminData()
      } else {
        editingBooking.parent_name = editForm.parent_name.trim()
        editingBooking.phone = editForm.phone.trim()
        editingBooking.email = editForm.email.trim()
        editingBooking.event_date = editForm.event_date
        editingBooking.child_age = editForm.child_age !== '' ? Number(editForm.child_age) : null
        editingBooking.status = editForm.status
        editingBooking.notes = JSON.stringify(notesObj)
      }

      setEditingBooking(null)
      alert('✅ Booking record updated successfully!')
    } catch (err: any) {
      console.error(err)
      alert(`❌ Failed to update booking: ${err.message || 'Error'}`)
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      {/* Header section with details */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Award className="w-5 h-5 text-purple-500" /> Lead Bookings &amp; Camp Registrations
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage birthday reservations, summer/winter camps registrations, and custom party requests.</p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Booking Type:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold shrink-0 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t.replace('User Panel / ', '')}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Birthday Package:</span>
            <select
              value={selectedPackageFilter}
              onChange={(e) => setSelectedPackageFilter(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold shrink-0 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            >
              <option value="All">All Packages</option>
              <option value="None">None / Custom Quote</option>
              {uniquePackages.map(pkg => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBookings.map((bk) => {
          let notesObj: any = {}
          try {
            notesObj = JSON.parse(bk.notes || '{}')
          } catch (_) {}

          const pkgSelection = notesObj.package_selection || 'None / Custom Quote'
          const guestCount = notesObj.guests || 'N/A'
          const requirements = notesObj.requirements || ''
          const paymentStatus = notesObj.payment_status || 'Pending'

          const isBirthdayLead = bk.booking_type?.toLowerCase().includes('birthday')

          const isPremium = pkgSelection.toLowerCase().includes('premium')
          const isBasic = pkgSelection.toLowerCase().includes('basic')
          const pkgBadgeClass = isPremium 
            ? 'bg-[#FF4D8D]/10 text-[#FF4D8D] border-[#FF4D8D]/20'
            : isBasic 
            ? 'bg-[#34B36B]/10 text-[#34B36B] border-[#34B36B]/20'
            : 'bg-purple-600/10 text-purple-500 border-purple-500/20'

          return (
            <div key={bk.id} className={`p-5 rounded-2xl border space-y-4 relative group flex flex-col justify-between ${bgSubCard} hover:shadow-lg transition`}>
              <div className="space-y-3">
                {/* Top header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wide font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500">
                      {bk.booking_type?.replace('User Panel / ', '')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(bk)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition shrink-0 cursor-pointer"
                      title="Edit Booking Record"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBooking(bk.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition shrink-0 cursor-pointer"
                      title="Delete Booking Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-1.5 text-xs">
                  <h4 className={`text-sm font-black ${textPrimary}`}>{bk.parent_name}</h4>
                  <p className="text-blue-500 font-mono text-[10px]">{bk.email || 'No email provided'}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2 py-0.5 bg-slate-200/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[10px] rounded font-mono font-bold">
                      📲 {bk.phone}
                    </span>
                    {bk.event_date && (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] rounded font-mono font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Date: {bk.event_date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom Birthday lead info */}
                {isBirthdayLead && (
                  <div className="p-3 bg-slate-100/50 dark:bg-slate-950/60 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-slate-800">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pkgBadgeClass}`}>
                        {pkgSelection}
                      </span>
                      {bk.child_age !== null && (
                        <span className="text-[10px] font-extrabold text-pink-500 flex items-center gap-0.5">
                          <Cake className="w-3.5 h-3.5" /> Turning: {bk.child_age}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <p><span className="text-slate-400">Expected Guests:</span> <strong className={textPrimary}>{guestCount}</strong></p>
                      <p><span className="text-slate-400">Payment status:</span> <strong className="text-amber-500 uppercase">{paymentStatus}</strong></p>
                    </div>
                    {requirements && (
                      <p className="text-[10px] text-slate-500 border-t pt-1.5 border-slate-200 dark:border-slate-800 italic leading-snug">
                        💡 Requirements: "{requirements}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex items-center space-x-1.5 text-[10px]">
                  <span className="font-extrabold text-slate-400">Status:</span>
                  <select
                    value={bk.status || 'New'}
                    onChange={(e) => handleUpdateBookingStatus(bk.id, e.target.value)}
                    className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                      bk.status === 'New' 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        : bk.status === 'Follow-up'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        : bk.status === 'Confirmed'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}
                  >
                    <option value="New">New</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <a
                    href={`tel:${bk.phone?.replace(/[^0-9+]/g, '')}`}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
                    title="Call Lead"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => openEditModal(bk)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppFollowUp(bk, pkgSelection)}
                    className="px-3 py-1.5 bg-[#34B36B] hover:bg-[#2e9e5e] text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(bk.id)}
                    className="px-2 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredBookings.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 text-xs font-mono">
            No registrations found matching the filters.
          </div>
        )}
      </div>

      {/* EDIT BOOKING MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative border border-purple-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" /> Edit Registration Record
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingBooking(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookingEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parent / Contact Name</label>
                <input
                  type="text"
                  required
                  value={editForm.parent_name}
                  onChange={(e) => setEditForm({ ...editForm, parent_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone No.</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={editForm.event_date}
                    onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-semibold text-slate-900 dark:text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Child Age</label>
                  <input
                    type="number"
                    value={editForm.child_age}
                    onChange={(e) => setEditForm({ ...editForm, child_age: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 outline-none font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Package Selection</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Birthday Celebration"
                  value={editForm.package_selection}
                  onChange={(e) => setEditForm({ ...editForm, package_selection: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Requirements / Remarks</label>
                <textarea
                  rows={2}
                  value={editForm.requirements}
                  onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
