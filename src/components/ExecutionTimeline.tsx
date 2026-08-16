import React from 'react';
import { ExecutionStep } from '../types';
import { ArrowRight, CircleDot, PlayCircle, GitCommit } from 'lucide-react';

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
  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#121820] p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitCommit className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-tight uppercase">
            Execution Timeline (Line Trace)
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Click any node to inspect state
        </span>
      </div>

      {/* Horizontal Nodes Sequence */}
      <div className="overflow-x-auto py-2 px-1">
        <div className="flex items-center min-w-max gap-1">
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <React.Fragment key={idx}>
                {/* Connecting line before node */}
                {idx > 0 && (
                  <div
                    className={`w-6 h-0.5 transition-colors duration-200 ${
                      isCompleted || isCurrent
                        ? 'bg-blue-500'
                        : 'bg-slate-800'
                    }`}
                  />
                )}

                {/* Node Pill */}
                <button
                  id={`timeline-node-${idx}`}
                  onClick={() => onSelectStep(idx)}
                  className={`group relative flex flex-col items-center p-1 rounded-xl transition-all duration-200 focus:outline-none cursor-pointer ${
                    isCurrent
                      ? 'scale-110 z-10'
                      : 'hover:scale-105'
                  }`}
                  title={`Step ${idx + 1}: Line ${step.line} - ${step.explanation}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 border ${
                      isCurrent
                        ? 'bg-blue-500 text-white border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.5)] ring-2 ring-blue-500/40'
                        : isCompleted
                        ? 'bg-slate-900 text-blue-400 border-slate-700 hover:border-blue-500/60'
                        : 'bg-slate-900/40 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400'
                    }`}
                  >
                    {step.line}
                  </div>

                  <span
                    className={`text-[9px] font-mono mt-1 ${
                      isCurrent ? 'text-blue-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    S{idx + 1}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-[#161E27] border border-slate-700 text-white text-[10px] rounded-lg py-1.5 px-2.5 shadow-2xl max-w-xs whitespace-normal font-sans text-center">
                      <div className="font-bold text-blue-400 font-mono mb-0.5">
                        Step {idx + 1} • Line {step.line}
                      </div>
                      <div className="text-slate-300 line-clamp-2">{step.explanation}</div>
                    </div>
                    <div className="w-2 h-2 bg-[#161E27] border-r border-b border-slate-700 rotate-45 -mt-1" />
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
