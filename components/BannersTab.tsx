'use client'

import React, { useState, useMemo } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Calendar,
  ExternalLink,
  MousePointerClick,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layout,
  Smartphone,
  Monitor,
  UploadCloud
} from 'lucide-react'
import { createClient } from '../lib/supabase/client'

export interface BannerItem {
  id: string
  title: string
  subtitle?: string
  description?: string
  cta_text?: string
  cta_url?: string
  target_link_open?: 'Same Tab' | 'New Tab'
  banner_type: 'Image Banner' | 'Poster Banner' | 'Promotional Banner' | 'Announcement Banner' | 'Event Banner' | 'Offer Banner' | 'Popup Banner'
  aspect_ratio: '16:9' | '21:9' | '4:3' | '1:1' | '3:4' | '9:16' | 'Custom'
  image_url: string
  mobile_image_url?: string
  thumbnail_url?: string
  display_position: 'Hero Section' | 'Header Top' | 'Top Announcement Bar' | 'Sidebar' | 'Pre-Footer' | 'Footer' | 'Popup Banner'
  priority: number
  status: 'active' | 'draft' | 'scheduled' | 'deactivated'
  start_date?: string
  end_date?: string
  device_target: 'All Devices' | 'Desktop Only' | 'Mobile Only' | 'Tablet Only'
  impressions?: number
  clicks?: number
  created_at?: string
}

interface BannersTabProps {
  bgCard: string
  bgSubCard: string
  textPrimary: string
  textSecondary: string
  isLight: boolean
  banners: BannerItem[]
  setBanners: React.Dispatch<React.SetStateAction<BannerItem[]>>
  loadAllAdminData: () => Promise<void>
}

export default function BannersTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  isLight,
  banners,
  setBanners,
  loadAllAdminData
}: BannersTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [loading, setLoading] = useState(false)

  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)

  // Form State
  const [form, setForm] = useState<Partial<BannerItem>>({
    title: '',
    subtitle: '',
    description: '',
    cta_text: 'Explore Now',
    cta_url: '',
    target_link_open: 'Same Tab',
    banner_type: 'Promotional Banner',
    aspect_ratio: '16:9',
    image_url: '',
    mobile_image_url: '',
    display_position: 'Hero Section',
    priority: 1,
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    device_target: 'All Devices'
  })

  const filteredBanners = useMemo(() => {
    return (banners || []).filter(b => {
      const matchSearch = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.display_position || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'All' || b.status === statusFilter
      const matchType = typeFilter === 'All' || b.banner_type === typeFilter
      return matchSearch && matchStatus && matchType
    }).sort((a, b) => (a.priority || 0) - (b.priority || 0))
  }, [banners, searchQuery, statusFilter, typeFilter])

  const openCreateModal = () => {
    setEditingBanner(null)
    setForm({
      title: '',
      subtitle: '',
      description: '',
      cta_text: 'Explore Now',
      cta_url: '',
      target_link_open: 'Same Tab',
      banner_type: 'Promotional Banner',
      aspect_ratio: '16:9',
      image_url: '',
      mobile_image_url: '',
      display_position: 'Hero Section',
      priority: (banners.length || 0) + 1,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      device_target: 'All Devices'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: BannerItem) => {
    setEditingBanner(item)
    setForm({ ...item })
    setIsModalOpen(true)
  }

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (target === 'main') setUploadingMain(true)
    else setUploadingMobile(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { data: uploadData, error: uploadErr } = await supabase.storage.from('gallery').upload(filePath, file, {
        contentType: file.type || 'image/png',
        upsert: true
      })
      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(filePath)
        if (publicUrlData?.publicUrl) {
          if (target === 'main') {
            setForm(prev => ({ ...prev, image_url: publicUrlData.publicUrl }))
          } else {
            setForm(prev => ({ ...prev, mobile_image_url: publicUrlData.publicUrl }))
          }
          return
        }
      }

      // Fallback to base64 data URL if storage upload policy restricts
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (target === 'main') {
          setForm(prev => ({ ...prev, image_url: result }))
        } else {
          setForm(prev => ({ ...prev, mobile_image_url: result }))
        }
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      console.error(err)
      alert(`Local file upload error: ${err.message}`)
    } finally {
      if (target === 'main') setUploadingMain(false)
      else setUploadingMobile(false)
    }
  }

  const handleDuplicate = async (item: BannerItem) => {
    const dup: Partial<BannerItem> = {
      ...item,
      id: undefined,
      title: `${item.title} (Copy)`,
      created_at: new Date().toISOString(),
      priority: (item.priority || 0) + 1
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('banners').insert([dup]).select()
      if (error) {
        alert(`Supabase save error: ${error.message}`)
      } else if (data && data[0]) {
        setBanners(prev => [data[0], ...prev])
        alert('✅ Banner duplicated successfully!')
      }
    } catch (e: any) {
      alert(`Error duplicating: ${e.message}`)
    } finally {
      setLoading(false)
      loadAllAdminData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this banner?')) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) {
        alert(`Supabase delete error: ${error.message}`)
      } else {
        setBanners(prev => prev.filter(b => b.id !== id))
        alert('🗑️ Banner deleted successfully!')
      }
    } catch (e: any) {
      alert(`Error deleting banner: ${e.message}`)
    } finally {
      setLoading(false)
      loadAllAdminData()
    }
  }

  const handleToggleStatus = async (item: BannerItem) => {
    const newStatus = item.status === 'active' ? 'deactivated' : 'active'
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('banners').update({ status: newStatus }).eq('id', item.id)
      if (error) {
        alert(`Status update error: ${error.message}`)
      } else {
        setBanners(prev => prev.map(b => b.id === item.id ? { ...b, status: newStatus } : b))
      }
    } catch (e: any) {
      alert(`Error updating status: ${e.message}`)
    } finally {
      setLoading(false)
      loadAllAdminData()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image_url && !form.title) {
      alert('Please provide a Banner Title or Banner Image URL.')
      return
    }

    setLoading(true)
    const startDateClean = form.start_date && String(form.start_date).trim() !== '' ? String(form.start_date).trim() : null
    const endDateClean = form.end_date && String(form.end_date).trim() !== '' ? String(form.end_date).trim() : null

    const payload = {
      title: form.title || 'Untitled Banner',
      subtitle: form.subtitle || '',
      description: form.description || '',
      cta_text: form.cta_text || '',
      cta_url: form.cta_url || '',
      target_link_open: form.target_link_open || 'Same Tab',
      banner_type: form.banner_type || 'Promotional Banner',
      aspect_ratio: form.aspect_ratio || '16:9',
      image_url: form.image_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80',
      mobile_image_url: form.mobile_image_url || form.image_url || '',
      display_position: form.display_position || 'Hero Section',
      priority: Number(form.priority || 1),
      status: form.status || 'active',
      start_date: startDateClean,
      end_date: endDateClean,
      device_target: form.device_target || 'All Devices',
      impressions: editingBanner ? (editingBanner.impressions || 0) : 0,
      clicks: editingBanner ? (editingBanner.clicks || 0) : 0
    }

    try {
      const supabase = createClient()
      if (editingBanner?.id) {
        const { data, error } = await supabase.from('banners').update(payload).eq('id', editingBanner.id).select()
        if (error) {
          alert(`Could not save banner to Supabase DB: ${error.message}`)
        } else if (data && data[0]) {
          setBanners(prev => prev.map(b => b.id === editingBanner.id ? data[0] : b))
          alert('✅ Banner updated successfully in Supabase DB!')
          setIsModalOpen(false)
        }
      } else {
        const { data, error } = await supabase.from('banners').insert([payload]).select()
        if (error) {
          alert(`Could not save banner to Supabase DB: ${error.message}`)
        } else if (data && data[0]) {
          setBanners(prev => [data[0], ...prev])
          alert('✅ New Banner published successfully to Supabase DB!')
          setIsModalOpen(false)
        }
      }
    } catch (err: any) {
      alert(`Network error saving banner: ${err?.message || err}`)
    } finally {
      setLoading(false)
      loadAllAdminData()
    }
  }

  const inputCls = `w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none transition ${
    isLight
      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
      : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
  }`

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6 shadow-sm animate-fadeIn`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-extrabold ${textPrimary} flex items-center gap-2`}>
            <ImageIcon className="w-5 h-5 text-pink-500" /> Banner &amp; Poster Management System
          </h3>
          <p className={`text-xs ${textSecondary}`}>
            Create, schedule, target, and manage custom promotional banners &amp; posters across website pages.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-pink-500/25 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>➕ Add New Banner</span>
        </button>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-blue-600">Total Banners</p>
            <p className="text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{banners.length}</p>
          </div>
          <Layers className="w-6 h-6 text-blue-500 opacity-80" />
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-emerald-600">Active Banners</p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
              {banners.filter(b => b.status === 'active').length}
            </p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-purple-600">Total Impressions</p>
            <p className="text-xl font-black text-purple-700 dark:text-purple-400 mt-0.5 font-mono">
              {banners.reduce((sum, b) => sum + (b.impressions || 0), 0)}
            </p>
          </div>
          <Eye className="w-6 h-6 text-purple-500 opacity-80" />
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-amber-600">Total Clicks</p>
            <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5 font-mono">
              {banners.reduce((sum, b) => sum + (b.clicks || 0), 0)}
            </p>
          </div>
          <MousePointerClick className="w-6 h-6 text-amber-500 opacity-80" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search banners by title, subtitle or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border outline-none font-semibold ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`text-xs px-3 py-2 rounded-xl border font-bold outline-none ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="deactivated">Deactivated</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`text-xs px-3 py-2 rounded-xl border font-bold outline-none ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}
          >
            <option value="All">All Banner Types</option>
            <option value="Image Banner">Image Banner</option>
            <option value="Poster Banner">Poster Banner</option>
            <option value="Promotional Banner">Promotional Banner</option>
            <option value="Announcement Banner">Announcement Banner</option>
            <option value="Event Banner">Event Banner</option>
            <option value="Offer Banner">Offer Banner</option>
            <option value="Popup Banner">Popup Banner</option>
          </select>
        </div>
      </div>

      {/* Banner Cards List */}
      {filteredBanners.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-extrabold text-slate-400">No Banners Found</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 cursor-pointer"
          >
            Create Your First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanners.map(item => {
            const isActive = item.status === 'active'
            const isDraft = item.status === 'draft'

            return (
              <div
                key={item.id}
                className={`rounded-2xl border overflow-hidden transition group hover:shadow-lg flex flex-col justify-between ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Banner Preview Thumbnail */}
                <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                        {item.banner_type}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shadow-xs ${
                        isActive
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : isDraft
                            ? 'bg-amber-500 text-white border-amber-400'
                            : 'bg-rose-500 text-white border-rose-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-pink-300 font-bold bg-pink-950/80 px-2 py-0.5 rounded border border-pink-500/30">
                        Priority #{item.priority || 1} • {item.display_position}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className={`font-black text-sm ${textPrimary} line-clamp-1`}>{item.title}</h4>
                    {item.subtitle && (
                      <p className={`text-xs font-semibold text-pink-500 line-clamp-1 mt-0.5`}>{item.subtitle}</p>
                    )}
                    {item.description && (
                      <p className={`text-[11px] ${textSecondary} line-clamp-2 mt-1 leading-relaxed`}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-semibold">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Aspect Ratio: <strong className={textPrimary}>{item.aspect_ratio}</strong></span>
                      <span>Target: <strong className="text-blue-500">{item.device_target}</strong></span>
                    </div>

                    {item.cta_url && (
                      <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.cta_url} ({item.target_link_open})</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400 pt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-purple-400" /> {item.impressions || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3 text-amber-400" /> {item.clicks || 0} clicks
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition cursor-pointer ${
                        isActive
                          ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(item)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition cursor-pointer"
                        title="Duplicate Banner"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-pink-500 hover:bg-pink-50 transition cursor-pointer"
                        title="Edit Banner"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl p-6 space-y-5 shadow-2xl border my-8 ${bgCard}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-extrabold ${textPrimary} flex items-center gap-2`}>
                <Sparkles className="w-5 h-5 text-pink-500" />
                {editingBanner ? 'Edit Banner / Poster' : 'Create New Banner / Poster'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold hover:text-rose-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Section 1: Basic Information */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <h4 className="font-extrabold text-[10px] text-pink-600 uppercase tracking-wider">1. Banner Details &amp; Copy</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Banner Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Summer Camp Special Admission Open 2026"
                      value={form.title || ''}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Subtitle / Tagline (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Get 20% Off on Early Bird Registrations"
                      value={form.subtitle || ''}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Banner Type</label>
                    <select
                      value={form.banner_type || 'Promotional Banner'}
                      onChange={(e) => setForm({ ...form, banner_type: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="Image Banner">Image Banner</option>
                      <option value="Poster Banner">Poster Banner</option>
                      <option value="Promotional Banner">Promotional Banner</option>
                      <option value="Announcement Banner">Announcement Banner</option>
                      <option value="Event Banner">Event Banner</option>
                      <option value="Offer Banner">Offer Banner</option>
                      <option value="Popup Banner">Popup Banner</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Short Description (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Detailed promotional text or description for popup modals and cards..."
                      value={form.description || ''}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Media & Images */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <h4 className="font-extrabold text-[10px] text-blue-600 uppercase tracking-wider">2. Banner Media &amp; Aspect Ratio</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Select Aspect Ratio</label>
                    <select
                      value={form.aspect_ratio || '16:9'}
                      onChange={(e) => setForm({ ...form, aspect_ratio: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="16:9">16:9 Widescreen Banner</option>
                      <option value="21:9">21:9 Ultra-wide Header</option>
                      <option value="4:3">4:3 Standard Card</option>
                      <option value="1:1">1:1 Square Poster</option>
                      <option value="3:4">3:4 Portrait Poster</option>
                      <option value="9:16">9:16 Vertical Mobile Banner</option>
                      <option value="Custom">Custom Ratio</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Main Banner Image URL *</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        required
                        placeholder="https://example.com/banner-image.jpg or Supabase Public URL"
                        value={form.image_url || ''}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        className={inputCls}
                      />
                      <label className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm transition whitespace-nowrap">
                        <UploadCloud className="w-4 h-4" />
                        <span>{uploadingMain ? 'Uploading...' : '📁 Upload Local Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLocalImageUpload(e, 'main')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Mobile Banner Image URL (Optional)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/mobile-banner.jpg (If different for small screens)"
                        value={form.mobile_image_url || ''}
                        onChange={(e) => setForm({ ...form, mobile_image_url: e.target.value })}
                        className={inputCls}
                      />
                      <label className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition whitespace-nowrap">
                        <UploadCloud className="w-4 h-4" />
                        <span>{uploadingMobile ? 'Uploading...' : '📁 Upload Mobile Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLocalImageUpload(e, 'mobile')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {form.image_url && (
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Live Image Preview</label>
                      <div className="aspect-[16/9] max-h-48 rounded-2xl bg-slate-950 overflow-hidden border border-slate-300 dark:border-slate-800">
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-contain mx-auto" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Call To Action & Links */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <h4 className="font-extrabold text-[10px] text-amber-600 uppercase tracking-wider">3. Click Action &amp; Target Link</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>CTA Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Enroll Now, Explore Courses"
                      value={form.cta_text || ''}
                      onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>CTA Target Link / URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /contact or https://phulwari.co.in/events"
                      value={form.cta_url || ''}
                      onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Open Link In</label>
                    <select
                      value={form.target_link_open || 'Same Tab'}
                      onChange={(e) => setForm({ ...form, target_link_open: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="Same Tab">Same Tab (_self)</option>
                      <option value="New Tab">New Tab (_blank)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Placement, Schedule & Devices */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <h4 className="font-extrabold text-[10px] text-purple-600 uppercase tracking-wider">4. Display Position &amp; Scheduling</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Display Position</label>
                    <select
                      value={form.display_position || 'Hero Section'}
                      onChange={(e) => setForm({ ...form, display_position: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="Hero Section">Hero Section</option>
                      <option value="Header Top">Header Top</option>
                      <option value="Top Announcement Bar">Top Announcement Bar</option>
                      <option value="Sidebar">Sidebar</option>
                      <option value="Pre-Footer">Pre-Footer</option>
                      <option value="Footer">Footer</option>
                      <option value="Popup Banner">Popup Banner</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Display Priority Order</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={form.priority || 1}
                      onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 1 })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Device Targeting</label>
                    <select
                      value={form.device_target || 'All Devices'}
                      onChange={(e) => setForm({ ...form, device_target: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="All Devices">All Devices</option>
                      <option value="Desktop Only">Desktop Only</option>
                      <option value="Mobile Only">Mobile Only</option>
                      <option value="Tablet Only">Tablet Only</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Publication Status</label>
                    <select
                      value={form.status || 'active'}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="active">Active (Published Immediately)</option>
                      <option value="draft">Draft Mode</option>
                      <option value="scheduled">Scheduled For Later</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>Start Date (Publish Date)</label>
                    <input
                      type="date"
                      value={form.start_date || ''}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${textSecondary}`}>End Date (Auto Unpublish)</label>
                    <input
                      type="date"
                      value={form.end_date || ''}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold rounded-xl shadow-md shadow-pink-500/25 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : editingBanner ? 'Save Banner Changes' : 'Save & Publish Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
