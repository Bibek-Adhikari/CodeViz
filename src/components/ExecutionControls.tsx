import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  FastForward, 
  Zap,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  Download,
  Check,
  FileJson,
  BrainCircuit,
  Code2,
  ChevronDown
} from 'lucide-react';
import { ExecutionProgram } from '../types';

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
  const currentStepNum = totalSteps > 0 ? currentStepIndex + 1 : 0;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  const handleExportClick = () => {
    if (onExportTrace) {
      onExportTrace();
    }
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#121820] shadow-lg p-3 select-none flex flex-col gap-2.5">
      {/* Top row: Status, Program Selector, Step Navigation, Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Program Picker & Step Navigation Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Program preset selector if provided */}
          {programs && onSelectProgram && selectedProgramId && (
            <div className="relative flex items-center mr-1">
              <div className="absolute left-2.5 pointer-events-none text-blue-400">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <select
                id="controls-program-select"
                value={selectedProgramId}
                onChange={(e) => onSelectProgram(e.target.value)}
                className="text-xs bg-[#0D1117] text-slate-200 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:border-slate-700 transition-colors shadow-sm"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.language.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          )}

          {/* Reset Button */}
          <button
            id="exec-ctrl-reset"
            onClick={onReset}
            className="p-2 rounded-lg bg-[#161E27] hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 active:scale-95 cursor-pointer"
            title="Reset Execution (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Backward */}
          <button
            id="exec-ctrl-step-back"
            onClick={onStepBack}
            disabled={currentStepIndex <= 0}
            className={`p-2 rounded-lg transition-all border ${
              currentStepIndex <= 0
                ? 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
                : 'bg-[#161E27] hover:bg-slate-800 text-slate-200 hover:text-white border-slate-800 active:scale-95 cursor-pointer'
            }`}
            title="Step Backward (Left Arrow)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            id="exec-ctrl-play-pause"
            onClick={onTogglePlay}
            className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 border border-blue-500/30'
            }`}
            title={isPlaying ? 'Pause auto-play (Space)' : 'Auto-play execution (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto-Play</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            id="exec-ctrl-step-forward"
            onClick={onStepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            className={`p-2 rounded-lg transition-all border ${
              currentStepIndex >= totalSteps - 1
                ? 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border-blue-500/30 active:scale-95 cursor-pointer'
            }`}
            title="Step Forward (Right Arrow)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Step Indicator Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-400">Step</span>
            <span className="font-bold text-white text-[13px]">{currentStepNum}</span>
            <span className="text-slate-500">of</span>
            <span className="font-bold text-slate-300">{totalSteps}</span>
          </div>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium bg-slate-900/60 border-slate-800">
            {status === 'running' || isPlaying ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Running
              </span>
            ) : status === 'completed' || currentStepIndex === totalSteps - 1 ? (
              <span className="flex items-center gap-1 text-blue-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Completed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Paused
              </span>
            )}
          </div>
        </div>

        {/* Right side: Quiz Me + Export Execution Trace + Speed Selector */}
        <div className="flex items-center gap-2">
          {/* Quiz Me Button */}
          {onOpenQuiz && (
            <button
              id="exec-ctrl-quiz-me"
              onClick={onOpenQuiz}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shadow-amber-500/10"
              title="Test your understanding with a 3-question AI Quiz on this execution flow"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Quiz Me</span>
              <span className="sm:hidden text-[11px]">Quiz</span>
            </button>
          )}

          {/* Export Execution Trace Button */}
          <button
            id="exec-ctrl-export-trace"
            onClick={handleExportClick}
            className="px-2.5 py-1.5 rounded-lg bg-[#161E27] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Download current execution trace as JSON for offline study"
          >
            {isExported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold text-[11px]">Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline text-[11px]">Export Trace</span>
                <span className="sm:hidden text-[11px]">Trace</span>
              </>
            )}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold px-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Speed
            </span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                id={`speed-btn-${s}x`}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Explanation Banner */}
      {stepExplanation && (
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            {currentLine && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-semibold border border-blue-500/30 shrink-0">
                Line {currentLine}
              </span>
            )}
            <span className="truncate text-slate-200">{stepExplanation}</span>
          </div>
        </div>
      )}
    </div>
  );
};
