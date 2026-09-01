import React, { useState } from 'react';
import { Gift, Plus, Save, Trash2, ExternalLink, Eye, RefreshCw } from 'lucide-react';

interface PackagesTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  partyPackages: any[];
  setPartyPackages: React.Dispatch<React.SetStateAction<any[]>>;
  handleCreateNewPackage: (newPkg: any) => Promise<boolean>;
  handleSavePartyPackages: () => void;
  pkgSaveStatus: string;
  handleDeletePackage: (id: string | number) => void;
  adminRole?: string;
}

export default function PackagesTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  isLight,
  partyPackages,
  setPartyPackages,
  handleCreateNewPackage,
  handleSavePartyPackages,
  pkgSaveStatus,
  handleDeletePackage,
  adminRole
}: PackagesTabProps) {
  const isStaff = adminRole === 'Staff';
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  const [newPkgForm, setNewPkgForm] = useState({
    name: '',
    tagline: '',
    price: '',
    includes: '',
    is_visible: true
  });

  const livePageUrl = 'https://phulwari.co.in/kids-and-child-birthday-party';

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Gift className="w-5 h-5 text-pink-500" /> Birthday &amp; Party Packages Configuration
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage party prices, dynamic package titles, and features published on the main website.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLivePreview(prev => !prev)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Eye className="w-4 h-4 text-purple-500" />
            <span>{showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
          </button>

          <a
            href={livePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-purple-500/10 text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live Page ↗</span>
          </a>

          {!isStaff && (
            <>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Package</span>
              </button>

              <button
                onClick={() => {
                  handleSavePartyPackages();
                  setPreviewKey(prev => prev + 1);
                }}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-pink-600/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save &amp; Publish Prices Live</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Live Screen Preview Snapshot Section */}
      {showLivePreview && (
        <div className="p-4 rounded-2xl border border-pink-200 dark:border-pink-900/40 bg-pink-50/20 dark:bg-pink-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-pink-600 dark:text-pink-400">
                Live Website Snapshot Preview — {livePageUrl}
              </h4>
            </div>
            <button
              onClick={() => setPreviewKey(prev => prev + 1)}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:text-pink-600 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Preview
            </button>
          </div>

          <div className="w-full aspect-[16/9] max-h-[420px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-md bg-white">
            <iframe
              key={previewKey}
              src={livePageUrl}
              title="Live Birthday Packages Preview"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {pkgSaveStatus && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold animate-fadeIn">
          {pkgSaveStatus}
        </div>
      )}

      {isStaff && (
        <div className="p-3 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold">
          ⚠️ Staff Role: You have read-only access to packages. Editing or saving package prices is restricted.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {showAddForm && (
          <div className={`p-5 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-50/5 dark:bg-blue-950/5 space-y-4`}>
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
              <h4 className={`text-sm font-bold ${textPrimary}`}>Create New Package</h4>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-rose-500 font-bold hover:underline"
              >Cancel</button>
            </div>
            
            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Package Name *</label>
              <input
                type="text"
                placeholder="e.g. Silver Party Package"
                value={newPkgForm.name}
                onChange={(e) => setNewPkgForm(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full text-xs font-bold px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Package Tagline</label>
              <input
                type="text"
                placeholder="e.g. Perfect for active kids"
                value={newPkgForm.tagline}
                onChange={(e) => setNewPkgForm(prev => ({ ...prev, tagline: e.target.value }))}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Display Price</label>
              <input
                type="text"
                placeholder="e.g. ₹7,999"
                value={newPkgForm.price}
                onChange={(e) => setNewPkgForm(prev => ({ ...prev, price: e.target.value }))}
                className={`w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Includes / Features</label>
              <textarea
                rows={3}
                placeholder="e.g. Space decoration, soft play area, music"
                value={newPkgForm.includes}
                onChange={(e) => setNewPkgForm(prev => ({ ...prev, includes: e.target.value }))}
                className={`w-full text-xs font-medium px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="new-pkg-visible"
                checked={newPkgForm.is_visible}
                onChange={(e) => setNewPkgForm(prev => ({ ...prev, is_visible: e.target.checked }))}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="new-pkg-visible" className={`text-xs font-bold ${textPrimary} cursor-pointer`}>Show in User Panel</label>
            </div>

            {newPkgForm.name.trim() !== '' && (
              <button
                onClick={async () => {
                  const success = await handleCreateNewPackage(newPkgForm);
                  if (success) {
                    setNewPkgForm({ name: '', tagline: '', price: '', includes: '', is_visible: true });
                    setShowAddForm(false);
                    setPreviewKey(prev => prev + 1);
                  }
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
              >
                Create &amp; Save Package to Database
              </button>
            )}
          </div>
        )}
        {partyPackages.map((pkg) => (
          <div key={pkg.id} className={`p-5 rounded-2xl border space-y-4 ${bgSubCard}`}>
            <div className="flex items-center justify-between">
              <input
                type="text"
                disabled={isStaff}
                value={pkg.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, name: val } : p));
                }}
                className={`text-sm font-bold bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 outline-none ${textPrimary} w-full mr-2 disabled:border-none`}
              />
              {!isStaff && (
                <button
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="p-1.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition cursor-pointer"
                  title="Delete Package"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Package Tagline</label>
              <input
                type="text"
                disabled={isStaff}
                value={pkg.tagline}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, tagline: val } : p));
                }}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none disabled:bg-slate-50 dark:disabled:bg-slate-950 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Configured Display Price</label>
              <input
                type="text"
                disabled={isStaff}
                value={pkg.price}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val } : p));
                }}
                className={`w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border outline-none disabled:bg-slate-50 dark:disabled:bg-slate-950 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Includes / Features</label>
              <textarea
                rows={3}
                disabled={isStaff}
                placeholder="e.g. Celebration Space, Basic Decoration, Music &amp; Entertainment"
                value={pkg.includes}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, includes: val } : p));
                }}
                className={`w-full text-xs font-medium px-3 py-2 rounded-xl border outline-none disabled:bg-slate-50 dark:disabled:bg-slate-950 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                disabled={isStaff}
                id={`pkg-visible-${pkg.id}`}
                checked={pkg.is_visible !== false}
                onChange={(e) => {
                  const val = e.target.checked;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, is_visible: val } : p));
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor={`pkg-visible-${pkg.id}`} className={`text-xs font-bold ${textPrimary} cursor-pointer`}>Show in User Panel / Don't show in user panel</label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
