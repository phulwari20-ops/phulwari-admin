import React from 'react';

interface BookingsTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  badgePassword: string;
  bookings: any[];
}

export default function BookingsTab({
  bgCard, bgSubCard, textPrimary, textSecondary, badgePassword, bookings
}: BookingsTabProps) {
  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
      <h3 className={`text-sm font-bold ${textPrimary}`}>Online Registrations &amp; Bookings</h3>
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
  );
}
