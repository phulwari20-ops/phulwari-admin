'use client'

import React, { useState, useEffect, useRef } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  Save,
  Loader2,
  Shield,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  ExternalLink,
  Smartphone,
  Laptop,
  Maximize2,
  Minimize2,
  Sparkles,
  MoveUp,
  MoveDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const COMMON_ICONS = [
  'Shield', 'Database', 'FileText', 'CreditCard', 'Share2', 'Clock', 'Lock',
  'UserCheck', 'Phone', 'Mail', 'Sparkles', 'Eye', 'CheckCircle2', 'Heart',
  'Award', 'Star', 'Scale', 'Gavel', 'HelpCircle'
]

function renderIcon(iconName: string, className: string = 'w-4 h-4', style?: React.CSSProperties) {
  if (!iconName) return <LucideIcons.Shield className={className} style={style} />
  const clean = iconName.trim()
  const pascal = clean.replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase())
  const Comp = (LucideIcons as any)[pascal] || (LucideIcons as any)[clean] || LucideIcons.Shield
  return <Comp className={className} style={style} />
}

const DEFAULT_PRIVACY_DATA = {
  id: 1,
  badge_text: 'Privacy Policy',
  last_updated: 'June 2026',
  title_part1: 'Your',
  title_highlight: 'Privacy',
  title_part2: 'Matters',
  intro_text: 'At Phulwari – Mother & Child Activity Centre, we value the privacy and trust of every child, parent, guardian, and visitor. This policy explains how we collect, use, and protect your personal information.',
  sections: [
    {
      id: 'intro',
      num: '01',
      label: 'Our Commitment',
      icon: 'Shield',
      color: '#FF4D8D',
      bg: '#FFE6EF',
      content: 'Phulwari – Mother & Child Activity Centre is committed to protecting the privacy of every child, parent, and guardian who interacts with our services or visits our website.\nBy using our website or enrolling in our programs, you agree to the practices described in this Privacy Policy.'
    },
    {
      id: 'collection',
      num: '02',
      label: 'Information We Collect',
      icon: 'Database',
      color: '#3D8BFF',
      bg: '#E5EFFF',
      content: 'We may collect personal information during registration, admissions, inquiries, event bookings, camp registrations, and website interactions.',
      bullets: [
        'Parent / Guardian: Full Name, Mobile Number, Email Address, Residential Address, Emergency Contact Details',
        'Child: Name, Age & Date of Birth, Medical Info, Allergy Details, Special Needs',
        'Additional: Payment Information, Event Bookings, Photo/Video Consent, Device Info'
      ]
    },
    {
      id: 'usage',
      num: '03',
      label: 'How We Use It',
      icon: 'FileText',
      color: '#34B36B',
      bg: '#E3F7EA',
      content: 'The information we collect is used to manage admissions, classes, event registrations, parent communications, and ensure safety.',
      bullets: [
        'Processing admissions and registrations',
        'Managing classes and attendance',
        'Birthday Party, Summer Camp & Winter Camp bookings',
        'Parent communication and emergency alerts',
        'Customer support and assistance',
        'Ensuring child safety and well-being'
      ]
    },
    {
      id: 'payments',
      num: '04',
      label: 'Payment Information',
      icon: 'CreditCard',
      color: '#E8A621',
      bg: '#FFF3D9',
      content: 'Online payments may be processed through secure third-party payment providers.',
      notes: [
        'Phulwari does not store complete debit card, credit card, UPI, or banking information on its servers.',
        'All payment transactions are handled through secure payment gateways.'
      ]
    },
    {
      id: 'sharing',
      num: '05',
      label: 'Sharing of Information',
      icon: 'Share2',
      color: '#8B5CF6',
      bg: '#EFE7FE',
      content: 'We respect your privacy and do not sell, rent, or trade personal information to third parties.',
      bullets: [
        'Authorized staff members',
        'Payment processing partners',
        'Emergency medical personnel (when necessary)',
        'Law enforcement or government authorities when legally required'
      ]
    },
    {
      id: 'media',
      num: '06',
      label: 'Photography & Media',
      icon: 'Camera',
      color: '#FF8A3D',
      bg: '#FFEADB',
      content: 'Photographs and videos may be captured during Activity Classes, Birthday Celebrations, Summer Camps, Winter Camps, Competitions, and Events for promotional materials and galleries.\nParents may submit a written opt-out request before participation.'
    },
    {
      id: 'security',
      num: '07',
      label: 'Data Security',
      icon: 'Lock',
      color: '#14B8A6',
      bg: '#DFF7F1',
      content: 'We implement reasonable administrative, technical, and physical safeguards to protect personal information against unauthorized access, disclosure, or loss.'
    },
    {
      id: 'children',
      num: '08',
      label: "Children's Privacy",
      icon: 'Baby',
      color: '#F43F5E',
      bg: '#FFE1E6',
      content: 'Protecting children\'s privacy is paramount. Information is collected only with the knowledge and consent of parents or legal guardians.'
    },
    {
      id: 'cookies',
      num: '09',
      label: 'Cookies',
      icon: 'Cookie',
      color: '#3D8BFF',
      bg: '#E5EFFF',
      content: 'Our website may use cookies to improve user experience, analyse website traffic, and enhance performance.\nUsers can manage or disable cookies through their browser settings.'
    },
    {
      id: 'rights',
      num: '10',
      label: 'Your Rights',
      icon: 'UserCheck',
      color: '#34B36B',
      bg: '#E3F7EA',
      content: 'You have the right to request access, correction, or deletion of your personal records at any time.'
    },
    {
      id: 'third-party',
      num: '11',
      label: 'Third-Party Links',
      icon: 'Link',
      color: '#E8A621',
      bg: '#FFF3D9',
      content: 'Our website may contain links to external platforms (social media, Google Maps). Users are encouraged to review the privacy policies of those third-party services.'
    },
    {
      id: 'changes',
      num: '12',
      label: 'Changes to Policy',
      icon: 'RefreshCw',
      color: '#8B5CF6',
      bg: '#EFE7FE',
      content: 'Phulwari reserves the right to modify or update this Privacy Policy at any time.\nAny updates will be published on this page along with the revised Last Updated date.'
    },
    {
      id: 'contact',
      num: '13',
      label: 'Contact Us',
      icon: 'Mail',
      color: '#FF4D8D',
      bg: '#FFE6EF',
      content: 'If you have any questions regarding this Privacy Policy or the handling of your personal information, please contact us.'
    }
  ]
}

const COLOR_OPTIONS = [
  { label: 'Rose Pink', color: '#FF4D8D', bg: '#FFE6EF' },
  { label: 'Ocean Blue', color: '#3D8BFF', bg: '#E5EFFF' },
  { label: 'Emerald Green', color: '#34B36B', bg: '#E3F7EA' },
  { label: 'Amber Gold', color: '#E8A621', bg: '#FFF3D9' },
  { label: 'Royal Purple', color: '#8B5CF6', bg: '#EFE7FE' },
  { label: 'Warm Orange', color: '#FF8A3D', bg: '#FFEADB' },
  { label: 'Teal Green', color: '#14B8A6', bg: '#DFF7F1' },
  { label: 'Ruby Red', color: '#F43F5E', bg: '#FFE1E6' }
]

export default function PrivacyPageTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [config, setConfig] = useState<any>(DEFAULT_PRIVACY_DATA)

  // Live preview controls
  const [previewEnv, setPreviewEnv] = useState<'local' | 'live'>('live')
  const [previewUrl, setPreviewUrl] = useState('https://phulwari.co.in/legal/privacy')
  const [previewDevice, setPreviewDevice] = useState<'laptop' | 'phone'>('phone')
  const [isExpanded, setIsExpanded] = useState(false)
  const [laptopWidth, setLaptopWidth] = useState<number>(1280)
  const [containerWidth, setContainerWidth] = useState<number>(550)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [isReloading, setIsReloading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPrivacyConfig()
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')
      setPreviewEnv(isLocal ? 'local' : 'live')
      const host = isLocal ? 'http://localhost:3000' : 'https://phulwari.co.in'
      setPreviewUrl(`${host}/legal/privacy`)
    }
  }, [])

  // Instantly send config changes to preview iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'LIVE_PRIVACY_UPDATE', config },
          '*'
        )
      } catch (e) {}
    }
  }, [config])

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'LIVE_PRIVACY_UPDATE', config },
          '*'
        )
      } catch (e) {}
    }
  }

  const changePreviewEnv = (env: 'local' | 'live') => {
    setPreviewEnv(env)
    const host = env === 'local' ? 'http://localhost:3000' : 'https://phulwari.co.in'
    const newUrl = `${host}/legal/privacy`
    setPreviewUrl(newUrl)
    if (iframeRef.current) {
      iframeRef.current.src = getRefreshedUrl(newUrl)
    }
  }

  useEffect(() => {
    if (!previewContainerRef.current) return
    const updateSize = () => {
      if (previewContainerRef.current) {
        setContainerWidth(previewContainerRef.current.clientWidth)
      }
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(previewContainerRef.current)
    return () => observer.disconnect()
  }, [previewDevice, isExpanded])

  const fetchPrivacyConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('privacy_page_config')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: seeded } = await supabase
            .from('privacy_page_config')
            .upsert(DEFAULT_PRIVACY_DATA)
            .select()
            .single()
          if (seeded) setConfig(seeded)
        } else {
          setConfig(DEFAULT_PRIVACY_DATA)
        }
      } else if (data) {
        setConfig(data)
      }
    } catch (err) {
      console.error('Error loading Privacy config:', err)
      setConfig(DEFAULT_PRIVACY_DATA)
    } finally {
      setLoading(false)
    }
  }

  const getRefreshedUrl = (base: string) => {
    try {
      const u = new URL(base)
      u.searchParams.set('_t', Date.now().toString())
      return u.toString()
    } catch (e) {
      return `${base}${base.includes('?') ? '&' : '?'}_t=${Date.now()}`
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('privacy_page_config')
        .upsert({ id: 1, ...config, updated_at: new Date().toISOString() })

      if (error) throw error
      setMessage('Privacy Policy page saved and published successfully!')
      if (iframeRef.current) {
        iframeRef.current.src = getRefreshedUrl(previewUrl)
      }
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      setMessage(`Error saving Privacy Policy: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const reloadPreview = () => {
    setIsReloading(true)
    if (iframeRef.current) {
      iframeRef.current.src = getRefreshedUrl(previewUrl)
    }
    setTimeout(() => setIsReloading(false), 1000)
  }

  const updateField = (field: string, val: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: val }))
  }

  const addSection = () => {
    const nextNum = String((config.sections?.length || 0) + 1).padStart(2, '0')
    const newSec = {
      id: `privacy-sec-${Date.now()}`,
      num: nextNum,
      label: 'New Privacy Section',
      icon: 'Shield',
      color: '#34B36B',
      bg: '#E3F7EA',
      content: 'Enter the data protection and privacy policy details here.'
    }
    setConfig((prev: any) => ({
      ...prev,
      sections: [...(prev.sections || []), newSec]
    }))
  }

  const updateSection = (index: number, field: string, val: any) => {
    const updated = [...(config.sections || [])]
    updated[index] = { ...updated[index], [field]: val }
    setConfig((prev: any) => ({ ...prev, sections: updated }))
  }

  const removeSection = (index: number) => {
    const updated = (config.sections || []).filter((_: any, i: number) => i !== index)
    setConfig((prev: any) => ({ ...prev, sections: updated }))
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const items = [...(config.sections || [])]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= items.length) return
    const temp = items[index]
    items[index] = items[targetIdx]
    items[targetIdx] = temp
    setConfig((prev: any) => ({ ...prev, sections: items }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Configuration Panel */}
      <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-emerald-500 w-5 h-5" />
              Privacy Policy CMS Editor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, reorder, and customize privacy sections. Updates publish instantly to website and mobile views.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://phulwari.co.in/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Live Privacy ↗</span>
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-70 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.includes('Error')
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-green-50 text-green-600 border border-green-100'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        {/* Header & Meta Settings */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Page Title &amp; Introduction
          </h3>
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Badge Text</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={config.badge_text || ''}
                onChange={(e) => updateField('badge_text', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Updated</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={config.last_updated || ''}
                onChange={(e) => updateField('last_updated', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title Main / Prefix</label>
              <input
                type="text"
                placeholder="e.g. Your"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={config.title_part1 || ''}
                onChange={(e) => updateField('title_part1', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title Highlight (Blue)</label>
              <input
                type="text"
                placeholder="e.g. Privacy"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={config.title_highlight || ''}
                onChange={(e) => updateField('title_highlight', e.target.value)}
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <span className="text-slate-400 font-medium">Title Live Preview:</span>
              <span>{config.title_part1 || 'Your'}</span>
              <span className="text-blue-500 font-extrabold">{config.title_highlight || 'Privacy'}</span>
              <span>{config.title_part2 || 'Matters'}</span>
            </div>
            <div className="md:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Introduction Text</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={config.intro_text || ''}
                onChange={(e) => updateField('intro_text', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Suggested icons datalist */}
        <datalist id="privacy-icon-suggestions">
          {COMMON_ICONS.map((ic) => (
            <option key={ic} value={ic} />
          ))}
        </datalist>

        {/* Sections List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Privacy Policy Sections ({config.sections?.length || 0})
            </h3>
            <button
              onClick={addSection}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Section
            </button>
          </div>

          <div className="space-y-3">
            {config.sections?.map((sec: any, idx: number) => (
              <div
                key={sec.id || idx}
                className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3 hover:border-emerald-200 transition"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center font-mono">
                      {sec.num || String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: sec.bg || '#FFE6EF' }}
                    >
                      {renderIcon(sec.icon, 'w-3.5 h-3.5', { color: sec.color || '#34B36B' })}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-xs">
                      {sec.label || 'Untitled Section'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (config.sections?.length || 0) - 1}
                      onClick={() => moveSection(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Section Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none"
                      value={sec.num || ''}
                      onChange={(e) => updateSection(idx, 'num', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Section Title / Label</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none"
                      value={sec.label || ''}
                      onChange={(e) => updateSection(idx, 'label', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Content / Paragraphs</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none font-sans"
                      value={sec.content || ''}
                      onChange={(e) => updateSection(idx, 'content', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Icon Name</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs"
                        style={{ backgroundColor: sec.bg || '#FFE6EF' }}
                      >
                        {renderIcon(sec.icon, 'w-4 h-4', { color: sec.color || '#34B36B' })}
                      </div>
                      <input
                        type="text"
                        list="privacy-icon-suggestions"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 outline-none font-mono"
                        value={sec.icon || 'Shield'}
                        onChange={(e) => updateSection(idx, 'icon', e.target.value)}
                        placeholder="Shield, Lock, Database..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Color Theme</label>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-slate-300"
                        style={{ backgroundColor: sec.color || '#34B36B' }}
                      />
                      <select
                        value={sec.color || '#34B36B'}
                        onChange={(e) => {
                          const chosen = COLOR_OPTIONS.find((c) => c.color === e.target.value)
                          if (chosen) {
                            updateSection(idx, 'color', chosen.color)
                            updateSection(idx, 'bg', chosen.bg)
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 outline-none cursor-pointer font-medium"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c.color} value={c.color}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className={`${isExpanded ? 'xl:col-span-12' : 'xl:col-span-5'} sticky top-6 space-y-4 transition-all duration-300`}>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
              <Eye className="w-4 h-4 text-emerald-500" /> Privacy Policy Live Preview
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => changePreviewEnv('local')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    previewEnv === 'local'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Preview from Local Server (http://localhost:3000)"
                >
                  ⚡ Local
                </button>
                <button
                  type="button"
                  onClick={() => changePreviewEnv('live')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    previewEnv === 'live'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Preview from Live Website (https://phulwari.co.in)"
                >
                  🌐 Live
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('phone')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === 'phone'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('laptop')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === 'laptop'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isExpanded
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={isExpanded ? 'Collapse to Split View' : 'Expand to Full Width'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={reloadPreview}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                title="Refresh Preview"
              >
                <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {previewDevice === 'phone' ? (
            <div className="w-full flex justify-center py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="w-[340px] h-[600px] border-[10px] border-slate-900 rounded-[38px] shadow-2xl overflow-hidden bg-white relative transition-all duration-300">
                <div className="w-24 h-3.5 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
                </div>
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  onLoad={handleIframeLoad}
                  className="w-full h-full border-none pt-2"
                  title="Live Privacy Phone Preview"
                />
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm z-20">
                  📱 Phone View ({previewEnv === 'local' ? 'Local' : 'Live'})
                </div>
              </div>
            </div>
          ) : (
            (() => {
              const scale = Math.min(1, Math.max(0.25, containerWidth / laptopWidth))
              const scaledHeight = Math.round(720 * scale)

              return (
                <div ref={previewContainerRef} className="w-full transition-all duration-300">
                  <div
                    className="w-full bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
                    style={{ height: `${scaledHeight + 36}px` }}
                  >
                    <div className="w-full h-9 bg-slate-800 flex items-center justify-between px-3 text-slate-300 text-[10px] font-mono z-20 relative border-b border-slate-700">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="ml-1 text-slate-300 font-bold hidden sm:inline">
                          Desktop Viewport ({laptopWidth}px)
                        </span>
                      </div>

                      <div className="flex-1 max-w-sm mx-2 text-center bg-slate-950/80 py-0.5 px-3 rounded-md text-[10px] text-slate-300 border border-slate-700/60 truncate">
                        🔒 {previewUrl}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          value={laptopWidth}
                          onChange={(e) => setLaptopWidth(Number(e.target.value))}
                          className="bg-slate-950 text-emerald-400 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer"
                        >
                          <option value={1024}>1024px</option>
                          <option value={1280}>1280px</option>
                          <option value={1440}>1440px</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full overflow-hidden relative" style={{ height: `${scaledHeight}px` }}>
                      <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        onLoad={handleIframeLoad}
                        style={{
                          width: `${laptopWidth}px`,
                          height: `${720 / scale}px`,
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left'
                        }}
                        className="border-none bg-white absolute top-0 left-0"
                        title="Live Privacy Desktop Preview"
                      />
                      <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[9px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-md z-20 shadow-lg border border-slate-700 flex items-center gap-1">
                        <span>💻 Laptop View ({laptopWidth}px)</span>
                        <span className="text-amber-400 font-mono">[{Math.round(scale * 100)}% Auto Scale]</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          )}
        </div>
      </div>
    </div>
  )
}
