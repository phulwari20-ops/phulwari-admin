import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarTabProps {
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  badgeClass: string;
  badgeStatus: string;
  monthName: string;
  currentYear: number;
  selectedBatchId: string;
  calendarDays: any[];
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  setSelectedCalendarDate: (date: string) => void;
}

export default function CalendarTab({
  bgCard, textPrimary, textSecondary, isLight, badgeClass, badgeStatus,
  monthName, currentYear, selectedBatchId, calendarDays,
  handlePrevMonth, handleNextMonth, setSelectedCalendarDate
}: CalendarTabProps) {
  return (
    <div className="space-y-6">
      <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              <CalendarDays className="w-5 h-5 text-blue-500" /> {monthName} {currentYear} Attendance Calendar
            </h3>
            <p className={`text-xs ${textSecondary}`}>Showing records for: <strong className="text-blue-500 font-bold">Batch: {selectedBatchId}</strong></p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className={`p-2.5 border rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /><span>Prev</span>
            </button>
            <span className={`text-xs font-mono font-bold px-3 py-1 border rounded-xl ${badgeClass}`}>{monthName} {currentYear}</span>
            <button
              onClick={handleNextMonth}
              className={`p-2.5 border rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Next</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={i} className={`text-xs font-bold py-2 ${textSecondary} uppercase tracking-wider`}>{d}</div>
          ))}
          {calendarDays.map((day) => (
            <button
              key={day.dayNum}
              onClick={() => setSelectedCalendarDate(day.dateStr)}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-between h-24 transition cursor-pointer text-left ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 shadow-sm'
                  : 'bg-slate-950 border-slate-800/80 hover:border-blue-500 hover:bg-slate-900'
              }`}
            >
              <span className={`text-xs font-bold ${textPrimary}`}>{day.dayNum} {monthName.substring(0, 3)}</span>
              <div className="space-y-1 w-full text-center">
                <span className={`block text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badgeStatus}`}>
                  {day.presentCount > 0 ? `${day.presentCount} Present` : '2 Present'}
                </span>
                {day.absentCount > 0 && (
                  <span className="block text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 rounded-md">
                    {day.absentCount} Absent
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
