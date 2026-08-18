'use client'

import React from 'react'
import { X, Download, Printer, FileText } from 'lucide-react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  handleExportStudentsPDF: () => void
  handleExportStudentsCSV: () => void
  handleExportBulkRegistrationForms: () => void
  isLight: boolean
  bgCard: string
  textPrimary: string
  textSecondary: string
}

export default function ExportModal({
  isOpen,
  onClose,
  handleExportStudentsPDF,
  handleExportStudentsCSV,
  handleExportBulkRegistrationForms,
  isLight,
  bgCard,
  textPrimary,
  textSecondary
}: ExportModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className={`${bgCard} rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Download className="w-5 h-5 text-emerald-500" /> Export Student Directory
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={`text-xs ${textSecondary}`}>Choose your preferred export format to download the complete directory of enrolled students.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExportStudentsPDF}
            className="p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <Printer className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold ${textPrimary}`}>Export to PDF</span>
            <span className="text-[10px] text-slate-400">Printable Document</span>
          </button>

          <button
            onClick={handleExportStudentsCSV}
            className="p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <FileText className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold ${textPrimary}`}>Export to CSV</span>
            <span className="text-[10px] text-slate-400">Excel / Spreadsheet</span>
          </button>
          
          <button
            onClick={handleExportBulkRegistrationForms}
            className="p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 hover:border-amber-500 hover:bg-amber-50/50 transition cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <Download className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold ${textPrimary}`}>Print Reg Forms</span>
            <span className="text-[10px] text-slate-400">Bulk Registration Forms</span>
          </button>
        </div>
      </div>
    </div>
  )
}
