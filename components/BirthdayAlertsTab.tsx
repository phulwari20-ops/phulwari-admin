import React from 'react';
import { Cake, Phone, Mail, User, Clock, AlertCircle } from 'lucide-react';

interface BirthdayAlertsTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  students: any[];
}

export default function BirthdayAlertsTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  isLight,
  students
}: BirthdayAlertsTabProps) {

  const getBirthdayInfo = (dobStr: string) => {
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Set target birthday in current year
    const bdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
    
    // Reset hours to compare dates cleanly
    const tDate = new Date(currentYear, today.getMonth(), today.getDate());
    const bDate = new Date(currentYear, dob.getMonth(), dob.getDate());
    
    let diffTime = bDate.getTime() - tDate.getTime();
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If birthday already passed this year (diffDays < 0), check next year
    if (diffDays < 0) {
      const bdayNextYear = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
      const tDateNext = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      diffTime = bdayNextYear.getTime() - tDateNext.getTime();
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate age turning
    const birthYear = dob.getFullYear();
    const turningYear = (bDate.getTime() >= tDate.getTime()) ? currentYear : currentYear + 1;
    const ageTurning = turningYear - birthYear;

    return {
      daysLeft: diffDays,
      ageTurning,
      birthdayDate: dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      dobFormatted: dob.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  const analyzedStudents = students
    .map(st => {
      const bdayInfo = getBirthdayInfo(st.dob);
      if (!bdayInfo) return null;
      return {
        ...st,
        ...bdayInfo
      };
    })
    .filter(Boolean) as any[];

  const todaysBirthdays = analyzedStudents.filter(st => st.daysLeft === 0);
  const upcomingBirthdays = analyzedStudents
    .filter(st => st.daysLeft > 0 && st.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const renderStudentRow = (st: any, isToday: boolean) => (
    <tr key={st.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${textPrimary} text-xs`}>
      <td className="py-3 px-3">
        <div className="font-bold flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-500" />
          {st.full_name}
        </div>
        <div className={`text-[10px] ${textSecondary}`}>Adm ID: {st.admission_id}</div>
      </td>
      <td className="py-3 px-3 font-semibold">{st.dobFormatted}</td>
      <td className="py-3 px-3 font-bold text-pink-500">
        {isToday ? `Turning ${st.ageTurning} today! 🎉` : `Turning ${st.ageTurning}`}
      </td>
      <td className="py-3 px-3 font-semibold text-slate-500">{st.batch_name || 'No Batch'}</td>
      <td className="py-3 px-3">
        <div className="font-bold">{st.parent_name}</div>
        <div className="flex flex-col gap-0.5 mt-0.5 text-[10px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {st.parent_phone}</span>
          {st.parent_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {st.parent_email}</span>}
        </div>
      </td>
      <td className="py-3 px-3 font-bold text-blue-500">
        {isToday ? (
          <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 animate-pulse flex items-center w-fit gap-1">
            🎂 Today
          </span>
        ) : (
          <span>{st.daysLeft === 1 ? 'Tomorrow' : `In ${st.daysLeft} days`}</span>
        )}
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const cleanPhone = (st.parent_phone || '').replace(/[^0-9]/g, '');
              const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone || '919876543210';
              const text = `Dear Parent,\nPhulwari Mother & Child Activity Centre wishes a very Happy Birthday to your child, ${st.full_name}! May they have a wonderful year ahead filled with joy and growth.\n\nRegards,\nPhulwari Mother & Child Activity Centre`;
              const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
              window.open(waUrl, '_blank');
            }}
            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            💬 Wish
          </button>
          <a
            href={`tel:${(st.parent_phone || '').replace(/[^0-9+]/g, '')}`}
            className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-bold flex items-center gap-1 transition text-decoration-none"
          >
            📞 Call
          </a>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className={`${bgCard} p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Cake className="w-5 h-5 text-pink-500 fill-pink-500/20" /> Birthday Alerts Dashboard
          </h3>
          <p className={`text-xs ${textSecondary}`}>Monitor kids birthdays today and upcoming alerts over the next 7 days.</p>
        </div>
      </div>

      {/* TODAY'S BIRTHDAYS SECTION */}
      <div className={`${bgCard} p-6 rounded-2xl space-y-4`}>
        <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 text-emerald-500`}>
          🎂 Today's Celebrations ({todaysBirthdays.length})
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Date of Birth</th>
                <th className="py-2.5 px-3">Age Turning</th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3">Parent Info</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {todaysBirthdays.map(st => renderStudentRow(st, true))}
              {todaysBirthdays.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No birthdays today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPCOMING BIRTHDAYS SECTION */}
      <div className={`${bgCard} p-6 rounded-2xl space-y-4`}>
        <h4 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 text-blue-500`}>
          📅 Upcoming Birthdays (Next 7 Days) ({upcomingBirthdays.length})
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Date of Birth</th>
                <th className="py-2.5 px-3">Age Turning</th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3">Parent Info</th>
                <th className="py-2.5 px-3">Time Left</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingBirthdays.map(st => renderStudentRow(st, false))}
              {upcomingBirthdays.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No upcoming birthdays in the next 7 days.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
