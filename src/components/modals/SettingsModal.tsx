import React, { useState } from 'react';
import { X, Sliders, Moon, Sun, Zap, Volume2, Eye, RefreshCw, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
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
    <div className="fixed inset-0 z-50 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121820] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="h-14 px-5 bg-slate-50 dark:bg-[#161E27] flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Workspace Preferences</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4 text-xs bg-slate-50/50 dark:bg-[#0D1117]">
          {/* Theme setting */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Color Theme & Palette</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Dark Theme Option */}
              <button
                id="theme-option-dark"
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border text-left font-medium transition-all cursor-pointer relative overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-[#161E27] border-blue-500 text-white shadow-md ring-1 ring-blue-500/30'
                    : 'bg-white dark:bg-[#121820] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 shadow-sm">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  {theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">Sophisticated Dark</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Deep navy & neon accents</div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#0A0E14] border border-slate-700 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#161E27] border border-slate-700 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                id="theme-option-light"
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-left font-medium transition-all cursor-pointer relative overflow-hidden ${
                  theme === 'light'
                    ? 'bg-blue-50/70 border-blue-600 text-slate-900 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-white dark:bg-[#121820] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  {theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">Crisp Clean Light</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">High-contrast light palette</div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#F4F6F9] border border-slate-300 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#FFFFFF] border border-slate-300 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                </div>
              </button>
            </div>
          </div>

          {/* Execution animation toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#121820] border border-slate-200 dark:border-slate-800 transition-colors">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">Auto-Scroll Active Line</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Keep executing source code line centered in view</div>
            </div>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#121820] border border-slate-200 dark:border-slate-800 transition-colors">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">Execution Sound Feedback</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Subtle sound on stack push/pop operations</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#161E27] border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 transition-colors">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save-settings-btn"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
