import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  UploadCloud, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ExternalLink, 
  FolderOpen, 
  HardDrive,
  FileCode2,
  Sparkles,
  BookMarked,
  Filter
} from 'lucide-react';
import { StudyMaterial } from '../types';

interface SidebarProps {
  materials: StudyMaterial[];
  selectedMaterial: StudyMaterial | null;
  onSelectMaterial: (material: StudyMaterial) => void;
  onUploadFiles: (files: FileList | null) => void;
  onDeleteMaterial: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  materials,
  selectedMaterial,
  onSelectMaterial,
  onUploadFiles,
  onDeleteMaterial,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const filteredMaterials = categoryFilter === 'All' 
    ? materials 
    : materials.filter(m => m.category === categoryFilter);

  if (isCollapsed) {
    return (
      <aside className="w-14 border-r border-slate-800/60 bg-[#0F141B] flex flex-col items-center py-4 z-20 shrink-0 transition-all duration-300">
        <button
          id="sidebar-expand-btn"
          onClick={onToggleCollapse}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-4"
          title="Expand Study Materials Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6" title="Study Library">
          <BookMarked className="w-4 h-4" />
        </div>

        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto w-full px-2">
          {materials.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectMaterial(item)}
              title={`${item.title} (${item.size})`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                selectedMaterial?.id === item.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.type === 'pdf' ? (
                <FileText className="w-4 h-4 text-red-400" />
              ) : (
                <ImageIcon className="w-4 h-4 text-blue-400" />
              )}
            </button>
          ))}
        </div>

        <button
          id="sidebar-collapsed-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors mt-auto"
          title="Upload Material"
        >
          <Plus className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.svg,.gif,.txt,.md"
          className="hidden"
          onChange={(e) => onUploadFiles(e.target.files)}
        />
      </aside>
    );
  }

  return (
    <aside className="w-72 xl:w-76 border-r border-slate-800/60 bg-[#0F141B] flex flex-col h-full z-20 shrink-0 select-none transition-all duration-300">
      {/* Top Header of Sidebar */}
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-[11px] uppercase tracking-widest font-semibold text-slate-500">Study Materials</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Lecture slides, diagrams & notes</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="sidebar-upload-quick-btn"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Upload new file"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            id="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Large Drag and Drop Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-blue-500 bg-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              : 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.svg,.gif,.txt,.md"
            className="hidden"
            onChange={(e) => onUploadFiles(e.target.files)}
          />
          <div className="flex flex-col items-center">
            <UploadCloud className="w-8 h-8 mx-auto text-blue-500/60 mb-2 group-hover:text-blue-400 transition-colors" />
            <p className="text-xs font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
              Drop files here
            </p>
            <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, or PNG</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          {['All', 'Lectures', 'Diagrams', 'Cheatsheets'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Uploaded Material Cards */}
        {filteredMaterials.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#161E27] border border-slate-800 text-center">
            <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-300">Library is empty</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Upload study files to inspect them side-by-side with execution.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMaterials.map((item) => {
              const isSelected = selectedMaterial?.id === item.id;
              const isPdf = item.type === 'pdf';

              return (
                <div
                  key={item.id}
                  id={`study-file-${item.id}`}
                  onClick={() => onSelectMaterial(item)}
                  className={`p-3 rounded-lg flex items-center gap-3 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#161E27] border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#161E27] border border-slate-800 hover:border-blue-500/50 ring-1 ring-transparent hover:ring-blue-500/10'
                  }`}
                >
                  {/* Thumbnail or Icon */}
                  {isPdf ? (
                    <div className="w-8 h-8 bg-red-500/10 text-red-500 rounded flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  ) : item.url ? (
                    <div className="w-8 h-8 rounded overflow-hidden border border-slate-700 bg-slate-800 shrink-0 flex items-center justify-center">
                      <img
                        src={item.url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-white font-semibold' : 'text-white'
                      }`}
                      title={item.title}
                    >
                      {item.title}
                    </p>
                    <p className={`text-[10px] ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                      {isPdf ? item.size : 'Image Asset'}
                    </p>
                  </div>

                  {/* Active Blue Dot */}
                  {isSelected && (
                    <div className="absolute right-2.5 top-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                  )}

                  {/* Delete quick action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMaterial(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Storage Indicator at Bottom */}
      <div className="p-5 border-t border-slate-800/60 bg-[#0C1219] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">Study Library</span>
          <span className="text-[10px] text-slate-400 font-mono">248 MB / 1GB</span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-[24.8%]" />
        </div>
      </div>
    </aside>
  );
};
