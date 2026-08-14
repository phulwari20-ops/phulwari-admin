import React, { useState } from 'react';
import { UserPlus, MessageSquare, PhoneCall, Plus, Trash2, CalendarDays } from 'lucide-react';

interface EnquiriesTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  badgePassword: string;
  isLight: boolean;
  enquiries: any[];
  onUpdateStatus: (id: string, status: string) => void;
  onAddEnquiry: (enquiry: any) => void;
  onConvertToAdmission: (enquiry: any) => void;
  onDeleteEnquiry?: (id: string) => void;
}

export default function EnquiriesTab({
  bgCard, bgSubCard, textPrimary, textSecondary, badgePassword, isLight,
  enquiries, onUpdateStatus, onAddEnquiry, onConvertToAdmission, onDeleteEnquiry
}: EnquiriesTabProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="space-y-6">
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
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-200'}`}>
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">No enquiries tracked yet.</td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      {enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold">{enq.child_name}</div>
                      <div className="text-[10px] text-slate-400">Age: {enq.age || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{enq.parent_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{enq.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-pink-600">{enq.program_interested}</td>
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
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {enq.status !== 'Admission Done' && (
                        <button
                          onClick={() => onConvertToAdmission(enq)}
                          className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-green-700 transition shadow-sm text-[10px] cursor-pointer"
                        >
                          Convert to Admission
                        </button>
                      )}
                      {onDeleteEnquiry && (
                        <button
                          onClick={() => onDeleteEnquiry(enq.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
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
    </div>
  );
}
