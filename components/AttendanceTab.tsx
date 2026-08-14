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
  handleMarkAttendance: (studentId: string, date: string, status: any) => void;
  searchQuery: string;
}

export default function AttendanceTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight,
  filteredStudents, attendance, attendanceDate, setAttendanceDate,
  setActiveTab, handleMarkAttendance, searchQuery
}: AttendanceTabProps) {
  
  // Calculate today's day of the week
  const dateObj = new Date(attendanceDate);
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

  // Filter students: Today's scheduled program by default, or all matching if searching
  const displayStudents = filteredStudents.filter(st => {
    if (searchQuery && searchQuery.trim() !== '') {
      return true; // Show all matching students when searching
    }
    
    // Check customized days schedule
    if (st.custom_days) {
      return st.custom_days.split(', ').includes(dayName);
    }
    
    // Fallback to batch schedule matching
    const bDays = (st.batch_days || st.days || '').toLowerCase();
    if (bDays.includes('monday to sunday') || bDays.includes('daily') || bDays.includes('everyday')) {
      return true;
    }
    return bDays.includes(dayName.toLowerCase());
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
              : `Showing ${displayStudents.length} students scheduled for ${dayName} by default.`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
          <button
            onClick={() => setActiveTab('calendar')}
            className="px-4 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-blue-600/20 transition cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span>View Attendance Calendar</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {displayStudents.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-semibold">
            No students scheduled for {dayName}. Use the search bar to query and mark attendance for other students.
          </div>
        ) : (
          displayStudents.map((st) => {
            const currentAtt = attendance.find(
              (a: any) => (a.student_id === st.id || a.students?.admission_id === st.admission_id) && a.date === attendanceDate
            );
            const isPresent = currentAtt?.status === 'present';
            const isAbsent = currentAtt?.status === 'absent';
            const classesLeft = (st.classes_total || 12) - (st.classes_consumed || 0);

            return (
              <div key={st.id} className={`p-4 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
                <div>
                  <h4 className={`text-xs font-bold ${textPrimary}`}>
                    {st.full_name} <span className="text-blue-500 font-mono">({st.admission_id})</span>
                  </h4>
                  <p className={`text-[11px] ${textSecondary}`}>
                    Batch: {st.batch_name || 'Mother & Toddler Program'} | 
                    Schedule: <span className="font-semibold text-orange-600">{st.custom_days || 'Standard Batch days'}</span> | 
                    Classes Left: <span className={`font-bold ${classesLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>{classesLeft}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMarkAttendance(st.id, attendanceDate, 'present')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm ${
                      isPresent ? 'bg-emerald-600 text-white font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20'
                    }`}
                  >Present</button>
                  <button
                    onClick={() => handleMarkAttendance(st.id, attendanceDate, 'absent')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      isAbsent ? 'bg-rose-600 text-white font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-500/20'
                    }`}
                  >Absent</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
