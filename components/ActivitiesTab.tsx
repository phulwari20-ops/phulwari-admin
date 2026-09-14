'use client'

import React, { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Layers,
  Search,
  Globe,
  HelpCircle,
  MessageSquare,
  Award,
  BookOpen,
  MapPin,
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const COMMON_ICONS = [
  'Sparkles', 'Music', 'PersonStanding', 'Dumbbell', 'Shield', 'Palette',
  'Trophy', 'Leaf', 'Smile', 'Heart', 'Star', 'Disc3', 'Swords', 'Footprints',
  'Activity', 'Gamepad2', 'Baby', 'Crown', 'Puzzle', 'Award', 'CheckCircle2'
]

const COLOR_PRESETS = [
  { color: '#FF4D8D', bg: '#FFE6EF', label: 'Rose Pink' },
  { color: '#8B5CF6', bg: '#EFE7FE', label: 'Purple' },
  { color: '#3D8BFF', bg: '#E5EFFF', label: 'Sky Blue' },
  { color: '#34B36B', bg: '#E3F7EA', label: 'Emerald' },
  { color: '#E8A621', bg: '#FFF3D9', label: 'Amber' },
  { color: '#FF8A3D', bg: '#FFEADB', label: 'Orange' },
  { color: '#6D28D9', bg: '#EDE9FE', label: 'Deep Violet' },
]

function renderIcon(iconName: string, className = 'w-4 h-4', style?: React.CSSProperties) {
  if (!iconName) return <LucideIcons.Sparkles className={className} style={style} />
  const clean = iconName.trim()
  const pascal = clean.replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase())
  const Comp = (LucideIcons as any)[pascal] || (LucideIcons as any)[clean] || LucideIcons.Sparkles
  return <Comp className={className} style={style} />
}

export interface ActivityRecord {
  id: string
  slug: string
  aliases?: string[]
  badge_text: string
  title_tag: string
  meta_description: string
  h1: string
  intro_p1: string
  intro_p2?: string
  hero_image: string
  gallery_images: string[]
  color: string
  bg: string
  icon: string
  why_matters_title: string
  why_matters_content: string
  benefits_title: string
  benefits: Array<{ title: string; description: string }>
  programs_title: string
  programs: Array<{ title: string; age_bracket?: string; description: string; points?: string[] }>
  why_choose_title: string
  why_choose_points: Array<{ title: string; description: string }>
  hyper_local_title: string
  hyper_local_points: Array<{ area: string; description: string }>
  testimonials: Array<{ quote: string; author: string; locality: string }>
  faqs: Array<{ question: string; answer: string }>
  schema_json: any
  cta?: {
    phone: string
    whatsapp: string
    address: string
    button_text: string
  }
  order_index: number
  is_active: boolean
  updated_at?: string
}

export default function ActivitiesTab() {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'seo' | 'media' | 'benefits' | 'programs' | 'details' | 'faqs' | 'cta' | 'schema'>('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch activities from Supabase
  const loadActivities = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('activity_pages')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error

      if (data) {
        setActivities(data as ActivityRecord[])
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id)
        }
      }
    } catch (err: any) {
      console.error('Error loading activities:', err)
      setErrorMessage(err.message || 'Failed to load activities from database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

  const currentActivity = activities.find(a => a.id === selectedId)

  // Update field of current activity in state
  const updateCurrent = (field: keyof ActivityRecord, value: any) => {
    if (!selectedId) return
    setActivities(prev =>
      prev.map(a => (a.id === selectedId ? { ...a, [field]: value } : a))
    )
  }

  // Save current activity to Supabase via API & direct client
  const handleSave = async () => {
    if (!currentActivity) return
    setSaving(true)
    setErrorMessage(null)
    setSaveSuccess(false)

    try {
      const payload = {
        ...currentActivity,
        updated_at: new Date().toISOString()
      }

      // Try API POST route first
      let savedData: any = null
      try {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const resJson = await res.json()
          savedData = resJson.data
        }
      } catch (e) {
        console.warn('API POST failed, falling back to direct client:', e)
      }

      // If API route was bypassed or failed, use direct Supabase client
      if (!savedData) {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('activity_pages')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single()

        if (error) throw error
        savedData = data
      }

      if (savedData) {
        setActivities(prev =>
          prev.map(a => (a.id === selectedId ? { ...a, ...savedData } : a))
        )
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err: any) {
      console.error('Error saving activity:', err)
      setErrorMessage(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Create new activity
  const handleAddNew = () => {
    const newSlug = `new-activity-${Date.now().toString().slice(-4)}`
    const newRecord: ActivityRecord = {
      id: newSlug,
      slug: newSlug,
      aliases: [],
      badge_text: 'New Activity',
      title_tag: 'Kids Activity Classes in Patna | Phulwari Activity Centre',
      meta_description: 'Join the best activity classes in Patna for children at Phulwari Activity Centre, Kidwaipuri.',
      h1: 'Kids Activity Classes in Patna',
      intro_p1: 'Discover engaging and fun-filled learning sessions designed to support your child’s development.',
      intro_p2: 'Led by passionate mentors in a child-safe environment.',
      hero_image: '/phulwari_logo.webp',
      gallery_images: ['/phulwari_logo.webp'],
      color: '#FF4D8D',
      bg: '#FFE6EF',
      icon: 'Sparkles',
      why_matters_title: 'Why This Program Matters',
      why_matters_content: 'Supports physical, cognitive, and social development.',
      benefits_title: 'Key Benefits',
      benefits: [
        { title: 'Confidence Building', description: 'Nurtures natural expression and self-belief.' }
      ],
      programs_title: 'Our Specialized Batches',
      programs: [
        { title: 'Foundational Batch', age_bracket: '3 - 6 Years', description: 'Introductory sessions focused on fun and basics.' }
      ],
      why_choose_title: 'Why Choose Phulwari?',
      why_choose_points: [
        { title: 'Expert Guidance', description: 'Certified mentors with personalized attention.' }
      ],
      hyper_local_title: 'Convenient Patna Locations',
      hyper_local_points: [
        { area: 'Kidwaipuri & Boring Road', description: 'Within 5 minutes travel time.' }
      ],
      testimonials: [
        { quote: 'A wonderfully safe and engaging place for our child.', author: 'Patna Parent', locality: 'Patna' }
      ],
      faqs: [
        { question: 'Is a free demo class available?', answer: 'Yes, we offer a free trial session before enrollment.' }
      ],
      schema_json: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Phulwari Mother & Child Activity Centre',
        'url': `https://phulwari.co.in/activities/${newSlug}`
      },
      order_index: activities.length + 1,
      is_active: true
    }

    setActivities(prev => [...prev, newRecord])
    setSelectedId(newRecord.id)
  }

  // Delete activity
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity page? This will remove it from the website.')) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('activity_pages').delete().eq('id', id)
      if (error) throw error
      const remaining = activities.filter(a => a.id !== id)
      setActivities(remaining)
      if (selectedId === id) {
        setSelectedId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (err: any) {
      alert('Delete failed: ' + err.message)
    }
  }

  const filteredActivities = activities.filter(a =>
    a.badge_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.h1?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[450px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600 mb-4" />
        <p className="text-sm font-medium">Loading activity pages from database...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900">Dynamic Activity Pages CMS</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage all 13 activity pages dynamically stored in Supabase with live frontend synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadActivities}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            title="Reload from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Activity</span>
          </button>

          {currentActivity && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 text-white font-semibold text-sm hover:bg-pink-700 transition shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Activity page updated successfully and synced to database!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Activity List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>

            <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
              {filteredActivities.map((act) => {
                const isSelected = act.id === selectedId
                return (
                  <button
                    key={act.id}
                    onClick={() => setSelectedId(act.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-pink-50/80 border border-pink-200 shadow-xs'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: act.bg || '#FFF', borderColor: act.color || '#DDD' }}
                      >
                        {renderIcon(act.icon, 'w-4 h-4', { color: act.color })}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {act.badge_text || act.slug}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          /{act.slug}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${act.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        title={act.is_active ? 'Active' : 'Inactive'}
                      />
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Editor Area */}
        <div className="lg:col-span-8">
          {currentActivity ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Activity Summary Bar */}
              <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: currentActivity.bg, borderColor: currentActivity.color }}
                  >
                    {renderIcon(currentActivity.icon, 'w-6 h-6', { color: currentActivity.color })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">{currentActivity.badge_text}</h2>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {currentActivity.slug}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                      <span>Order: #{currentActivity.order_index}</span>
                      <span>•</span>
                      <span className={currentActivity.is_active ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                        {currentActivity.is_active ? 'Active on Web' : 'Draft / Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://phulwari.co.in/activities/${currentActivity.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-white transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Live</span>
                  </a>

                  <button
                    onClick={() => handleDelete(currentActivity.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtabs Header */}
              <div className="border-b border-gray-100 flex overflow-x-auto px-4 gap-1 text-sm font-semibold bg-white scrollbar-none">
                {[
                  { key: 'basic', label: 'Basic & Colors' },
                  { key: 'seo', label: 'SEO & Headers' },
                  { key: 'media', label: 'Images & Gallery' },
                  { key: 'benefits', label: `Benefits (${currentActivity.benefits?.length || 0})` },
                  { key: 'programs', label: `Programs (${currentActivity.programs?.length || 0})` },
                  { key: 'details', label: 'Why Us & Commute' },
                  { key: 'faqs', label: `FAQs (${currentActivity.faqs?.length || 0})` },
                  { key: 'cta', label: 'CTA & Contact' },
                  { key: 'schema', label: 'JSON Schema' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSubTab(tab.key as any)}
                    className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap ${
                      activeSubTab === tab.key
                        ? 'border-pink-600 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subtab Contents */}
              <div className="p-6 space-y-6">
                {/* 1. BASIC & COLORS */}
                {activeSubTab === 'basic' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          URL Slug (unique)
                        </label>
                        <input
                          type="text"
                          value={currentActivity.slug || ''}
                          onChange={e => updateCurrent('slug', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                        <p className="text-xs text-gray-400 mt-1">Example: music-classes-patna</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Badge / Short Title
                        </label>
                        <input
                          type="text"
                          value={currentActivity.badge_text || ''}
                          onChange={e => updateCurrent('badge_text', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                    </div>

                    {/* Icon Picker with live preview */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Lucide Icon Name
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
                          style={{ backgroundColor: currentActivity.bg, borderColor: currentActivity.color }}
                        >
                          {renderIcon(currentActivity.icon, 'w-5 h-5', { color: currentActivity.color })}
                        </div>
                        <input
                          type="text"
                          list="activity-icon-suggestions"
                          value={currentActivity.icon || ''}
                          onChange={e => updateCurrent('icon', e.target.value)}
                          placeholder="Type icon name e.g. Music, Star, Sparkles..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                        <datalist id="activity-icon-suggestions">
                          {COMMON_ICONS.map(i => (
                            <option key={i} value={i} />
                          ))}
                        </datalist>
                      </div>

                      {/* Quick icon chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {COMMON_ICONS.slice(0, 10).map(ic => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => updateCurrent('icon', ic)}
                            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 transition"
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentActivity.color || '#FF4D8D'}
                            onChange={e => updateCurrent('color', e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border p-0.5"
                          />
                          <input
                            type="text"
                            value={currentActivity.color || ''}
                            onChange={e => updateCurrent('color', e.target.value)}
                            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Light Background Tint
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentActivity.bg || '#FFE6EF'}
                            onChange={e => updateCurrent('bg', e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border p-0.5"
                          />
                          <input
                            type="text"
                            value={currentActivity.bg || ''}
                            onChange={e => updateCurrent('bg', e.target.value)}
                            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Color Presets */}
                    <div>
                      <span className="block text-xs text-gray-500 mb-1.5">Quick Palette Presets:</span>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              updateCurrent('color', p.color)
                              updateCurrent('bg', p.bg)
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs hover:scale-105 transition"
                            style={{ borderColor: p.color }}
                          >
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Order & Active toggle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Display Order Index
                        </label>
                        <input
                          type="number"
                          value={currentActivity.order_index ?? 0}
                          onChange={e => updateCurrent('order_index', parseInt(e.target.value) || 0)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Publish Status</div>
                          <div className="text-xs text-gray-500">Visible to website visitors</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentActivity.is_active ?? true}
                          onChange={e => updateCurrent('is_active', e.target.checked)}
                          className="w-5 h-5 accent-pink-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SEO & HEADERS */}
                {activeSubTab === 'seo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        SEO Title Tag (&lt;title&gt;)
                      </label>
                      <input
                        type="text"
                        value={currentActivity.title_tag || ''}
                        onChange={e => updateCurrent('title_tag', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
                      />
                      <span className="text-xs text-gray-400 mt-1 block">
                        Character count: {currentActivity.title_tag?.length || 0} / 60 optimal
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={currentActivity.meta_description || ''}
                        onChange={e => updateCurrent('meta_description', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                      />
                      <span className="text-xs text-gray-400 mt-1 block">
                        Character count: {currentActivity.meta_description?.length || 0} / 160 optimal
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Main H1 Headline on Page
                      </label>
                      <input
                        type="text"
                        value={currentActivity.h1 || ''}
                        onChange={e => updateCurrent('h1', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Intro Paragraph 1 (Lead summary)
                        </label>
                        <textarea
                          rows={3}
                          value={currentActivity.intro_p1 || ''}
                          onChange={e => updateCurrent('intro_p1', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Intro Paragraph 2 (Secondary details)
                        </label>
                        <textarea
                          rows={3}
                          value={currentActivity.intro_p2 || ''}
                          onChange={e => updateCurrent('intro_p2', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. MEDIA & GALLERY */}
                {activeSubTab === 'media' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Primary Hero Image Path / URL
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={currentActivity.hero_image || ''}
                          onChange={e => updateCurrent('hero_image', e.target.value)}
                          placeholder="/music/image.png"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
                        />
                        {currentActivity.hero_image && (
                          <div className="w-12 h-12 rounded-xl border overflow-hidden relative shrink-0 bg-gray-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentActivity.hero_image}
                              alt="Hero preview"
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.target as any).style.display = 'none')}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Gallery Images Showcase</h4>
                          <p className="text-xs text-gray-500">Interactive carousel photos displayed on the activity page.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentActivity.gallery_images || []
                            updateCurrent('gallery_images', [...cur, '/music/image.png'])
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Image Path</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(currentActivity.gallery_images || []).map((imgUrl, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-gray-50">
                            <div className="w-10 h-10 rounded-lg border overflow-hidden relative shrink-0 bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imgUrl}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => ((e.target as any).style.display = 'none')}
                              />
                            </div>
                            <input
                              type="text"
                              value={imgUrl}
                              onChange={(e) => {
                                const copy = [...(currentActivity.gallery_images || [])]
                                copy[idx] = e.target.value
                                updateCurrent('gallery_images', copy)
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (currentActivity.gallery_images || []).filter((_, i) => i !== idx)
                                updateCurrent('gallery_images', copy)
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. BENEFITS */}
                {activeSubTab === 'benefits' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Benefits Section Title
                      </label>
                      <input
                        type="text"
                        value={currentActivity.benefits_title || ''}
                        onChange={e => updateCurrent('benefits_title', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Key Benefits Cards ({currentActivity.benefits?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentActivity.benefits || []
                            updateCurrent('benefits', [...cur, { title: 'New Benefit', description: 'Benefit explanation here.' }])
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Benefit</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(currentActivity.benefits || []).map((b, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-gray-400">Benefit #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = (currentActivity.benefits || []).filter((_, i) => i !== idx)
                                  updateCurrent('benefits', copy)
                                }}
                                className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={b.title}
                              onChange={(e) => {
                                const copy = [...(currentActivity.benefits || [])]
                                copy[idx] = { ...copy[idx], title: e.target.value }
                                updateCurrent('benefits', copy)
                              }}
                              placeholder="Benefit Title"
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold bg-white"
                            />
                            <textarea
                              rows={2}
                              value={b.description}
                              onChange={(e) => {
                                const copy = [...(currentActivity.benefits || [])]
                                copy[idx] = { ...copy[idx], description: e.target.value }
                                updateCurrent('benefits', copy)
                              }}
                              placeholder="Benefit Description"
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PROGRAMS */}
                {activeSubTab === 'programs' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Programs Section Title
                      </label>
                      <input
                        type="text"
                        value={currentActivity.programs_title || ''}
                        onChange={e => updateCurrent('programs_title', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Batches & Streams ({currentActivity.programs?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentActivity.programs || []
                            updateCurrent('programs', [
                              ...cur,
                              { title: 'New Program Stream', age_bracket: '4 - 8 Years', description: 'Curriculum details.', points: ['Point 1', 'Point 2'] }
                            ])
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Program</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(currentActivity.programs || []).map((prog, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-gray-400">Program #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = (currentActivity.programs || []).filter((_, i) => i !== idx)
                                  updateCurrent('programs', copy)
                                }}
                                className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={prog.title}
                                onChange={(e) => {
                                  const copy = [...(currentActivity.programs || [])]
                                  copy[idx] = { ...copy[idx], title: e.target.value }
                                  updateCurrent('programs', copy)
                                }}
                                placeholder="Program Name (e.g. Toddler Rhythm Sessions)"
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold bg-white"
                              />
                              <input
                                type="text"
                                value={prog.age_bracket || ''}
                                onChange={(e) => {
                                  const copy = [...(currentActivity.programs || [])]
                                  copy[idx] = { ...copy[idx], age_bracket: e.target.value }
                                  updateCurrent('programs', copy)
                                }}
                                placeholder="Age Bracket (e.g. 2 - 4 Years)"
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                              />
                            </div>

                            <textarea
                              rows={2}
                              value={prog.description}
                              onChange={(e) => {
                                const copy = [...(currentActivity.programs || [])]
                                copy[idx] = { ...copy[idx], description: e.target.value }
                                updateCurrent('programs', copy)
                              }}
                              placeholder="Program Curriculum description"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. DETAILS & COMMUTE */}
                {activeSubTab === 'details' && (
                  <div className="space-y-6">
                    {/* Why Matters */}
                    <div className="space-y-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-900">Why It Matters Section</h4>
                      <input
                        type="text"
                        value={currentActivity.why_matters_title || ''}
                        onChange={e => updateCurrent('why_matters_title', e.target.value)}
                        placeholder="Why This Activity Matters"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                      />
                      <textarea
                        rows={3}
                        value={currentActivity.why_matters_content || ''}
                        onChange={e => updateCurrent('why_matters_content', e.target.value)}
                        placeholder="Detailed editorial paragraph on the developmental impact"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white leading-relaxed"
                      />
                    </div>

                    {/* Why Choose Phulwari Points */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">Why Choose Phulwari Points</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentActivity.why_choose_points || []
                            updateCurrent('why_choose_points', [...cur, { title: 'Safe Environment', description: 'CCTV monitored.' }])
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold hover:bg-gray-200 transition"
                        >
                          + Add Point
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(currentActivity.why_choose_points || []).map((pt, idx) => (
                          <div key={idx} className="flex gap-2 items-start p-2 rounded-lg border border-gray-200 bg-white">
                            <input
                              type="text"
                              value={pt.title}
                              onChange={(e) => {
                                const copy = [...(currentActivity.why_choose_points || [])]
                                copy[idx] = { ...copy[idx], title: e.target.value }
                                updateCurrent('why_choose_points', copy)
                              }}
                              placeholder="Title"
                              className="w-1/3 px-2.5 py-1.5 rounded border border-gray-200 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={pt.description}
                              onChange={(e) => {
                                const copy = [...(currentActivity.why_choose_points || [])]
                                copy[idx] = { ...copy[idx], description: e.target.value }
                                updateCurrent('why_choose_points', copy)
                              }}
                              placeholder="Description"
                              className="flex-1 px-2.5 py-1.5 rounded border border-gray-200 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (currentActivity.why_choose_points || []).filter((_, i) => i !== idx)
                                updateCurrent('why_choose_points', copy)
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hyper Local Commute Points */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">Hyper-Local Patna Areas & Commute</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = currentActivity.hyper_local_points || []
                            updateCurrent('hyper_local_points', [...cur, { area: 'Kidwaipuri', description: '2 mins away.' }])
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold hover:bg-gray-200 transition"
                        >
                          + Add Area
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(currentActivity.hyper_local_points || []).map((loc, idx) => (
                          <div key={idx} className="flex gap-2 items-start p-2 rounded-lg border border-gray-200 bg-white">
                            <input
                              type="text"
                              value={loc.area}
                              onChange={(e) => {
                                const copy = [...(currentActivity.hyper_local_points || [])]
                                copy[idx] = { ...copy[idx], area: e.target.value }
                                updateCurrent('hyper_local_points', copy)
                              }}
                              placeholder="Locality name"
                              className="w-1/3 px-2.5 py-1.5 rounded border border-gray-200 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={loc.description}
                              onChange={(e) => {
                                const copy = [...(currentActivity.hyper_local_points || [])]
                                copy[idx] = { ...copy[idx], description: e.target.value }
                                updateCurrent('hyper_local_points', copy)
                              }}
                              placeholder="Commute time / directions"
                              className="flex-1 px-2.5 py-1.5 rounded border border-gray-200 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (currentActivity.hyper_local_points || []).filter((_, i) => i !== idx)
                                updateCurrent('hyper_local_points', copy)
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. FAQS */}
                {activeSubTab === 'faqs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Activity Specific FAQs</h4>
                        <p className="text-xs text-gray-500">Displayed in accordion on this activity&apos;s page.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = currentActivity.faqs || []
                          updateCurrent('faqs', [...cur, { question: 'Frequently asked question?', answer: 'Clear helpful answer.' }])
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(currentActivity.faqs || []).map((faq, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-gray-400">FAQ #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = (currentActivity.faqs || []).filter((_, i) => i !== idx)
                                updateCurrent('faqs', copy)
                              }}
                              className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const copy = [...(currentActivity.faqs || [])]
                              copy[idx] = { ...copy[idx], question: e.target.value }
                              updateCurrent('faqs', copy)
                            }}
                            placeholder="Question"
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold bg-white"
                          />
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const copy = [...(currentActivity.faqs || [])]
                              copy[idx] = { ...copy[idx], answer: e.target.value }
                              updateCurrent('faqs', copy)
                            }}
                            placeholder="Answer"
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. CTA & CONTACT */}
                {activeSubTab === 'cta' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Call Phone Number
                        </label>
                        <input
                          type="text"
                          value={currentActivity.cta?.phone || '+91 62073 68839'}
                          onChange={e => {
                            const cta = currentActivity.cta || { phone: '', whatsapp: '', address: '', button_text: '' }
                            updateCurrent('cta', { ...cta, phone: e.target.value })
                          }}
                          placeholder="+91 62073 68839"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          WhatsApp Number
                        </label>
                        <input
                          type="text"
                          value={currentActivity.cta?.whatsapp || '+916207368839'}
                          onChange={e => {
                            const cta = currentActivity.cta || { phone: '', whatsapp: '', address: '', button_text: '' }
                            updateCurrent('cta', { ...cta, whatsapp: e.target.value })
                          }}
                          placeholder="+916207368839"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Centre Address / Location Text
                      </label>
                      <input
                        type="text"
                        value={currentActivity.cta?.address || 'M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road, Patna, Bihar – 800001'}
                        onChange={e => {
                          const cta = currentActivity.cta || { phone: '', whatsapp: '', address: '', button_text: '' }
                          updateCurrent('cta', { ...cta, address: e.target.value })
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={currentActivity.cta?.button_text || 'Book Free Trial / Demo'}
                        onChange={e => {
                          const cta = currentActivity.cta || { phone: '', whatsapp: '', address: '', button_text: '' }
                          updateCurrent('cta', { ...cta, button_text: e.target.value })
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* 9. SCHEMA JSON */}
                {activeSubTab === 'schema' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Structured Data (Schema.org JSON-LD)
                    </label>
                    <textarea
                      rows={12}
                      value={
                        typeof currentActivity.schema_json === 'object'
                          ? JSON.stringify(currentActivity.schema_json, null, 2)
                          : currentActivity.schema_json || '{}'
                      }
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value)
                          updateCurrent('schema_json', parsed)
                        } catch {
                          // Allow typing until valid JSON
                          updateCurrent('schema_json', e.target.value)
                        }
                      }}
                      className="w-full p-3.5 rounded-xl border border-gray-200 text-xs font-mono bg-gray-50 leading-relaxed"
                    />
                    <p className="text-xs text-gray-400">
                      Directly injected into Google search results snippet metadata.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-2xl bg-white">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select an activity from the left list to edit, or click &ldquo;Add New Activity&rdquo;.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
