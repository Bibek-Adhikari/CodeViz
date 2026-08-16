import React, { useState } from 'react';
import { X, Sliders, Moon, Zap, Volume2, Eye, RefreshCw, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState('dark-navy');
  const [animSpeed, setAnimSpeed] = useState('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#121820] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 bg-[#161E27] flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Workspace Preferences</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4 text-xs text-slate-200 bg-[#0D1117]">
          {/* Theme setting */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span>Theme Archetype</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('dark-navy')}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                  theme === 'dark-navy'
                    ? 'bg-[#161E27] border-blue-500/60 text-white'
                    : 'bg-[#121820] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Sophisticated Dark</div>
                <div className="text-[10px] text-slate-400">Deep navy & electric blue</div>
              </button>

              <button
                onClick={() => setTheme('charcoal-obsidian')}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                  theme === 'charcoal-obsidian'
                    ? 'bg-[#161E27] border-blue-500/60 text-white'
                    : 'bg-[#121820] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Obsidian Charcoal</div>
                <div className="text-[10px] text-slate-400">Pure minimal dark</div>
              </button>
            </div>
          </div>

          {/* Execution animation toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#121820] border border-slate-800">
            <div>
              <div className="font-semibold text-slate-200">Auto-Scroll Active Line</div>
              <div className="text-[11px] text-slate-400">Keep executing source code line centered in view</div>
            </div>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded bg-slate-800 border-slate-700 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#121820] border border-slate-800">
            <div>
              <div className="font-semibold text-slate-200">Execution Sound Feedback</div>
              <div className="text-[11px] text-slate-400">Subtle click upon stack push/pop operations</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded bg-slate-800 border-slate-700 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161E27] border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
