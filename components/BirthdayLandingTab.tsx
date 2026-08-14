'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Save, Loader2, Sparkles, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function BirthdayLandingTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState<'hero' | 'badges' | 'pain' | 'features' | 'reviews' | 'faqs'>('hero')
  
  const [config, setConfig] = useState<any>({
    hero_section: {
      pill_text: '',
      headline_part1: '',
      headline_highlight: '',
      headline_part2: '',
      sub_headline: '',
      description: '',
      cta_text: ''
    },
    trust_badges: [],
    pain_points_section: {
      title: '',
      description: '',
      points: [],
      advantage_title: '',
      advantage_desc: ''
    },
    features_section: {
      title: '',
      features: []
    },
    testimonials_section: {
      title: '',
      reviews: []
    },
    faq_section: {
      title: '',
      faqs: []
    }
  })

  const [previewUrl, setPreviewUrl] = useState('')
  const [isReloading, setIsReloading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchConfig()
    // Determine frontend URL based on window location
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (isLocalhost) {
        const port = window.location.port
        const frontend = window.location.origin.replace(`:${port}`, ':3000') + '/birthdays'
        setPreviewUrl(frontend)
      } else {
        // In production, always point to the live site
        setPreviewUrl('https://phulwari.co.in/birthdays')
      }
    }
  }, [])

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_landing_config')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setMessage('No configuration found. Please run the SQL setup script first.')
        } else if (error.code === '42P01') {
          setMessage('The birthday_landing_config table does not exist. Run the SQL script in your Supabase SQL Editor.')
        } else {
          console.error(error)
        }
      } else if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('birthday_landing_config')
        .upsert({ id: 1, ...config, updated_at: new Date().toISOString() })

      if (error) throw error
      setMessage('Landing page configuration saved successfully!')
      
      // Reload iframe preview to show changes
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src
      }
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`Error saving: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const reloadPreview = () => {
    setIsReloading(true)
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
    setTimeout(() => {
      setIsReloading(false)
    }, 1000)
  }

  // Helpers for nested updates
  const updateHero = (field: string, val: string) => {
    setConfig({
      ...config,
      hero_section: { ...config.hero_section, [field]: val }
    })
  }

  const updateBadge = (index: number, field: string, val: string) => {
    const updated = [...config.trust_badges]
    updated[index] = { ...updated[index], [field]: val }
    setConfig({ ...config, trust_badges: updated })
  }

  const updatePainSection = (field: string, val: any) => {
    setConfig({
      ...config,
      pain_points_section: { ...config.pain_points_section, [field]: val }
    })
  }

  const updatePainPoint = (index: number, field: string, val: string) => {
    const points = [...config.pain_points_section.points]
    points[index] = { ...points[index], [field]: val }
    updatePainSection('points', points)
  }

  const updateFeaturesSection = (field: string, val: any) => {
    setConfig({
      ...config,
      features_section: { ...config.features_section, [field]: val }
    })
  }

  const updateFeature = (index: number, field: string, val: string) => {
    const features = [...config.features_section.features]
    features[index] = { ...features[index], [field]: val }
    updateFeaturesSection('features', features)
  }

  const updateTestimonialsSection = (field: string, val: any) => {
    setConfig({
      ...config,
      testimonials_section: { ...config.testimonials_section, [field]: val }
    })
  }

  const updateReview = (index: number, field: string, val: any) => {
    const reviews = [...config.testimonials_section.reviews]
    reviews[index] = { ...reviews[index], [field]: val }
    updateTestimonialsSection('reviews', reviews)
  }

  const removeReview = (index: number) => {
    const reviews = config.testimonials_section.reviews.filter((_: any, i: number) => i !== index)
    updateTestimonialsSection('reviews', reviews)
  }

  const addReview = () => {
    const reviews = [...config.testimonials_section.reviews, { text: '', author: '', rating: 5, avatar: '' }]
    updateTestimonialsSection('reviews', reviews)
  }

  const updateFaqSection = (field: string, val: any) => {
    setConfig({
      ...config,
      faq_section: { ...config.faq_section, [field]: val }
    })
  }

  const updateFaq = (index: number, field: string, val: string) => {
    const faqs = [...config.faq_section.faqs]
    faqs[index] = { ...faqs[index], [field]: val }
    updateFaqSection('faqs', faqs)
  }

  const removeFaq = (index: number) => {
    const faqs = config.faq_section.faqs.filter((_: any, i: number) => i !== index)
    updateFaqSection('faqs', faqs)
  }

  const addFaq = () => {
    const faqs = [...config.faq_section.faqs, { question: '', answer: '' }]
    updateFaqSection('faqs', faqs)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* Configuration Panels */}
      <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        
        <div className="flex justify-between items-center pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-rose-500 w-5 h-5" />
              Birthday Landing Page Editor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Edit all sections dynamically. Click save to apply changes instantly.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${message.includes('Error') || message.includes('exist') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        {/* Section Selectors */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
          {(['hero', 'badges', 'pain', 'features', 'reviews', 'faqs'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSection === sec ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {sec === 'hero' && 'Hero'}
              {sec === 'badges' && 'Trust Badges'}
              {sec === 'pain' && 'Pain Points'}
              {sec === 'features' && 'Why Phulwari'}
              {sec === 'reviews' && 'Reviews'}
              {sec === 'faqs' && 'FAQ'}
            </button>
          ))}
        </div>

        {/* HERO SECTION */}
        {activeSection === 'hero' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Hero Header & CTA</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pill Badge Text</label>
                <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-rose-500 outline-none" 
                  value={config.hero_section?.pill_text || ''} onChange={e => updateHero('pill_text', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Headline Part 1</label>
                <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-rose-500 outline-none" 
                  value={config.hero_section?.headline_part1 || ''} onChange={e => updateHero('headline_part1', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Headline Highlight</label>
                <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-rose-500 outline-none" 
                  value={config.hero_section?.headline_highlight || ''} onChange={e => updateHero('headline_highlight', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Headline Part 2</label>
                <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-rose-500 outline-none" 
                  value={config.hero_section?.headline_part2 || ''} onChange={e => updateHero('headline_part2', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-rose-500 outline-none" rows={3}
                  value={config.hero_section?.description || ''} onChange={e => updateHero('description', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">CTA Button Text</label>
                <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-rose-500 outline-none" 
                  value={config.hero_section?.cta_text || ''} onChange={e => updateHero('cta_text', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* TRUST BADGES */}
        {activeSection === 'badges' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Trust Badges (3 Badges Below CTA)</h3>
            {config.trust_badges?.map((badge: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Badge #{idx + 1}</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Icon Name (ShieldCheck, Camera, PartyPopper)</label>
                    <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                      value={badge.icon || ''} onChange={e => updateBadge(idx, 'icon', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Title Line 1</label>
                    <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                      value={badge.title || ''} onChange={e => updateBadge(idx, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Subtitle Line 2</label>
                    <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                      value={badge.subtitle || ''} onChange={e => updateBadge(idx, 'subtitle', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAIN POINTS & ADVANTAGE */}
        {activeSection === 'pain' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Pain Points & Phulwari Advantage</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                  value={config.pain_points_section?.title || ''} onChange={e => updatePainSection('title', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Section Subtitle</label>
                <textarea className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" rows={2}
                  value={config.pain_points_section?.description || ''} onChange={e => updatePainSection('description', e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Pain Points (3 columns)</h4>
              {config.pain_points_section?.points?.map((pt: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pain Point #{idx+1} Title</label>
                      <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={pt.title || ''} onChange={e => updatePainPoint(idx, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pain Point #{idx+1} Description</label>
                      <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={pt.desc || ''} onChange={e => updatePainPoint(idx, 'desc', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 space-y-4">
              <h4 className="text-xs font-bold text-amber-800">The Phulwari Advantage Column</h4>
              <div>
                <label className="block text-[10px] font-semibold text-amber-700 mb-1">Advantage Title</label>
                <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-amber-200 outline-none bg-white" 
                  value={config.pain_points_section?.advantage_title || ''} onChange={e => updatePainSection('advantage_title', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-amber-700 mb-1">Advantage Description</label>
                <textarea className="w-full px-3 py-2 text-xs rounded-lg border border-amber-200 outline-none bg-white" rows={3}
                  value={config.pain_points_section?.advantage_desc || ''} onChange={e => updatePainSection('advantage_desc', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* FEATURES (WHY PHULWARI) */}
        {activeSection === 'features' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Why Phulwari Section (5 Icons)</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
              <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                value={config.features_section?.title || ''} onChange={e => updateFeaturesSection('title', e.target.value)} />
            </div>

            <div className="space-y-4">
              {config.features_section?.features?.map((feat: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">Feature Item #{idx+1}</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Icon (ShieldCheck, Gamepad2, Crown, Droplets, Camera)</label>
                      <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={feat.icon || ''} onChange={e => updateFeature(idx, 'icon', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Title</label>
                      <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={feat.title || ''} onChange={e => updateFeature(idx, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Short Description</label>
                      <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={feat.desc || ''} onChange={e => updateFeature(idx, 'desc', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TESTIMONIALS */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Parent Testimonials</h3>
              <button 
                onClick={addReview}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Review
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
              <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                value={config.testimonials_section?.title || ''} onChange={e => updateTestimonialsSection('title', e.target.value)} />
            </div>

            <div className="space-y-4">
              {config.testimonials_section?.reviews?.map((rev: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative space-y-3">
                  <button 
                    onClick={() => removeReview(idx)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h4 className="text-xs font-bold text-slate-700">Reviewer #{idx+1}</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Author Name</label>
                      <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={rev.author || ''} onChange={e => updateReview(idx, 'author', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Rating Stars (1-5)</label>
                      <input type="number" min="1" max="5" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={rev.rating || 5} onChange={e => updateReview(idx, 'rating', parseInt(e.target.value))} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Quote Text</label>
                      <textarea className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" rows={2}
                        value={rev.text || ''} onChange={e => updateReview(idx, 'text', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {activeSection === 'faqs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Frequently Asked Questions</h3>
              <button 
                onClick={addFaq}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add FAQ
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
              <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                value={config.faq_section?.title || ''} onChange={e => updateFaqSection('title', e.target.value)} />
            </div>

            <div className="space-y-4">
              {config.faq_section?.faqs?.map((faq: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative space-y-3">
                  <button 
                    onClick={() => removeFaq(idx)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h4 className="text-xs font-bold text-slate-700">FAQ Item #{idx+1}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Question</label>
                      <input type="text" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" 
                        value={faq.question || ''} onChange={e => updateFaq(idx, 'question', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Answer</label>
                      <textarea className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none" rows={2}
                        value={faq.answer || ''} onChange={e => updateFaq(idx, 'answer', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Live Preview Panel */}
      <div className="xl:col-span-5 sticky top-6 space-y-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-rose-500" /> Live Preview Snapshot
            </h3>
            <button 
              onClick={reloadPreview}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
              title="Refresh Preview"
            >
              <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {previewUrl ? (
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50 relative aspect-[9/16] xl:aspect-[3/4]">
              <iframe 
                ref={iframeRef}
                src={previewUrl} 
                className="w-full h-full border-none origin-top"
                title="Live Preview"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm">
                Preview Mode (Read-Only)
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs font-medium">Resolving live app URL...</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
