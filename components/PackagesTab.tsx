import React, { useState, useEffect, useRef } from 'react';
import { Gift, Plus, Save, Trash2, ExternalLink, Eye, RefreshCw, Smartphone, Laptop } from 'lucide-react';

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

  const [livePageUrl, setLivePageUrl] = useState('https://phulwari.co.in/kids-and-child-birthday-party');
  const [previewDevice, setPreviewDevice] = useState<'laptop' | 'phone'>('laptop');
  const [laptopWidth, setLaptopWidth] = useState<number>(1280);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const updateSize = () => {
      if (previewContainerRef.current) {
        setContainerWidth(previewContainerRef.current.clientWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [previewDevice]);

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Gift className="w-5 h-5 text-pink-500" /> Birthday &amp; Party Packages Configuration
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage party prices, dynamic package titles, and features published on the main website.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={livePageUrl}
            onChange={(e) => setLivePageUrl(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="https://phulwari.co.in/kids-and-child-birthday-party">🎂 Live Birthday Page (https://phulwari.co.in/kids-and-child-birthday-party)</option>
            <option value="https://phulwari.co.in/">🏠 Live Home Page (https://phulwari.co.in)</option>
            <option value="https://phulwari.co.in/activities">🎨 Live Activities Page (https://phulwari.co.in/activities)</option>
            <option value="https://phulwari.co.in/batch-galary/batch">📅 Live Batches Page (https://phulwari.co.in/batch-galary/batch)</option>
          </select>

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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-pink-600 dark:text-pink-400">
                Live Website Snapshot Preview — {livePageUrl}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {/* Device View Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('phone')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    previewDevice === 'phone'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('laptop')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    previewDevice === 'laptop'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop View</span>
                </button>
              </div>

              <button
                onClick={() => setPreviewKey(prev => prev + 1)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:text-pink-600 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          </div>

          {previewDevice === 'phone' ? (
            <div className="w-full flex justify-center py-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl">
              <div className="w-[340px] h-[600px] border-[10px] border-slate-900 rounded-[38px] shadow-2xl overflow-hidden bg-white relative transition-all duration-300">
                <div className="w-24 h-3.5 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
                </div>
                <iframe
                  key={previewKey}
                  src={livePageUrl}
                  title="Live Birthday Packages Phone Preview"
                  className="w-full h-full border-0 pt-2"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm z-20">
                  📱 Phone View (Mobile Layout)
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
                        🔒 {livePageUrl}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-slate-400 font-sans hidden md:inline">Desktop Res:</span>
                        <select
                          value={laptopWidth}
                          onChange={(e) => setLaptopWidth(Number(e.target.value))}
                          className="bg-slate-950 text-pink-400 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer"
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
                        key={previewKey}
                        src={livePageUrl} 
                        style={{
                          width: `${laptopWidth}px`,
                          height: `${720 / scale}px`,
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left'
                        }}
                        className="border-none bg-white absolute top-0 left-0"
                        title="Live Scaled Packages Laptop Preview"
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
          )}
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
