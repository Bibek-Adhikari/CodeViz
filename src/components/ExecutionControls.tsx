import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Download, 
  Check, 
  BrainCircuit, 
  ChevronDown, 
  MoreHorizontal, 
  FileJson, 
  Keyboard, 
  Sliders, 
  FastForward, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Sparkles,
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
  const isAtStart = currentStepIndex <= 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

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
    <div className={`rounded-xl border shadow-md p-3 select-none flex flex-col gap-2.5 transition-colors ${
      isDark ? 'border-slate-800/80 bg-[#121820]' : 'border-slate-200 bg-white'
    }`}>
      {/* Primary Control Bar with Symmetrical Layout & Centralized Stepper */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap md:flex-nowrap">
        
        {/* LEFT SECTION: Program Preset Selector & Context Indicator */}
        <div className="flex items-center gap-2 min-w-0 order-1 md:w-1/3">
          {programs && onSelectProgram && selectedProgramId ? (
            <div className="relative flex items-center min-w-0">
              <select
                id="controls-program-select"
                value={selectedProgramId}
                onChange={(e) => onSelectProgram(e.target.value)}
                className={`text-xs font-semibold border rounded-lg pl-2.5 pr-7 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs max-w-[11rem] sm:max-w-[13rem] truncate transition-colors ${
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
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Execution Engine</span>
            </div>
          )}

          {/* Current Line Indicator */}
          {currentLine && (
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold hidden sm:inline-flex items-center gap-1 ${
              isDark ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Line {currentLine}
            </span>
          )}
        </div>

        {/* CENTER SECTION: PROMINENT CENTRALIZED STEP & PLAYBACK CONTROLS */}
        <div className="flex items-center justify-center gap-2 order-3 md:order-2 w-full md:w-1/3 py-0.5">
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border shadow-inner ${
            isDark ? 'bg-[#0A0E14] border-slate-800/90' : 'bg-slate-100 border-slate-300/80'
          }`}>
            {/* Reset Button */}
            <Tooltip content="Reset to Beginning" shortcut="R" position="top">
              <button
                id="exec-ctrl-reset"
                onClick={onReset}
                className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-[#141B24] hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 shadow-xs'
                }`}
                aria-label="Reset execution"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Step Backward */}
            <Tooltip content="Step Backward (Previous Line)" shortcut="←" position="top">
              <button
                id="exec-ctrl-step-back"
                onClick={onStepBack}
                disabled={isAtStart}
                className={`px-2.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all border ${
                  isAtStart
                    ? isDark
                      ? 'bg-slate-900/40 text-slate-700 border-slate-900 cursor-not-allowed'
                      : 'bg-slate-200/60 text-slate-400 border-slate-200 cursor-not-allowed'
                    : isDark
                    ? 'bg-[#161F2C] hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80 active:scale-95 cursor-pointer shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border-slate-300 active:scale-95 cursor-pointer shadow-xs'
                }`}
                aria-label="Step backward"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Prev</span>
              </button>
            </Tooltip>

            {/* Central Primary Play / Pause Button */}
            <Tooltip content={isPlaying ? 'Pause Execution' : isAtEnd ? 'Replay Execution' : 'Auto-Play Execution'} shortcut="Space" position="top">
              <button
                id="exec-ctrl-play-pause"
                onClick={onTogglePlay}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer min-w-[5.2rem] justify-center ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/30'
                    : isAtEnd
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 ring-2 ring-blue-500/20'
                }`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : isAtEnd ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </Tooltip>

            {/* Step Forward */}
            <Tooltip content="Step Forward (Next Line)" shortcut="→" position="top">
              <button
                id="exec-ctrl-step-forward"
                onClick={onStepForward}
                disabled={isAtEnd}
                className={`px-2.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all border ${
                  isAtEnd
                    ? isDark
                      ? 'bg-slate-900/40 text-slate-700 border-slate-900 cursor-not-allowed'
                      : 'bg-slate-200/60 text-slate-400 border-slate-200 cursor-not-allowed'
                    : isDark
                    ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 hover:text-white border-blue-500/40 active:scale-95 cursor-pointer shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 active:scale-95 cursor-pointer shadow-xs'
                }`}
                aria-label="Step forward"
              >
                <span className="hidden sm:inline text-[11px]">Next</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Step Counter Badge */}
            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs ${
              isDark ? 'bg-[#0E141C] border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}>
              <span className="font-semibold text-slate-400 text-[10.5px]">Step</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{currentStepNum}</span>
              <span className="text-slate-500">/</span>
              <span className="font-medium text-slate-400">{totalSteps}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Playback Speed, Quiz & Export Utilities */}
        <div className="flex items-center justify-end gap-1.5 order-2 md:order-3 md:w-1/3">
          {/* Status Badge */}
          <div className="hidden lg:flex items-center mr-1">
            {status === 'running' || isPlaying ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Step
              </span>
            ) : status === 'completed' || isAtEnd ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Done
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Paused
              </span>
            )}
          </div>

          {/* Speed Selector (Compact Pill Group) */}
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isDark ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 font-semibold px-1 hidden xl:inline">
              Speed
            </span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                id={`speed-btn-${s}x`}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
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

          {/* AI Quiz Button (Direct Access) */}
          {onOpenQuiz && (
            <Tooltip content="Launch AI Logic Quiz" position="top">
              <button
                id="exec-ctrl-quiz-btn"
                onClick={onOpenQuiz}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 transition-colors cursor-pointer shadow-xs"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Quiz</span>
              </button>
            </Tooltip>
          )}

          {/* Export JSON Trace */}
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
              aria-label="Export Trace JSON"
            >
              {isExported ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>

          {/* More Actions Popover Menu */}
          <div className="relative" ref={moreMenuRef}>
            <Tooltip content="More options & shortcuts" position="top">
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
                aria-label="More options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div className={`absolute right-0 bottom-full mb-1.5 w-56 rounded-xl shadow-2xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
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

                <div className="px-2.5 py-1 text-[10px] text-slate-500 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold">
                      <Keyboard className="w-3 h-3" /> Shortcuts:
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9.5px]">
                    <span>Step Back / Fwd:</span>
                    <span className="bg-slate-200 dark:bg-slate-800 px-1 rounded">← / →</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9.5px]">
                    <span>Play / Pause:</span>
                    <span className="bg-slate-200 dark:bg-slate-800 px-1 rounded">Space</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9.5px]">
                    <span>Reset Trace:</span>
                    <span className="bg-slate-200 dark:bg-slate-800 px-1 rounded">R</span>
                  </div>
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
        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs transition-colors ${
          isDark
            ? 'bg-blue-950/20 border-blue-500/20 text-slate-200'
            : 'bg-blue-50/70 border-blue-200 text-slate-800'
        }`}>
          {currentLine && (
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[10.5px] font-bold shrink-0 shadow-xs">
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
