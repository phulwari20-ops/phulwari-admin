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
}

export default function AttendanceTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight,
  filteredStudents, attendance, attendanceDate, setAttendanceDate,
  setActiveTab, handleMarkAttendance
}: AttendanceTabProps) {
  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-sm font-bold ${textPrimary}`}>Daily &amp; Past Attendance Marker</h3>
          <p className={`text-xs ${textSecondary}`}>Mark or update student attendance accurately for any date.</p>
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
        {filteredStudents.map((st) => {
          const currentAtt = attendance.find(
            (a: any) => (a.student_id === st.id || a.students?.admission_id === st.admission_id) && a.date === attendanceDate
          );
          const isPresent = currentAtt?.status === 'present';
          const isAbsent = currentAtt?.status === 'absent';
          return (
            <div key={st.id} className={`p-4 rounded-xl border flex items-center justify-between ${bgSubCard}`}>
              <div>
                <h4 className={`text-xs font-bold ${textPrimary}`}>{st.full_name} <span className="text-blue-500 font-mono">({st.admission_id})</span></h4>
                <p className={`text-[11px] ${textSecondary}`}>Batch: {st.batch_name || 'Mother & Toddler Program'} | Parent: {st.parent_name}</p>
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
        })}
      </div>
    </div>
  );
}
