import React from 'react';
import { 
  Cpu, 
  Layers, 
  Box, 
  CornerDownRight, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { StackFrame, HeapObject, VariableValue } from '../../types';

interface MemoryStatePanelProps {
  stackFrames: StackFrame[];
  heapObjects: HeapObject[];
  highlightVariables?: string[];
  status?: string;
}

export const MemoryStatePanel: React.FC<MemoryStatePanelProps> = ({
  stackFrames,
  heapObjects,
  highlightVariables = [],
  status = 'Running',
}) => {
  // Variable value badge color resolver
  const renderValueBadge = (variable: VariableValue) => {
    const { type, value, pointerRef } = variable;

    switch (type) {
      case 'int':
      case 'float':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-blue-500/40 font-mono text-xs font-semibold shadow-sm">
            {String(value)}
          </span>
        );
      case 'string':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-semibold">
            {String(value)}
          </span>
        );
      case 'bool':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-semibold">
            {String(value)}
          </span>
        );
      case 'pointer':
      case 'object':
      case 'list':
      case 'dict':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-xs font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {String(value)}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs">
            {String(value)}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#121820] shadow-lg flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="h-10 px-3.5 bg-[#161E27] border-b border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">Memory State</span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 font-normal">
            • Live program state
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status}
          </span>
        </div>
      </div>

      {/* Main Memory Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-[#0D1117]">
        {/* STACK SECTION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wide">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Call Stack (LIFO)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {stackFrames.length} {stackFrames.length === 1 ? 'frame' : 'frames'} active
            </span>
          </div>

          {/* Render Stack Frames (top frame is the newest) */}
          <div className="space-y-2.5">
            {stackFrames.map((frame, frameIdx) => {
              const isTop = frameIdx === stackFrames.length - 1;
              const varEntries = Object.entries(frame.variables || {}) as [string, VariableValue][];

              return (
                <div
                  key={frame.id || frameIdx}
                  className={`rounded-lg border transition-all duration-200 ${
                    isTop
                      ? 'bg-[#161E27] border-blue-500/40 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20'
                      : 'bg-[#0D1117] border-slate-800 opacity-90'
                  }`}
                >
                  {/* Frame Header */}
                  <div
                    className={`px-3 py-2 border-b flex items-center justify-between text-xs font-mono rounded-t-lg ${
                      isTop
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isTop ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                      <span>{frame.functionName}</span>
                      {isTop && (
                        <span className="text-[10px] font-sans font-medium px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Active Frame
                        </span>
                      )}
                    </div>
                    {frame.returnAddress && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ret → {frame.returnAddress}
                      </span>
                    )}
                  </div>

                  {/* Variables in Frame */}
                  <div className="p-2.5 space-y-1.5">
                    {varEntries.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic px-2 py-1">
                        No local variables allocated yet.
                      </div>
                    ) : (
                      varEntries.map(([varName, varObj]) => {
                        const isHighlighted = highlightVariables.includes(varName) || varObj.isModified;

                        return (
                          <div
                            key={varName}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors border ${
                              isHighlighted
                                ? 'bg-blue-500/10 border-blue-500/30 shadow-sm'
                                : 'bg-[#0A0E14] border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-medium text-slate-200">
                                {varObj.name || varName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                ({varObj.type})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              {renderValueBadge(varObj)}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Frame Return Value if returning */}
                    {frame.returnValue !== undefined && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs mt-1">
                        <span className="font-mono text-emerald-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Return Value
                        </span>
                        <span className="font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                          {frame.returnValue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HEAP SECTION */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wide">
              <Box className="w-3.5 h-3.5 text-purple-400" />
              <span>Heap Objects (Dynamic Memory)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {heapObjects.length} {heapObjects.length === 1 ? 'object' : 'objects'}
            </span>
          </div>

          {heapObjects.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-[#0A0E14] p-4 text-center">
              <Database className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
              <div className="text-xs font-semibold text-slate-400">Heap is empty</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Complex objects (lists, classes, dynamic allocations) will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {heapObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-2.5 shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/30">
                        {obj.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{obj.label || obj.type}</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase">
                      {obj.type}
                    </span>
                  </div>

                  {/* Object Value representation */}
                  <div className="p-2 rounded-lg bg-[#0A0E14] border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                    {obj.value}
                  </div>

                  {/* Properties table if any */}
                  {obj.properties && (
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1">
                      {Object.entries(obj.properties).map(([propKey, propVal]) => (
                        <div key={propKey} className="px-2 py-0.5 rounded bg-[#0A0E14] text-slate-400 flex justify-between border border-slate-800/60">
                          <span>{propKey}:</span>
                          <span className="text-cyan-300 font-semibold">{String(propVal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
