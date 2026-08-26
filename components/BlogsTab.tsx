import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit, Save, RefreshCw, BarChart2, Eye, FileText, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { createClient } from '../lib/supabase/client';

interface BlogsTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  badgeClass: string;
}

export default function BlogsTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  isLight,
  badgeClass
}: BlogsTabProps) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'list' | 'add' | 'view'>('dashboard');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Blog Form State
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [viewingBlog, setViewingBlog] = useState<any | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    content: '',
    featured_image: '',
    banner_image: '',
    category: 'Education',
    tags: '',
    status: 'draft',
    featured: false,
    author_name: 'Phulwari Admin',
    meta_title: '',
    meta_description: '',
    focus_keyword: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, short_description, category, author_name, created_at, featured_image, status, views, featured')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBlogs(data || []);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setErrorMsg(err.message || 'Blogs table may not exist yet in Supabase.');
      // Local fallback to keep UI functional
      const local = localStorage.getItem('phulwari_blogs_fallback');
      if (local) setBlogs(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    if (editingBlog) {
      setEditingBlog({ ...editingBlog, title: val, slug });
    } else {
      setBlogForm({ ...blogForm, title: val, slug });
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawData = editingBlog || {
      ...blogForm,
      tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      published_at: blogForm.status === 'published' ? new Date().toISOString() : null
    };

    // Filter only actual database table columns
    const dbPayload = {
      title: rawData.title,
      slug: rawData.slug,
      short_description: rawData.short_description,
      content: rawData.content,
      featured_image: rawData.featured_image,
      banner_image: rawData.banner_image,
      category: rawData.category,
      tags: Array.isArray(rawData.tags) ? rawData.tags : [],
      status: rawData.status || 'draft',
      featured: !!rawData.featured,
      author_name: rawData.author_name || 'Phulwari Admin',
      author_photo: rawData.author_photo || null,
      author_bio: rawData.author_bio || null,
      published_at: rawData.published_at
    };

    try {
      const supabase = createClient();
      let res;
      if (editingBlog) {
        res = await supabase
          .from('blogs')
          .update(dbPayload)
          .eq('id', editingBlog.id);
      } else {
        res = await supabase
          .from('blogs')
          .insert([dbPayload]);
      }

      if (res.error) throw res.error;
      
      alert('Blog saved successfully!');
      setEditingBlog(null);
      setBlogForm({
        title: '',
        slug: '',
        short_description: '',
        content: '',
        featured_image: '',
        banner_image: '',
        category: 'Education',
        tags: '',
        status: 'draft',
        featured: false,
        author_name: 'Phulwari Admin',
        meta_title: '',
        meta_description: '',
        focus_keyword: ''
      });
      setActiveSubTab('list');
      fetchBlogs();
    } catch (err: any) {
      console.error('Failed to save blog:', err);
      // Local storage fallback
      const updatedList = editingBlog 
        ? blogs.map(b => b.id === editingBlog.id ? { ...b, ...dbPayload } : b)
        : [{ id: `b-${Date.now()}`, ...dbPayload, views: 0, created_at: new Date().toISOString() }, ...blogs];
      
      setBlogs(updatedList);
      localStorage.setItem('phulwari_blogs_fallback', JSON.stringify(updatedList));
      alert(`Saved in local memory. (DB Note: ${err.message})`);
      setEditingBlog(null);
      setActiveSubTab('list');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      fetchBlogs();
    } catch (err: any) {
      const updated = blogs.filter(b => b.id !== id);
      setBlogs(updated);
      localStorage.setItem('phulwari_blogs_fallback', JSON.stringify(updated));
    }
  };

  const handleViewBlog = async (b: any) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('blogs').select('*').eq('id', b.id).single();
      if (!error && data) {
        setViewingBlog(data);
        setActiveSubTab('view');
      } else {
        // Fallback for local
        setViewingBlog(b);
        setActiveSubTab('view');
      }
    } catch (err) {
      setViewingBlog(b);
      setActiveSubTab('view');
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(b => b.status === 'published').length;
  const draftBlogs = blogs.filter(b => b.status === 'draft').length;
  const scheduledBlogs = blogs.filter(b => b.status === 'scheduled').length;
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <BookOpen className="w-5 h-5 text-blue-500" /> Blog Management CMS
          </h3>
          <p className={`text-xs ${textSecondary}`}>Create, schedule, edit and view blogs published to the frontend application.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingBlog(null); setActiveSubTab('dashboard'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'dashboard' ? 'bg-blue-600 text-white' : (isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200')}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setEditingBlog(null); setActiveSubTab('list'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'list' ? 'bg-blue-600 text-white' : (isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200')}`}
          >
            Blog List
          </button>
          <button
            onClick={() => { setEditingBlog(null); setActiveSubTab('add'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'add' ? 'bg-blue-600 text-white' : (isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200')}`}
          >
            Add New Blog
          </button>
          <button
            onClick={fetchBlogs}
            className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-200 border-slate-700'}`}
            title="Reload blogs from DB"
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

      {/* SUB TAB 1: DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-1`}>
              <p className={`text-xs font-bold ${textSecondary}`}>Total Blogs</p>
              <h4 className={`text-2xl font-black ${textPrimary}`}>{totalBlogs}</h4>
            </div>
            <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-1`}>
              <p className={`text-xs font-bold ${textSecondary} text-emerald-500`}>Published</p>
              <h4 className={`text-2xl font-black text-emerald-500`}>{publishedBlogs}</h4>
            </div>
            <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-1`}>
              <p className={`text-xs font-bold ${textSecondary} text-amber-500`}>Drafts</p>
              <h4 className={`text-2xl font-black text-amber-500`}>{draftBlogs}</h4>
            </div>
            <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-1`}>
              <p className={`text-xs font-bold ${textSecondary} text-blue-500`}>Scheduled</p>
              <h4 className={`text-2xl font-black text-blue-500`}>{scheduledBlogs}</h4>
            </div>
            <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-1`}>
              <p className={`text-xs font-bold ${textSecondary}`}>Total Views</p>
              <h4 className={`text-2xl font-black ${textPrimary}`}>{totalViews}</h4>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${bgSubCard} space-y-3`}>
            <h4 className={`text-sm font-extrabold ${textPrimary} flex items-center gap-1.5`}><BarChart2 className="w-4 h-4 text-blue-500" /> Popular Blogs</h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {blogs.slice(0, 3).map(b => (
                <div 
                  key={b.id} 
                  onClick={() => handleViewBlog(b)}
                  className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-500/10 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
                  title="Click to view details & actions"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className={`font-bold ${textPrimary} truncate`}>{b.title}</p>
                    <p className={`text-[10px] ${textSecondary}`}>{b.category} • {b.status}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg font-mono flex items-center gap-1 shrink-0 ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-slate-800 text-blue-400'}`}>
                    <Eye className="w-3.5 h-3.5" /> {b.views || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: LIST */}
      {activeSubTab === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="py-3 px-2">Thumbnail</th>
                <th className="py-3 px-2">Title</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Views</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {blogs.map(b => (
                <tr key={b.id} className={`${isLight ? 'hover:bg-slate-50/50' : 'hover:bg-slate-800/30'} ${textPrimary}`}>
                  <td className="py-3 px-2">
                    <div className={`w-12 h-10 rounded overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <img src={b.featured_image || '/phulwari_logo.webp'} className="w-full h-full object-cover" onError={(e:any) => e.target.src='/phulwari_logo.webp'} />
                    </div>
                  </td>
                  <td className="py-3 px-2 font-bold max-w-[200px] truncate">{b.title}</td>
                  <td className="py-3 px-2 font-semibold">{b.category}</td>
                  <td className="py-3 px-2 font-mono">{b.views || 0}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewBlog(b)}
                      className="p-1 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-500 rounded transition cursor-pointer"
                      title="View Post Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setEditingBlog(b); setActiveSubTab('add'); }}
                      className="p-1 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 rounded transition cursor-pointer"
                      title="Edit Post"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={
                        typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))
                          ? `http://localhost:${window.location.port === '3000' ? '3001' : '3000'}/blogs/${b.slug}`
                          : `https://phulwari.co.in/blogs/${b.slug}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded transition cursor-pointer flex items-center justify-center"
                      title="Preview Article on Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteBlog(b.id)}
                      className="p-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded transition cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No blogs created yet. Click "Add New Blog" to start!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB TAB 3: ADD/EDIT FORM */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className={`font-bold ${textPrimary} text-sm`}>Basic Details</h4>
              
              <div>
                <label className={`font-bold ${textSecondary}`}>Blog Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Benefits of Yoga for Toddlers"
                  value={editingBlog ? editingBlog.title : blogForm.title}
                  onChange={handleTitleChange}
                  className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                />
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Slug (Auto Generated)</label>
                <input
                  type="text"
                  readOnly
                  value={editingBlog ? editingBlog.slug : blogForm.slug}
                  className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 opacity-60 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                />
              </div>

              <div>
                <label className={`font-bold ${textSecondary}`}>Short Description</label>
                <textarea
                  placeholder="Brief summary of the blog post..."
                  value={editingBlog ? editingBlog.short_description : blogForm.short_description}
                  onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, short_description: e.target.value }) : setBlogForm({ ...blogForm, short_description: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 min-h-[60px] ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Featured Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/img.jpg"
                    value={editingBlog ? editingBlog.featured_image : blogForm.featured_image}
                    onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, featured_image: e.target.value }) : setBlogForm({ ...blogForm, featured_image: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                  />
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Banner Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/banner.jpg"
                    value={editingBlog ? editingBlog.banner_image : blogForm.banner_image}
                    onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, banner_image: e.target.value }) : setBlogForm({ ...blogForm, banner_image: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className={`font-bold ${textPrimary} text-sm`}>Category, Tags &amp; Publish settings</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Category</label>
                  <select
                    value={editingBlog ? editingBlog.category : blogForm.category}
                    onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, category: e.target.value }) : setBlogForm({ ...blogForm, category: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 cursor-pointer ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                  >
                    <option>Education</option>
                    <option>Parenting</option>
                    <option>Health &amp; Fitness</option>
                    <option>Activities</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="yoga, baby, health"
                    value={editingBlog ? (Array.isArray(editingBlog.tags) ? editingBlog.tags.join(', ') : (editingBlog.tags || '')) : blogForm.tags}
                    onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, tags: e.target.value.split(',').map((t:string) => t.trim()) }) : setBlogForm({ ...blogForm, tags: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold ${textSecondary}`}>Status</label>
                  <select
                    value={editingBlog ? editingBlog.status : blogForm.status}
                    onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, status: e.target.value }) : setBlogForm({ ...blogForm, status: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 cursor-pointer ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className={`font-bold ${textSecondary}`}>Author Name</label>
                  <input
                    type="text"
                    value={editingBlog ? editingBlog.author_name : blogForm.author_name}
                    onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, author_name: e.target.value }) : setBlogForm({ ...blogForm, author_name: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-blog-check"
                  checked={editingBlog ? editingBlog.featured : blogForm.featured}
                  onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, featured: e.target.checked }) : setBlogForm({ ...blogForm, featured: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featured-blog-check" className={`font-bold ${textPrimary} cursor-pointer`}>Mark as Featured Blog (Shows at top)</label>
              </div>
            </div>
          </div>

          <div>
            <label className={`font-bold ${textSecondary}`}>Blog Content *</label>
            <textarea
              required
              placeholder="Write the full blog post content here (Supports HTML or Rich Text)..."
              value={editingBlog ? editingBlog.content : blogForm.content}
              onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, content: e.target.value }) : setBlogForm({ ...blogForm, content: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 min-h-[160px] ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/30">
            <h5 className={`font-bold ${textPrimary}`}>SEO Settings (Optional)</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={textSecondary}>Meta Title</label>
                <input
                  type="text"
                  placeholder="SEO Search Title"
                  value={editingBlog ? (editingBlog.meta_title || '') : blogForm.meta_title}
                  onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, meta_title: e.target.value }) : setBlogForm({ ...blogForm, meta_title: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                />
              </div>
              <div>
                <label className={textSecondary}>Meta Description</label>
                <input
                  type="text"
                  placeholder="Google search description"
                  value={editingBlog ? (editingBlog.meta_description || '') : blogForm.meta_description}
                  onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, meta_description: e.target.value }) : setBlogForm({ ...blogForm, meta_description: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                />
              </div>
              <div>
                <label className={textSecondary}>Focus Keyword</label>
                <input
                  type="text"
                  placeholder="Primary search phrase"
                  value={editingBlog ? (editingBlog.focus_keyword || '') : blogForm.focus_keyword}
                  onChange={(e) => editingBlog ? setEditingBlog({ ...editingBlog, focus_keyword: e.target.value }) : setBlogForm({ ...blogForm, focus_keyword: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none mt-1 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => { setEditingBlog(null); setActiveSubTab('list'); }}
              className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Blog Post
            </button>
          </div>
        </form>
      )}

      {/* SUB TAB 4: VIEW BLOG */}
      {activeSubTab === 'view' && viewingBlog && (
        <div className={`rounded-xl border ${bgSubCard} overflow-hidden`}>
          <div className="relative h-64 w-full bg-slate-900">
            <img 
              src={viewingBlog.banner_image || viewingBlog.featured_image || '/phulwari_logo.webp'} 
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 inline-block">
                {viewingBlog.category}
              </span>
              <h2 className="text-3xl font-black text-white leading-tight">{viewingBlog.title}</h2>
              <div className="flex items-center gap-4 mt-4 text-slate-300 text-xs">
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {viewingBlog.views || 0} Views</span>
                <span>By {viewingBlog.author_name}</span>
                <span>{new Date(viewingBlog.created_at).toLocaleDateString()}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewingBlog.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {viewingBlog.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className={`prose max-w-none ${isLight ? 'prose-slate' : 'prose-invert'} prose-sm md:prose-base`} dangerouslySetInnerHTML={{ __html: viewingBlog.content || '<p>No content provided.</p>' }} />
            
            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button 
                onClick={() => { setViewingBlog(null); setActiveSubTab('list'); }}
                className={`px-5 py-2 rounded-xl font-bold cursor-pointer ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
              >
                Back to List
              </button>
              <button
                onClick={() => { setEditingBlog(viewingBlog); setActiveSubTab('add'); }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-4 h-4" /> Edit Blog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
