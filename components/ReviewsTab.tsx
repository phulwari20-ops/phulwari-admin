import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus, RefreshCw, Save, ThumbsUp, ShieldAlert } from 'lucide-react';
import { createClient } from '../lib/supabase/client';

interface ReviewsTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  badgeClass: string;
}

export default function ReviewsTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  isLight,
  badgeClass
}: ReviewsTabProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    author_name: '',
    review_date: '',
    rating: 5,
    content: '',
    program_tag: 'Phulwari Premium Circle',
    is_verified: true
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setErrorMsg(err.message || 'Reviews table may not exist yet in Supabase.');
      // Local fallback to keep UI functional
      const local = localStorage.getItem('phulwari_reviews_fallback');
      if (local) setReviews(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.content.trim()) return;

    const payload = {
      ...form,
      review_date: form.review_date.trim() || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reviews')
        .insert([payload])
        .select();
      
      if (error) throw error;
      alert('Review saved successfully to database!');
      setIsAddOpen(false);
      setForm({
        author_name: '',
        review_date: '',
        rating: 5,
        content: '',
        program_tag: 'Phulwari Premium Circle',
        is_verified: true
      });
      fetchReviews();
    } catch (err: any) {
      console.error('Failed to save review in database:', err);
      const localObj = { id: `r-${Date.now()}`, ...payload, created_at: new Date().toISOString() };
      const updated = [localObj, ...reviews];
      setReviews(updated);
      localStorage.setItem('phulwari_reviews_fallback', JSON.stringify(updated));
      alert(`Saved in local memory. (DB Note: ${err.message})`);
      setIsAddOpen(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      fetchReviews();
    } catch (err: any) {
      const updated = reviews.filter(r => r.id !== id);
      setReviews(updated);
      localStorage.setItem('phulwari_reviews_fallback', JSON.stringify(updated));
    }
  };

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Reviews &amp; Testimonials Manager ({reviews.length})
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage parents feedback displayed live on the frontend website. Matches Image 1 layout.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Review</span>
          </button>
          <button
            onClick={fetchReviews}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
            title="Sync Database Reviews"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs">
          ⚠️ <strong>Notice:</strong> {errorMsg} Running in fallback/local mode. Run updated schema SQL to connect completely.
        </div>
      )}

      {/* ADD REVIEW COLLAPSIBLE BOX */}
      {isAddOpen && (
        <form onSubmit={handleCreateReview} className={`p-5 rounded-2xl border ${bgSubCard} space-y-4 text-xs`}>
          <h4 className={`font-bold ${textPrimary} text-sm`}>Add New Parent Testimonial</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={`font-bold ${textSecondary}`}>Parent Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sushmita Kumari"
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
              />
            </div>
            <div>
              <label className={`font-bold ${textSecondary}`}>Date (e.g. October 2024)</label>
              <input
                type="text"
                placeholder="Leave blank for current month"
                value={form.review_date}
                onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
              />
            </div>
            <div>
              <label className={`font-bold ${textSecondary}`}>Rating Stars (1-5)</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 cursor-pointer ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`font-bold ${textSecondary}`}>Program/Activity Badge</label>
              <select
                value={form.program_tag}
                onChange={(e) => setForm({ ...form, program_tag: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 cursor-pointer ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
              >
                <option>Phulwari Premium Circle</option>
                <option>Phulwari Core</option>
                <option>Mother &amp; Toddler Program</option>
                <option>Mother Fitness Program</option>
                <option>Summer Camp</option>
                <option>Winter Camp</option>
                <option>Birthday Party</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="is-verified-check"
                checked={form.is_verified}
                onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="is-verified-check" className={`font-bold ${textPrimary} cursor-pointer`}>Show Verified Badge</label>
            </div>
          </div>

          <div>
            <label className={`font-bold ${textSecondary}`}>Review Content *</label>
            <textarea
              required
              placeholder="Write the parent's feedback..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 min-h-[80px] ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Review
            </button>
          </div>
        </form>
      )}

      {/* REVIEWS LIST TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
              <th className="py-3 px-2">Initials</th>
              <th className="py-3 px-2">Author</th>
              <th className="py-3 px-2">Date</th>
              <th className="py-3 px-2">Stars</th>
              <th className="py-3 px-2">Program Badge</th>
              <th className="py-3 px-2">Verified</th>
              <th className="py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {reviews.map(r => (
              <tr key={r.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${textPrimary}`}>
                <td className="py-3 px-2">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white font-black">
                    {r.author_name?.substring(0, 2).toUpperCase() || 'P'}
                  </span>
                </td>
                <td className="py-3 px-2 font-bold">{r.author_name}</td>
                <td className="py-3 px-2 font-semibold text-slate-400">{r.review_date}</td>
                <td className="py-3 px-2">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500`}>
                    {r.program_tag}
                  </span>
                </td>
                <td className="py-3 px-2">
                  {r.is_verified ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">No reviews found. Click "Add Manual Review" to write one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
