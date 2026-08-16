import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Zap,
  CheckCircle2,
  Download,
  Check,
  BrainCircuit,
  Code2,
  ChevronDown,
  MoreHorizontal,
  FileJson,
  Keyboard,
  Info
} from 'lucide-react';
import { ExecutionProgram } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Tooltip } from './common/Tooltip';

interface ExecutionControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onStepBack: () => void;
  onStepForward: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
  onExportTrace?: () => void;
  onOpenQuiz?: () => void;
  status: 'idle' | 'running' | 'paused' | 'completed';
  currentLine?: number | null;
  stepExplanation?: string;
  programs?: ExecutionProgram[];
  selectedProgramId?: string;
  onSelectProgram?: (programId: string) => void;
}

export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  speed,
  onStepBack,
  onStepForward,
  onTogglePlay,
  onReset,
  onChangeSpeed,
  onExportTrace,
  onOpenQuiz,
  status,
  currentLine,
  stepExplanation,
  programs,
  selectedProgramId,
  onSelectProgram,
}) => {
  const [isExported, setIsExported] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  const currentStepNum = totalSteps > 0 ? currentStepIndex + 1 : 0;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = () => {
    if (onExportTrace) {
      onExportTrace();
    }
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  return (
    <div className={`rounded-xl border shadow-md p-2.5 sm:p-3 select-none flex flex-col gap-2 transition-colors ${
      isDark ? 'border-slate-800/80 bg-[#121820]' : 'border-slate-200 bg-white'
    }`}>
      {/* Top Controls Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left Side: Program Preset + Core Navigation Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Preset Selector Dropdown (Compact) */}
          {programs && onSelectProgram && selectedProgramId && (
            <div className="relative flex items-center mr-1">
              <select
                id="controls-program-select"
                value={selectedProgramId}
                onChange={(e) => onSelectProgram(e.target.value)}
                className={`text-[0.75rem] font-medium border rounded-lg pl-2 pr-6 py-1.5 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs max-w-[8.5rem] sm:max-w-[12rem] truncate transition-colors ${
                  isDark
                    ? 'bg-[#0D1117] text-slate-200 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400'
                }`}
                title="Select Example Program"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 pointer-events-none" />
            </div>
          )}

          {/* Reset Button */}
          <Tooltip content="Reset Execution" shortcut="R" position="top">
            <button
              id="exec-ctrl-reset"
              onClick={onReset}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-[#161E27] hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Step Backward */}
          <Tooltip content="Step Backward" shortcut="←" position="top">
            <button
              id="exec-ctrl-step-back"
              onClick={onStepBack}
              disabled={currentStepIndex <= 0}
              className={`p-1.5 sm:p-2 rounded-lg transition-all border ${
                currentStepIndex <= 0
                  ? isDark
                    ? 'bg-slate-900/30 text-slate-700 border-slate-900 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : isDark
                  ? 'bg-[#161E27] hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 active:scale-95 cursor-pointer'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 active:scale-95 cursor-pointer'
              }`}
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Play / Pause Toggle Button */}
          <Tooltip content={isPlaying ? 'Pause Execution' : 'Auto-Play Execution'} shortcut="Space" position="top">
            <button
              id="exec-ctrl-play-pause"
              onClick={onTogglePlay}
              className={`px-3 py-1.5 rounded-lg font-bold text-[0.75rem] flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </button>
          </Tooltip>

          {/* Step Forward */}
          <Tooltip content="Step Forward" shortcut="→" position="top">
            <button
              id="exec-ctrl-step-forward"
              onClick={onStepForward}
              disabled={currentStepIndex >= totalSteps - 1}
              className={`p-1.5 sm:p-2 rounded-lg transition-all border ${
                currentStepIndex >= totalSteps - 1
                  ? isDark
                    ? 'bg-slate-900/30 text-slate-700 border-slate-900 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : isDark
                  ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 active:scale-95 cursor-pointer'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 active:scale-95 cursor-pointer'
              }`}
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Center: Compact Step Badge & Status */}
        <div className="flex items-center gap-1.5">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[0.75rem] font-mono ${
            isDark ? 'bg-[#0D1117] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Step</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentStepNum}</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold">{totalSteps}</span>
          </div>

          <div className="hidden sm:flex items-center">
            {status === 'running' || isPlaying ? (
              <span className="flex items-center gap-1 text-[0.6875rem] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                Running
              </span>
            ) : status === 'completed' || currentStepIndex === totalSteps - 1 ? (
              <span className="flex items-center gap-1 text-[0.6875rem] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[0.6875rem] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-md">
                Paused
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Speed Selector & More Actions Popover */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Speed Selector (Compact Pill Group) */}
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isDark ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[0.625rem] text-slate-400 font-semibold px-1 hidden sm:inline">
              Speed
            </span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                id={`speed-btn-${s}x`}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 text-[0.6875rem] font-mono font-semibold rounded transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title={`Set speed to ${s}x`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Export JSON Trace (Compact Icon Button) */}
          <Tooltip content="Export execution trace JSON" position="top">
            <button
              id="exec-ctrl-export-trace"
              onClick={handleExportClick}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                isExported
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                  : isDark
                  ? 'bg-[#161E27] hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
            >
              {isExported ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>

          {/* More Actions Popover Menu */}
          <div className="relative" ref={moreMenuRef}>
            <Tooltip content="More execution tools" position="top">
              <button
                id="exec-ctrl-more-btn"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
                  showMoreMenu
                    ? isDark
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-200 text-slate-900 border-slate-300'
                    : isDark
                    ? 'bg-[#161E27] hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div className={`absolute right-0 bottom-full mb-1.5 w-52 rounded-xl shadow-2xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isDark
                  ? 'bg-[#161E27] border-slate-700/80 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/15'
              }`}>
                {onOpenQuiz && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenQuiz();
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-amber-800'
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Logic Quiz (3 Questions)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleExportClick();
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5 text-blue-500" />
                  <span>Download Trace JSON</span>
                </button>

                <div className={`h-px my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

                <div className="px-2.5 py-1 text-[10px] text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Keyboard className="w-3 h-3" /> Shortcuts
                  </span>
                  <span className="font-mono">← / → / Space</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Track (Scrubber) */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-200 shadow-xs"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Explanation Banner (Slim, High Contrast) */}
      {stepExplanation && (
        <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 text-xs transition-colors ${
          isDark
            ? 'bg-blue-950/20 border-blue-500/20 text-slate-200'
            : 'bg-blue-50/70 border-blue-200 text-slate-800'
        }`}>
          {currentLine && (
            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono text-[10px] font-bold shrink-0">
              L{currentLine}
            </span>
          )}
          <span className="truncate text-[11.5px] font-medium leading-tight">
            {stepExplanation}
          </span>
        </div>
      )}
    </div>
  );
};
