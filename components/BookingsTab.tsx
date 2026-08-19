'use client'

import React, { useState } from 'react'
import { Award, Calendar, Users, Cake, Phone, MessageSquare, Trash2, ShieldCheck, Heart, Sparkles } from 'lucide-react'

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
  isLight
}: BookingsTabProps) {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All')
  const [selectedPackageFilter, setSelectedPackageFilter] = useState<string>('All')

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
    // 1. Booking Type Filter
    if (selectedTypeFilter !== 'All' && b.booking_type !== selectedTypeFilter) return false

    // 2. Package Filter
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

          // Dynamic colors per package selection
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

                  <button
                    onClick={() => handleDeleteBooking(bk.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition shrink-0 cursor-pointer"
                    title="Delete Booking Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex items-center space-x-2 text-[10px]">
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

                <button
                  onClick={() => handleWhatsAppFollowUp(bk, pkgSelection)}
                  className="px-3.5 py-1.5 bg-[#34B36B] hover:bg-[#2e9e5e] text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-md shadow-[#34B36B]/20 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Lead</span>
                </button>
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
    </div>
  )
}
