import React, { useState } from 'react';
import { Image as ImageIcon, RefreshCw, Upload, Trash2, ChevronLeft, ChevronRight, GripVertical, Save } from 'lucide-react';

interface GalleryTabProps {
  bgCard: string;
  bgSubCard: string;
  textPrimary: string;
  textSecondary: string;
  badgeClass: string;
  galleryImages: any[];
  galleryPage: number;
  galleryPerPage: number;
  setGalleryPage: React.Dispatch<React.SetStateAction<number>>;
  handleDeviceImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fetchAdminGallery: () => void;
  setSelectedAdminGalleryImg: (img: any) => void;
  setDeletingGalleryImg: (img: any) => void;
  isUploadingGallery?: boolean;
  handleUpdateGalleryOrder?: (reorderedImages: any[]) => void;
}

export default function GalleryTab({
  bgCard,
  bgSubCard,
  textPrimary,
  textSecondary,
  badgeClass,
  galleryImages,
  galleryPage,
  galleryPerPage,
  setGalleryPage,
  handleDeviceImageUpload,
  fetchAdminGallery,
  setSelectedAdminGalleryImg,
  setDeletingGalleryImg,
  isUploadingGallery = false,
  handleUpdateGalleryOrder
}: GalleryTabProps) {
  // Sort images by sort_order
  const sortedImages = [...galleryImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const [draggedImg, setDraggedImg] = useState<any>(null);
  const [localOrder, setLocalOrder] = useState<any[]>(sortedImages);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);

  // Sync localOrder when galleryImages change (e.g. from fetch)
  React.useEffect(() => {
    setLocalOrder([...galleryImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    setHasOrderChanged(false);
  }, [galleryImages]);

  const handleDragStart = (e: React.DragEvent, img: any) => {
    setDraggedImg(img);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedImg(null);
  };

  const handleDrop = (e: React.DragEvent, targetImg: any) => {
    e.preventDefault();
    if (!draggedImg || draggedImg.id === targetImg.id) return;

    const draggedIdx = localOrder.findIndex(img => img.id === draggedImg.id);
    const targetIdx = localOrder.findIndex(img => img.id === targetImg.id);

    const newOrder = [...localOrder];
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedImg);

    // Update sort_order explicitly based on new index
    const updatedImages = newOrder.map((img, index) => ({
      ...img,
      sort_order: index + 1
    }));

    setLocalOrder(updatedImages);
    setHasOrderChanged(true);
  };

  return (
    <div className={`${bgCard} rounded-2xl p-6 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <ImageIcon className="w-5 h-5 text-blue-500" /> Dynamic Gallery Photo Manager ({galleryImages.length} Photos)
          </h3>
          <p className={`text-xs ${textSecondary}`}>Upload photos, drag to reorder display sequence, and publish live!</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleDeviceImageUpload}
            className="hidden"
            id="device-photo-input"
            disabled={isUploadingGallery}
          />

          {hasOrderChanged && handleUpdateGalleryOrder && (
            <button
              onClick={() => {
                handleUpdateGalleryOrder(localOrder);
                setHasOrderChanged(false);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Display Order</span>
            </button>
          )}

          <button
            onClick={fetchAdminGallery}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Fetch latest photos from API & Database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync API Data</span>
          </button>

          {isUploadingGallery ? (
            <div className="px-4 py-2.5 bg-blue-600/50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition cursor-not-allowed">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Uploading &amp; Compressing...</span>
            </div>
          ) : (
            <label
              htmlFor="device-photo-input"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Photo</span>
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {localOrder
          .slice((galleryPage - 1) * galleryPerPage, galleryPage * galleryPerPage)
          .map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => handleDragStart(e, img)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, img)}
              onClick={() => setSelectedAdminGalleryImg(img)}
              className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 ${bgSubCard} group cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition`}
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition pointer-events-none"
                  onError={(e: any) => {
                    e.target.src = '/phulwari_logo.webp';
                  }}
                />
                <div className="absolute top-2 left-2 p-1.5 bg-slate-900/60 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition shadow-sm">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 shadow-sm backdrop-blur-sm rounded-md text-white text-[10px] font-bold">
                  #{img.sort_order || localOrder.findIndex(i => i.id === img.id) + 1}
                </div>
              </div>
              <div>
                <h4 className={`text-xs font-bold truncate ${textPrimary}`}>{img.title}</h4>
                <p className={`text-[10px] font-mono ${textSecondary} truncate`}>{img.url.startsWith('data:') ? 'Device Base64 Image' : img.url}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingGalleryImg(img);
                }}
                className="w-full py-1.5 bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <span className={`text-xs font-semibold ${textSecondary}`}>
          Showing photos {Math.min((galleryPage - 1) * galleryPerPage + 1, localOrder.length)} - {Math.min(galleryPage * galleryPerPage, localOrder.length)} of {localOrder.length}
        </span>

        <div className="flex items-center space-x-2">
          <button
            disabled={galleryPage === 1}
            onClick={() => setGalleryPage(prev => Math.max(prev - 1, 1))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
              galleryPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-600 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev Page</span>
          </button>

          <span className={`text-xs font-mono font-bold px-3 py-1 border rounded-xl ${badgeClass}`}>
            Page {galleryPage} of {Math.ceil(localOrder.length / galleryPerPage) || 1}
          </span>

          <button
            disabled={galleryPage >= Math.ceil(localOrder.length / galleryPerPage)}
            onClick={() => setGalleryPage(prev => Math.min(prev + 1, Math.ceil(localOrder.length / galleryPerPage)))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
              galleryPage >= Math.ceil(localOrder.length / galleryPerPage) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-600 hover:text-white'
            }`}
          >
            <span>Next Page</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
