import React from 'react';
import { Gift, Plus, Save, Trash2 } from 'lucide-react';

interface PackagesTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean;
  partyPackages: any[];
  setPartyPackages: React.Dispatch<React.SetStateAction<any[]>>;
  handleAddNewPackage: () => void;
  handleSavePartyPackages: () => void;
  pkgSaveStatus: string;
  handleDeletePackage: (id: string) => void;
}

export default function PackagesTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  isLight,
  partyPackages,
  setPartyPackages,
  handleAddNewPackage,
  handleSavePartyPackages,
  pkgSaveStatus,
  handleDeletePackage
}: PackagesTabProps) {
  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Gift className="w-5 h-5 text-pink-500" /> Birthday & Party Packages Configuration
          </h3>
          <p className={`text-xs ${textSecondary}`}>Manage party prices, dynamic package titles, and features published on the main website.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddNewPackage}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package</span>
          </button>

          <button
            onClick={handleSavePartyPackages}
            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-pink-600/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Publish Prices Live</span>
          </button>
        </div>
      </div>

      {pkgSaveStatus && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold animate-fadeIn">
          {pkgSaveStatus}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {partyPackages.map((pkg) => (
          <div key={pkg.id} className={`p-5 rounded-2xl border space-y-4 ${bgSubCard}`}>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={pkg.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, name: val } : p));
                }}
                className={`text-sm font-bold bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 outline-none ${textPrimary} w-full mr-2`}
              />
              <button
                onClick={() => handleDeletePackage(pkg.id)}
                className="p-1.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition"
                title="Delete Package"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Package Tagline</label>
              <input
                type="text"
                value={pkg.tagline}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, tagline: val } : p));
                }}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Configured Display Price</label>
              <input
                type="text"
                value={pkg.price}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val } : p));
                }}
                className={`w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase ${textSecondary}`}>Includes / Features</label>
              <textarea
                rows={3}
                placeholder="e.g. Celebration Space, Basic Decoration, Music & Entertainment"
                value={pkg.includes}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartyPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, includes: val } : p));
                }}
                className={`w-full text-xs font-medium px-3 py-2 rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
