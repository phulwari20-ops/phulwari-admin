'use client'

import React, { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { Search, X, Check } from 'lucide-react'

export interface IconPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (iconName: string) => void
  currentIcon?: string
  accentColor?: string
}

// Curated list of popular Lucide icons for activities, education, legal, FAQs, services
export const CURATED_ICONS: { name: string; category: string }[] = [
  // Legal & Trust
  { name: 'Shield', category: 'Legal & Trust' },
  { name: 'ShieldCheck', category: 'Legal & Trust' },
  { name: 'Scale', category: 'Legal & Trust' },
  { name: 'Gavel', category: 'Legal & Trust' },
  { name: 'FileText', category: 'Legal & Trust' },
  { name: 'Lock', category: 'Legal & Trust' },
  { name: 'Key', category: 'Legal & Trust' },
  { name: 'Eye', category: 'Legal & Trust' },
  { name: 'EyeOff', category: 'Legal & Trust' },
  { name: 'CheckCircle2', category: 'Legal & Trust' },
  { name: 'AlertCircle', category: 'Legal & Trust' },
  { name: 'HelpCircle', category: 'Legal & Trust' },
  { name: 'Info', category: 'Legal & Trust' },
  { name: 'FileCheck', category: 'Legal & Trust' },
  { name: 'Copyright', category: 'Legal & Trust' },

  // Kids, Education & Learning
  { name: 'Sparkles', category: 'Activities & Learning' },
  { name: 'Baby', category: 'Activities & Learning' },
  { name: 'Smile', category: 'Activities & Learning' },
  { name: 'Heart', category: 'Activities & Learning' },
  { name: 'HeartPulse', category: 'Activities & Learning' },
  { name: 'BookOpen', category: 'Activities & Learning' },
  { name: 'GraduationCap', category: 'Activities & Learning' },
  { name: 'Award', category: 'Activities & Learning' },
  { name: 'Trophy', category: 'Activities & Learning' },
  { name: 'Star', category: 'Activities & Learning' },
  { name: 'Music', category: 'Activities & Learning' },
  { name: 'Palette', category: 'Activities & Learning' },
  { name: 'Camera', category: 'Activities & Learning' },
  { name: 'Gamepad2', category: 'Activities & Learning' },
  { name: 'Cake', category: 'Activities & Learning' },
  { name: 'Tent', category: 'Activities & Learning' },
  { name: 'Sun', category: 'Activities & Learning' },
  { name: 'Flame', category: 'Activities & Learning' },
  { name: 'Zap', category: 'Activities & Learning' },
  { name: 'Activity', category: 'Activities & Learning' },
  { name: 'Dumbbell', category: 'Activities & Learning' },

  // People & Community
  { name: 'Users', category: 'People & Community' },
  { name: 'User', category: 'People & Community' },
  { name: 'UserCheck', category: 'People & Community' },
  { name: 'UserPlus', category: 'People & Community' },
  { name: 'MessageCircle', category: 'People & Community' },
  { name: 'Phone', category: 'People & Community' },
  { name: 'Mail', category: 'People & Community' },
  { name: 'MapPin', category: 'People & Community' },
  { name: 'Globe', category: 'People & Community' },
  { name: 'Share2', category: 'People & Community' },

  // Management & Operations
  { name: 'ClipboardList', category: 'Management' },
  { name: 'Calendar', category: 'Management' },
  { name: 'Clock', category: 'Management' },
  { name: 'Wallet', category: 'Management' },
  { name: 'CreditCard', category: 'Management' },
  { name: 'RotateCcw', category: 'Management' },
  { name: 'RefreshCw', category: 'Management' },
  { name: 'Settings', category: 'Management' },
  { name: 'Bell', category: 'Management' },
  { name: 'Bookmark', category: 'Management' },
  { name: 'Tag', category: 'Management' },
  { name: 'Gift', category: 'Management' }
]

export function renderLucideIcon(
  iconName?: string,
  className: string = 'w-4 h-4',
  style?: React.CSSProperties
) {
  if (!iconName) return <LucideIcons.HelpCircle className={className} style={style} />
  const clean = iconName.trim()
  const pascal = clean.replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase())

  // Direct match
  if ((LucideIcons as any)[pascal]) {
    const Comp = (LucideIcons as any)[pascal]
    return <Comp className={className} style={style} />
  }
  if ((LucideIcons as any)[clean]) {
    const Comp = (LucideIcons as any)[clean]
    return <Comp className={className} style={style} />
  }

  // Case-insensitive match across all Lucide icons
  const lower = clean.toLowerCase().replace(/[-_ ]/g, '')
  const foundKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === lower)
  if (foundKey) {
    const Comp = (LucideIcons as any)[foundKey]
    return <Comp className={className} style={style} />
  }

  return <LucideIcons.HelpCircle className={className} style={style} />
}

export default function IconPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentIcon = 'Sparkles',
  accentColor = '#3D8BFF'
}: IconPickerModalProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = useMemo(() => {
    const set = new Set<string>(['All'])
    CURATED_ICONS.forEach(i => set.add(i.category))
    return Array.from(set)
  }, [])

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase()
    return CURATED_ICONS.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory
      const matchQuery = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [search, selectedCategory])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Choose Lucide Icon
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse or search icons. Click any icon to apply.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search icons (e.g. shield, sparkles, baby, scale, lock)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[400px]">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No icons found matching &quot;{search}&quot;. Try a different keyword.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {filteredIcons.map(item => {
                const isSelected = currentIcon?.toLowerCase() === item.name.toLowerCase()
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onSelect(item.name)
                      onClose()
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/30 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {renderLucideIcon(item.name, 'w-5 h-5')}
                    </div>
                    <span className="text-[10px] font-medium mt-1 truncate max-w-full text-slate-600 dark:text-slate-400 group-hover:text-blue-600">
                      {item.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex items-center justify-between text-xs text-slate-500">
          <span>Current: <strong className="text-slate-800 dark:text-slate-200">{currentIcon || 'Sparkles'}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
