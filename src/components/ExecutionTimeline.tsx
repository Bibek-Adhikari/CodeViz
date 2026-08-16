import React, { useState } from 'react';
import { ExecutionStep } from '../types';
import { 
  GitCommit, 
  ArrowRight, 
  Layers, 
  CornerDownRight, 
  Repeat, 
  GitBranch, 
  Terminal, 
  Sparkles, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Tooltip } from './common/Tooltip';

interface ExecutionTimelineProps {
  steps: ExecutionStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  const { isDark } = useTheme();
  const [filterType, setFilterType] = useState<'all' | 'calls' | 'assign' | 'output'>('all');
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

  if (!steps || steps.length === 0) return null;

  // Determine event type styling & icon for any step
  const getEventMeta = (step: ExecutionStep) => {
    const text = (step.explanation || '').toLowerCase();
    const event = step.event || '';

    if (event === 'call' || text.includes('call') || text.includes('invok') || text.includes('pushe')) {
      return {
        label: 'Call',
        color: 'text-indigo-400',
        badgeBg: isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Layers,
      };
    }
    if (event === 'return' || text.includes('return') || text.includes('popped') || text.includes('pops')) {
      return {
        label: 'Return',
        color: 'text-purple-400',
        badgeBg: isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-purple-50 text-purple-700 border-purple-200',
        icon: CornerDownRight,
      };
    }
    if (event === 'loop' || text.includes('loop') || text.includes('iterat') || text.includes('while') || text.includes('for ')) {
      return {
        label: 'Loop',
        color: 'text-amber-400',
        badgeBg: isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Repeat,
      };
    }
    if (event === 'condition' || text.includes('if ') || text.includes('branch') || text.includes('condition')) {
      return {
        label: 'Branch',
        color: 'text-rose-400',
        badgeBg: isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-50 text-rose-700 border-rose-200',
        icon: GitBranch,
      };
    }
    if (event === 'print' || text.includes('print') || text.includes('stdout') || text.includes('output') || step.stdout?.length > 0) {
      return {
        label: 'Output',
        color: 'text-emerald-400',
        badgeBg: isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Terminal,
      };
    }
    return {
      label: 'Assign',
      color: 'text-blue-400',
      badgeBg: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Sparkles,
    };
  };

  // Filter steps if user selects a specific event category
  const filteredIndices = steps.map((step, idx) => {
    if (filterType === 'all') return idx;
    const meta = getEventMeta(step);
    if (filterType === 'calls' && (meta.label === 'Call' || meta.label === 'Return')) return idx;
    if (filterType === 'assign' && meta.label === 'Assign') return idx;
    if (filterType === 'output' && meta.label === 'Output') return idx;
    return -1;
  }).filter((idx) => idx !== -1);

  return (
    <div className={`rounded-xl border shadow-md p-3 select-none flex flex-col gap-2.5 transition-colors ${
      isDark ? 'border-slate-800/80 bg-[#121820]' : 'border-slate-200 bg-white'
    }`}>
      {/* Top Header of Timeline with Interactive Filters and Jump Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <GitCommit className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Interactive Execution Timeline
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              Click any step node or hover to preview line trace, stack depth, and variable changes
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          <div className={`flex items-center p-0.5 rounded-lg border text-[10.5px] font-medium ${
            isDark ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {[
              { id: 'all', label: 'All Steps' },
              { id: 'calls', label: 'Calls' },
              { id: 'assign', label: 'Assigns' },
              { id: 'output', label: 'Output' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  filterType === f.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick Prev / Next Jump Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectStep(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex <= 0}
              className="p-1 rounded border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Jump to previous step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectStep(Math.min(steps.length - 1, currentStepIndex + 1))}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-1 rounded border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Jump to next step"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Nodes Track */}
      <div className={`rounded-xl border p-3 overflow-x-auto scrollbar-thin transition-colors ${
        isDark ? 'bg-[#0A0E14] border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
      }`}>
        <div className="flex items-center min-w-max gap-2 py-1 px-2">
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const isHovered = idx === hoveredStepIndex;
            const isFiltered = filteredIndices.includes(idx);
            const meta = getEventMeta(step);
            const EventIcon = meta.icon;

            const topFrame = step.callStack?.[step.callStack.length - 1];
            const activeVarNames = step.highlightVariables || [];

            return (
              <React.Fragment key={idx}>
                {/* Connecting Track Segment with Step Line */}
                {idx > 0 && (
                  <div
                    onClick={() => onSelectStep(idx)}
                    className={`h-1 w-6 sm:w-8 rounded-full transition-all duration-200 cursor-pointer ${
                      isCompleted || isCurrent
                        ? 'bg-blue-600 dark:bg-blue-500 shadow-xs'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Jump between step ${idx} and ${idx + 1}`}
                  />
                )}

                {/* Interactive Node Button with Rich Hover Preview */}
                <div className="relative group">
                  <button
                    id={`timeline-node-${idx}`}
                    onClick={() => onSelectStep(idx)}
                    onMouseEnter={() => setHoveredStepIndex(idx)}
                    onMouseLeave={() => setHoveredStepIndex(null)}
                    className={`relative flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-200 focus:outline-none cursor-pointer ${
                      isCurrent
                        ? 'scale-110 z-20'
                        : isHovered
                        ? 'scale-105 z-10'
                        : isFiltered
                        ? 'opacity-100'
                        : 'opacity-40 hover:opacity-100'
                    }`}
                    aria-label={`Jump to Step ${idx + 1}: Line ${step.line}`}
                  >
                    {/* Node Circle / Box */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center font-mono text-xs font-bold transition-all duration-200 border shadow-xs ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/25 scale-105'
                          : isCompleted
                          ? isDark
                            ? 'bg-[#151D28] text-blue-400 border-blue-500/40 hover:border-blue-400 hover:bg-[#1A2433]'
                            : 'bg-white text-blue-600 border-blue-300 hover:border-blue-500 hover:bg-blue-50/50'
                          : isDark
                          ? 'bg-[#10151E] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                          : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        <EventIcon className={`w-3 h-3 ${isCurrent ? 'text-white' : meta.color}`} />
                        <span className="text-[10px] font-bold">L{step.line}</span>
                      </div>
                      <span className={`text-[8.5px] font-mono leading-none ${
                        isCurrent ? 'text-blue-100' : 'text-slate-400'
                      }`}>
                        S{idx + 1}
                      </span>
                    </div>

                    {/* Event Tag Pill beneath Node */}
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-semibold rounded-md border tracking-tight leading-tight ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-xs'
                          : meta.badgeBg
                      }`}
                    >
                      {meta.label}
                    </span>

                    {/* Interactive Active Glow Ring */}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Rich Interactive Hover Card / Preview Tooltip */}
                  {isHovered && (
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 rounded-xl border shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
                      isDark
                        ? 'bg-[#161F2C] border-slate-700 text-slate-200 shadow-black/80'
                        : 'bg-white border-slate-300 text-slate-800 shadow-slate-900/20'
                    }`}>
                      {/* Header */}
                      <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-slate-700/50">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-mono font-bold">
                            Step {idx + 1}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-400">
                            Line {step.line}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${meta.badgeBg}`}>
                          {meta.label}
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs leading-relaxed text-slate-300 dark:text-slate-300 mb-2">
                        {step.explanation}
                      </p>

                      {/* Call Stack & Variable Metadata Snapshot */}
                      <div className={`p-1.5 rounded-lg text-[10px] font-mono space-y-1 ${
                        isDark ? 'bg-[#0E141E] text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Scope:</span>
                          <span className="font-semibold text-blue-400">
                            {topFrame?.functionName || 'GLOBAL'}
                          </span>
                        </div>
                        {activeVarNames.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Modified:</span>
                            <span className="font-semibold text-amber-400">
                              {activeVarNames.join(', ')}
                            </span>
                          </div>
                        )}
                        {step.stdout && step.stdout.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Output:</span>
                            <span className="font-semibold text-emerald-400 truncate max-w-[9rem]">
                              {step.stdout[step.stdout.length - 1]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pointer triangle */}
                      <div className={`w-3 h-3 border-r border-b rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 ${
                        isDark ? 'bg-[#161F2C] border-slate-700' : 'bg-white border-slate-300'
                      }`} />
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
