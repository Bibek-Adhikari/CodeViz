import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { StudyMaterial } from '../../types';

interface ImagePreviewModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  material,
  onClose,
}) => {
  const [zoom, setZoom] = useState(100);

  if (!material || material.type !== 'image') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-4xl h-[85vh]">
        {/* Header */}
        <div className="h-14 px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate" title={material.title}>
                {material.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {material.dimensions || '1920 × 1080 px'} • {material.size} • {material.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 20))}
                className="p-1 rounded text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-slate-300 min-w-[45px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 20))}
                className="p-1 rounded text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Canvas Container */}
        <div className="flex-1 bg-[#090d16] p-6 overflow-auto flex flex-col items-center justify-center">
          {material.url ? (
            <div
              className="transition-transform duration-150 rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl max-w-full max-h-full flex items-center justify-center"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
            >
              <img
                src={material.url}
                alt={material.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Image preview generated</p>
            </div>
          )}

          {/* Description banner */}
          <div className="mt-4 max-w-2xl text-center px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            {material.summary}
          </div>
        </div>
      </div>
    </div>
  );
};
