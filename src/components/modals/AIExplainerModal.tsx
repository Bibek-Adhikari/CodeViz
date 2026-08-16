import React from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Layers, 
  Clock, 
  HardDrive, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2,
  Code2
} from 'lucide-react';
import { ExecutionStep, ExecutionProgram } from '../../types';

interface AIExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: ExecutionStep | null;
  program: ExecutionProgram | null;
}

export const AIExplainerModal: React.FC<AIExplainerModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  program,
}) => {
  if (!isOpen) return null;

  const stepNum = currentStep ? currentStep.stepNumber : 1;
  const lineNum = currentStep ? currentStep.line : 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#121820] border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-2xl max-h-[85vh]">
        {/* Header */}
        <div className="h-14 px-5 bg-[#161E27] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                AI Code & Memory Tutor
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Step {stepNum} Analysis
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Deep architectural breakdown of this execution step</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-slate-200 bg-[#0D1117]">
          {/* Current Execution Action Box */}
          <div className="p-4 rounded-xl bg-[#161E27] border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-blue-400 font-bold uppercase">Current Executing Line</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                Line {lineNum}
              </span>
            </div>
            <p className="text-slate-100 text-sm font-medium leading-relaxed">
              {currentStep?.explanation || 'Program is allocating memory and executing statements.'}
            </p>
          </div>

          {/* Memory Architecture Insight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#121820] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <Layers className="w-3.5 h-3.5" />
                <span>Call Stack State</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStep?.callStack.length === 1
                  ? 'Only the GLOBAL activation record is active. No subroutines are currently pushed.'
                  : `${currentStep?.callStack.length} stack frames are active. Top frame is "${currentStep?.callStack[currentStep.callStack.length - 1].functionName}".`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121820] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Heap Allocation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStep?.heap.length === 0
                  ? 'No dynamic heap objects allocated. All primitive integers/references reside on the stack.'
                  : `${currentStep?.heap.length} dynamic heap objects tracked. References are stored via pointers.`}
              </p>
            </div>
          </div>

          {/* Complexity Breakdown */}
          {program?.complexity && (
            <div className="p-3.5 rounded-xl bg-[#121820] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Big-O Complexity Metrics</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Time: <strong className="text-amber-300">{program.complexity.time}</strong>
                  </span>
                  <span className="text-slate-400">
                    Space: <strong className="text-blue-300">{program.complexity.space}</strong>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {program.description}
              </p>
            </div>
          )}

          {/* University Exam Tip */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-emerald-300">CS Exam Tip</span>
              <p className="text-slate-300 leading-relaxed">
                Remember that local variables allocated on the stack are deallocated as soon as the function returns (when the stack pointer moves back). Objects created on the heap survive until explicitly freed or garbage collected.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#161E27] border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
