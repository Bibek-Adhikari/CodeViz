import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  UploadCloud, 
  Plus, 
  Trash2, 
  FolderOpen, 
  BookMarked,
  PanelLeftClose
} from 'lucide-react';
import { StudyMaterial } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Tooltip } from './common/Tooltip';

interface SidebarProps {
  materials: StudyMaterial[];
  selectedMaterial: StudyMaterial | null;
  onSelectMaterial: (material: StudyMaterial) => void;
  onUploadFiles: (files: FileList | null) => void;
  onDeleteMaterial: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  materials,
  selectedMaterial,
  onSelectMaterial,
  onUploadFiles,
  onDeleteMaterial,
  isOpen,
  onClose,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

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

  const handleItemClick = (item: StudyMaterial) => {
    onSelectMaterial(item);
    // On mobile/tablet screens (< 1024px), automatically close sidebar drawer
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile / Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        id="app-study-sidebar"
        aria-hidden={!isOpen}
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col select-none transition-all duration-300 ease-in-out ${
          isOpen
            ? `w-[18rem] sm:w-[19rem] max-w-[19rem] lg:basis-[19rem] opacity-100 translate-x-0 shadow-2xl lg:shadow-none pointer-events-auto border-r ${
                isDark
                  ? 'bg-[#0F141B] border-slate-800/60 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`
            : 'w-0 max-w-0 min-w-0 lg:basis-0 p-0 m-0 border-r-0 border-transparent -translate-x-full lg:translate-x-0 overflow-hidden opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-[18rem] sm:w-[19rem] min-w-[18rem] sm:min-w-[19rem] h-full flex flex-col overflow-hidden">
          {/* Top Header of Sidebar */}
          <div className={`h-[3.25rem] px-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-800/60 bg-[#121820]' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookMarked className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white truncate">
                  Study Materials
                </h2>
                <p className="text-[10px] text-slate-500 truncate">
                  {materials.length} {materials.length === 1 ? 'resource' : 'resources'} available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip content="Upload material" position="bottom">
                <button
                  id="sidebar-upload-quick-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip content="Close Sidebar (⌘B)" position="bottom">
                <button
                  id="sidebar-close-btn"
                  onClick={onClose}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-200/90 dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Close</span>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Sidebar Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all duration-200 group ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                  : isDark
                  ? 'border-slate-800 hover:border-blue-500/50 bg-[#161E27]/50 hover:bg-[#161E27]'
                  : 'border-slate-300 hover:border-blue-500/60 bg-white hover:bg-blue-50/30'
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
                <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  Upload / Drop Lecture Notes
                </p>
                <p className="text-[9.5px] text-slate-500 mt-0.5">PDF, PNG, JPG, MD</p>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {['All', 'Lectures', 'Diagrams', 'Cheatsheets'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Uploaded Materials List */}
            {filteredMaterials.length === 0 ? (
              <div className={`p-4 rounded-xl text-center border ${
                isDark ? 'bg-[#161E27]/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <FolderOpen className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">No materials</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Upload files to inspect beside code.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredMaterials.map((item) => {
                  const isSelected = selectedMaterial?.id === item.id;
                  const isPdf = item.type === 'pdf';

                  return (
                    <div
                      key={item.id}
                      id={`study-file-${item.id}`}
                      onClick={() => handleItemClick(item)}
                      className={`p-2.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer group relative border ${
                        isSelected
                          ? isDark
                            ? 'bg-blue-950/40 border-blue-500/60 text-white shadow-xs'
                            : 'bg-blue-50 border-blue-400 text-blue-950 shadow-xs'
                          : isDark
                          ? 'bg-[#161E27]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#161E27]'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      {/* Thumbnail or Icon */}
                      {isPdf ? (
                        <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      ) : item.url ? (
                        <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium truncate leading-tight"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {isPdf ? item.size : 'Image Diagram'}
                        </p>
                      </div>

                      {/* Delete quick button */}
                      <Tooltip content="Delete file" position="left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMaterial(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Storage Bar & Collapse Footer */}
          <div className={`p-3 border-t text-xs shrink-0 flex flex-col gap-2.5 ${
            isDark ? 'border-slate-800/60 bg-[#0C1219]' : 'border-slate-200 bg-slate-100/70'
          }`}>
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="font-semibold uppercase tracking-wider">Library Space</span>
                <span className="font-mono">248 MB / 1 GB</span>
              </div>
              <div className="h-1 w-full bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 dark:bg-blue-500 w-[24.8%]" />
              </div>
            </div>

            <button
              id="sidebar-footer-collapse-btn"
              onClick={onClose}
              className={`w-full py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[11.5px] font-medium transition-all border cursor-pointer ${
                isDark
                  ? 'bg-[#161E27] hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <PanelLeftClose className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Close Sidebar View</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
