'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  AlertCircle,
  Heart,
  Dumbbell,
  Baby,
  Sun,
  Snowflake,
  Cake,
  Video,
  Film,
  Upload,
  Play,
  RotateCcw,
  Clock,
  Radio
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressVideo, formatBytes, generateVideoPoster } from '@/lib/videoCompressor'
import IconPickerModal, { renderLucideIcon } from './IconPickerModal'

const COMMON_ICONS = [
  'Sparkles', 'Music', 'PersonStanding', 'Dumbbell', 'Shield', 'Palette',
  'Trophy', 'Leaf', 'Smile', 'Heart', 'Star', 'Disc3', 'Swords', 'Footprints',
  'Activity', 'Gamepad2', 'Baby', 'Crown', 'Puzzle', 'Award', 'CheckCircle2',
  'Sun', 'Snowflake', 'Cake'
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
  return renderLucideIcon(iconName, className, style)
}

export interface ActivityVideo {
  id: string
  title: string
  description?: string
  url: string
  poster?: string
  duration?: string
  is_featured?: boolean
  created_at?: string
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
  videos?: ActivityVideo[]
  color: string
  bg: string
  content_color?: string
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
    content_color?: string
  }
  order_index: number
  is_active: boolean
  updated_at?: string
}

export interface ActivitiesTabProps {
  mode?: 'activities' | 'mothers' | 'camps' | 'all'
}

export function isMotherProgram(act: { slug?: string; badge_text?: string; h1?: string }): boolean {
  const s = (act.slug || '').toLowerCase()
  const b = (act.badge_text || '').toLowerCase()
  const h = (act.h1 || '').toLowerCase()
  return (
    s.includes('mother') ||
    b.includes('mother') ||
    h.includes('mother') ||
    s.includes('toddler') ||
    b.includes('toddler')
  )
}

export function isCampOrEvent(act: { slug?: string; badge_text?: string; h1?: string }): boolean {
  const s = (act.slug || '').toLowerCase()
  const b = (act.badge_text || '').toLowerCase()
  const h = (act.h1 || '').toLowerCase()
  return (
    s.includes('camp') ||
    b.includes('camp') ||
    h.includes('camp') ||
    s.includes('winter') ||
    b.includes('winter') ||
    s.includes('summer') ||
    b.includes('summer') ||
    s.includes('birthday') ||
    b.includes('birthday') ||
    s.includes('event') ||
    b.includes('event')
  )
}

export function isChildActivity(act: { slug?: string; badge_text?: string; h1?: string }): boolean {
  return !isMotherProgram(act) && !isCampOrEvent(act)
}

export default function ActivitiesTab({ mode = 'activities' }: ActivitiesTabProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'seo' | 'media' | 'videos' | 'benefits' | 'programs' | 'details' | 'faqs' | 'cta' | 'schema'>('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)

  // Video Management State
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [compressingVideo, setCompressingVideo] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [compressionStatus, setCompressionStatus] = useState('')
  const [autoCompress, setAutoCompress] = useState(true)
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)
  const [videoStats, setVideoStats] = useState<{ original: number; compressed: number; saved: number } | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Filter activities based on the current active mode
  const displayedActivities = useMemo(() => {
    return activities.filter((act) => {
      if (mode === 'mothers') return isMotherProgram(act)
      if (mode === 'camps') return isCampOrEvent(act)
      if (mode === 'activities') return isChildActivity(act)
      return true // 'all'
    })
  }, [activities, mode])

  const filteredActivities = useMemo(() => {
    return displayedActivities.filter(
      (a) =>
        a.badge_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.h1?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [displayedActivities, searchQuery])

  // Select initial item when displayed list changes
  useEffect(() => {
    if (displayedActivities.length > 0) {
      const isCurrentInList = displayedActivities.some((a) => a.id === selectedId)
      if (!isCurrentInList) {
        setSelectedId(displayedActivities[0].id)
      }
    } else {
      setSelectedId(null)
    }
  }, [displayedActivities, selectedId])

  // Fetch activities via server-side /api/activities proxy with fallback & timeout protection
  const loadActivities = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      let data: any[] | null = null

      // 1. Try server-side API proxy first with 3.5s timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3500)
        const res = await fetch('/api/activities', { signal: controller.signal })
        clearTimeout(timeoutId)
        if (res.ok) {
          const apiData = await res.json()
          if (Array.isArray(apiData) && apiData.length > 0) {
            data = apiData
          }
        }
      } catch (apiErr) {
        console.warn('API /api/activities fetch timed out or failed, trying direct client:', apiErr)
      }

      // 2. Fallback to direct Supabase client
      if (!data) {
        try {
          const supabase = createClient()
          const { data: dbData, error } = await supabase
            .from('activity_pages')
            .select('*')
            .order('order_index', { ascending: true })

          if (!error && dbData && dbData.length > 0) {
            data = dbData
          }
        } catch (dbErr) {
          console.warn('Direct Supabase fetch failed:', dbErr)
        }
      }

      if (data && data.length > 0) {
        // Filter out deprecated test items
        const cleanedData = data.filter((a: any) => 
          a.slug !== 'activity-4984' && 
          a.slug !== 'new-activity-1160' && 
          !a.id?.startsWith('activity-4984')
        )
        const formatted = cleanedData.map((a: any) => ({
          ...a,
          content_color: a.content_color || a.cta?.content_color || '#334155',
          videos: a.videos || [],
        }))
        setActivities(formatted as ActivityRecord[])
        try {
          localStorage.setItem('phulwari_admin_activities', JSON.stringify(formatted))
        } catch (_) {}
      } else {
        const saved = localStorage.getItem('phulwari_admin_activities')
        if (saved) {
          try {
            const parsed = JSON.parse(saved).filter((a: any) => 
              a.slug !== 'activity-4984' && 
              a.slug !== 'new-activity-1160' && 
              !a.id?.startsWith('activity-4984')
            )
            setActivities(parsed)
          } catch (_) {}
        }
      }
    } catch (err: any) {
      console.error('Error loading activities:', err)
      const saved = localStorage.getItem('phulwari_admin_activities')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setActivities(parsed)
        } catch (_) {}
      }
      setErrorMessage(err?.message || 'Failed to load activities from database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

  const currentActivity = activities.find((a) => a.id === selectedId)

  // Update field of current activity in state
  const updateCurrent = (field: keyof ActivityRecord, value: any) => {
    if (!selectedId) return
    setActivities((prev) =>
      prev.map((a) => (a.id === selectedId ? { ...a, [field]: value } : a))
    )
  }

  // Save current activity to Supabase via API & direct client
  const handleSave = async () => {
    if (!currentActivity) return
    setSaving(true)
    setErrorMessage(null)
    setSaveSuccess(false)

    try {
      const { content_color, ...cleanActivity } = currentActivity
      const payload: any = {
        ...cleanActivity,
        cta: {
          ...(currentActivity.cta || {}),
          content_color: content_color || '#334155',
        },
        videos: currentActivity.videos || [],
        updated_at: new Date().toISOString(),
      }

      // Try API POST route first
      let savedData: any = null
      try {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, content_color }),
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
        savedData = {
          ...data,
          content_color: data?.cta?.content_color || content_color || '#334155',
        }
      }

      if (savedData) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === selectedId
              ? {
                  ...a,
                  ...savedData,
                  content_color: savedData.content_color || content_color || '#334155',
                  videos: savedData.videos || a.videos || [],
                }
              : a
          )
        )
      }

      try {
        localStorage.setItem(
          'phulwari_admin_activities',
          JSON.stringify(
            activities.map((a) => (a.id === selectedId ? { ...a, ...savedData } : a))
          )
        )
      } catch (_) {}

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err: any) {
      console.error('Error saving activity:', err)
      setErrorMessage(err?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Handle direct video file selection and optional client-side automatic compression + upload
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentActivity) return

    setUploadingVideo(true)
    setCompressingVideo(true)
    setCompressionProgress(0)
    setCompressionStatus('Starting video processing...')
    setVideoStats(null)

    try {
      let fileToUpload: File = file
      let posterDataUrl = ''
      let videoDurationStr = ''

      if (autoCompress) {
        setCompressionStatus('Compressing video on client-side...')
        const compressionResult = await compressVideo(file, {
          maxWidth: 1280,
          maxHeight: 720,
          videoBitrate: 1_800_000,
          onProgress: (percent, status) => {
            setCompressionProgress(percent)
            setCompressionStatus(status)
          },
        })
        fileToUpload = compressionResult.file
        posterDataUrl = compressionResult.poster
        if (compressionResult.duration) {
          const mins = Math.floor(compressionResult.duration / 60)
          const secs = Math.floor(compressionResult.duration % 60)
          videoDurationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`
        }
        if (compressionResult.compressionRatio > 0) {
          setVideoStats({
            original: compressionResult.originalSize,
            compressed: compressionResult.compressedSize,
            saved: compressionResult.compressionRatio,
          })
        }
      } else {
        setCompressionStatus('Extracting thumbnail poster...')
        posterDataUrl = await generateVideoPoster(file, 1.0)
      }

      setCompressionStatus('Uploading video to Cloudflare R2 / storage...')
      setCompressionProgress(92)

      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

      const res = await fetch('/api/r2/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to upload video')
      }

      const uploadResult = await res.json()
      const newVideoObj: ActivityVideo = {
        id: 'vid-' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        description: `Session video for ${currentActivity.badge_text || currentActivity.h1}`,
        url: uploadResult.url,
        poster: posterDataUrl || '/phulwari_logo.webp',
        duration: videoDurationStr || '0:30',
        is_featured: (currentActivity.videos || []).length === 0,
        created_at: new Date().toISOString(),
      }

      const updatedVideos = [...(currentActivity.videos || []), newVideoObj]
      updateCurrent('videos', updatedVideos)
      setCompressionProgress(100)
      setCompressionStatus('Video uploaded & attached successfully!')
      setTimeout(() => {
        setCompressionStatus('')
        setUploadingVideo(false)
        setCompressingVideo(false)
      }, 2500)
    } catch (uploadErr: any) {
      console.error('Video upload error:', uploadErr)
      alert(`Video processing/upload error: ${uploadErr.message || uploadErr}`)
      setUploadingVideo(false)
      setCompressingVideo(false)
    } finally {
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
    }
  }

  // Add existing video by path or public URL (e.g. /videos/cricket.mov)
  const handleAddVideoByUrl = (url: string, title?: string, poster?: string) => {
    if (!url.trim() || !currentActivity) return
    const cleanUrl = url.trim()
    const autoTitle = title || cleanUrl.split('/').pop()?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Activity Video'
    const newVideoObj: ActivityVideo = {
      id: 'vid-' + Date.now(),
      title: autoTitle,
      description: `Training session video for ${currentActivity.badge_text || currentActivity.h1}`,
      url: cleanUrl,
      poster: poster || currentActivity.hero_image || '/phulwari_logo.webp',
      duration: '0:30',
      is_featured: (currentActivity.videos || []).length === 0,
      created_at: new Date().toISOString(),
    }
    updateCurrent('videos', [...(currentActivity.videos || []), newVideoObj])
  }

  // Delete video from activity
  const handleDeleteVideo = (videoId: string) => {
    if (!currentActivity) return
    const updated = (currentActivity.videos || []).filter((v) => v.id !== videoId)
    updateCurrent('videos', updated)
  }

  // Set video as featured
  const handleToggleFeaturedVideo = (videoId: string) => {
    if (!currentActivity) return
    const updated = (currentActivity.videos || []).map((v) => ({
      ...v,
      is_featured: v.id === videoId,
    }))
    updateCurrent('videos', updated)
  }

  // Delete activity
  const handleDelete = async (id: string) => {
    const target = activities.find((a) => a.id === id || a.slug === id)
    const displayName = target?.badge_text || target?.h1 || id
    if (!confirm(`Are you sure you want to delete "${displayName}"? This will remove it from the website.`)) return

    // Optimistically update local state & localStorage
    const remaining = activities.filter((a) => a.id !== id && a.slug !== id && (target?.slug ? a.slug !== target.slug : true))
    setActivities(remaining)
    if (selectedId === id || (target && selectedId === target.id)) {
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
    }
    try {
      localStorage.setItem('phulwari_admin_activities', JSON.stringify(remaining))
    } catch (_) {}

    try {
      const supabase = createClient()
      const targetSlug = target?.slug || id
      await supabase.from('activity_pages').delete().or(`id.eq.${id},slug.eq.${targetSlug}`)
      try {
        await fetch(`/api/activities?id=${id}&slug=${targetSlug}`, { method: 'DELETE' })
      } catch (_) {}
    } catch (err: any) {
      console.error('Delete sync error:', err)
      const errorText = err?.message || err?.error_description || (typeof err === 'string' ? err : JSON.stringify(err))
      console.warn('Activity delete note:', errorText)
    }
  }

  // Create new activity / mother program / camp based on mode
  const handleAddNew = async () => {
    setSaving(true)
    setErrorMessage(null)

    let defaultBadge = 'New Child Activity'
    let defaultH1 = 'Kids Activity Classes in Patna'
    let defaultSlugPrefix = 'activity'
    let defaultColor = '#FF4D8D'
    let defaultBg = '#FFE6EF'
    let defaultIcon = 'Sparkles'
    let defaultWhyMatters = 'Helps develop foundational motor skills, confidence, and cognitive abilities in young children.'
    let defaultAgeBracket = '3 - 8 Years'

    if (mode === 'mothers') {
      defaultBadge = 'New Mother Program'
      defaultH1 = 'Mother & Toddler Fitness Program in Patna'
      defaultSlugPrefix = 'mother-program'
      defaultColor = '#8B5CF6'
      defaultBg = '#EFE7FE'
      defaultIcon = 'Heart'
      defaultWhyMatters = 'Designed to support maternal fitness, emotional wellness, and positive parent-child bonding through guided morning sessions.'
      defaultAgeBracket = 'Mothers & Toddlers'
    } else if (mode === 'camps') {
      defaultBadge = 'Winter Camp 2026'
      defaultH1 = 'Winter Camp 2026: Skill, Creativity & Fun in Patna'
      defaultSlugPrefix = 'winter-camp-2026'
      defaultColor = '#3D8BFF'
      defaultBg = '#E5EFFF'
      defaultIcon = 'Snowflake'
      defaultWhyMatters = 'Offers an immersive, enriching holiday camp experience packed with arts, sports, science fun, and confidence building.'
      defaultAgeBracket = '4 - 14 Years'
    }

    const timestamp = Date.now().toString().slice(-4)
    const newSlug = `${defaultSlugPrefix}-${timestamp}`

    const newRecord: ActivityRecord = {
      id: newSlug,
      slug: newSlug,
      aliases: [],
      badge_text: defaultBadge,
      title_tag: `${defaultBadge} in Patna | Phulwari Activity Centre`,
      meta_description: `Join ${defaultBadge} in Patna at Phulwari Activity Centre, Kidwaipuri. Register for free demo class today.`,
      h1: defaultH1,
      intro_p1: `Discover engaging and fun-filled sessions at Phulwari Mother & Child Activity Centre in Patna.`,
      intro_p2: 'Led by certified mentors in a child-safe, hygienic, and air-conditioned facility at Kidwaipuri.',
      hero_image: '/phulwari_logo.webp',
      gallery_images: ['/phulwari_logo.webp'],
      color: defaultColor,
      bg: defaultBg,
      content_color: '#334155',
      icon: defaultIcon,
      why_matters_title: 'Why This Program Matters',
      why_matters_content: defaultWhyMatters,
      benefits_title: 'Key Benefits',
      benefits: [
        { title: 'Confidence & Growth', description: 'Nurtures self-expression, discipline, and natural talents.' },
        { title: 'Safe Infrastructure', description: 'Child-friendly spaces with attentive mentor supervision.' },
      ],
      programs_title: 'Specialized Batches & Curriculum',
      programs: [
        {
          title: 'Foundational Batch',
          age_bracket: defaultAgeBracket,
          description: 'Structured progressive sessions focusing on core techniques and fun interaction.',
          points: ['Personalized attention', 'Trial demo session available', 'Weekend & weekday options'],
        },
      ],
      why_choose_title: 'Why Choose Phulwari Mother & Child Centre?',
      why_choose_points: [
        { title: 'Experienced Mentors', description: 'Passionate and patient faculty trained in child psychology.' },
        { title: 'Central Patna Location', description: 'Conveniently located at Kidwaipuri, close to Boring Road.' },
      ],
      hyper_local_title: 'Convenient Patna Locations & Commute',
      hyper_local_points: [
        { area: 'Kidwaipuri & Sri Krishna Nagar', description: 'M/32, Road No. 25 Main Road with stress-free drop-off.' },
        { area: 'Boring Road & Patliputra', description: 'Just 3 to 5 minutes travel time.' },
      ],
      testimonials: [
        { quote: 'A wonderful learning experience! My child loves going to Phulwari every week.', author: 'Patna Parent', locality: 'Patna' },
      ],
      faqs: [
        { question: 'Is a free demo trial class available?', answer: 'Yes, we offer trial demo sessions before regular batch enrollment.' },
      ],
      schema_json: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Phulwari Mother & Child Activity Centre',
        url: `https://phulwari.co.in/activities/${newSlug}`,
      },
      cta: {
        phone: '+91 62073 68839',
        whatsapp: '+916207368839',
        address: 'M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road, Patna, Bihar – 800001',
        button_text: 'Book Free Trial / Demo',
      },
      order_index: activities.length + 1,
      is_active: true,
    }

    // Persist immediately
    try {
      const supabase = createClient()
      await supabase.from('activity_pages').upsert(newRecord, { onConflict: 'id' })
      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        })
      } catch (_) {}
    } catch (e: any) {
      console.warn('Initial save note:', e)
    }

    setActivities((prev) => [...prev, newRecord])
    setSelectedId(newRecord.id)
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Section title & descriptions based on mode
  const sectionTitle =
    mode === 'mothers'
      ? 'Programs for Mothers CMS'
      : mode === 'camps'
      ? 'Camps & Events CMS'
      : 'Activities Website CMS (Child Activities)'

  const sectionSubtitle =
    mode === 'mothers'
      ? 'Manage Mother & Toddler, Mother Fitness, and mother wellness programs with live frontend synchronization.'
      : mode === 'camps'
      ? 'Manage Summer Camp 2026, Winter Camp 2026, Birthday Celebrations & Seasonal Events dynamically.'
      : 'Manage all child activity pages (Skating, Karate, Music, Dance, Art & Craft, Yoga, etc.) with live frontend synchronization.'

  const addButtonText =
    mode === 'mothers'
      ? 'Add New Mother Program'
      : mode === 'camps'
      ? 'Add New Camp / Event'
      : 'Add New Activity'

  const sectionIcon =
    mode === 'mothers' ? Dumbbell : mode === 'camps' ? Cake : Layers

  const SectionIconComp = sectionIcon

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[450px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600 mb-4" />
        <p className="text-sm font-medium">Loading pages from database...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <SectionIconComp className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900">{sectionTitle}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
              {displayedActivities.length} {displayedActivities.length === 1 ? 'Page' : 'Pages'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{sectionSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadActivities}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            title="Reload from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{addButtonText}</span>
          </button>

          {currentActivity && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 text-white font-semibold text-sm hover:bg-pink-700 transition shadow-md disabled:opacity-50 cursor-pointer"
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
          <span>Page updated successfully and synced to database!</span>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in this section..."
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
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
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
                        <div className="text-xs text-gray-400 truncate">/{act.slug}</div>
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

              {filteredActivities.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-xs">
                  No pages found in this section. Click &quot;{addButtonText}&quot; to create one.
                </div>
              )}
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
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
                  { key: 'videos', label: `Videos & Streams (${currentActivity.videos?.length || 0})` },
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
                    className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
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
                          onChange={(e) => updateCurrent('slug', e.target.value)}
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
                          onChange={(e) => updateCurrent('badge_text', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                    </div>

                    {/* Icon Picker with live preview */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Activity Icon
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsIconPickerOpen(true)}
                          className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 hover:scale-105 transition cursor-pointer shadow-2xs"
                          style={{ backgroundColor: currentActivity.bg, borderColor: currentActivity.color }}
                          title="Click to choose icon visually"
                        >
                          {renderIcon(currentActivity.icon, 'w-5 h-5', { color: currentActivity.color })}
                        </button>
                        <input
                          type="text"
                          list="activity-icon-suggestions"
                          value={currentActivity.icon || ''}
                          onChange={(e) => updateCurrent('icon', e.target.value)}
                          placeholder="Type icon name e.g. Music, Star, Sparkles, Snowflake..."
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setIsIconPickerOpen(true)}
                          className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                        >
                          Browse Icons
                        </button>
                        <datalist id="activity-icon-suggestions">
                          {COMMON_ICONS.map((i) => (
                            <option key={i} value={i} />
                          ))}
                        </datalist>
                      </div>

                      {/* Quick icon chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {COMMON_ICONS.slice(0, 12).map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => updateCurrent('icon', ic)}
                            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 transition cursor-pointer"
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Theme Title & Active Theme Indicator */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                        <div className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: currentActivity.color || '#FF4D8D' }}
                          />
                          <span>Active Color Theme:</span>
                          <span className="text-sm font-black text-blue-600 normal-case">
                            {COLOR_PRESETS.find(
                              (p) => p.color.toLowerCase() === (currentActivity.color || '').toLowerCase()
                            )?.label || 'Custom Theme'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">
                          {currentActivity.color || '#FF4D8D'}
                        </span>
                      </div>

                      {/* Color Presets */}
                      <div>
                        <span className="block text-xs font-semibold text-gray-600 mb-2">
                          Select Theme Preset:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_PRESETS.map((p, idx) => {
                            const isMatch =
                              (currentActivity.color || '').toLowerCase() === p.color.toLowerCase()
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  updateCurrent('color', p.color)
                                  updateCurrent('bg', p.bg)
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                  isMatch
                                    ? 'border-gray-900 bg-gray-900 text-white shadow-xs scale-105'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span>{p.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Color Swatches Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Accent Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={currentActivity.color || '#FF4D8D'}
                              onChange={(e) => updateCurrent('color', e.target.value)}
                              className="w-10 h-10 rounded-xl cursor-pointer border p-0.5"
                            />
                            <input
                              type="text"
                              value={currentActivity.color || ''}
                              onChange={(e) => updateCurrent('color', e.target.value)}
                              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-mono bg-white"
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
                              onChange={(e) => updateCurrent('bg', e.target.value)}
                              className="w-10 h-10 rounded-xl cursor-pointer border p-0.5"
                            />
                            <input
                              type="text"
                              value={currentActivity.bg || ''}
                              onChange={(e) => updateCurrent('bg', e.target.value)}
                              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-mono bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Content / Paragraph Text Color Customization */}
                      <div className="pt-2 border-t border-gray-200/60">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                          Content / Paragraph Text Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentActivity.content_color || '#334155'}
                            onChange={(e) => updateCurrent('content_color', e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border p-0.5"
                          />
                          <input
                            type="text"
                            value={currentActivity.content_color || '#334155'}
                            onChange={(e) => updateCurrent('content_color', e.target.value)}
                            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-mono bg-white"
                            placeholder="#334155"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-gray-400 font-medium">Quick Text Colors:</span>
                          {[
                            { label: 'Slate (#334155)', color: '#334155' },
                            { label: 'Dark Slate (#1E293B)', color: '#1E293B' },
                            { label: 'Navy (#0F172A)', color: '#0F172A' },
                            { label: 'Neutral (#4B5563)', color: '#4B5563' },
                            { label: 'Theme Accent', color: currentActivity.color || '#FF4D8D' },
                          ].map((tc) => (
                            <button
                              key={tc.label}
                              type="button"
                              onClick={() => updateCurrent('content_color', tc.color)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition ${
                                (currentActivity.content_color || '#334155').toLowerCase() === tc.color.toLowerCase()
                                  ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: tc.color }}
                              />
                              <span>{tc.label}</span>
                            </button>
                          ))}
                        </div>
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
                          onChange={(e) => updateCurrent('order_index', parseInt(e.target.value) || 0)}
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
                          onChange={(e) => updateCurrent('is_active', e.target.checked)}
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
                        onChange={(e) => updateCurrent('title_tag', e.target.value)}
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
                        onChange={(e) => updateCurrent('meta_description', e.target.value)}
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
                        onChange={(e) => updateCurrent('h1', e.target.value)}
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
                          onChange={(e) => updateCurrent('intro_p1', e.target.value)}
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
                          onChange={(e) => updateCurrent('intro_p2', e.target.value)}
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
                          onChange={(e) => updateCurrent('hero_image', e.target.value)}
                          placeholder="/music/image.png"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
                        />
                        {currentActivity.hero_image && (
                          <div className="w-12 h-12 rounded-xl border overflow-hidden relative shrink-0 bg-gray-50 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentActivity.hero_image}
                              alt="Hero preview"
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                const target = e.target as HTMLImageElement
                                if (!target.dataset.triedFallback && currentActivity.hero_image?.startsWith('/')) {
                                  target.dataset.triedFallback = 'true'
                                  target.src = `https://phulwari.co.in${currentActivity.hero_image}`
                                } else {
                                  target.src = '/phulwari_logo.webp'
                                }
                              }}
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Image Path</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(currentActivity.gallery_images || []).map((imgUrl, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-gray-50">
                            <div className="w-10 h-10 rounded-lg border overflow-hidden relative shrink-0 bg-white flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imgUrl}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e: any) => {
                                  const target = e.target as HTMLImageElement
                                  if (!target.dataset.triedFallback && imgUrl?.startsWith('/')) {
                                    target.dataset.triedFallback = 'true'
                                    target.src = `https://phulwari.co.in${imgUrl}`
                                  } else {
                                    target.src = '/phulwari_logo.webp'
                                  }
                                }}
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
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3B. VIDEOS & STREAMS (SEPARATE FROM IMAGES) */}
                {activeSubTab === 'videos' && (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-purple-600 text-white">
                            <Film className="w-4 h-4" />
                          </span>
                          <h3 className="text-base font-bold text-gray-900">
                            Videos & Streaming Management
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Upload fast-streaming videos to Cloudflare R2 / storage with automatic client-side compression.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={uploadingVideo}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingVideo ? 'Processing Video...' : 'Upload Video File'}</span>
                        </button>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*,.mp4,.mov,.webm,.m4v,.mkv"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Compression & Upload Status Box */}
                    {uploadingVideo && (
                      <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-lg space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            <span>{compressionStatus || 'Compressing & uploading video...'}</span>
                          </span>
                          <span>{compressionProgress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                            style={{ width: `${compressionProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Compression Result Stat Banner */}
                    {videoStats && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Optimized: {formatBytes(videoStats.original)} → {formatBytes(videoStats.compressed)} ({videoStats.saved}% bandwidth saved!)
                          </span>
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Fast Web Ready</span>
                      </div>
                    )}

                    {/* Compression Setting Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                      <div>
                        <span className="font-bold text-gray-800">Automatic Client-Side Video Compression</span>
                        <p className="text-gray-500 mt-0.5">
                          Resizes camera/phone 4K/1080p clips to lightweight 720p 30fps web stream before uploading.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoCompress}
                        onChange={(e) => setAutoCompress(e.target.checked)}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                      />
                    </div>

                    {/* Quick Add Built-in Videos Bar */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Quick Link Built-in Video Assets
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: '🎂 Birthday Party Video', url: '/videos/birthday_party.mp4', poster: '/birthday_party/image.png' },
                          { label: '🏏 Cricket Academy Video', url: '/videos/cricket.mp4', poster: '/Cricket/image.png' },
                          { label: '🤸 Gymnastics Video', url: '/videos/gymnastics.mp4', poster: '/Gymnastics/image.png' },
                          { label: '🛼 Roller Skating Video', url: '/videos/skating.mp4', poster: '/Roller_skating/image.png' },
                        ].map((q) => (
                          <button
                            key={q.url}
                            type="button"
                            onClick={() => handleAddVideoByUrl(q.url, q.label.replace(/^[^\s]+\s/, ''), q.poster)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition shadow-xs cursor-pointer"
                          >
                            + {q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Videos List */}
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            Active Activity Videos ({(currentActivity.videos || []).length})
                          </h4>
                          <p className="text-xs text-gray-500">
                            Videos featured here appear in the frontend action showcase section.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddVideoByUrl('/videos/birthday_party.mp4', 'New Video')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Video Link</span>
                        </button>
                      </div>

                      {(currentActivity.videos || []).length === 0 ? (
                        <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-3 bg-gray-50/50">
                          <Video className="w-10 h-10 text-gray-400 mx-auto" />
                          <div>
                            <h5 className="text-sm font-bold text-gray-700">No Videos Attached Yet</h5>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                              Upload a video clip or link one of the built-in video assets above to showcase action footage on this page.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(currentActivity.videos || []).map((vid, idx) => (
                            <div
                              key={vid.id || idx}
                              className={`p-4 rounded-2xl border transition-all ${
                                vid.is_featured
                                  ? 'border-purple-300 bg-purple-50/30 ring-1 ring-purple-200 shadow-sm'
                                  : 'border-gray-200 bg-white shadow-xs'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row gap-4">
                                {/* Video Thumbnail / Mini Player */}
                                <div className="w-full md:w-56 aspect-video rounded-xl overflow-hidden bg-slate-950 relative shrink-0 border border-slate-800">
                                  {previewVideoUrl === vid.url ? (
                                    <video
                                      src={vid.url}
                                      controls
                                      autoPlay
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div
                                      onClick={() => setPreviewVideoUrl(vid.url)}
                                      className="w-full h-full cursor-pointer group relative flex items-center justify-center bg-slate-900"
                                    >
                                      {vid.poster && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={vid.poster}
                                          alt={vid.title}
                                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                                        />
                                      )}
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                          <Play className="w-5 h-5 fill-current ml-0.5" />
                                        </div>
                                      </div>
                                      <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-bold text-white px-1.5 py-0.5 rounded">
                                        {vid.duration || '0:30'}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Video Fields */}
                                <div className="flex-1 space-y-3 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      value={vid.title || ''}
                                      onChange={(e) => {
                                        const copy = [...(currentActivity.videos || [])]
                                        copy[idx] = { ...copy[idx], title: e.target.value }
                                        updateCurrent('videos', copy)
                                      }}
                                      placeholder="Video Title"
                                      className="w-full font-bold text-sm text-gray-900 border-b border-transparent focus:border-purple-400 focus:outline-none px-1 py-0.5"
                                    />

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVideo(vid.id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                                      title="Delete Video"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    value={vid.description || ''}
                                    onChange={(e) => {
                                      const copy = [...(currentActivity.videos || [])]
                                      copy[idx] = { ...copy[idx], description: e.target.value }
                                      updateCurrent('videos', copy)
                                    }}
                                    placeholder="Short video description..."
                                    className="w-full text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
                                  />

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Video URL</label>
                                      <input
                                        type="text"
                                        value={vid.url || ''}
                                        onChange={(e) => {
                                          const copy = [...(currentActivity.videos || [])]
                                          copy[idx] = { ...copy[idx], url: e.target.value }
                                          updateCurrent('videos', copy)
                                        }}
                                        className="w-full font-mono text-[11px] border border-gray-200 rounded-lg px-2 py-1"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Poster Image</label>
                                      <input
                                        type="text"
                                        value={vid.poster || ''}
                                        onChange={(e) => {
                                          const copy = [...(currentActivity.videos || [])]
                                          copy[idx] = { ...copy[idx], poster: e.target.value }
                                          updateCurrent('videos', copy)
                                        }}
                                        className="w-full font-mono text-[11px] border border-gray-200 rounded-lg px-2 py-1"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFeaturedVideo(vid.id)}
                                      className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                        vid.is_featured
                                          ? 'bg-purple-600 text-white shadow-xs'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      <Sparkles className="w-3 h-3" />
                                      <span>{vid.is_featured ? 'Primary Featured Video' : 'Set as Featured'}</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-gray-400">Duration:</span>
                                      <input
                                        type="text"
                                        value={vid.duration || '0:30'}
                                        onChange={(e) => {
                                          const copy = [...(currentActivity.videos || [])]
                                          copy[idx] = { ...copy[idx], duration: e.target.value }
                                          updateCurrent('videos', copy)
                                        }}
                                        className="w-14 text-xs font-mono text-center border border-gray-200 rounded px-1 py-0.5"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                        onChange={(e) => updateCurrent('benefits_title', e.target.value)}
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition cursor-pointer"
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
                                className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
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
                        onChange={(e) => updateCurrent('programs_title', e.target.value)}
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition cursor-pointer"
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
                                className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
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
                                placeholder="Program Name"
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
                        onChange={(e) => updateCurrent('why_matters_title', e.target.value)}
                        placeholder="Why This Activity Matters"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                      />
                      <textarea
                        rows={3}
                        value={currentActivity.why_matters_content || ''}
                        onChange={(e) => updateCurrent('why_matters_content', e.target.value)}
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
                          className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
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
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
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
                          className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
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
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition cursor-pointer"
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
                              className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
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
                          onChange={(e) => {
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
                          onChange={(e) => {
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
                        value={
                          currentActivity.cta?.address ||
                          'M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road, Patna, Bihar – 800001'
                        }
                        onChange={(e) => {
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
                        onChange={(e) => {
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
              <SectionIconComp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select a page from the left list to edit, or click &ldquo;{addButtonText}&rdquo;.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reusable Icon Picker Modal */}
      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        currentIcon={currentActivity?.icon}
        accentColor={currentActivity?.color}
        onSelect={(iconName) => {
          updateCurrent('icon', iconName)
        }}
      />
    </div>
  )
}
