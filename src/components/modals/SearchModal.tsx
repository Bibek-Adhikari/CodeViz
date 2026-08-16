import React, { useState } from 'react';
import { Search, X, Code2, FileText, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { ExecutionProgram, StudyMaterial } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: ExecutionProgram[];
  materials: StudyMaterial[];
  onSelectProgram: (id: string) => void;
  onSelectMaterial: (material: StudyMaterial) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  programs,
  materials,
  onSelectProgram,
  onSelectMaterial,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredPrograms = programs.filter(
    p => p.title.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMaterials = materials.filter(
    m => m.title.toLowerCase().includes(query.toLowerCase()) || m.summary.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#121820] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="h-14 px-4 bg-[#161E27] flex items-center gap-3 border-b border-slate-800">
          <Search className="w-4 h-4 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code algorithms, memory concepts, lecture PDFs..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 bg-[#0D1117]">
          {/* Programs */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Execution Algorithms ({filteredPrograms.length})</span>
            </div>
            <div className="space-y-1">
              {filteredPrograms.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProgram(p.id);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#161E27] border border-transparent hover:border-slate-800 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-md">
                      {p.description}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {p.language}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Study Materials */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Study Materials ({filteredMaterials.length})</span>
            </div>
            <div className="space-y-1">
              {filteredMaterials.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMaterial(m);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#161E27] border border-transparent hover:border-slate-800 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-md">
                      {m.summary}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {m.size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#161E27] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Navigate with arrows</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
