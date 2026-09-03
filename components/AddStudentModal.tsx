'use client'

import React, { useState } from 'react'
import { X, Plus, Trash2, Edit, Save, Settings } from 'lucide-react'
import { createClient } from '../lib/supabase/client'

const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
};

const parseDateToDb = (displayStr: string): string => {
  if (!displayStr) return '';
  const parts = displayStr.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return displayStr;
};

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  newStudentForm: any
  setNewStudentForm: (val: any) => void
  allAvailableBatches: any[]
  setBatches?: React.Dispatch<React.SetStateAction<any[]>>
  handleAddStudentSubmit: (e: React.FormEvent) => void
  batchSchedules: any[]
  categories: any[]
  setCategories: (val: any) => void
  feeHeads: any[]
}

const MONTHS_LIST = [
  'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
  'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026',
  'January 2027', 'February 2027', 'March 2027'
]

const classFees: Record<string, number> = {
  'Mother & Toddler Program': 3500,
  'Phulwari Premium Circle': 4500,
  'Playzone Activity': 1500,
  'Kids Gymnastics / MMA': 3000,
  'Roller Skating & Karate': 2500,
  'Music & Dance Classes': 2000,
  'Art & Craft Studio': 1800
}

export default function AddStudentModal({
  isOpen,
  onClose,
  newStudentForm,
  setNewStudentForm,
  allAvailableBatches = [],
  setBatches,
  handleAddStudentSubmit,
  batchSchedules = [],
  categories = [],
  setCategories,
  feeHeads = []
}: AddStudentModalProps) {
  const [dobInput, setDobInput] = useState('');

  const [isCatMgrOpen, setIsCatMgrOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('🧸')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatName, setEditingCatName] = useState('')
  const [editingCatEmoji, setEditingCatEmoji] = useState('🧸')

  // Quick Add Batch Modal state
  const [isQuickAddBatchOpen, setIsQuickAddBatchOpen] = useState(false)
  const [quickBatchName, setQuickBatchName] = useState('')
  const [quickBatchTime, setQuickBatchTime] = useState('10:30 AM - 11:30 AM')
  const [quickBatchFee, setQuickBatchFee] = useState<number | string>(3500)
  const [quickBatchClasses, setQuickBatchClasses] = useState<number | string>(12)
  const [quickBatchValidity, setQuickBatchValidity] = useState<number | string>(30)
  const [quickBatchCategory, setQuickBatchCategory] = useState('')
  const [quickBatchLoading, setQuickBatchLoading] = useState(false)

  const handleQuickAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickBatchName.trim()) return
    setQuickBatchLoading(true)

    const generateUuid = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
      return 'b' + Date.now().toString(16).padStart(12, '0') + '-4000-8000-000000000000'
    }

    const newId = generateUuid()
    const feeNum = Number(quickBatchFee) || 3500
    const catName = quickBatchCategory || newStudentForm.category || 'Child Activity'
    const newBatchObj = {
      id: newId,
      batch_name: quickBatchName.trim(),
      batch_time: quickBatchTime.trim() || '10:30 AM',
      fee_amount: feeNum,
      classes_total: Number(quickBatchClasses) || 12,
      validity_days: Number(quickBatchValidity) || 30,
      days: 'Mon - Sat',
      days_schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      status: 'active',
      category: catName,
      location: 'Kidwaipuri Main Branch'
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('batches').insert([newBatchObj]).select()
      const insertedObj = (data && data.length > 0) ? data[0] : newBatchObj

      if (setBatches) {
        setBatches((prev: any[]) => [...prev, insertedObj])
      }
      if (allAvailableBatches && !allAvailableBatches.some(b => b.id === insertedObj.id)) {
        allAvailableBatches.push(insertedObj)
      }

      const updatedItems = (newStudentForm.payment_items || [
        { id: '1', fee_head: 'Registration Fee', month: '', custom_head_name: '', amount: 1000, discount: 0 },
        { id: '2', fee_head: 'Monthly Fee', month: 'January 2027', custom_head_name: '', amount: feeNum, discount: 0 }
      ]).map((it: any) => {
        if (it.fee_head === 'Monthly Fee') {
          return { ...it, amount: feeNum };
        }
        return it;
      });

      setNewStudentForm({
        ...newStudentForm,
        category: catName,
        batch_id: newId,
        classes_total: Number(quickBatchClasses) || 12,
        custom_days: 'Mon - Sat',
        payment_items: updatedItems,
        total_fee: updatedItems.reduce((sum: number, it: any) => sum + Math.max(0, Number(it.amount || 0) - Number(it.discount || 0)), 0)
      })

      setIsQuickAddBatchOpen(false)
      setQuickBatchName('')
    } catch (err: any) {
      console.error('Quick add batch error:', err)
      alert(`❌ Could not create batch: ${err.message || 'Error'}`)
    } finally {
      setQuickBatchLoading(false)
    }
  }

  // Manual Schedule Entry Builder state
  const [manualSchDay, setManualSchDay] = useState('Monday')
  const [manualSchClass, setManualSchClass] = useState('Gymnastics')
  const [manualSchStart, setManualSchStart] = useState('05:00 PM')
  const [manualSchEnd, setManualSchEnd] = useState('06:00 PM')

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    const name = newCatName.trim()
    const emoji = newCatEmoji
    const newCat = { name, emoji }

    const updated = [...categories, newCat]
    setCategories(updated)
    try { localStorage.setItem('phulwari_admin_categories', JSON.stringify(updated)) } catch (e) {}
    setNewCatName('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('categories').insert([newCat]).select()
      if (!error && data && data.length > 0) {
        setCategories((prev: any[]) => prev.map(c => c.name === name ? data[0] : c))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateCategory = async (catId: string | undefined, updatedName: string, updatedEmoji: string) => {
    if (!updatedName.trim()) return
    const name = updatedName.trim()
    const emoji = updatedEmoji

    setCategories((prev: any[]) => prev.map(c => (catId && c.id === catId) || (!catId && c.name === name) ? { ...c, name, emoji } : c))
    setEditingCatId(null)

    try {
      const supabase = createClient()
      if (catId) {
        await supabase.from('categories').update({ name, emoji }).eq('id', catId)
      } else {
        await supabase.from('categories').update({ name, emoji }).eq('name', name)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteCategory = async (cat: any) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return

    const updated = categories.filter(c => c.name !== cat.name)
    setCategories(updated)
    try { localStorage.setItem('phulwari_admin_categories', JSON.stringify(updated)) } catch (e) {}

    try {
      const supabase = createClient()
      if (cat.id) {
        await supabase.from('categories').delete().eq('id', cat.id)
      } else {
        await supabase.from('categories').delete().eq('name', cat.name)
      }
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      setDobInput(formatDateToDisplay(newStudentForm.dob || '2021-01-01'));
    }
  }, [isOpen, newStudentForm.dob]);

  const isZumbaYogaBatch = (name: string) => {
    const n = (name || '').toLowerCase();
    return n.includes('zumba') || n.includes('yoga') || n.includes('mother');
  };

  const filteredBatches = (allAvailableBatches || []).filter(b => {
    if (b.id === '00000000-0000-0000-0000-000000000000') return false;
    const isZY = isZumbaYogaBatch(b.batch_name || '');
    return newStudentForm.category === 'Zumba & Yoga' ? isZY : !isZY;
  });

  if (!isOpen) return null


  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white text-slate-800 rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative max-h-[95vh] overflow-y-auto border-4 border-pink-100 custom-scrollbar">
        
        {/* Flower decoration top-left & top-right */}
        <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500 via-red-500 to-transparent"></div>
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500 via-red-500 to-transparent"></div>
        
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition cursor-pointer">
          <X className="w-5 h-5" />
        </button>
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-1 border-b-2 border-pink-200 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <div className="flex items-center -my-4">
              <img src="/Logo-png.png" alt="Phulwari Logo" className="h-40 md:h-48 object-contain" />
            </div>
            
            <div className="text-center md:text-left -my-2">
              <h1 className="text-xl md:text-2xl font-black text-purple-900 tracking-wide uppercase">PARENT REGISTRATION</h1>
              <h2 className="text-lg md:text-xl font-bold text-pink-600 tracking-wide uppercase -mt-1">& CONSENT FORM</h2>
              <div className="mt-0.5 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full inline-block tracking-wider uppercase">
                Where Growth Meets Wellness
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-600 space-y-0.5 border-l-2 border-purple-200 pl-4 py-1">
            <p className="flex items-center gap-1 font-semibold"><span className="text-purple-600">📍</span> M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri, Patna - 800001</p>
            <p className="flex items-center gap-1 font-semibold"><span className="text-purple-600">📞</span> +91 6207368839</p>
            <p className="flex items-center gap-1"><span className="text-purple-600">✉️</span> phulwari02@gmail.com</p>
            <p className="flex items-center gap-1"><span className="text-purple-600">🌐</span> www.phulwari.co.in</p>
            <p className="flex items-center gap-1"><span className="text-purple-600">📸</span> @phulwari.activitycentre</p>
          </div>
        </div>

        <form onSubmit={handleAddStudentSubmit} className="mt-6 space-y-6 text-xs">
          
          {/* ADMISSION NUMBER SECTION */}
          <div className="flex items-center gap-3 bg-pink-50 p-3 rounded-2xl border border-pink-200 w-fit">
            <span className="font-extrabold text-pink-700 text-sm">Admission No.:</span>
            <input
              type="text"
              required
              readOnly
              title="Auto-generated — no need to enter manually"
              value={newStudentForm.admission_id}
              className="bg-pink-50 border-2 border-pink-300 rounded-xl px-3 py-1.5 text-sm font-mono font-extrabold text-pink-700 focus:outline-none focus:border-pink-500 w-44 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 font-semibold">(auto)</span>

            <span className="font-bold text-slate-500 text-xs ml-4">Password:</span>
            <input
              type="text"
              value={newStudentForm.password}
              placeholder="Leave blank"
              onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-amber-500 w-32"
            />

            <span className="font-bold text-slate-700 text-xs ml-4">Date of Admission:</span>
            <input
              type="date"
              required
              value={newStudentForm.admission_date || ''}
              onChange={(e) => setNewStudentForm({ ...newStudentForm, admission_date: e.target.value })}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-pink-500 w-36 cursor-pointer"
            />
          </div>

          {/* 1. CHILD'S DETAILS */}
          <div className="border border-pink-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-pink-600 text-white font-extrabold px-4 py-2 text-sm uppercase tracking-wider flex items-center justify-between">
              <span>1. Child's Details</span>
            </div>
            <div className="p-4 bg-slate-50/50 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Child's Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter child's full name" 
                  value={newStudentForm.full_name} 
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, full_name: e.target.value })} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-pink-500 font-semibold" 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth (DD/MM/YYYY)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 01/01/2021" 
                  value={dobInput} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setDobInput(val);
                    const dbVal = parseDateToDb(val);
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dbVal)) {
                      setNewStudentForm({ ...newStudentForm, dob: dbVal });
                    } else {
                      setNewStudentForm({ ...newStudentForm, dob: val });
                    }
                  }} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-pink-500 font-mono font-bold" 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <div className="flex gap-4 mt-2">
                  {['Boy', 'Girl', 'Other'].map(g => (
                    <label key={g} className="flex items-center gap-1.5 font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={g === 'Other' ? 'Other' : g} 
                        checked={newStudentForm.gender === g || (g === 'Other' && !['Boy', 'Girl'].includes(newStudentForm.gender))} 
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value })} 
                        className="w-4 h-4 accent-pink-600" 
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-4">
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Residential address" 
                  value={newStudentForm.address} 
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, address: e.target.value })} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-pink-500 font-semibold" 
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input 
                  type="text" 
                  value={newStudentForm.city} 
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, city: e.target.value })} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-pink-500 font-semibold" 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">State</label>
                <input 
                  type="text" 
                  value={newStudentForm.state} 
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, state: e.target.value })} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-pink-500 font-semibold" 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
                <input 
                  type="text" 
                  value={newStudentForm.pin_code} 
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, pin_code: e.target.value })} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-pink-500 font-semibold" 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select 
                  value={newStudentForm.blood_group} 
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, blood_group: e.target.value })} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-pink-500 font-semibold cursor-pointer"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. PARENT / GUARDIAN DETAILS */}
          <div className="border border-purple-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-purple-900 text-white font-extrabold px-4 py-2 text-sm uppercase tracking-wider">
              2. Parent / Guardian Details
            </div>
            <div className="p-4 bg-slate-50/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent / Guardian Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Full name" 
                    value={newStudentForm.parent_name} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_name: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-semibold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <select 
                    value={newStudentForm.parent_relationship} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_relationship: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-semibold cursor-pointer"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                  <input 
                    type="text" 
                    placeholder="Occupation" 
                    value={newStudentForm.parent_occupation} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_occupation: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-semibold" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email ID</label>
                  <input 
                    type="email" 
                    placeholder="parent@example.com" 
                    value={newStudentForm.parent_email} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_email: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-semibold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone No.</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="Primary phone number" 
                    value={newStudentForm.parent_phone} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_phone: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-mono font-semibold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alternate Phone No.</label>
                  <input 
                    type="tel" 
                    placeholder="Alternate phone number" 
                    value={newStudentForm.parent_alt_phone} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_alt_phone: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-mono font-semibold" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EMERGENCY CONTACT & PROGRAM DETAILS (Side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 3. EMERGENCY CONTACT DETAILS */}
            <div className="border border-green-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="bg-green-700 text-white font-extrabold px-4 py-2 text-sm uppercase tracking-wider">
                3. Emergency Contact Details
              </div>
              <div className="p-4 bg-slate-50/50 space-y-3 flex-1">
                <p className="text-[10px] text-green-700 font-semibold italic">(In case parent/guardian is not reachable)</p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input 
                    type="text" 
                    placeholder="Contact person name" 
                    value={newStudentForm.emergency_contact_name} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, emergency_contact_name: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-green-500 font-semibold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Uncle / Aunt / Neighbor" 
                    value={newStudentForm.emergency_relationship} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, emergency_relationship: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-green-500 font-semibold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone No.</label>
                  <input 
                    type="tel" 
                    placeholder="Emergency contact phone" 
                    value={newStudentForm.emergency_phone} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, emergency_phone: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-green-500 font-mono font-semibold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alternate Phone No.</label>
                  <input 
                    type="tel" 
                    placeholder="Alternate contact phone" 
                    value={newStudentForm.emergency_alt_phone} 
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, emergency_alt_phone: e.target.value })} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-green-500 font-mono font-semibold" 
                  />
                </div>
              </div>
            </div>

            {/* 4. PROGRAM / BATCH DETAILS */}
            <div className="border border-orange-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="bg-[#f57c00] text-white font-extrabold px-4 py-2 text-sm uppercase tracking-wider">
                4. Program / Batch Details
              </div>
              <div className="p-4 bg-slate-50/50 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 text-xs">Registration Category</label>
                      <button
                        type="button"
                        onClick={() => setIsCatMgrOpen(true)}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    </div>
                    <select 
                      value={newStudentForm.category} 
                       onChange={(e) => {
                        const newCat = e.target.value;
                        const firstValid = (allAvailableBatches || []).find(b => {
                          if (b.id === '00000000-0000-0000-0000-000000000000') return false;
                          const isZY = isZumbaYogaBatch(b.batch_name || '');
                          return newCat === 'Zumba & Yoga' ? isZY : !isZY;
                        });
                        const schedules = batchSchedules.filter(sch => sch.batch_id === firstValid?.id);
                        const weeklyCount = schedules.length;
                        const totalCls = weeklyCount > 0 ? weeklyCount * 4 : 12;
                        const daysString = Array.from(new Set(schedules.map(sch => sch.day_of_week))).join(', ');
                        
                        const batchFee = firstValid ? Number(firstValid.fee_amount || 3500) : 3500;
                        const updatedItems = (newStudentForm.payment_items || [
                          { id: '1', fee_head: 'Registration Fee', month: '', custom_head_name: '', amount: 1000, discount: 0 },
                          { id: '2', fee_head: 'Monthly Fee', month: 'January 2027', custom_head_name: '', amount: 3500, discount: 0 }
                        ]).map((it: any) => {
                          if (it.fee_head === 'Monthly Fee') {
                            return { ...it, amount: batchFee };
                          }
                          return it;
                        });

                        setNewStudentForm({
                          ...newStudentForm,
                          category: newCat,
                          batch_id: firstValid?.id || '',
                          classes_total: totalCls,
                          custom_days: daysString || firstValid?.days || '',
                          payment_items: updatedItems,
                          total_fee: updatedItems.reduce((sum: number, it: any) => sum + Math.max(0, Number(it.amount || 0) - Number(it.discount || 0)), 0)
                        });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-semibold cursor-pointer text-slate-800"
                    >
                      {categories.map((cat: any) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name} {cat.emoji || ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 text-xs">Select Student Batch</label>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickBatchCategory(newStudentForm.category || 'Child Activity')
                          setIsQuickAddBatchOpen(true)
                        }}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Quick Add Batch</span>
                      </button>
                    </div>
                    <select 
                      value={newStudentForm.batch_id} 
                      onChange={(e) => {
                        const bId = e.target.value;
                        if (bId === '00000000-0000-0000-0000-000000000000') {
                          setNewStudentForm({
                            ...newStudentForm,
                            batch_id: bId,
                            classes_total: 0,
                            custom_days: '',
                            custom_schedules: []
                          });
                          return;
                        }
                        const matchedBatch = allAvailableBatches.find(b => b.id === bId);
                        const schedules = batchSchedules.filter(sch => sch.batch_id === bId);
                        const weeklyCount = schedules.length;
                        const totalCls = weeklyCount > 0 ? weeklyCount * 4 : 12;
                        const daysString = Array.from(new Set(schedules.map(sch => sch.day_of_week))).join(', ');
                        
                        const batchFee = matchedBatch ? Number(matchedBatch.fee_amount || 3500) : 3500;
                        const updatedItems = (newStudentForm.payment_items || [
                          { id: '1', fee_head: 'Registration Fee', month: '', custom_head_name: '', amount: 1000, discount: 0 },
                          { id: '2', fee_head: 'Monthly Fee', month: 'January 2027', custom_head_name: '', amount: 3500, discount: 0 }
                        ]).map((it: any) => {
                          if (it.fee_head === 'Monthly Fee') {
                            return { ...it, amount: batchFee };
                          }
                          return it;
                        });

                        setNewStudentForm({
                          ...newStudentForm,
                          batch_id: bId,
                          classes_total: totalCls,
                          custom_days: daysString || matchedBatch?.days || '',
                          payment_items: updatedItems,
                          total_fee: updatedItems.reduce((sum: number, it: any) => sum + Math.max(0, Number(it.amount || 0) - Number(it.discount || 0)), 0)
                        });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-semibold cursor-pointer"
                    >
                      {filteredBatches.map(b => {
                        const timingStr = b.start_time ? (b.end_time ? `${b.start_time} - ${b.end_time}` : b.start_time) : (b.batch_time || 'Flexi Timing');
                        return (
                          <option key={b.id} value={b.id} className="bg-white text-slate-900">
                            {b.batch_name} ({timingStr}) — ₹{b.fee_amount || 3500} / {b.validity_days || 30} Days
                          </option>
                        );
                      })}
                      {newStudentForm.category === 'Child Activity' && (
                        <option value="00000000-0000-0000-0000-000000000000" className="bg-white font-bold text-orange-600">
                          ⚙️ Customized Batch (Build Custom Schedule)
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                {newStudentForm.batch_id === '00000000-0000-0000-0000-000000000000' ? (
                  <div className="space-y-3 pt-3 border-t border-dashed border-orange-200">
                    <label className="block font-bold text-slate-700">Customized Batch Schedule Builder</label>
                    <p className="text-[10px] text-slate-500 font-semibold italic -mt-2">Select classes/times available in Batch Master for each day:</p>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        // Class Master view for this day: the same slot can be
                        // scheduled by several batches, so collapse duplicates
                        // to one selectable entry and order them by start time.
                        const dayClasses = Array.from(
                          new Map(
                            batchSchedules
                              .filter(sch => sch.day_of_week === day)
                              .map(sch => [
                                `${sch.class_name}|${sch.start_time}|${sch.end_time}`,
                                sch
                              ])
                          ).values()
                        );
                        const currentCustomSch = newStudentForm.custom_schedules || [];
                        
                        return (
                          <div key={day} className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2">
                            <span className="font-bold text-slate-800 text-xs block">📅 {day}</span>
                            {dayClasses.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic">No classes scheduled on this day in Batch Master.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dayClasses.map(cls => {
                                  const isChecked = currentCustomSch.some(
                                    (s: any) => s.day_of_week === day && s.class_name === cls.class_name && s.start_time === cls.start_time && s.end_time === cls.end_time
                                  );
                                  return (
                                    <label key={`${cls.class_name}|${cls.start_time}|${cls.end_time}`} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:border-orange-300 transition cursor-pointer text-[11px] font-semibold text-slate-700 bg-slate-50/50">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          let updated = [...currentCustomSch];
                                          if (e.target.checked) {
                                            updated.push({
                                              day_of_week: day,
                                              class_name: cls.class_name,
                                              start_time: cls.start_time,
                                              end_time: cls.end_time
                                            });
                                          } else {
                                            updated = updated.filter(
                                              (s: any) => !(s.day_of_week === day && s.class_name === cls.class_name && s.start_time === cls.start_time && s.end_time === cls.end_time)
                                            );
                                          }
                                          const uniqueDays = Array.from(new Set(updated.map(s => s.day_of_week))).join(', ');
                                          setNewStudentForm({
                                            ...newStudentForm,
                                            custom_schedules: updated,
                                            custom_days: uniqueDays,
                                            classes_total: updated.length * 4
                                          });
                                        }}
                                        className="w-4 h-4 accent-orange-600 rounded"
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{cls.class_name}</span>
                                        <span className="text-[10px] font-mono text-slate-500">{cls.start_time} - {cls.end_time}</span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ➕ Manual Custom Schedule Builder */}
                    <div className="p-3.5 bg-gradient-to-br from-orange-50 to-amber-50/60 border border-orange-200/90 rounded-2xl space-y-3 shadow-xs mt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>➕</span> Add Custom Schedule Entry
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Manual Day, Time &amp; Class Builder</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Day of Week</label>
                          <select
                            value={manualSchDay}
                            onChange={(e) => setManualSchDay(e.target.value)}
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-orange-500"
                          >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Class / Activity</label>
                          <input
                            type="text"
                            placeholder="e.g. Gymnastics"
                            value={manualSchClass}
                            onChange={(e) => setManualSchClass(e.target.value)}
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Start Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 05:00 PM"
                            value={manualSchStart}
                            onChange={(e) => setManualSchStart(e.target.value)}
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none font-mono focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">End Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 06:00 PM"
                            value={manualSchEnd}
                            onChange={(e) => setManualSchEnd(e.target.value)}
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white outline-none font-mono focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!manualSchClass.trim()) return;
                            const currentCustomSch = newStudentForm.custom_schedules || [];
                            const updated = [
                              ...currentCustomSch,
                              {
                                day_of_week: manualSchDay,
                                class_name: manualSchClass.trim(),
                                start_time: manualSchStart.trim() || '05:00 PM',
                                end_time: manualSchEnd.trim() || '06:00 PM'
                              }
                            ];
                            const uniqueDays = Array.from(new Set(updated.map((s: any) => s.day_of_week))).join(', ');
                            setNewStudentForm({
                              ...newStudentForm,
                              custom_schedules: updated,
                              custom_days: uniqueDays,
                              classes_total: updated.length * 4
                            });
                          }}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition cursor-pointer"
                        >
                          <span>➕ Add Schedule Entry</span>
                        </button>
                      </div>

                      {/* Display configured custom entries */}
                      {(newStudentForm.custom_schedules || []).length > 0 && (
                        <div className="pt-2 border-t border-orange-200/80 space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase text-orange-700 tracking-wider">Configured Custom Entries ({(newStudentForm.custom_schedules || []).length})</span>
                          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                            {(newStudentForm.custom_schedules || []).map((sch: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-orange-200 text-[11px] font-semibold text-slate-700 shadow-xs">
                                <span className="font-bold text-orange-600">📅 {sch.day_of_week}</span>
                                <span>|</span>
                                <span>{sch.class_name}</span>
                                <span className="font-mono text-[10px] text-blue-500">({sch.start_time} - {sch.end_time})</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (newStudentForm.custom_schedules || []).filter((_: any, i: number) => i !== idx);
                                    const uniqueDays = Array.from(new Set(updated.map((s: any) => s.day_of_week))).join(', ');
                                    setNewStudentForm({
                                      ...newStudentForm,
                                      custom_schedules: updated,
                                      custom_days: uniqueDays,
                                      classes_total: updated.length * 4
                                    });
                                  }}
                                  className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Select Attendance Days (Custom Plan):</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        const isChecked = newStudentForm.custom_days ? newStudentForm.custom_days.split(', ').includes(day) : false;
                        return (
                          <label key={day} className="flex items-center gap-1.5 font-semibold cursor-pointer p-1.5 bg-white border border-slate-100 rounded-lg">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 accent-orange-500 rounded" 
                              checked={isChecked}
                              onChange={(e) => {
                                let days = newStudentForm.custom_days ? newStudentForm.custom_days.split(', ') : [];
                                if (e.target.checked) days.push(day);
                                else days = days.filter((d: string) => d !== day);
                                
                                const totalCls = days.length * 4;
                                setNewStudentForm({ 
                                  ...newStudentForm, 
                                  custom_days: days.join(', '),
                                  classes_total: totalCls > 0 ? totalCls : 12
                                });
                              }} 
                            />
                            <span>{day.slice(0,3)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Classes in Plan</label>
                    <input 
                      type="number"
                      value={newStudentForm.classes_total}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, classes_total: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Classes Consumed Already</label>
                    <input 
                      type="number"
                      value={newStudentForm.classes_consumed}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, classes_consumed: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Program / Activity Interested In:</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {['Playzone', 'Weekend Program', '3 Days Program', '5 Days Program', '6 Days Program', '7 Days Program', 'Mother Zumba'].map(prog => (
                      <label key={prog} className="flex items-center gap-2 font-semibold cursor-pointer p-1.5 bg-white border border-slate-100 hover:border-orange-200 rounded-lg">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 accent-orange-500 rounded" 
                          checked={newStudentForm.program_interested.includes(prog)}
                          onChange={(e) => {
                            let progs = newStudentForm.program_interested ? newStudentForm.program_interested.split(', ') : [];
                            if (e.target.checked) progs.push(prog);
                            else progs = progs.filter((p: string) => p !== prog);
                            setNewStudentForm({ ...newStudentForm, program_interested: progs.join(', ') })
                          }} 
                        />
                        <span>{prog}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time Slot:</label>
                  <div className="flex gap-6 mt-1">
                    {['Morning', 'Evening'].map(slot => (
                      <label key={slot} className="flex items-center gap-1.5 font-bold cursor-pointer">
                        <input 
                          type="radio" 
                          name="slot" 
                          value={slot} 
                          checked={newStudentForm.preferred_time_slot === slot} 
                          onChange={(e) => setNewStudentForm({ ...newStudentForm, preferred_time_slot: e.target.value })} 
                          className="w-4 h-4 accent-orange-500" 
                        />
                        <span>{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* 6. TERMS & CONDITIONS */}
          <div className="border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#b45309] text-white font-extrabold px-4 py-2 text-sm uppercase tracking-wider flex items-center justify-between">
              <span>6. Terms & Conditions</span>
              <span className="text-[10px] italic">(Please read and agree to all terms)</span>
            </div>
            <div className="p-4 bg-amber-50/20 space-y-3">
              {[
                "I confirm that all the information provided above is true and accurate to the best of my knowledge.",
                "I authorize Phulwari - Mother & Child Activity Centre to seek emergency medical treatment for my child in case of any injury or illness during the activities, and I will bear all related expenses.",
                "I understand that physical activities, play, and learning sessions may involve movement and participation. I consent to my child's participation in all activities conducted at Phulwari.",
                "I give permission for Phulwari to use my child's photographs / videos taken during activities for training, documentation, promotional purposes (such as social media, website, brochures, etc.).",
                "I understand that fees once paid are non-refundable. Missed sessions will not be compensated unless prior notice is given."
              ].map((consentText, idx) => (
                <label key={idx} className="flex items-start gap-3 cursor-pointer group p-1 hover:bg-amber-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    required={idx < 4}
                    defaultChecked={true}
                    className="mt-0.5 w-4 h-4 accent-amber-600 rounded text-white" 
                  />
                  <span className="text-[11px] font-medium text-slate-700 leading-normal group-hover:text-slate-900">{consentText}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 7. PARENT / GUARDIAN AGREEMENT */}
          <div className="border border-indigo-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-indigo-700 text-white font-extrabold px-4 py-2 text-sm uppercase tracking-wider">
              7. Parent / Guardian Agreement
            </div>
            <div className="p-4 bg-indigo-50/20">
              <label className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                <input 
                  type="checkbox" 
                  required
                  defaultChecked={true}
                  className="mt-0.5 w-5 h-5 accent-indigo-700 rounded text-white shrink-0" 
                />
                <span className="text-xs font-semibold text-slate-700 leading-relaxed">
                  I, <strong className="text-indigo-700">{newStudentForm.parent_name || '____________________'}</strong>, parent/guardian of <strong className="text-pink-600">{newStudentForm.full_name || '____________________'}</strong>, hereby agree to all the Terms and Conditions of Phulwari Mother &amp; Child Activity Centre. I confirm that I have read, understood, and willingly consent to all the above declarations.
                </span>
              </label>
            </div>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6 py-6">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-full border-b border-slate-400 h-10 flex items-end justify-center font-bold text-slate-600 pb-1">
                {newStudentForm.parent_name || "____________________"}
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Parent / Guardian Signature</span>
            </div>
            
            <div className="w-full md:w-1/4 flex flex-col items-center">
              <div className="w-full border-b border-slate-400 h-10 flex items-end justify-center font-mono font-bold text-slate-600 pb-1">
                {new Date().toLocaleDateString('en-GB')}
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Date</span>
            </div>
            
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-full border-b border-slate-400 h-10 flex items-end justify-center text-pink-600 font-bold pb-1 text-center italic">
                Phulwari Signatory
              </div>
              <span className="text-[10px] text-pink-600 font-bold mt-1 uppercase">Authorised Signatory</span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center py-2 flex items-center justify-center gap-2">
            <span className="text-pink-600">🌺</span>
            <span className="font-extrabold text-[#43a047] tracking-wider italic text-xs">
              Nurturing Bonds. Building Confidence. Creating Happy Childhoods.
            </span>
            <span className="text-pink-600">🌺</span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t-2 border-pink-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-extrabold transition-all duration-200 shadow-md shadow-pink-600/20 cursor-pointer"
            >
              Save Registration
            </button>
          </div>

        </form>
      </div>

      {isCatMgrOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                📂 Manage Registration Categories
              </h3>
              <button onClick={() => { setIsCatMgrOpen(false); setEditingCatId(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of existing categories */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat: any) => {
                const isEditing = editingCatId === cat.id || (!cat.id && editingCatId === cat.name);
                return (
                  <div key={cat.name} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 rounded-xl">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingCatEmoji}
                          onChange={(e) => setEditingCatEmoji(e.target.value)}
                          className="w-10 border rounded-lg px-1.5 py-1 text-center font-semibold text-xs text-slate-800 bg-white"
                          title="Emoji"
                        />
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 border rounded-lg px-2 py-1 font-semibold text-xs text-slate-800 bg-white"
                          placeholder="Category Name"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 text-xs">
                        <span>{cat.emoji || '🧸'}</span>
                        <span>{cat.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(cat.id, editingCatName, editingCatEmoji)}
                            className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id || cat.name);
                              setEditingCatName(cat.name);
                              setEditingCatEmoji(cat.emoji || '🧸');
                            }}
                            className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Category form */}
            <div className="border-t pt-3 space-y-2 border-slate-200 dark:border-slate-800">
              <span className="block font-bold text-[10px] uppercase text-orange-500 tracking-wider">➕ Add New Category</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Emoji (e.g. 🎨)"
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value)}
                  className="w-16 border rounded-xl px-2 py-1.5 text-center text-xs font-semibold text-slate-800 bg-white"
                />
                <input
                  type="text"
                  placeholder="Category Name (e.g. Art & Craft)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 border rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD BATCH MODAL */}
      {isQuickAddBatchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative border border-orange-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" /> Quick Add New Batch
              </h3>
              <button 
                type="button" 
                onClick={() => setIsQuickAddBatchOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddBatchSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Explorers (10:30 AM)"
                  value={quickBatchName}
                  onChange={(e) => setQuickBatchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Category</label>
                  <select
                    value={quickBatchCategory || newStudentForm.category || 'Child Activity'}
                    onChange={(e) => setQuickBatchCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-semibold text-slate-900 cursor-pointer"
                  >
                    {categories.map((c: any) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM - 11:30 AM"
                    value={quickBatchTime}
                    onChange={(e) => setQuickBatchTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={quickBatchFee}
                    onChange={(e) => setQuickBatchFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Classes</label>
                  <input
                    type="number"
                    required
                    value={quickBatchClasses}
                    onChange={(e) => setQuickBatchClasses(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    required
                    value={quickBatchValidity}
                    onChange={(e) => setQuickBatchValidity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuickAddBatchOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickBatchLoading}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{quickBatchLoading ? 'Saving Batch...' : 'Save & Select Batch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
