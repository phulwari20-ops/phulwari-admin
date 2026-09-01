import React, { useState } from 'react';
import { UserPlus, MessageSquare, PhoneCall, Plus, Trash2, CalendarDays, Phone, MessageCircle } from 'lucide-react';

const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return '—';
  let str = String(dateStr).trim();
  if (str.includes('T')) {
    str = str.split('T')[0];
  } else if (str.includes(' ')) {
    str = str.split(' ')[0];
  }
  if (str.includes('/')) return str;
  const parts = str.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y.length === 4) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  return dateStr;
};

interface EnquiriesTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  badgePassword: string;
  isLight: boolean;
  enquiries: any[];
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateFollowUpDate?: (id: string, date: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onAddEnquiry: (enquiry: any) => void;
  onConvertToAdmission: (enquiry: any) => void;
  onDeleteEnquiry?: (id: string) => void;
}

export default function EnquiriesTab({
  bgCard, bgSubCard, textPrimary, textSecondary, badgePassword, isLight,
  enquiries, onUpdateStatus, onUpdateFollowUpDate, onUpdateNotes, onAddEnquiry, onConvertToAdmission, onDeleteEnquiry
}: EnquiriesTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logModalEnq, setLogModalEnq] = useState<any | null>(null);
  const [newLogText, setNewLogText] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({
    child_name: '',
    age: '',
    parent_name: '',
    phone: '',
    email: '',
    program_interested: 'Gymnastics & MMA',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEnquiry(form);
    setForm({
      child_name: '',
      age: '',
      parent_name: '',
      phone: '',
      email: '',
      program_interested: 'Gymnastics & MMA',
      notes: ''
    });
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Admission Done':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Trial Scheduled':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Contacted':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysFollowups = enquiries.filter(enq => {
    if (!enq.next_follow_up_date) return false;
    const fDate = String(enq.next_follow_up_date).split('T')[0];
    return fDate === todayStr && enq.status !== 'Admission Done';
  });

  return (
    <div className="space-y-6">
      {/* ── TODAY'S LEAD FOLLOW-UP DEDICATED SECTION ── */}
      {todaysFollowups.length > 0 && (
        <div className={`${bgCard} rounded-2xl p-6 border border-pink-500/20 shadow-lg space-y-4 bg-gradient-to-br from-pink-500/5 to-purple-500/5 dark:from-pink-950/10 dark:to-purple-950/10 animate-fadeIn`}>
          <div className="flex items-center justify-between pb-3 border-b border-pink-200 dark:border-pink-900/50">
            <div>
              <h4 className="text-sm font-black text-pink-600 dark:text-pink-400 flex items-center gap-2">
                <span>📋</span> Today's Follow-up Alerts ({todaysFollowups.length} Leads Scheduled)
              </h4>
              <p className={`text-[11px] ${textSecondary}`}>Leads requiring immediate attention today.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysFollowups.map(enq => {
              let logsList: any[] = [];
              try {
                const parsed = JSON.parse(enq.notes || '[]');
                if (Array.isArray(parsed)) logsList = parsed;
              } catch (_) {}
              const lastLog = logsList.length > 0 ? logsList[logsList.length - 1].text : enq.notes || 'No notes logged yet.';

              return (
                <div key={enq.id} className={`${bgSubCard} p-4 rounded-xl border border-pink-500/10 dark:border-pink-500/5 flex flex-col justify-between space-y-3 hover:border-pink-400 dark:hover:border-pink-700 transition`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <strong className={`text-xs ${textPrimary}`}>{enq.child_name || 'N/A'} (Age: {enq.age || 'N/A'})</strong>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-pink-500/10 text-pink-650 border border-pink-500/20">
                        {enq.status || 'New'}
                      </span>
                    </div>
                    <div className={`text-[10px] ${textSecondary} mt-1`}>
                      Parent: <strong className={textPrimary}>{enq.parent_name}</strong>
                    </div>
                    <div className={`text-[10px] ${textSecondary} mt-1 font-mono`}>
                      📞 {enq.phone}
                    </div>
                    <div className="mt-2 text-[10px] bg-white/50 dark:bg-slate-900/50 p-2 rounded border border-slate-200/50 dark:border-slate-800/50 italic text-slate-600 dark:text-slate-400 leading-relaxed truncate" title={lastLog}>
                      💬 Remark: {lastLog}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <a href={`tel:${enq.phone}`} title="Call" className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-bold text-[10px] transition cursor-pointer">
                      Call
                    </a>
                    <a href={`sms:${enq.phone}`} title="SMS" className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-750 text-white rounded-lg text-center font-bold text-[10px] transition cursor-pointer">
                      SMS
                    </a>
                    <a href={`https://wa.me/${enq.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center font-bold text-[10px] transition cursor-pointer">
                      WhatsApp
                    </a>
                    <button
                      onClick={() => setLogModalEnq(enq)}
                      className={`p-1.5 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}
                      title="Update Log"
                    >
                      📝
                    </button>
                    <button
                      onClick={() => onUpdateStatus(enq.id, 'Admission Done')}
                      className="p-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition cursor-pointer text-xs font-bold"
                      title="Mark Completed"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${bgCard} rounded-2xl p-6 space-y-4 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <PhoneCall className="w-5 h-5 text-pink-500" /> Lead &amp; Enquiry Management
            </h3>
            <p className={`text-xs ${textSecondary}`}>Track incoming enquiries, trial sessions, and easily convert hot leads to student registrations.</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-pink-600/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Enquiry</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-bold uppercase tracking-wider ${isLight ? 'bg-slate-550/10 text-slate-600' : 'bg-slate-800/20 text-slate-400'}`}>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Child Details</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Interested Program</th>
                <th className="py-3 px-4">Follow-up Status</th>
                <th className="py-3 px-4">Next Follow-up Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">No enquiries tracked yet.</td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      <div>{enq.created_at ? formatDateToDisplay(enq.created_at) : 'N/A'}</div>
                      {enq.source && (
                        <div className="mt-1 text-[10px] font-sans px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 inline-block text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {enq.source}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold">{enq.child_name || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">Age: {enq.age || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{enq.parent_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{enq.phone}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <a href={`tel:${enq.phone}`} title="Call" className="p-1 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded transition cursor-pointer">
                          <Phone className="w-3 h-3" />
                        </a>
                        <a href={`sms:${enq.phone}`} title="SMS" className="p-1 bg-purple-50 text-purple-500 hover:bg-purple-100 rounded transition cursor-pointer">
                          <MessageSquare className="w-3 h-3" />
                        </a>
                        <a href={`https://wa.me/${enq.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-1 bg-green-50 text-green-500 hover:bg-green-100 rounded transition cursor-pointer">
                          <MessageCircle className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td 
                      onClick={() => setLogModalEnq(enq)}
                      className="py-3.5 px-4 max-w-[220px] cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition group"
                      title="Click to view full message & follow-up logs in overlay"
                    >
                      <div className="font-semibold text-pink-600 group-hover:text-pink-700 transition">{enq.program_interested || 'General Inquiry'}</div>
                      {enq.message && (
                        <div className="mt-1 text-[10px] text-slate-650 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-1.5 rounded-lg whitespace-pre-wrap leading-relaxed max-w-[200px]" title={enq.message}>
                          💬 {enq.message}
                        </div>
                      )}
                      {/* Log replies timeline list preview (spreadsheet-like timeline matching Image 4) */}
                      {(() => {
                        let logsList: any[] = [];
                        try {
                          const parsed = JSON.parse(enq.notes || '[]');
                          if (Array.isArray(parsed)) logsList = parsed;
                        } catch (_) {}

                        if (logsList.length > 0) {
                          return (
                            <div className="mt-1.5 space-y-1">
                              {logsList.map((lg, idx) => (
                                <div key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-650 dark:text-slate-350 font-medium">
                                  📎 {lg.text} <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 ml-1">({lg.date})</span>
                                </div>
                              ))}
                            </div>
                          );
                        } else if (enq.notes) {
                          return (
                            <div className="mt-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]" title={enq.notes}>
                              📌 {enq.notes}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={enq.status || 'New'}
                        onChange={(e) => onUpdateStatus(enq.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${getStatusColor(enq.status || 'New')}`}
                      >
                        <option value="New">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Trial Scheduled">Trial Scheduled</option>
                        <option value="Admission Done">Admission Done</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="date"
                          value={enq.next_follow_up_date ? String(enq.next_follow_up_date).split('T')[0] : ''}
                          onChange={(e) => onUpdateFollowUpDate && onUpdateFollowUpDate(enq.id, e.target.value)}
                          className={`text-[11px] font-mono font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setLogModalEnq(enq)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isLight ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400'
                          }`}
                          title="View & Add Follow-up Logs / Replies"
                        >
                          📝
                        </button>
                        {enq.status !== 'Admission Done' && (
                          <button
                            onClick={() => onConvertToAdmission(enq)}
                            className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-700 transition shadow-sm text-[10px] cursor-pointer shrink-0"
                          >
                            Convert to Admission
                          </button>
                        )}
                        {onDeleteEnquiry && (
                          <button
                            onClick={() => onDeleteEnquiry(enq.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD ENQUIRY */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${bgCard} rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                <MessageSquare className="w-5 h-5 text-pink-500" /> Log New Enquiry
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Child's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riya"
                    value={form.child_name}
                    onChange={(e) => setForm({ ...form, child_name: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Years"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Parent / Guardian Name</label>
                <input
                  type="text"
                  required
                  placeholder="Parent's Name"
                  value={form.parent_name}
                  onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9999999999"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Email Address</label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Program Interested In</label>
                <select
                  value={form.program_interested}
                  onChange={(e) => setForm({ ...form, program_interested: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none cursor-pointer ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                >
                  <option value="Music & Dance">Music & Dance 💃</option>
                  <option value="Gymnastics & MMA">Gymnastics & MMA 🥋</option>
                  <option value="Roller Skating & Karate">Roller Skating & Karate 🛼</option>
                  <option value="Art & Craft">Art & Craft 🎨</option>
                  <option value="Yoga & Cricket">Yoga & Cricket 🏏</option>
                  <option value="Play Zone">Play Zone 🧸</option>
                  <option value="Zumba & Yoga">Zumba & Yoga (Mother) 🧘</option>
                </select>
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Follow-up Notes</label>
                <textarea
                  placeholder="Details of conversation, next follow-up dates..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Log Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LEAD FOLLOW-UP LOGS & REPLIES HISTORY */}
      {logModalEnq && (() => {
        let logs: { text: string, date: string }[] = [];
        if (logModalEnq.notes) {
          try {
            const parsed = JSON.parse(logModalEnq.notes);
            if (Array.isArray(parsed)) {
              logs = parsed;
            } else {
              logs = [{ text: logModalEnq.notes, date: logModalEnq.created_at ? new Date(logModalEnq.created_at).toLocaleDateString('en-GB') : '' }];
            }
          } catch (_) {
            logs = [{ text: logModalEnq.notes, date: logModalEnq.created_at ? new Date(logModalEnq.created_at).toLocaleDateString('en-GB') : '' }];
          }
        }

        const quickReplies = [
          "No pick call",
          "Cut the call",
          "Interested sure aayege",
          "Visit on Sunday",
          "Visit krege aaj evening",
          "Aaj nhi aayege",
          "Out of Patna hai",
          "Not interested",
          "Share details"
        ];

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
            <div className={`${bgCard} rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                  📝 Follow-up Logs & replies: <span className="text-pink-600 font-extrabold">{logModalEnq.child_name}</span>
                </h3>
                <button onClick={() => setLogModalEnq(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm">
                  ✕
                </button>
              </div>

              {/* ORIGINAL INQUIRY MESSAGE DETAIL (Properly visible in large overlay) */}
              {logModalEnq.message && (
                <div className="p-3 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 rounded-2xl space-y-1">
                  <span className="block font-bold text-[10px] uppercase text-pink-600 tracking-wider">Original Message / Inquiry Details</span>
                  <p className={`font-semibold leading-relaxed text-xs ${textPrimary} whitespace-pre-wrap`}>
                    💬 {logModalEnq.message}
                  </p>
                </div>
              )}

              {/* LOGS LIST */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                <span className={`block font-bold text-[10px] uppercase tracking-wider ${textSecondary}`}>Replies Timeline ({logs.length})</span>
                {logs.length === 0 ? (
                  <p className="text-slate-400 italic py-2 text-center">No replies logged yet. Use quick reply buttons below to add one!</p>
                ) : (
                  <div className="space-y-1.5">
                    {logs.map((lg, idx) => (
                      <div key={idx} className="flex justify-between gap-3 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800 rounded-xl">
                        <span className="font-semibold text-slate-850 dark:text-slate-200">{lg.text}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">{lg.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ADD LOG SUBFORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newLogText.trim()) return;
                  const updatedLogs = [...logs, { text: newLogText.trim(), date: new Date(newLogDate).toLocaleDateString('en-GB') }];
                  onUpdateNotes && onUpdateNotes(logModalEnq.id, JSON.stringify(updatedLogs));
                  setLogModalEnq({ ...logModalEnq, notes: JSON.stringify(updatedLogs) });
                  setNewLogText('');
                }}
                className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800"
              >
                <div className="space-y-1.5">
                  <span className={`block font-bold text-[10px] uppercase tracking-wider ${textSecondary}`}>Quick Reply Helpers:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickReplies.map(reply => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() => setNewLogText(reply)}
                        className="px-2 py-1 bg-pink-500/10 text-pink-600 hover:bg-pink-600 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer border border-pink-200 dark:border-pink-900"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className={`font-bold ${textSecondary}`}>Follow-up Reason / Response</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Will visit on Wednesday"
                      value={newLogText}
                      onChange={(e) => setNewLogText(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 outline-none ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold' : 'bg-slate-950 border-slate-800 text-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`font-bold ${textSecondary}`}>Contact Date</label>
                    <input
                      type="date"
                      required
                      value={newLogDate}
                      onChange={(e) => setNewLogDate(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 outline-none font-mono font-bold ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setLogModalEnq(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    + Add Reply Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
