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
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={i} className={`text-[11px] sm:text-xs font-black py-2 ${textSecondary} uppercase tracking-wider`}>{d}</div>
          ))}

          {/* Gregorian Calendar alignment: Empty spacer slots before 1st of month */}
          {(() => {
            const firstDayIndex = calendarDays.length > 0 
              ? new Date(calendarDays[0].dateStr + 'T00:00:00').getDay() 
              : 0;
            return Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`blank-start-${i}`}
                className={`p-2 sm:p-3 rounded-2xl border border-dashed transition flex flex-col justify-between h-20 sm:h-24 ${
                  isLight ? 'border-slate-200/50 bg-slate-100/30' : 'border-slate-800/50 bg-slate-900/20'
                } opacity-30 pointer-events-none select-none`}
              />
            ));
          })()}

          {calendarDays.map((day) => {
            const dateObj = new Date(day.dateStr + 'T00:00:00');
            const dayOfWeekName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
            const todayStr = new Date().toISOString().split('T')[0];
            const isToday = day.dateStr === todayStr;

            return (
              <button
                key={day.dayNum}
                onClick={() => setSelectedCalendarDate(day.dateStr)}
                className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center justify-between h-20 sm:h-24 transition cursor-pointer text-left ${
                  isToday
                    ? 'ring-2 ring-blue-500 border-blue-500 ' + (isLight ? 'bg-blue-50/70 shadow-md' : 'bg-blue-950/40 shadow-md')
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 shadow-xs'
                    : 'bg-slate-950 border-slate-800/80 hover:border-blue-500 hover:bg-slate-900'
                }`}
              >
                <div className="w-full flex items-center justify-between gap-1">
                  <span className={`text-[11px] sm:text-xs font-black ${isToday ? 'text-blue-600 dark:text-blue-400' : textPrimary}`}>
                    {day.dayNum} {monthName.substring(0, 3)}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-bold ${isToday ? 'text-blue-500 font-extrabold' : 'text-slate-400'}`}>
                    {dayOfWeekName}
                  </span>
                </div>
                <div className="space-y-0.5 sm:space-y-1 w-full mt-1">
                  {day.presentCount > 0 && (
                    <span className="block text-[8px] sm:text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded text-center">
                      {day.presentCount} P
                    </span>
                  )}
                  {day.absentCount > 0 && (
                    <span className="block text-[8px] sm:text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 rounded text-center">
                      {day.absentCount} A
                    </span>
                  )}
                  {day.halfdayCount > 0 && (
                    <span className="block text-[8px] sm:text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded text-center">
                      {day.halfdayCount} HD
                    </span>
                  )}
                  {day.leaveCount > 0 && (
                    <span className="block text-[8px] sm:text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1 py-0.5 rounded text-center">
                      {day.leaveCount} L
                    </span>
                  )}
                  {day.holidayCount > 0 && (
                    <span className="block text-[8px] sm:text-[9px] font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1 py-0.5 rounded text-center">
                      {day.holidayCount} H
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
