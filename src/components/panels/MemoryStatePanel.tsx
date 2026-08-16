import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  Pin,
  PinOff,
  Eye,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { StackFrame, HeapObject, VariableValue, VariableType, PinnedVariable } from '../../types';

interface MemoryStatePanelProps {
  stackFrames: StackFrame[];
  heapObjects: HeapObject[];
  highlightVariables?: string[];
  status?: string;
  pinnedVarNames?: string[];
  onTogglePinVariable?: (varName: string) => void;
}

export const MemoryStatePanel: React.FC<MemoryStatePanelProps> = ({
  stackFrames,
  heapObjects,
  highlightVariables = [],
  status = 'Running',
  pinnedVarNames: externalPinnedVarNames,
  onTogglePinVariable: externalOnTogglePin,
}) => {
  // Local state for pinned variable names if not provided externally
  const [localPinnedNames, setLocalPinnedNames] = useState<string[]>(['n', 'ans', 'count']);
  const [newWatchInput, setNewWatchInput] = useState('');
  const [isAddingWatch, setIsAddingWatch] = useState(false);
  const [watchlistCache, setWatchlistCache] = useState<Record<string, {
    lastKnownValue: any;
    type: VariableType;
    lastScopeName: string;
  }>>({});

  const pinnedNames = externalPinnedVarNames || localPinnedNames;

  const togglePin = (varName: string) => {
    if (externalOnTogglePin) {
      externalOnTogglePin(varName);
    } else {
      if (localPinnedNames.includes(varName)) {
        setLocalPinnedNames(localPinnedNames.filter((n) => n !== varName));
      } else {
        setLocalPinnedNames([...localPinnedNames, varName]);
      }
    }
  };

  const handleAddWatch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWatchInput.trim();
    if (!trimmed) return;
    if (!pinnedNames.includes(trimmed)) {
      togglePin(trimmed);
    }
    setNewWatchInput('');
    setIsAddingWatch(false);
  };

  const handleClearAllPinned = () => {
    if (externalOnTogglePin) {
      pinnedNames.forEach(n => externalOnTogglePin(n));
    } else {
      setLocalPinnedNames([]);
    }
  };

  // Synchronize and update watchlist values from current stack frames & heap
  useEffect(() => {
    const updatedCache = { ...watchlistCache };

    pinnedNames.forEach((varName) => {
      let found = false;

      // Check stack frames from active/top to bottom
      for (let i = stackFrames.length - 1; i >= 0; i--) {
        const frame = stackFrames[i];
        if (frame.variables && frame.variables[varName]) {
          const v = frame.variables[varName];
          updatedCache[varName] = {
            lastKnownValue: v.value,
            type: v.type,
            lastScopeName: frame.functionName,
          };
          found = true;
          break;
        }
      }

      // Check heap if not in stack
      if (!found) {
        const heapObj = heapObjects.find(
          (h) => h.id === varName || h.label.toLowerCase().includes(varName.toLowerCase())
        );
        if (heapObj) {
          updatedCache[varName] = {
            lastKnownValue: heapObj.value,
            type: 'object',
            lastScopeName: 'Heap',
          };
        }
      }
    });

    setWatchlistCache(updatedCache);
  }, [stackFrames, heapObjects, pinnedNames]);

  // Compute resolved pinned variable list with real-time scope detection
  const resolvedPinnedVariables: PinnedVariable[] = useMemo(() => {
    return pinnedNames.map((name) => {
      let activeVar: VariableValue | null = null;
      let activeScopeName = '';
      let isInScope = false;

      // Look from top frame down
      for (let i = stackFrames.length - 1; i >= 0; i--) {
        const frame = stackFrames[i];
        if (frame.variables && frame.variables[name]) {
          activeVar = frame.variables[name];
          activeScopeName = frame.functionName;
          isInScope = true;
          break;
        }
      }

      const cached = watchlistCache[name];

      return {
        name,
        type: activeVar ? activeVar.type : (cached?.type || 'none'),
        lastKnownValue: activeVar ? activeVar.value : (cached?.lastKnownValue ?? '(not initialized)'),
        lastScopeName: activeScopeName || (cached?.lastScopeName || 'Unknown Scope'),
        isCurrentlyInScope: isInScope,
        isModified: activeVar ? (highlightVariables.includes(name) || activeVar.isModified) : false,
      };
    });
  }, [pinnedNames, stackFrames, highlightVariables, watchlistCache]);

  // Variable value badge color resolver
  const renderValueBadge = (type: string, value: any) => {
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
            • Live program & variable state
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
        
        {/* PERSISTENT VARIABLE WATCHLIST SECTION */}
        <div className="rounded-xl border border-amber-500/30 bg-[#151A22] p-3 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Pin className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Persistent Watchlist
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold">
                    {pinnedNames.length} {pinnedNames.length === 1 ? 'pinned' : 'pinned'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Tracked constantly across stack frame pushes & pops
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="watchlist-add-btn"
                onClick={() => setIsAddingWatch(!isAddingWatch)}
                className="px-2 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Add variable name to watch list"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>

              {pinnedNames.length > 0 && (
                <button
                  id="watchlist-clear-btn"
                  onClick={handleClearAllPinned}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                  title="Clear all pinned variables"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Inline Form */}
          {isAddingWatch && (
            <form onSubmit={handleAddWatch} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newWatchInput}
                onChange={(e) => setNewWatchInput(e.target.value)}
                placeholder="Variable name (e.g. n, ans, count)..."
                autoFocus
                className="flex-1 text-xs bg-[#0D1117] text-slate-200 border border-amber-500/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Track
              </button>
              <button
                type="button"
                onClick={() => setIsAddingWatch(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded"
              >
                ✕
              </button>
            </form>
          )}

          {/* Pinned Variables Cards */}
          {resolvedPinnedVariables.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-800 bg-[#0D1117] p-3 text-center text-xs text-slate-500 space-y-1">
              <p>No variables pinned yet.</p>
              <p className="text-[10px] text-slate-400">
                Click the <Pin className="w-2.5 h-2.5 inline text-slate-400" /> icon next to any variable in the call stack below to pin it for continuous tracking!
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {resolvedPinnedVariables.map((pv) => (
                <div
                  key={pv.name}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                    pv.isCurrentlyInScope
                      ? pv.isModified
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm shadow-amber-500/10'
                        : 'bg-[#111720] border-slate-800 hover:border-amber-500/40'
                      : 'bg-[#0D1117] border-slate-800/80 opacity-75'
                  }`}
                >
                  {/* Left: Pin icon + Name + Scope Status */}
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => togglePin(pv.name)}
                      className="p-0.5 text-amber-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Unpin from watchlist"
                    >
                      <Pin className="w-3.5 h-3.5 fill-amber-400" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {pv.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({pv.type})
                        </span>
                        {pv.isModified && pv.isCurrentlyInScope && (
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-500 text-slate-950">
                            UPDATED
                          </span>
                        )}
                      </div>

                      {/* Scope Status Badge */}
                      <div className="flex items-center gap-1 text-[10px] mt-0.5 font-mono">
                        {pv.isCurrentlyInScope ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            In Scope ({pv.lastScopeName})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Out of Scope (Last: {pv.lastScopeName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Value badge */}
                  <div className="flex items-center gap-2 pl-2">
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    {renderValueBadge(pv.type, pv.lastKnownValue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                        const isPinned = pinnedNames.includes(varName);

                        return (
                          <div
                            key={varName}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors border group ${
                              isHighlighted
                                ? 'bg-blue-500/10 border-blue-500/30 shadow-sm'
                                : 'bg-[#0A0E14] border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Pin Toggle Button */}
                              <button
                                onClick={() => togglePin(varName)}
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  isPinned
                                    ? 'text-amber-400 hover:text-rose-400 bg-amber-500/10'
                                    : 'text-slate-600 group-hover:text-slate-400 hover:text-amber-400'
                                }`}
                                title={isPinned ? `Unpin ${varName} from Watchlist` : `Pin ${varName} to Persistent Watchlist`}
                              >
                                <Pin className={`w-3 h-3 ${isPinned ? 'fill-amber-400' : ''}`} />
                              </button>

                              <span className="text-xs font-mono font-medium text-slate-200">
                                {varObj.name || varName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                ({varObj.type})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              {renderValueBadge(varObj.type, varObj.value)}
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
              {heapObjects.map((obj) => {
                const isPinned = pinnedNames.includes(obj.id);

                return (
                  <div
                    key={obj.id}
                    className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-2.5 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => togglePin(obj.id)}
                          className={`p-0.5 rounded transition-colors cursor-pointer ${
                            isPinned ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                          }`}
                          title={isPinned ? 'Unpin heap object' : 'Pin heap object to watchlist'}
                        >
                          <Pin className={`w-3 h-3 ${isPinned ? 'fill-amber-400' : ''}`} />
                        </button>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
