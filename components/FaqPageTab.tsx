'use client'

import React, { useState, useEffect, useRef } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  Save,
  Loader2,
  HelpCircle,
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
  'HelpCircle', 'Baby', 'Music4', 'Dumbbell', 'Sparkles', 'Cake', 'Tent',
  'Snowflake', 'ShieldCheck', 'ClipboardCheck', 'Gamepad2', 'Trophy',
  'Clock3', 'Eye', 'Settings2', 'FileText', 'Heart', 'Star', 'Phone', 'MapPin'
]

function renderIcon(iconName: string, className: string = 'w-4 h-4', style?: React.CSSProperties) {
  if (!iconName) return <LucideIcons.HelpCircle className={className} style={style} />
  const clean = iconName.trim()
  const pascal = clean.replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase())
  const Comp = (LucideIcons as any)[pascal] || (LucideIcons as any)[clean] || LucideIcons.HelpCircle
  return <Comp className={className} style={style} />
}

const DEFAULT_FAQ_DATA = {
  id: 1,
  badge_text: 'FAQ',
  hero_title: 'Find Answers to',
  hero_highlight: 'Common Questions',
  hero_subtitle: 'We understand parents may have questions before enrolling their child or joining our programs — here are answers to the most frequently asked ones.',
  faqs: [
    {
      id: 'faq-1',
      icon: 'HelpCircle',
      color: '#FF4D8D',
      bg: '#FFE6EF',
      question: 'What is Phulwari Mother & Child Activity Centre?',
      answer: 'Phulwari is a unique activity centre where children can learn, play, explore and develop through engaging activities, while mothers can participate in dedicated fitness programs and family-oriented experiences.'
    },
    {
      id: 'faq-2',
      icon: 'Baby',
      color: '#3D8BFF',
      bg: '#E5EFFF',
      question: 'What is the minimum age for admission?',
      answer: 'Children aged 3 years and above can join our regular activity programs and batches. For younger children, we offer our special Mother & Toddler Program designed for toddlers and their mothers.'
    },
    {
      id: 'faq-3',
      icon: 'Music4',
      color: '#34B36B',
      bg: '#E3F7EA',
      question: 'What activities are available at Phulwari?',
      answer: 'Music Classes, Dance Classes, Gymnastics, MMA Training, Roller Skating, Art & Craft, Cricket Training, Yoga, Play Zone Activities, Mother & Toddler Program, Fitness Program for Mothers.'
    },
    {
      id: 'faq-4',
      icon: 'Dumbbell',
      color: '#E8A621',
      bg: '#FFF3D9',
      question: 'Do you have programs for mothers?',
      answer: 'Yes. We offer a dedicated Fitness Program for Mothers that helps mothers stay active, healthy and energetic while their children participate in activities.'
    },
    {
      id: 'faq-5',
      icon: 'Sparkles',
      color: '#8B5CF6',
      bg: '#EFE7FE',
      question: 'What programs and batches are available?',
      answer: '1. Phulwari Premium Circle (5:00 PM Onwards, Mon-Sun, 3+ Years)\n2. Phulwari Core (6:30 PM Onwards, Wed-Sun, 3+ Years)\n3. Mother & Toddler Program (10:30 AM - 11:30 AM, Mon-Sat, 1-3 Years)'
    },
    {
      id: 'faq-6',
      icon: 'ShieldCheck',
      color: '#34B36B',
      bg: '#E3F7EA',
      question: 'Is the environment safe for children?',
      answer: 'Absolutely. Child safety and well-being are our highest priorities. We provide a secure, clean, hygienic and child-friendly environment with trained instructors and staff.'
    },
    {
      id: 'faq-7',
      icon: 'Cake',
      color: '#FF8A3D',
      bg: '#FFEADB',
      question: 'How You Organise Birthday ?',
      answer: 'Theme Decorations, Fun Activities, Entertainment, Customized Packages, Photo-Friendly Setups.'
    },
    {
      id: 'faq-8',
      icon: 'Tent',
      color: '#34B36B',
      bg: '#E3F7EA',
      question: 'Do you organize Summer Camps?',
      answer: 'Dance, Music, Art & Craft, Sports & Games, Fitness Activities, Personality Development Sessions.'
    },
    {
      id: 'faq-9',
      icon: 'Snowflake',
      color: '#3D8BFF',
      bg: '#E5EFFF',
      question: 'Do you organize Winter Camps?',
      answer: 'Creative Learning, Art & Craft, Fitness Activities, Sports & Games, Team Building Activities, Fun Competitions.'
    },
    {
      id: 'faq-10',
      icon: 'Eye',
      color: '#8B5CF6',
      bg: '#EFE7FE',
      question: 'Can parents visit the centre before enrollment?',
      answer: 'Yes. Parents are welcome to visit our centre, explore the facilities, meet our team and understand the programs before enrollment.'
    },
    {
      id: 'faq-11',
      icon: 'ClipboardCheck',
      color: '#FF4D8D',
      bg: '#FFE6EF',
      question: 'How can I enroll my child?',
      answer: '1. Call Us (+91 6207368839)\n2. Contact Us on WhatsApp\n3. Visit the Centre Directly\n4. Complete the Admission Process'
    },
    {
      id: 'faq-12',
      icon: 'Settings2',
      color: '#3D8BFF',
      bg: '#E5EFFF',
      question: 'Are customized activity options available?',
      answer: 'Yes. Customized activity options are available under Phulwari Premium Circle, subject to availability and requirements.'
    },
    {
      id: 'faq-13',
      icon: 'Gamepad2',
      color: '#FF8A3D',
      bg: '#FFEADB',
      question: 'Do you have a Play Zone?',
      answer: 'Yes. We provide a safe, clean and enjoyable Play Zone where children can play, interact and have fun in a supervised environment.'
    },
    {
      id: 'faq-14',
      icon: 'Trophy',
      color: '#E8A621',
      bg: '#FFF3D9',
      question: 'Do you conduct special events and competitions?',
      answer: 'Competitions, Talent Shows, Celebrations, Children\'s Events, Family Engagement Activities.'
    },
    {
      id: 'faq-15',
      icon: 'Clock3',
      color: '#34B36B',
      bg: '#E3F7EA',
      question: 'What are your operating hours?',
      answer: 'Activities generally begin from 5:00 PM onwards and continue according to the selected batch schedule. For the latest timings and updates, please contact us directly.'
    },
    {
      id: 'faq-16',
      icon: 'MapPin',
      color: '#FF4D8D',
      bg: '#FFE6EF',
      question: 'Where is Phulwari located?',
      answer: 'M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road, Patna, Bihar – 800001'
    },
    {
      id: 'faq-17',
      icon: 'Phone',
      color: '#3D8BFF',
      bg: '#E5EFFF',
      question: 'How can I contact Phulwari?',
      answer: '+91 6207368839 | WhatsApp Support Available | Visit Our Centre'
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
  { label: 'Teal Green', color: '#14B8A6', bg: '#DFF7F1' }
]

export default function FaqPageTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [config, setConfig] = useState<any>(DEFAULT_FAQ_DATA)

  // Live preview controls
  const [previewEnv, setPreviewEnv] = useState<'local' | 'live'>('live')
  const [previewUrl, setPreviewUrl] = useState('https://phulwari.co.in/legal/faq')
  const [previewDevice, setPreviewDevice] = useState<'laptop' | 'phone'>('phone')
  const [isExpanded, setIsExpanded] = useState(false)
  const [laptopWidth, setLaptopWidth] = useState<number>(1280)
  const [containerWidth, setContainerWidth] = useState<number>(550)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [isReloading, setIsReloading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchFaqConfig()
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')
      setPreviewEnv(isLocal ? 'local' : 'live')
      const host = isLocal ? 'http://localhost:3000' : 'https://phulwari.co.in'
      setPreviewUrl(`${host}/legal/faq`)
    }
  }, [])

  // Instantly send config changes to preview iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'LIVE_FAQ_UPDATE', config },
          '*'
        )
      } catch (e) {}
    }
  }, [config])

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'LIVE_FAQ_UPDATE', config },
          '*'
        )
      } catch (e) {}
    }
  }

  const changePreviewEnv = (env: 'local' | 'live') => {
    setPreviewEnv(env)
    const host = env === 'local' ? 'http://localhost:3000' : 'https://phulwari.co.in'
    const newUrl = `${host}/legal/faq`
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

  const fetchFaqConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_page_config')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: seeded } = await supabase
            .from('faq_page_config')
            .upsert(DEFAULT_FAQ_DATA)
            .select()
            .single()
          if (seeded) setConfig(seeded)
        } else {
          setConfig(DEFAULT_FAQ_DATA)
        }
      } else if (data) {
        setConfig(data)
      }
    } catch (err) {
      console.error('Error loading FAQ config:', err)
      setConfig(DEFAULT_FAQ_DATA)
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
        .from('faq_page_config')
        .upsert({ id: 1, ...config, updated_at: new Date().toISOString() })

      if (error) throw error
      setMessage('FAQ Page changes saved and published successfully!')
      if (iframeRef.current) {
        iframeRef.current.src = getRefreshedUrl(previewUrl)
      }
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      setMessage(`Error saving FAQ: ${err.message}`)
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

  const addFaqItem = () => {
    const newItem = {
      id: `faq-${Date.now()}`,
      icon: 'HelpCircle',
      color: '#FF4D8D',
      bg: '#FFE6EF',
      question: 'New Question Title',
      answer: 'Detailed answer text goes here.'
    }
    setConfig((prev: any) => ({
      ...prev,
      faqs: [...(prev.faqs || []), newItem]
    }))
  }

  const updateFaqItem = (index: number, field: string, val: any) => {
    const updated = [...(config.faqs || [])]
    updated[index] = { ...updated[index], [field]: val }
    setConfig((prev: any) => ({ ...prev, faqs: updated }))
  }

  const removeFaqItem = (index: number) => {
    const updated = (config.faqs || []).filter((_: any, i: number) => i !== index)
    setConfig((prev: any) => ({ ...prev, faqs: updated }))
  }

  const moveFaqItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(config.faqs || [])]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= items.length) return
    const temp = items[index]
    items[index] = items[targetIdx]
    items[targetIdx] = temp
    setConfig((prev: any) => ({ ...prev, faqs: items }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
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
              <HelpCircle className="text-pink-500 w-5 h-5" />
              FAQ Page Dynamic CMS Editor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, delete, and reorder FAQ questions. Updates reflect instantly on website and mobile view.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://phulwari.co.in/legal/faq"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Live FAQ ↗</span>
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-70 cursor-pointer"
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

        {/* Hero Section Header Settings */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-500" />
            Hero Header & Subtitle
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Badge Text</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                value={config.badge_text || ''}
                onChange={(e) => updateField('badge_text', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title (Prefix)</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                value={config.hero_title || ''}
                onChange={(e) => updateField('hero_title', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title Highlight (Pink)</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                value={config.hero_highlight || ''}
                onChange={(e) => updateField('hero_highlight', e.target.value)}
              />
            </div>
            <div className="md:col-span-3 flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <span className="text-slate-400 font-medium">Title Live Preview:</span>
              <span>{config.hero_title || 'Find Answers to'}</span>
              <span className="text-pink-500 font-extrabold">{config.hero_highlight || 'Common Questions'}</span>
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hero Subtitle Text</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                value={config.hero_subtitle || ''}
                onChange={(e) => updateField('hero_subtitle', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Suggested icons datalist */}
        <datalist id="faq-icon-suggestions">
          {COMMON_ICONS.map((ic) => (
            <option key={ic} value={ic} />
          ))}
        </datalist>

        {/* FAQ Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              FAQ Questions &amp; Answers ({config.faqs?.length || 0})
            </h3>
            <button
              onClick={addFaqItem}
              className="bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add New FAQ
            </button>
          </div>

          <div className="space-y-3">
            {config.faqs?.map((faq: any, idx: number) => (
              <div
                key={faq.id || idx}
                className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3 hover:border-pink-200 transition"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: faq.bg || '#FFE6EF' }}
                    >
                      {renderIcon(faq.icon, 'w-3.5 h-3.5', { color: faq.color || '#FF4D8D' })}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-xs">
                      {faq.question || 'Untitled Question'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveFaqItem(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (config.faqs?.length || 0) - 1}
                      onClick={() => moveFaqItem(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFaqItem(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Question</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-pink-500"
                      value={faq.question || ''}
                      onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Answer</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-pink-500 font-sans"
                      value={faq.answer || ''}
                      onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Icon Name</label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs"
                          style={{ backgroundColor: faq.bg || '#FFE6EF' }}
                        >
                          {renderIcon(faq.icon, 'w-4 h-4', { color: faq.color || '#FF4D8D' })}
                        </div>
                        <input
                          type="text"
                          list="faq-icon-suggestions"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 outline-none font-mono"
                          value={faq.icon || 'HelpCircle'}
                          onChange={(e) => updateFaqItem(idx, 'icon', e.target.value)}
                          placeholder="HelpCircle, Baby, Music4..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Color Theme</label>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-slate-300"
                          style={{ backgroundColor: faq.color || '#FF4D8D' }}
                        />
                        <select
                          value={faq.color || '#FF4D8D'}
                          onChange={(e) => {
                            const chosen = COLOR_OPTIONS.find((c) => c.color === e.target.value)
                            if (chosen) {
                              updateFaqItem(idx, 'color', chosen.color)
                              updateFaqItem(idx, 'bg', chosen.bg)
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
              <Eye className="w-4 h-4 text-pink-500" /> FAQ Live Preview Snapshot
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
                      ? 'bg-pink-500 text-white shadow-sm'
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
                      ? 'bg-pink-500 text-white shadow-sm'
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
                  title="Live FAQ Phone Preview"
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
                          className="bg-slate-950 text-pink-400 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer"
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
                        title="Live FAQ Desktop Preview"
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
