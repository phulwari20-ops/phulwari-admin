import React from 'react';
import { Send, Trash2 } from 'lucide-react';

interface NoticesTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  announcements: any[];
  setIsAddNoticeOpen: (isOpen: boolean) => void;
  handleDeleteNotice: (id: string) => void;
}

export default function NoticesTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  announcements,
  setIsAddNoticeOpen,
  handleDeleteNotice
}: NoticesTabProps) {
  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className={`text-sm font-bold ${textPrimary}`}>Notices & Circular Broadcaster</h3>
        <button
          onClick={() => setIsAddNoticeOpen(true)}
          className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Publish New Notice</span>
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((an, i) => (
          <div key={i} className={`p-4 rounded-xl border space-y-2 ${bgSubCard}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-600/20 text-purple-400 border border-purple-800 rounded-full">
                {an.category || 'General Notice'}
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 font-mono">{an.date || 'August 2026'}</span>
                <button
                  onClick={() => handleDeleteNotice(an.id)}
                  className="p-1.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition"
                  title="Delete Notice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className={`text-xs font-bold ${textPrimary}`}>{an.title}</h4>
            <p className={`text-xs ${textSecondary}`}>{an.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
