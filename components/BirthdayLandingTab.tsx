'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Save, Loader2, Sparkles, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, Eye, ExternalLink, Smartphone, Laptop, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_BIRTHDAY_CONFIG = {
  id: 1,
  hero_section: {
    pill_text: "🎉 Zero Stress, 100% Fun",
    headline_part1: "Give Your Little One an",
    headline_highlight: "Unforgettable",
    headline_part2: "1st to 5th Birthday",
    sub_headline: "— Zero Stress for You!",
    description: "Safe, spacious, and toddler-friendly party celebrations at Phulwari Activity Centre. Creative themes, soft-play fun, and complete end-to-end event management.",
    cta_text: "Check Date Availability & Get Free Quote",
    hero_image: "/birthday/birthday_1.png",
    playzone_images: [
      "/birthday/birthday_1.png",
      "/birthday/birthday_2.png",
      "/birthday/birthday_3.png"
    ]
  },
  trust_badges: [
    { icon: "ShieldCheck", title: "100% Safe &", subtitle: "Hygienic Environment" },
    { icon: "Camera", title: "24/7 CCTV", subtitle: "Monitored" },
    { icon: "PartyPopper", title: "100+ Happy", subtitle: "Birthdays Hosted" }
  ],
  pain_points_section: {
    title: "Planning a Toddler’s Birthday Party Shouldn't Leave You Exhausted.",
    description: "When your child is under 5, hosting a birthday party at home or in an adult banquet hall can be overwhelming:",
    points: [
      {
        icon: "ShieldAlert",
        title: "The Mess & Safety Risks",
        desc: "Sharp corners, fragile decor, and crowded spaces.",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=80"
      },
      {
        icon: "Frown",
        title: "Toddler Boredom",
        desc: "Traditional party venues don't keep 1–5-year-olds engaged.",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&auto=format&fit=crop&q=80"
      },
      {
        icon: "Frown",
        title: "Parent Exhaustion",
        desc: "You spend the whole party managing logistics instead of enjoying the moment.",
        image: "https://images.unsplash.com/photo-1537655780520-1e392ed8101a?w=500&auto=format&fit=crop&q=80"
      }
    ],
    advantage_title: "The Phulwari Advantage:",
    advantage_desc: "At Phulwari Mother & Child Activity Centre, we create child-centric celebrations where your little one can play freely in a safe, soft-padded environment while you relax and celebrate with guests.",
    advantage_image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600",
    advantage_logo: "https://api.dicebear.com/7.x/bottts/svg?seed=teddy"
  },
  features_section: {
    title: "Why Phulwari is Perfect for Ages 0–5",
    features: [
      { icon: "ShieldCheck", title: "Toddler-Proof Safety", desc: "Cushioned play areas, non-toxic materials, and rounded edges built specifically for early childhood safety." },
      { icon: "Gamepad2", title: "Interactive Play Zone Access", desc: "Keeps toddlers active with age-appropriate games, music, soft play, and creative art activities." },
      { icon: "Crown", title: "Magical Custom Themes", desc: "Cocomelon, Peppa Pig, Jungle Safari, Baby Shark, Princess, Superhero, and custom setups tailored to your kid's favorite world!" },
      { icon: "Droplets", title: "Sanitized & Hygienic Premises", desc: "Cleaned and disinfected before every event to keep little immune systems safe." },
      { icon: "Camera", title: "Picture-Perfect Backdrops", desc: "Beautiful, brightly lit theme setups designed for memory-making photo sessions." }
    ]
  },
  testimonials_section: {
    title: "What Parents Are Saying",
    reviews: [
      { text: "We hosted our son's 2nd birthday at Phulwari, and it was the best decision! The space was completely child-proof, so we didn't have to constantly chase him around. The theme setup was gorgeous!", author: "Priya & Amit S.", rating: 5, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya" },
      { text: "Usually, kids under 4 get bored in regular banquet halls. Here, the kids were busy in the activity zone the whole time. Stress-free event planning at its best!", author: "Ritu M.", rating: 5, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ritu" }
    ]
  },
  faq_section: {
    title: "Frequently Asked Questions",
    faqs: [
      { question: "Is the venue safe for 1 to 3-year-old toddlers?", answer: "Yes! Phulwari is designed as a Mother & Child Activity Centre. All play areas feature child-safe infrastructure, rounded edges, clean floors, and 24/7 CCTV surveillance." },
      { question: "Can we bring our own food or caterer?", answer: "Yes, we offer flexible party planning options so you can choose your preferred menu or let us assist you with catering recommendations." },
      { question: "How early should we book the venue?", answer: "Weekend slots fill up quickly. We recommend reserving your date at least 2–3 weeks in advance." }
    ],
    faq_image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600"
  }
}

export default function BirthdayLandingTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState<'hero' | 'badges' | 'pain' | 'features' | 'reviews' | 'faqs'>('hero')
  
  const [config, setConfig] = useState<any>(DEFAULT_BIRTHDAY_CONFIG)

  const [previewUrl, setPreviewUrl] = useState('https://phulwari.co.in/kids-and-child-birthday-party')
  const [previewDevice, setPreviewDevice] = useState<'laptop' | 'phone'>('phone')
  const [isExpanded, setIsExpanded] = useState(false)
  const [laptopWidth, setLaptopWidth] = useState<number>(1280)
  const [containerWidth, setContainerWidth] = useState<number>(550)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [isReloading, setIsReloading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchConfig()
    setPreviewUrl('https://phulwari.co.in/kids-and-child-birthday-party')
  }, [])

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

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_landing_config')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Auto-seed table if empty
          const { data: seeded } = await supabase.from('birthday_landing_config').upsert(DEFAULT_BIRTHDAY_CONFIG).select().single()
          if (seeded) setConfig(seeded)
        } else {
          setConfig(DEFAULT_BIRTHDAY_CONFIG)
        }
      } else if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error(error)
      setConfig(DEFAULT_BIRTHDAY_CONFIG)
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-rose-500 w-5 h-5" />
              Birthday Landing Page Editor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Edit all sections dynamically. Click save to apply changes instantly.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="https://phulwari.co.in/kids-and-child-birthday-party">🎂 Live Birthday Page (/kids-and-child-birthday-party)</option>
              <option value="https://phulwari.co.in/birthdays">🎈 Birthday Route (/birthdays)</option>
              <option value="https://phulwari.co.in/">🏠 Live Home Page (/)</option>
              <option value="https://phulwari.co.in/activities">🎨 Live Activities Page (/activities)</option>
              <option value="https://phulwari.co.in/batch-galary/batch">📅 Live Batches Page (/batch-galary/batch)</option>
            </select>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Live ↗</span>
            </a>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
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
      <div className={`${isExpanded ? 'xl:col-span-12' : 'xl:col-span-5'} sticky top-6 space-y-4 transition-all duration-300`}>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
              <Eye className="w-4 h-4 text-rose-500" /> Live Preview Snapshot
            </h3>

            <div className="flex items-center gap-2">
              {/* Device View Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('phone')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    previewDevice === 'phone'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('laptop')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    previewDevice === 'laptop'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop</span>
                </button>
              </div>

              {/* Expand / Minimize Full Width Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isExpanded ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={isExpanded ? "Collapse to Split View" : "Expand to Full Width"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
              </button>

              <button 
                onClick={reloadPreview}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                title="Refresh Preview"
              >
                <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {previewUrl ? (
            previewDevice === 'phone' ? (
              <div className="w-full flex justify-center py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="w-[340px] h-[600px] border-[10px] border-slate-900 rounded-[38px] shadow-2xl overflow-hidden bg-white relative transition-all duration-300">
                  <div className="w-24 h-3.5 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
                  </div>
                  <iframe 
                    ref={iframeRef}
                    src={previewUrl} 
                    className="w-full h-full border-none pt-2"
                    title="Live Phone Preview"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm z-20">
                    📱 Phone View (Mobile)
                  </div>
                </div>
              </div>
            ) : (
              (() => {
                const scale = Math.min(1, Math.max(0.25, containerWidth / laptopWidth));
                const scaledHeight = Math.round(720 * scale);

                return (
                  <div ref={previewContainerRef} className="w-full transition-all duration-300">
                    <div className="w-full bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative" style={{ height: `${scaledHeight + 36}px` }}>
                      {/* Laptop Desktop Browser Bar */}
                      <div className="w-full h-9 bg-slate-800 flex items-center justify-between px-3 text-slate-300 text-[10px] font-mono z-20 relative border-b border-slate-700">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                          <span className="ml-1 text-slate-300 font-bold hidden sm:inline">Desktop Viewport ({laptopWidth}px)</span>
                        </div>

                        <div className="flex-1 max-w-sm mx-2 text-center bg-slate-950/80 py-0.5 px-3 rounded-md text-[10px] text-slate-300 border border-slate-700/60 truncate">
                          🔒 {previewUrl}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] text-slate-400 font-sans hidden md:inline">Desktop Resolution:</span>
                          <select
                            value={laptopWidth}
                            onChange={(e) => setLaptopWidth(Number(e.target.value))}
                            className="bg-slate-950 text-rose-400 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer"
                          >
                            <option value={1024}>1024px (Standard Laptop)</option>
                            <option value={1280}>1280px (Desktop HD)</option>
                            <option value={1440}>1440px (Widescreen)</option>
                          </select>
                        </div>
                      </div>

                      {/* Scaled Desktop Viewport Wrapper */}
                      <div className="w-full overflow-hidden relative" style={{ height: `${scaledHeight}px` }}>
                        <iframe 
                          ref={iframeRef}
                          src={previewUrl} 
                          style={{
                            width: `${laptopWidth}px`,
                            height: `${720 / scale}px`,
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left'
                          }}
                          className="border-none bg-white absolute top-0 left-0"
                          title="Live Scaled Laptop Desktop Preview"
                        />
                        <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[9px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-md z-20 shadow-lg border border-slate-700 flex items-center gap-1">
                          <span>💻 Laptop View ({laptopWidth}px Desktop Layout)</span>
                          <span className="text-amber-400 font-mono">[{Math.round(scale * 100)}% Auto Scale]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )
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
