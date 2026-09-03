import React from 'react';
import {
  Users, Layers, TrendingUp, IndianRupee, CreditCard, UserCheck,
  ChevronRight, Plus, UserPlus, CheckCircle2
} from 'lucide-react';

interface DashboardTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  students: any[];
  batches: any[];
  totalPaidFees: number;
  totalPendingFees: number;
  paidRatioPercentage: number | string;
  pendingRatioPercentage: number | string;
  totalRevenueCombined: number;
  studentsByBatchDistribution: any[];
  fees: any[];
  attendance?: any[];
  setActiveTab: (tab: any) => void;
  setIsAddStudentOpen: (v: boolean) => void;
  galleryImages: any[];
}

export default function DashboardTab({
  bgCard, bgSubCard, textPrimary, textSecondary, isLight,
  students, batches, totalPaidFees, totalPendingFees,
  paidRatioPercentage, pendingRatioPercentage, totalRevenueCombined,
  studentsByBatchDistribution, fees, attendance = [], setActiveTab, setIsAddStudentOpen, galleryImages
}: DashboardTabProps) {
  const batchColors = ['bg-pink-500', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500', 'bg-teal-500'];

  // Dynamic Attendance Calculation from Supabase `attendance` data
  const { barDays, todayAttendanceRate, attendanceTrendText } = React.useMemo(() => {
    const attList = attendance || [];
    
    // 1. Get dates for current week (Mon - Sat)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ...
    const distToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayThisWeek = new Date(now);
    mondayThisWeek.setDate(now.getDate() + distToMon);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let thisWeekPresentCount = 0;
    let thisWeekTotalCount = 0;

    const days = dayLabels.map((dayName, idx) => {
      const d = new Date(mondayThisWeek);
      d.setDate(mondayThisWeek.getDate() + idx);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const recordsForDay = attList.filter((a: any) => a.date === dateStr);
      const presentForDay = recordsForDay.filter((a: any) => a.status === 'present' || a.status === 'halfday').length;
      
      thisWeekPresentCount += presentForDay;
      thisWeekTotalCount += recordsForDay.length;

      const p = recordsForDay.length > 0 ? Math.round((presentForDay / recordsForDay.length) * 100) : 0;

      return { day: dayName, dateStr, p, total: recordsForDay.length, present: presentForDay };
    });

    // 2. Calculate Last Week's Attendance for trend comparison
    const mondayLastWeek = new Date(mondayThisWeek);
    mondayLastWeek.setDate(mondayThisWeek.getDate() - 7);

    let lastWeekPresentCount = 0;
    let lastWeekTotalCount = 0;

    for (let i = 0; i < 6; i++) {
      const d = new Date(mondayLastWeek);
      d.setDate(mondayLastWeek.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const records = attList.filter((a: any) => a.date === dateStr);
      const present = records.filter((a: any) => a.status === 'present' || a.status === 'halfday').length;

      lastWeekPresentCount += present;
      lastWeekTotalCount += records.length;
    }

    const thisWeekRate = thisWeekTotalCount > 0 ? (thisWeekPresentCount / thisWeekTotalCount) * 100 : 0;
    const lastWeekRate = lastWeekTotalCount > 0 ? (lastWeekPresentCount / lastWeekTotalCount) * 100 : 0;

    let trendText = 'Live Supabase Sync';
    if (lastWeekTotalCount > 0 && thisWeekTotalCount > 0) {
      const diff = thisWeekRate - lastWeekRate;
      if (diff >= 0) {
        trendText = `↑ ${diff.toFixed(1)}% from last week`;
      } else {
        trendText = `↓ ${Math.abs(diff).toFixed(1)}% from last week`;
      }
    } else if (thisWeekTotalCount > 0) {
      trendText = `Live (${thisWeekPresentCount}/${thisWeekTotalCount} Present)`;
    }

    // 3. Today's Attendance Rate
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayRecords = attList.filter((a: any) => a.date === todayStr);
    const todayPresent = todayRecords.filter((a: any) => a.status === 'present' || a.status === 'halfday').length;

    let todayRateStr = '0%';
    if (todayRecords.length > 0) {
      const rate = Math.round((todayPresent / todayRecords.length) * 100);
      todayRateStr = `${rate}%`;
    } else if (thisWeekTotalCount > 0) {
      todayRateStr = `${Math.round(thisWeekRate)}%`;
    } else if (attList.length > 0) {
      const totalP = attList.filter((a: any) => a.status === 'present' || a.status === 'halfday').length;
      todayRateStr = `${Math.round((totalP / attList.length) * 100)}%`;
    }

    return { barDays: days, todayAttendanceRate: todayRateStr, attendanceTrendText: trendText };
  }, [attendance]);

  // Low Classes alerts (<= 3 classes left)
  const lowClassStudents = students.filter(st => {
    const remaining = (st.classes_total || 12) - (st.classes_consumed || 0);
    return st.status === 'active' && remaining <= 3;
  });

  // Validity Expiry alerts (within next 5 days)
  const expiryStudents = students.filter(st => {
    if (!st.validity_end_date || st.status !== 'active') return false;
    const expiryDate = new Date(st.validity_end_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  });

  return (
    <div className="space-y-6">
      {/* Expiry & Remaining Class Alerts */}
      {(lowClassStudents.length > 0 || expiryStudents.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          {lowClassStudents.length > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                ⚠️ Low Classes Remaining Alert ({lowClassStudents.length} Students)
              </h4>
              <ul className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 list-disc pl-4 space-y-1">
                {lowClassStudents.slice(0, 4).map(st => {
                  const left = (st.classes_total || 12) - (st.classes_consumed || 0);
                  return (
                    <li key={st.id}>
                      {st.full_name} ({st.admission_id}) — Only <strong>{left}</strong> classes left!
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {expiryStudents.length > 0 && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                ⏳ Validity Expiry Alert ({expiryStudents.length} Students)
              </h4>
              <ul className="text-[11px] font-semibold text-rose-900 dark:text-rose-300 list-disc pl-4 space-y-1">
                {expiryStudents.slice(0, 4).map(st => (
                  <li key={st.id}>
                    {st.full_name} ({st.admission_id}) — Plan expires on <strong>{st.validity_end_date}</strong>!
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Admission & Student Status KPI Breakdown */}
      {(() => {
        const parseStudentDate = (str: any): Date | null => {
          if (!str) return null
          const s = String(str).trim()
          if (s.includes('/')) {
            const parts = s.split('/')
            if (parts.length === 3) {
              const [d, m, y] = parts.map(p => parseInt(p, 10))
              if (y && m && d) return new Date(y, m - 1, d)
            }
          }
          const d = new Date(s)
          return isNaN(d.getTime()) ? null : d
        }

        const activeCount = students.filter(st => st.status !== 'deactivated').length
        const deactivatedCount = students.filter(st => st.status === 'deactivated').length
        const newCount = students.filter(st => {
          if (st.status === 'deactivated') return false
          if (st.status === 'new' || st.status === 'New') return true
          const dateStr = st.admission_date || st.created_at || st.print_date || st.plan_start_date
          if (dateStr) {
            const d = parseStudentDate(dateStr)
            const now = new Date()
            if (d) {
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }
          }
          return false
        }).length

        return (
          <div className={`p-4 rounded-2xl border ${bgCard} shadow-xs space-y-3 animate-fadeIn`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-black uppercase tracking-wider ${textPrimary} flex items-center gap-2`}>
                <Users className="w-4 h-4 text-blue-500" /> Admission &amp; Student Status Breakdown
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">Live Master Directory Sync</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-emerald-600">Total Active Students</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{activeCount}</p>
                </div>
                <UserCheck className="w-7 h-7 text-emerald-500 opacity-80" />
              </div>
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-blue-600">Total New Admissions</p>
                  <p className="text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{newCount}</p>
                </div>
                <UserPlus className="w-7 h-7 text-blue-500 opacity-80" />
              </div>
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-rose-600">Total Left / Deactivated</p>
                  <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{deactivatedCount}</p>
                </div>
                <Users className="w-7 h-7 text-rose-500 opacity-80" />
              </div>
            </div>
          </div>
        )
      })()}

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 12.5%</span>
          </div>
          <div><p className={`text-[11px] font-semibold ${textSecondary}`}>Total Students</p><p className={`text-xl font-bold ${textPrimary}`}>{students.length}</p></div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Layers className="w-4 h-4" /></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 4.3%</span>
          </div>
          <div><p className={`text-[11px] font-semibold ${textSecondary}`}>Total Batches</p><p className={`text-xl font-bold ${textPrimary}`}>{batches.length}</p></div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 18.6%</span>
          </div>
          <div><p className={`text-[11px] font-semibold ${textSecondary}`}>Total Revenue</p><p className={`text-xl font-bold ${textPrimary}`}>₹{(totalPaidFees + totalPendingFees).toLocaleString('en-IN')}</p></div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center"><IndianRupee className="w-4 h-4" /></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 20.1%</span>
          </div>
          <div><p className={`text-[11px] font-semibold ${textSecondary}`}>Fees Collected</p><p className="text-xl font-bold text-emerald-500">₹{(totalPaidFees || 0).toLocaleString('en-IN')}</p></div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">↓ 8.7%</span>
          </div>
          <div><p className={`text-[11px] font-semibold ${textSecondary}`}>Pending Fees</p><p className="text-xl font-bold text-rose-500">₹{(totalPendingFees || 0).toLocaleString('en-IN')}</p></div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl space-y-2 border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><UserCheck className="w-4 h-4" /></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">↑ 6.2%</span>
          </div>
          <div><p className={`text-[11px] font-semibold ${textSecondary}`}>{"Today's Attendance"}</p><p className="text-xl font-bold text-blue-500">{todayAttendanceRate}</p></div>
        </div>
      </div>


      {/* Row 2: Fee Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>Fee Collection Overview</h3>
              <p suppressHydrationWarning className="text-2xl font-extrabold text-blue-600">₹{(totalPaidFees || 0).toLocaleString('en-IN')}</p>
              <span className="text-xs text-emerald-500 font-bold">↑ 20.1% from last month</span>
            </div>
            <select className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
              <option>This Month</option><option>Last Month</option>
            </select>
          </div>
          <div className="h-56 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0,130 Q 80,110 160,80 T 320,40 T 500,20 L 500,150 L 0,150 Z" fill="url(#blueGradient)" />
              <path d="M 0,130 Q 80,110 160,80 T 320,40 T 500,20" fill="none" stroke="#3B82F6" strokeWidth="3" />
              <circle cx="160" cy="80" r="5" fill="#3B82F6" /><circle cx="320" cy="40" r="5" fill="#3B82F6" /><circle cx="500" cy="20" r="5" fill="#3B82F6" />
            </svg>
            <div className={`flex justify-between text-[10px] font-bold ${textSecondary} pt-2`}>
              <span>May 1</span><span>May 6</span><span>May 11</span><span>May 16</span><span>May 21</span><span>May 26</span><span>May 31</span>
            </div>
          </div>
        </div>
        <div className={`${bgCard} p-6 rounded-3xl border shadow-sm flex flex-col justify-between`}>
          <div className="flex items-center justify-between pb-2">
            <h3 className={`text-base font-bold ${textPrimary}`}>Fees Status</h3>
            <span className={`text-xs ${textSecondary}`}>Live Ratio</span>
          </div>
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-emerald-500" strokeWidth="4.5" strokeDasharray={`${paidRatioPercentage}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-amber-500" strokeWidth="4.5" strokeDasharray={`${pendingRatioPercentage}, 100`} strokeDashoffset={`-${paidRatioPercentage}`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center">
              <p className={`text-[10px] font-bold uppercase ${textSecondary}`}>Total</p>
              <p className={`text-base font-extrabold ${textPrimary}`}>₹{totalRevenueCombined.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-semibold">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Collected</span><span className={textPrimary}>₹{totalPaidFees.toLocaleString()} ({paidRatioPercentage}%)</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending</span><span className={textPrimary}>₹{totalPendingFees.toLocaleString()} ({pendingRatioPercentage}%)</span></div>
          </div>
        </div>
      </div>

      {/* Row 3: Attendance Bar + Students by Batch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>Attendance Overview</h3>
              <p className="text-xl font-extrabold text-blue-600">{todayAttendanceRate} <span className="text-xs text-emerald-500 font-bold ml-2">{attendanceTrendText}</span></p>
            </div>
            <select className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-bold ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'}`}><option>This Week</option></select>
          </div>
          <div className="grid grid-cols-6 items-end gap-4 h-48 pt-6">
            {barDays.map(bar => (
              <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-blue-500">{bar.p}%</span>
                <div className="w-full bg-blue-600 rounded-t-xl transition-all" style={{ height: `${bar.p}%` }} />
                <span className={`text-xs font-bold ${textSecondary}`}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
          <h3 className={`text-base font-bold ${textPrimary}`}>Students by Batch</h3>
          <div className="space-y-3 pt-2">
            {studentsByBatchDistribution.map((item, idx) => (
              <div key={item.batch_name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${batchColors[idx % batchColors.length]}`} /><span className={textPrimary}>{item.batch_name}</span></span>
                  <span className={textSecondary}>{item.count} Students</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${batchColors[idx % batchColors.length]}`} style={{ width: `${Math.max(15, item.percentage)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Fees + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${textPrimary}`}>Recent Fee Collections</h3>
            <button onClick={() => setActiveTab('fees')} className="text-xs font-bold text-blue-500 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold ${textSecondary}`}>
                  <th className="py-2.5 px-3">Receipt No</th><th className="py-2.5 px-3">Student Name</th><th className="py-2.5 px-3">Batch</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Date</th><th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                {fees.slice(0, 5).map((f: any) => (
                  <tr key={f.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-500">{f.receipt_no || 'RCPT-2026-101'}</td>
                    <td className={`py-3 px-3 font-bold ${textPrimary}`}>{f.students?.full_name || 'Aarav Sharma'}</td>
                    <td className="py-3 px-3 font-semibold">{f.students?.batch_name || 'Mother & Toddler'}</td>
                    <td className="py-3 px-3 font-bold text-emerald-500">₹{f.amount}</td>
                    <td className={`py-3 px-3 ${textSecondary}`}>{f.date || '2026-08-01'}</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Success</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={`${bgCard} p-6 rounded-3xl border shadow-sm space-y-4`}>
          <h3 className={`text-base font-bold ${textPrimary}`}>Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTab('batches')} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}><span className="flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500" /> Create New Batch</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setIsAddStudentOpen(true)} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}><span className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-emerald-500" /> Add New Student</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setActiveTab('fees')} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}><span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-500" /> Collect Fee</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setActiveTab('attendance')} className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${bgSubCard} hover:border-blue-500 transition`}><span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Mark Attendance</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className={`${bgCard} p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500`}>
        <div className="flex items-center gap-2"><span>Total Teachers:</span> <span className={textPrimary}>48 Active</span></div>
        <div className="flex items-center gap-2"><span>Total Programs:</span> <span className={textPrimary}>36 Active</span></div>
        <div className="flex items-center gap-2"><span>Activity Halls:</span> <span className={textPrimary}>18 Halls</span></div>
        <div className="flex items-center gap-2"><span>Gallery Photos:</span> <span className={textPrimary}>{galleryImages.length} Photos</span></div>
        <div className="flex items-center gap-2"><span>System Status:</span> <span className="text-emerald-500 font-extrabold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online</span></div>
      </div>
    </div>
  );
}
