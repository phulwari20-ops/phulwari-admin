import React from 'react';
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
  handleMarkAttendance: (studentId: string, date: string, status: any, className: string, classTime: string) => void;
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
  const [localSearch, setLocalSearch] = React.useState<string>('');

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

    let schedules: any[] = [];
    if (st.batch_id === '00000000-0000-0000-0000-000000000000') {
      schedules = studentCustomSchedules.filter(sch => sch.student_id === st.id && sch.day_of_week === dayName);
    } else {
      schedules = batchSchedules.filter(sch => sch.batch_id === st.batch_id && sch.day_of_week === dayName);
    }

    schedules.forEach(sch => {
      attendanceItems.push({
        student: st,
        class_name: sch.class_name,
        class_time: `${sch.start_time} - ${sch.end_time}`
      });
    });
  });

  // Filter items by selected batch and search query
  const displayItems = attendanceItems.filter(item => {
    // Batch filter
    if (selectedBatchIdFilter !== 'All' && item.student.batch_id !== selectedBatchIdFilter) return false;

    // Search query filter
    const activeSearch = localSearch.trim() !== '' ? localSearch : searchQuery;
    if (!activeSearch || activeSearch.trim() === '') return true;
    const query = activeSearch.toLowerCase();
    return item.student.full_name.toLowerCase().includes(query) || 
           item.student.admission_id.toLowerCase().includes(query) ||
           item.class_name.toLowerCase().includes(query);
  });

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-1.5`}>
            <span>📅</span> Daily Attendance Marker ({dayName})
          </h3>
          <p className={`text-xs ${textSecondary}`}>
            {searchQuery 
              ? `Showing search results for "${searchQuery}"`
              : `Showing ${displayItems.length} classes scheduled for ${dayName}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Search Student:</span>
            <input
              type="text"
              placeholder="Name or Admission ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold shrink-0 w-44 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
              }`}
            />
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-semibold ${textSecondary}`}>Batch Filter:</span>
            <select
              value={selectedBatchIdFilter}
              onChange={(e) => setSelectedBatchIdFilter(e.target.value)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border outline-none font-bold shrink-0 ${
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
        </div>
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

      <div className="space-y-3 pt-2">
        {isHoliday ? (
          <div className="text-center py-12 text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
            🏖️ This date is marked as a Holiday. Attendance marking is blocked.
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
            No classes scheduled for {dayName}.
          </div>
        ) : (
          displayItems.map((item, idx) => {
            const currentAtt = attendance.find(
              (a: any) => a.student_id === item.student.id && 
                          a.date === attendanceDate && 
                          a.class_name === item.class_name && 
                          a.class_time === item.class_time
            );
            const currentStatus = currentAtt?.status || 'unmarked';
            const classesLeft = (item.student.classes_total || 12) - (item.student.classes_consumed || 0);

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

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 self-start sm:self-auto">
                  {/* P Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'present' ? 'unmarked' : 'present', item.class_name, item.class_time)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-605 hover:bg-emerald-500/10'
                    }`}
                    title="Present"
                  >P</button>

                  {/* A Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'absent' ? 'unmarked' : 'absent', item.class_name, item.class_time)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-605 hover:bg-rose-500/10'
                    }`}
                    title="Absent"
                  >A</button>

                  {/* HD Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => handleMarkAttendance(item.student.id, attendanceDate, currentStatus === 'halfday' ? 'unmarked' : 'halfday', item.class_name, item.class_time)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      currentStatus === 'halfday'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-amber-505 hover:bg-amber-500/10'
                    }`}
                    title="Half Day"
                  >HD</button>

                  {/* L Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => {
                      if (currentStatus === 'leave') {
                        handleMarkAttendance(item.student.id, attendanceDate, 'unmarked', item.class_name, item.class_time)
                      } else {
                        const r = prompt("Enter Leave Reason (e.g. Sick Leave, Out of Town, Family Function):", "Sick Leave")
                        if (r !== null) {
                          handleMarkAttendance(item.student.id, attendanceDate, 'leave', item.class_name, item.class_time, r || 'Leave')
                        }
                      }
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      currentStatus === 'leave'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-blue-605 hover:bg-blue-500/10'
                    }`}
                    title={currentStatus === 'leave' && currentAtt?.leave_reason ? `Leave: ${currentAtt.leave_reason}` : "Leave"}
                  >L</button>

                  {/* H Button */}
                  <button
                    disabled={isHoliday}
                    onClick={() => {
                      if (currentStatus === 'holiday') {
                        handleMarkAttendance(item.student.id, attendanceDate, 'unmarked', item.class_name, item.class_time)
                      } else {
                        const r = prompt("Enter Student-specific Holiday Reason (e.g. Exam, Trip, Medical):", "School Trip")
                        if (r !== null) {
                          handleMarkAttendance(item.student.id, attendanceDate, 'holiday', item.class_name, item.class_time, r || 'Holiday')
                        }
                      }
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      currentStatus === 'holiday'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-605 hover:bg-purple-500/10'
                    }`}
                    title={currentStatus === 'holiday' && currentAtt?.holiday_reason ? `Holiday: ${currentAtt.holiday_reason}` : "Student Holiday"}
                  >H</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
