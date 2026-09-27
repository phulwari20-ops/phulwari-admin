import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';

interface AttendanceTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  filteredStudents: any[];
  attendance: any[];
  attendanceDate: string;
  setAttendanceDate: (d: string) => void;
  setActiveTab: (tab: any) => void;
  handleMarkAttendance: (studentId: string, date: string, status: any, className: string, classTime: string, leaveReason?: string) => void;
  searchQuery: string;
  batchSchedules: any[];
  studentCustomSchedules: any[];
  holidays: any[];
  handleToggleHoliday: (date: string, description?: string) => void;
}

export default function AttendanceTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight,
  filteredStudents, attendance, attendanceDate, setAttendanceDate,
  setActiveTab, handleMarkAttendance, searchQuery,
  batchSchedules, studentCustomSchedules, holidays, handleToggleHoliday
}: AttendanceTabProps) {
  
  const [selectedBatchIdFilter, setSelectedBatchIdFilter] = React.useState<string>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [unscheduledSearch, setUnscheduledSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name_asc' | 'name_desc' | 'admission_id_asc' | 'admission_id_desc'>('name_asc');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  const ALPHABETS = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const compareAdmissionId = (a: string, b: string): number => {
    const numA = parseInt((a || '').replace(/\D+/g, ''), 10) || 0;
    const numB = parseInt((b || '').replace(/\D+/g, ''), 10) || 0;
    if (numA !== numB) return numA - numB;
    return (a || '').localeCompare(b || '');
  };

  // Derive the day of the week from the selected date.
  // `new Date('2026-08-21')` is parsed as UTC midnight while getDay() reads the
  // local clock, so in any timezone behind UTC the weekday comes out one day
  // early. Build the date from its parts to keep it purely local.
  const [attYear, attMonth, attDay] = attendanceDate.split('-').map(Number);
  const dateObj = new Date(attYear, (attMonth || 1) - 1, attDay || 1);
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

  // Check if current date is a holiday
  const currentHoliday = holidays.find(h => h.date === attendanceDate);
  const isHoliday = !!currentHoliday;

  // Extract unique batches from active students
  const uniqueBatches = Array.from(
    new Map(
      filteredStudents
        .filter(s => s.status !== 'deactivated' && s.batch_id)
        .map(s => [s.batch_id, s.batch_name || 'Mother & Toddler Program'])
    ).entries()
  );

  // Build the list of all scheduled class entries for all active students on dayName
  const attendanceItems: Array<{
    student: any;
    class_name: string;
    class_time: string;
  }> = [];

  filteredStudents.forEach(st => {
    // Only process active students
    if (st.status === 'deactivated') return;

    let isScheduledForDay = false;
    const dayNameLower = dayName.toLowerCase();
    const dayShortLower = dayName.slice(0, 3).toLowerCase();

    // 1. Check custom_days string if student has explicit custom days configured
    if (st.custom_days && st.custom_days.trim() !== '') {
      const daysList = st.custom_days.split(',').map((d: string) => d.trim().toLowerCase());
      const isDayMatched = daysList.some((d: string) => 
        d === dayNameLower || d.startsWith(dayShortLower) || dayNameLower.startsWith(d)
      );

      if (!isDayMatched) {
        // Explicitly NOT scheduled on this day!
        return;
      }
      isScheduledForDay = true;
    }

    // 2. Fetch schedule entries from studentCustomSchedules or batchSchedules
    let schedules: any[] = [];
    if (st.batch_id === '00000000-0000-0000-0000-000000000000' || st.custom_days) {
      schedules = studentCustomSchedules.filter(sch => 
        sch.student_id === st.id && 
        (sch.day_of_week?.toLowerCase() === dayNameLower || sch.day_of_week?.toLowerCase()?.startsWith(dayShortLower))
      );
      if (schedules.length === 0 && isScheduledForDay) {
        // Synthetic schedule entry for custom plan
        schedules = [{
          class_name: st.program_interested || st.batch_name || 'Activity Class',
          start_time: st.preferred_time_slot?.split('(')[1]?.split('-')[0]?.trim() || '10:30 AM',
          end_time: st.preferred_time_slot?.split('-')[1]?.replace(')', '')?.trim() || '11:30 AM'
        }];
      }
    } else {
      schedules = batchSchedules.filter(sch => 
        sch.batch_id === st.batch_id && 
        (sch.day_of_week?.toLowerCase() === dayNameLower || sch.day_of_week?.toLowerCase()?.startsWith(dayShortLower))
      );
      if (schedules.length === 0) {
        // Check batch days
        const matchedBatch = st.batch_id ? (filteredStudents.find(s => s.batch_id === st.batch_id)?.batch_days || '') : '';
        const bDays = (st.batch_days || matchedBatch || 'Monday to Sunday').toLowerCase();
        if (bDays.includes('monday to sunday') || bDays.includes('all days') || bDays.includes(dayNameLower) || bDays.includes(dayShortLower)) {
          schedules = [{
            class_name: st.batch_name || 'Batch Class',
            start_time: '10:30 AM',
            end_time: '11:30 AM'
          }];
        }
      }
    }

    schedules.forEach(sch => {
      attendanceItems.push({
        student: st,
        class_name: sch.class_name || st.batch_name || 'Class',
        class_time: sch.start_time && sch.end_time ? `${sch.start_time} - ${sch.end_time}` : (st.preferred_time_slot || '10:30 AM - 11:30 AM')
      });
    });
  });

  // Filter items by selected batch, letter, and search query
  const displayItems = attendanceItems
    .filter(item => {
      // Batch filter
      if (selectedBatchIdFilter !== 'All' && item.student.batch_id !== selectedBatchIdFilter) return false;

      // Letter filter
      if (selectedLetter !== 'ALL' && !(item.student.full_name || '').trim().toUpperCase().startsWith(selectedLetter)) {
        return false;
      }

      // Search query filter
      const activeSearch = localSearch.trim() !== '' ? localSearch : searchQuery;
      if (!activeSearch || activeSearch.trim() === '') return true;
      const query = activeSearch.toLowerCase();
      return item.student.full_name.toLowerCase().includes(query) || 
             item.student.admission_id.toLowerCase().includes(query) ||
             item.class_name.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'name_asc':
          return (a.student.full_name || '').localeCompare(b.student.full_name || '');
        case 'name_desc':
          return (b.student.full_name || '').localeCompare(a.student.full_name || '');
        case 'admission_id_asc':
          return compareAdmissionId(a.student.admission_id, b.student.admission_id);
        case 'admission_id_desc':
          return compareAdmissionId(b.student.admission_id, a.student.admission_id);
        default:
          return 0;
      }
    });

  // State for Section 2: Unscheduled / Additional Attendance
  const [selectedStudentForExtra, setSelectedStudentForExtra] = useState<any | null>(null);
  const [extraActivity, setExtraActivity] = useState<string>('Extra Activity');
  const [customExtraActivity, setCustomExtraActivity] = useState<string>('');
  const [extraTimeSlot, setExtraTimeSlot] = useState<string>('10:30 AM - 11:30 AM');
  const [customExtraTimeSlot, setCustomExtraTimeSlot] = useState<string>('');
  const [extraStatus, setExtraStatus] = useState<'present' | 'absent' | 'halfday' | 'leave' | 'holiday'>('present');
  const [extraDuplicateError, setExtraDuplicateError] = useState<string>('');
  const [extraSuccessMsg, setExtraSuccessMsg] = useState<string>('');

  const STANDARD_ACTIVITIES = [
    'Dance',
    'Zumba',
    'Art & Craft',
    'Music / Singing',
    'Mother & Toddler Program',
    'Early Learning / Playgroup',
    'Day Care Session',
    'Extra Remedial Class',
    'Special Workshop',
    'Other (Custom)'
  ];

  const STANDARD_TIME_SLOTS = [
    '09:30 AM - 10:30 AM',
    '10:30 AM - 11:30 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '03:30 PM - 04:30 PM',
    '04:30 PM - 05:30 PM',
    '05:30 PM - 06:30 PM',
    'Other (Custom)'
  ];

  // Helper to identify scheduled items matching a student on attendanceDate
  const isScheduledSession = (studentId: string, className: string, classTime: string) => {
    return attendanceItems.some(
      item => item.student.id === studentId &&
              (item.class_name || '').toLowerCase() === (className || '').toLowerCase() &&
              (item.class_time || '').toLowerCase() === (classTime || '').toLowerCase()
    );
  };

  // Find all attendance records for attendanceDate that are unscheduled / additional sessions
  const unscheduledAttendanceRecords = attendance.filter((a: any) => {
    if (a.date !== attendanceDate) return false;
    return !isScheduledSession(a.student_id, a.class_name || '', a.class_time || '');
  });

  // Handle adding an unscheduled attendance record with strict duplicate prevention
  const handleAddUnscheduledSession = () => {
    setExtraDuplicateError('');
    setExtraSuccessMsg('');

    if (!selectedStudentForExtra) {
      setExtraDuplicateError('Please select a student first.');
      return;
    }

    const finalActivity = extraActivity === 'Other (Custom)' 
      ? customExtraActivity.trim() 
      : extraActivity.trim();
    
    if (!finalActivity) {
      setExtraDuplicateError('Please specify an activity / class name.');
      return;
    }

    const finalTime = extraTimeSlot === 'Other (Custom)'
      ? customExtraTimeSlot.trim()
      : extraTimeSlot.trim();

    if (!finalTime) {
      setExtraDuplicateError('Please specify a time slot.');
      return;
    }

    // Exact Duplicate Prevention: check if Student + Date + Time + Activity already exists
    const duplicateInDb = attendance.some((a: any) =>
      a.student_id === selectedStudentForExtra.id &&
      a.date === attendanceDate &&
      (a.class_name || '').trim().toLowerCase() === finalActivity.toLowerCase() &&
      (a.class_time || '').trim().toLowerCase() === finalTime.toLowerCase()
    );

    const duplicateInScheduled = attendanceItems.some((item) =>
      item.student.id === selectedStudentForExtra.id &&
      (item.class_name || '').trim().toLowerCase() === finalActivity.toLowerCase() &&
      (item.class_time || '').trim().toLowerCase() === finalTime.toLowerCase()
    );

    if (duplicateInDb || duplicateInScheduled) {
      setExtraDuplicateError(
        `Duplicate session detected: "${selectedStudentForExtra.full_name}" already has an attendance record for "${finalActivity}" at "${finalTime}" on ${attendanceDate}. Please select a different activity or time.`
      );
      return;
    }

    // Mark attendance
    handleMarkAttendance(
      selectedStudentForExtra.id,
      attendanceDate,
      extraStatus,
      finalActivity,
      finalTime,
      extraStatus === 'leave' ? 'Extra Session Leave' : undefined
    );

    setExtraSuccessMsg(`Recorded ${extraStatus.toUpperCase()} for ${selectedStudentForExtra.full_name} (${finalActivity})!`);
    setSelectedStudentForExtra(null);
    setUnscheduledSearch('');
    setTimeout(() => setExtraSuccessMsg(''), 4000);
  };

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      {/* ─────────────────────────────────────────────────────────────
          HEADER & FILTERS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-black ${textPrimary} flex items-center gap-2`}>
            <span>📅</span> Daily Attendance Console
          </h3>
          <p className={`text-xs ${textSecondary} mt-0.5`}>
            Selected Date: <span className="font-bold text-blue-600 font-mono">{attendanceDate}</span> ({dayName})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Search:</span>
            <input
              type="text"
              placeholder="Name or ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold shrink-0 w-36 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
              }`}
            />
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Sort:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border outline-none font-bold shrink-0 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            >
              <option value="name_asc">Name A → Z</option>
              <option value="name_desc">Name Z → A</option>
              <option value="admission_id_asc">ID: First → Last</option>
              <option value="admission_id_desc">ID: Last → First</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Batch:</span>
            <select
              value={selectedBatchIdFilter}
              onChange={(e) => setSelectedBatchIdFilter(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold shrink-0 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            >
              <option value="All">All Batches</option>
              {uniqueBatches.map(([bId, bName]) => (
                <option key={bId} value={bId}>{bName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Date:</span>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className={`border rounded-xl px-3 py-1.5 font-mono font-bold outline-none cursor-pointer ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Alphabet quick filter bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        <span className={`text-[10px] font-extrabold uppercase mr-1 shrink-0 ${textSecondary}`}>Letter:</span>
        {ALPHABETS.map((letter) => {
          const isSelected = selectedLetter === letter;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => setSelectedLetter(letter)}
              className={`px-2 py-0.5 rounded text-[11px] font-black transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs scale-105'
                  : isLight
                  ? 'bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Holiday Management Status Bar */}
      {isHoliday ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏖️</span>
            <div>
              <p className="uppercase tracking-wider">HOLIDAY / CENTER CLOSED FOR THIS DATE</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-sans">Reason: {currentHoliday.description || 'Public Holiday / Closed'}</p>
            </div>
          </div>
          <button
            onClick={() => handleToggleHoliday(attendanceDate)}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold transition cursor-pointer shadow-md shadow-rose-600/20"
          >
            Remove Holiday Mark
          </button>
        </div>
      ) : (
        <div className="p-3 bg-blue-500/5 dark:bg-blue-950/10 border border-blue-500/10 dark:border-blue-900/30 rounded-2xl flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>Center is open on this date.</span>
          <button
            onClick={() => {
              const desc = prompt("Enter holiday description (e.g. Independence Day, Diwali):")
              if (desc !== null) handleToggleHoliday(attendanceDate, desc)
            }}
            className="px-3 py-1 bg-blue-600/10 text-blue-500 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-xl transition text-[10px] font-bold cursor-pointer"
          >
            Mark as Holiday
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: SCHEDULED ATTENDANCE (Auto populated by dayName)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black">1</span>
            <h4 className={`text-sm font-black uppercase tracking-wider ${textPrimary}`}>
              Scheduled Attendance ({dayName})
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold">
              {displayItems.length} {displayItems.length === 1 ? 'student' : 'students'} scheduled
            </span>
          </div>
        </div>

        {isHoliday ? (
          <div className="text-center py-10 text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
            🏖️ This date is marked as a Holiday. Attendance marking is blocked.
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
            No classes scheduled for {dayName}.
          </div>
        ) : (
          displayItems.map((item, idx) => {
            const liveStudent = filteredStudents.find((s: any) => s.id === item.student.id) || item.student;
            const currentAtt = attendance.find(
              (a: any) => a.student_id === item.student.id && 
                          a.date === attendanceDate && 
                          a.class_name === item.class_name && 
                          a.class_time === item.class_time
            ) || attendance.find(
              (a: any) => a.student_id === item.student.id && 
                          a.date === attendanceDate && 
                          a.class_name === item.class_name
            ) || attendance.find(
              (a: any) => a.student_id === item.student.id && 
                          a.date === attendanceDate
            );
            const currentStatus = currentAtt?.status || 'unmarked';
            const classesLeft = (liveStudent.classes_total || 12) - (liveStudent.classes_consumed || 0);

            return (
              <div key={`${item.student.id}-${item.class_name}-${idx}`} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${bgSubCard}`}>
                <div>
                  <h4 className={`text-xs font-bold ${textPrimary} flex items-center gap-2`}>
                    <span>{item.student.full_name}</span>
                    <span className="text-blue-500 font-mono">({item.student.admission_id})</span>
                    {currentAtt?.remarks && (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-semibold italic">
                        {currentAtt.remarks}
                      </span>
                    )}
                  </h4>
                  <div className={`text-[11px] ${textSecondary} mt-1 flex flex-wrap gap-x-3 gap-y-1 items-center`}>
                    <span>Batch: <strong className={textPrimary}>{item.student.batch_name}</strong></span>
                    <span>|</span>
                    <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                      <span>📖</span> Class: {item.class_name}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono">
                      <span>⏰</span> Time: {item.class_time}
                    </span>
                    <span>|</span>
                    <span>Classes Left: <span className={`font-bold ${classesLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>{classesLeft}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto shadow-xs">
                  {/* P Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'present' ? 'unmarked' : 'present', item.class_name, item.class_time)}
                    className={`h-8 px-2.5 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105 border border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-transparent'
                    }`}
                    title="Present - Click to toggle"
                  >
                    <span>✓</span> P
                  </button>

                  {/* A Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'absent' ? 'unmarked' : 'absent', item.class_name, item.class_time)}
                    className={`h-8 px-2.5 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 border border-rose-400 ring-2 ring-rose-500/20'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-transparent'
                    }`}
                    title="Absent - Click to toggle"
                  >
                    <span>✕</span> A
                  </button>

                  {/* HD Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'halfday' ? 'unmarked' : 'halfday', item.class_name, item.class_time)}
                    className={`h-8 px-2 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                      currentStatus === 'halfday'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105 border border-amber-300 ring-2 ring-amber-500/20'
                        : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-transparent'
                    }`}
                    title="Half Day - Click to toggle"
                  >
                    <span>½</span> HD
                  </button>

                  {/* L Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'leave' ? 'unmarked' : 'leave', item.class_name, item.class_time, 'Leave')}
                    className={`h-8 px-2.5 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                      currentStatus === 'leave'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105 border border-blue-400 ring-2 ring-blue-500/20'
                        : 'text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-transparent'
                    }`}
                    title="Leave - Single click toggle"
                  >
                    <span>🌴</span> L
                  </button>

                  {/* H Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'holiday' ? 'unmarked' : 'holiday', item.class_name, item.class_time, 'Student Holiday')}
                    className={`h-8 px-2.5 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                      currentStatus === 'holiday'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105 border border-purple-400 ring-2 ring-purple-500/20'
                        : 'text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-transparent'
                    }`}
                    title="Holiday - Single click toggle"
                  >
                    <span>🏖️</span> H
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: UNSCHEDULED / ADDITIONAL SESSIONS
         ───────────────────────────────────────────────────────────── */}
      <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black">2</span>
            <div>
              <h4 className={`text-sm font-black uppercase tracking-wider ${textPrimary} flex items-center gap-1.5`}>
                <span>➕</span> Unscheduled / Additional Attendance
              </h4>
              <p className={`text-[11px] ${textSecondary}`}>
                Add extra sessions for any student (including already scheduled students taking an additional class). Prevents duplicate entry for identical activity and time.
              </p>
            </div>
          </div>
          {unscheduledAttendanceRecords.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
              {unscheduledAttendanceRecords.length} additional {unscheduledAttendanceRecords.length === 1 ? 'record' : 'records'} marked
            </span>
          )}
        </div>

        {/* Action Form to Add Additional / Unscheduled Session */}
        <div className={`p-4 sm:p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Student Selector */}
            <div className="space-y-1">
              <label className={`text-[11px] font-black uppercase tracking-wider ${textSecondary}`}>
                Select Student:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type name or ID to search..."
                  value={selectedStudentForExtra ? `${selectedStudentForExtra.full_name} (${selectedStudentForExtra.admission_id})` : unscheduledSearch}
                  onChange={(e) => {
                    setSelectedStudentForExtra(null);
                    setUnscheduledSearch(e.target.value);
                  }}
                  className={`w-full text-xs font-bold px-3 py-2 rounded-xl border outline-none ${
                    selectedStudentForExtra
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                      : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-blue-500'
                  }`}
                />
                {selectedStudentForExtra && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForExtra(null);
                      setUnscheduledSearch('');
                    }}
                    className="absolute right-2 top-2 text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
                {/* Autocomplete dropdown */}
                {!selectedStudentForExtra && unscheduledSearch.trim().length > 0 && (
                  <div className={`absolute z-30 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl ${
                    isLight ? 'bg-white border-slate-200 divide-y divide-slate-100' : 'bg-slate-900 border-slate-700 divide-y divide-slate-800'
                  }`}>
                    {filteredStudents
                      .filter(s => s.status !== 'deactivated' && (
                        s.full_name?.toLowerCase().includes(unscheduledSearch.toLowerCase()) ||
                        s.admission_id?.toLowerCase().includes(unscheduledSearch.toLowerCase())
                      ))
                      .slice(0, 8)
                      .map(st => (
                        <div
                          key={st.id}
                          onClick={() => {
                            setSelectedStudentForExtra(st);
                            setUnscheduledSearch('');
                            setExtraDuplicateError('');
                          }}
                          className={`p-2.5 text-xs cursor-pointer flex items-center justify-between ${
                            isLight ? 'hover:bg-blue-50' : 'hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <span className="font-bold">{st.full_name}</span>
                            <span className="text-[10px] text-blue-500 ml-1.5 font-mono">({st.admission_id})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{st.batch_name || 'General'}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Activity / Class Selector */}
            <div className="space-y-1">
              <label className={`text-[11px] font-black uppercase tracking-wider ${textSecondary}`}>
                Activity / Class:
              </label>
              <select
                value={extraActivity}
                onChange={(e) => setExtraActivity(e.target.value)}
                className={`w-full text-xs font-bold px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                }`}
              >
                {STANDARD_ACTIVITIES.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
              {extraActivity === 'Other (Custom)' && (
                <input
                  type="text"
                  placeholder="Enter custom activity name..."
                  value={customExtraActivity}
                  onChange={(e) => setCustomExtraActivity(e.target.value)}
                  className={`w-full text-xs font-bold px-3 py-1.5 mt-1 rounded-xl border outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              )}
            </div>

            {/* 3. Time Slot & Status */}
            <div className="space-y-1">
              <label className={`text-[11px] font-black uppercase tracking-wider ${textSecondary}`}>
                Time Slot:
              </label>
              <select
                value={extraTimeSlot}
                onChange={(e) => setExtraTimeSlot(e.target.value)}
                className={`w-full text-xs font-bold px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                }`}
              >
                {STANDARD_TIME_SLOTS.map(ts => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
              {extraTimeSlot === 'Other (Custom)' && (
                <input
                  type="text"
                  placeholder="e.g. 01:00 PM - 02:00 PM"
                  value={customExtraTimeSlot}
                  onChange={(e) => setCustomExtraTimeSlot(e.target.value)}
                  className={`w-full text-xs font-bold px-3 py-1.5 mt-1 rounded-xl border outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              )}
            </div>
          </div>

          {/* Action Row: Status Picker & Submit Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black uppercase tracking-wider ${textSecondary}`}>Status:</span>
              <div className="flex items-center gap-1">
                {(['present', 'absent', 'halfday', 'leave'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setExtraStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                      extraStatus === st
                        ? st === 'present' ? 'bg-emerald-600 text-white shadow-xs'
                        : st === 'absent' ? 'bg-rose-600 text-white shadow-xs'
                        : st === 'halfday' ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                        : isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {st === 'present' ? 'Present' : st === 'absent' ? 'Absent' : st === 'halfday' ? 'Half Day' : 'Leave'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={isHoliday}
              onClick={handleAddUnscheduledSession}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Record Additional Attendance
            </button>
          </div>

          {/* Error & Success Messages */}
          {extraDuplicateError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span>⚠️</span>
              <span>{extraDuplicateError}</span>
            </div>
          )}
          {extraSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span>✓</span>
              <span>{extraSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* List of Marked Unscheduled / Additional Attendance Records */}
        <div className="space-y-2">
          <span className={`block font-bold text-[11px] uppercase tracking-wider ${textSecondary}`}>
            Recorded Additional / Unscheduled Sessions ({unscheduledAttendanceRecords.length})
          </span>

          {unscheduledAttendanceRecords.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold border border-dashed rounded-xl">
              No additional or unscheduled sessions marked for {attendanceDate}.
            </div>
          ) : (
            unscheduledAttendanceRecords.map((attRec: any, idx: number) => {
              const student = filteredStudents.find(s => s.id === attRec.student_id) || attRec.students || { full_name: 'Student', admission_id: '' };
              const currentStatus = attRec.status || 'present';
              const classesLeft = (student.classes_total || 12) - (student.classes_consumed || 0);

              return (
                <div
                  key={`extra-rec-${attRec.id || idx}`}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${bgSubCard}`}
                >
                  <div>
                    <h4 className={`text-xs font-bold ${textPrimary} flex items-center gap-2`}>
                      <span>{student.full_name}</span>
                      <span className="text-blue-500 font-mono">({student.admission_id})</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                        Additional Session
                      </span>
                      {attRec.remarks && (
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-semibold italic">
                          {attRec.remarks}
                        </span>
                      )}
                    </h4>
                    <div className={`text-[11px] ${textSecondary} mt-1 flex flex-wrap gap-x-3 gap-y-1 items-center`}>
                      <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                        <span>📖</span> Activity: {attRec.class_name || 'Extra Class'}
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono">
                        <span>⏰</span> Time: {attRec.class_time || 'Custom Time'}
                      </span>
                      <span>|</span>
                      <span>Classes Left: <span className={`font-bold ${classesLeft <= 3 ? 'text-red-500' : 'text-green-600'}`}>{classesLeft}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Status Toggles */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                      <button
                        disabled={isHoliday}
                        onClick={() => handleMarkAttendance(attRec.student_id, attendanceDate, currentStatus === 'present' ? 'unmarked' : 'present', attRec.class_name, attRec.class_time)}
                        className={`h-7 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          currentStatus === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-600 hover:bg-emerald-500/10'
                        }`}
                        title="Present"
                      >P</button>

                      <button
                        disabled={isHoliday}
                        onClick={() => handleMarkAttendance(attRec.student_id, attendanceDate, currentStatus === 'absent' ? 'unmarked' : 'absent', attRec.class_name, attRec.class_time)}
                        className={`h-7 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          currentStatus === 'absent' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600 hover:bg-rose-500/10'
                        }`}
                        title="Absent"
                      >A</button>

                      <button
                        disabled={isHoliday}
                        onClick={() => handleMarkAttendance(attRec.student_id, attendanceDate, currentStatus === 'halfday' ? 'unmarked' : 'halfday', attRec.class_name, attRec.class_time)}
                        className={`h-7 px-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          currentStatus === 'halfday' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-600 hover:bg-amber-500/10'
                        }`}
                        title="Half Day"
                      >HD</button>

                      <button
                        disabled={isHoliday}
                        onClick={() => handleMarkAttendance(attRec.student_id, attendanceDate, currentStatus === 'leave' ? 'unmarked' : 'leave', attRec.class_name, attRec.class_time, 'Leave')}
                        className={`h-7 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          currentStatus === 'leave' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-600 hover:bg-blue-500/10'
                        }`}
                        title="Leave"
                      >L</button>
                    </div>

                    {/* Delete / Remove this additional session */}
                    <button
                      type="button"
                      disabled={isHoliday}
                      onClick={() => {
                        if (confirm(`Remove this additional session (${attRec.class_name}) for ${student.full_name}?`)) {
                          handleMarkAttendance(attRec.student_id, attendanceDate, 'unmarked', attRec.class_name, attRec.class_time);
                        }
                      }}
                      className="h-7 px-2 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer border border-rose-500/20"
                      title="Remove Session"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
