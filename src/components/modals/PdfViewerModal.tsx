import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Download, 
  FileText, 
  RotateCw,
  BookOpen,
  CheckCircle2,
  Highlighter
} from 'lucide-react';
import { StudyMaterial, StudyPage } from '../../types';

interface PdfViewerModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  material,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  if (!material || material.type !== 'pdf') return null;

  const pages: StudyPage[] = material.samplePages || [
    {
      pageNum: 1,
      heading: 'CS101: Memory Layout & Stack Frames Overview',
      text: material.summary,
      keyPoints: [
        'Stack Allocation: Automatic O(1) frame creation upon function entry.',
        'Activation Record: Contains return address, frame pointer, and local variables.',
        'Heap Allocation: Dynamic memory requested at runtime via malloc / new.'
      ]
    }
  ];

  const totalPages = pages.length;
  const currentContent = pages.find(p => p.pageNum === currentPage) || pages[0];

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div
        className={`bg-[#121820] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[88vh]'
        }`}
      >
        {/* PDF Modal Header */}
        <div className="h-14 px-4 bg-[#161E27] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate" title={material.title}>
                {material.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {material.size} • {totalPages} Pages • {material.category}
              </p>
            </div>
          </div>

          {/* Navigation & Zoom Toolbar */}
          <div className="flex items-center gap-2">
            {/* Page Navigation */}
            <div className="flex items-center gap-1 bg-[#0D1117] rounded-lg p-1 border border-slate-800">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={`p-1 rounded text-slate-300 transition-colors cursor-pointer ${
                  currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'
                }`}
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-slate-200 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={`p-1 rounded text-slate-300 transition-colors cursor-pointer ${
                  currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'
                }`}
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-[#0D1117] rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setZoom(Math.max(70, zoom - 15))}
                className="p-1 rounded text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1.5 text-slate-300 min-w-[45px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 15))}
                className="p-1 rounded text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Page Canvas Preview */}
        <div className="flex-1 bg-[#0A0E14] p-4 sm:p-8 overflow-auto flex justify-center items-start">
          <div
            className="bg-[#121820] border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-10 text-slate-100 max-w-2xl w-full transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Slide Header */}
            <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">
                  University Computer Science • Lecture Materials
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  {currentContent.heading}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            {/* Slide Body */}
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <p className="text-base text-slate-200 font-normal leading-relaxed">
                {currentContent.text}
              </p>

              {/* Key Concept Points */}
              {currentContent.keyPoints && (
                <div className="rounded-xl bg-[#0D1117] border border-slate-800 p-4 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Key Examination Takeaways
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {currentContent.keyPoints.map((pt, idx) => (
                      <li
                        key={idx}
                        onClick={() => setActiveHighlight(activeHighlight === idx ? null : idx)}
                        className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start gap-2 ${
                          activeHighlight === idx
                            ? 'bg-blue-500/20 border border-blue-400 text-white font-medium'
                            : 'hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="text-blue-400 font-mono font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Memory Layout Diagram Mock inside PDF */}
              <div className="rounded-xl border border-slate-800 bg-[#0A0E14] p-4 text-center">
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  [FIGURE 4.{currentPage}] Stack Activation Record Diagram
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[#121820] border border-slate-800 text-slate-300">
                    High Memory (0xFFFFFFFF)<br />Parameters
                  </div>
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/40 text-blue-300 font-bold">
                    Return Address (RIP)<br />Frame Pointer (RBP)
                  </div>
                  <div className="p-2 rounded bg-[#121820] border border-slate-800 text-slate-300">
                    Low Memory<br />Local Variables (RSP)
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Footer */}
            <div className="border-t border-slate-800 pt-4 mt-8 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>CodeViz Study Hub • Lecture Companion</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
