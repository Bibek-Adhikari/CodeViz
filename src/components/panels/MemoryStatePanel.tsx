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
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Activity
} from 'lucide-react';
import { StackFrame, HeapObject, VariableValue, VariableType, PinnedVariable } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Tooltip } from '../common/Tooltip';

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
  const { isDark } = useTheme();
  // Local state for pinned variable names if not provided externally
  const [localPinnedNames, setLocalPinnedNames] = useState<string[]>(['x', 'y', 'z']);
  const [newWatchInput, setNewWatchInput] = useState('');
  const [isAddingWatch, setIsAddingWatch] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [watchlistCache, setWatchlistCache] = useState<Record<string, {
    lastKnownValue: any;
    previousValue?: any;
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

  // Extract all existing variable names from stack frames & heap for 1-click watch suggestions
  const availableVariableSuggestions = useMemo(() => {
    const names = new Set<string>();
    stackFrames.forEach((frame) => {
      if (frame.variables) {
        Object.keys(frame.variables).forEach((varName) => {
          if (!pinnedNames.includes(varName)) {
            names.add(varName);
          }
        });
      }
    });
    heapObjects.forEach((obj) => {
      if (!pinnedNames.includes(obj.id)) {
        names.add(obj.id);
      }
    });
    return Array.from(names);
  }, [stackFrames, heapObjects, pinnedNames]);

  // Synchronize and update watchlist values from current stack frames & heap with previous value delta
  useEffect(() => {
    setWatchlistCache((prev) => {
      const updatedCache = { ...prev };

      pinnedNames.forEach((varName) => {
        let found = false;

        // Check stack frames from active/top to bottom
        for (let i = stackFrames.length - 1; i >= 0; i--) {
          const frame = stackFrames[i];
          if (frame.variables && frame.variables[varName]) {
            const v = frame.variables[varName];
            const prevVal = updatedCache[varName]?.lastKnownValue;
            updatedCache[varName] = {
              lastKnownValue: v.value,
              previousValue: prevVal !== undefined && prevVal !== v.value ? prevVal : updatedCache[varName]?.previousValue,
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
            (h) => h.id === varName || h.label?.toLowerCase().includes(varName.toLowerCase())
          );
          if (heapObj) {
            const prevVal = updatedCache[varName]?.lastKnownValue;
            updatedCache[varName] = {
              lastKnownValue: heapObj.value,
              previousValue: prevVal !== undefined && prevVal !== heapObj.value ? prevVal : updatedCache[varName]?.previousValue,
              type: 'object',
              lastScopeName: 'Heap',
            };
          }
        }
      });

      return updatedCache;
    });
  }, [stackFrames, heapObjects, pinnedNames]);

  // Compute resolved pinned variable list with real-time scope detection
  const resolvedPinnedVariables = useMemo(() => {
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
        lastKnownValue: activeVar ? activeVar.value : (cached?.lastKnownValue ?? '(uninitialized)'),
        previousValue: cached?.previousValue,
        lastScopeName: activeScopeName || (cached?.lastScopeName || 'Global / Heap'),
        isCurrentlyInScope: isInScope,
        isModified: activeVar ? (highlightVariables.includes(name) || activeVar.isModified) : false,
      };
    });
  }, [pinnedNames, stackFrames, highlightVariables, watchlistCache]);

  // Variable value badge color resolver
  const renderValueBadge = (type: string, value: any) => {
    const valString = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);

    switch (type) {
      case 'int':
      case 'float':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-cyan-300 border border-blue-400/30 font-mono text-xs font-bold shadow-xs">
            {valString}
          </span>
        );
      case 'string':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30 font-mono text-xs font-semibold">
            "{valString.replace(/^"|"$/g, '')}"
          </span>
        );
      case 'bool':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 font-mono text-xs font-bold">
            {valString}
          </span>
        );
      case 'pointer':
      case 'object':
      case 'list':
      case 'dict':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/30 font-mono text-xs font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {valString}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-mono text-xs">
            {valString}
          </span>
        );
    }
  };

  return (
    <div className={`rounded-xl border shadow-lg flex flex-col h-full overflow-hidden select-none transition-colors ${
      isDark ? 'border-slate-800/80 bg-[#121820]' : 'border-slate-200 bg-white'
    }`}>
      {/* Header */}
      <div className={`h-11 px-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
        isDark ? 'bg-[#161E27] border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Memory State Inspector
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-normal ml-2">
              Stack Frames • Heap • Persistent Watchlist
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-4 transition-colors ${
        isDark ? 'bg-[#0D1117]' : 'bg-slate-50/50'
      }`}>
        
        {/* ========================================================================= */}
        {/* PERSISTENT VARIABLE WATCHLIST SECTION WITH CLEAR INSTRUCTIONS & SUGGESTIONS */}
        {/* ========================================================================= */}
        <div className={`rounded-xl border p-3 shadow-sm space-y-3 transition-colors ${
          isDark
            ? 'border-amber-500/40 bg-[#161C26]'
            : 'border-amber-300 bg-amber-50/40'
        }`}>
          {/* Watchlist Header Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Pin className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                    Live Watchlist
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 font-bold">
                    {pinnedNames.length} {pinnedNames.length === 1 ? 'tracked' : 'tracked'}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  Monitors variable values continuously across function calls, loops & returns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* How to use toggle button */}
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                title="Toggle How to Use guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Guide</span>
                {showInstructions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Add Variable Button */}
              <button
                id="watchlist-add-btn"
                onClick={() => setIsAddingWatch(!isAddingWatch)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="Add variable to watch list"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Watch</span>
              </button>

              {/* Clear All Button */}
              {pinnedNames.length > 0 && (
                <button
                  id="watchlist-clear-btn"
                  onClick={handleClearAllPinned}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear all pinned variables"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible "How to Use Watchlist" Visual Guide Banner */}
          {showInstructions && (
            <div className={`rounded-lg border p-2.5 text-xs transition-colors ${
              isDark
                ? 'bg-[#0D1219] border-amber-500/20 text-slate-300'
                : 'bg-white border-amber-200 text-slate-700 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>How to Use the Watchlist:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-start gap-1.5 p-1.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span><strong>Pin Variables:</strong> Click the <Pin className="w-3 h-3 inline text-amber-500 fill-amber-500" /> icon next to any variable in the stack or heap below.</span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span><strong>Step & Observe:</strong> Step forward or back to see values update in real-time as execution flows.</span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span><strong>Change Highlights:</strong> Modified variables glow amber with live value history across scopes.</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Add Custom Variable Form */}
          {isAddingWatch && (
            <form onSubmit={handleAddWatch} className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newWatchInput}
                  onChange={(e) => setNewWatchInput(e.target.value)}
                  placeholder="Enter variable name (e.g., x, result, count)..."
                  autoFocus
                  className={`w-full text-xs rounded-lg pl-3 pr-3 py-1.5 font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                    isDark ? 'bg-[#0D1117] text-slate-200 border-amber-500/50' : 'bg-white text-slate-800 border-amber-300 shadow-inner'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Track
              </button>
              <button
                type="button"
                onClick={() => setIsAddingWatch(false)}
                className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          {/* 1-Click Quick Suggestions for Unwatched Variables */}
          {availableVariableSuggestions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                Quick Add:
              </span>
              {availableVariableSuggestions.slice(0, 6).map((varName) => (
                <button
                  key={varName}
                  onClick={() => togglePin(varName)}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#0E141E] hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-400'
                      : 'bg-white hover:bg-amber-100 text-amber-800 border-amber-200 shadow-xs'
                  }`}
                  title={`Click to watch variable ${varName}`}
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{varName}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tracked Variable Cards Grid */}
          {resolvedPinnedVariables.length === 0 ? (
            <div className={`rounded-xl border border-dashed p-4 text-center text-xs space-y-2 transition-colors ${
              isDark ? 'border-slate-800 bg-[#0D1117] text-slate-400' : 'border-slate-300 bg-white text-slate-500'
            }`}>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Pin className="w-4 h-4" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                No variables added to Watchlist yet
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Click the <Pin className="w-3 h-3 inline text-amber-500" /> icon next to any variable in the Call Stack below, or click any of the quick add suggestions above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {resolvedPinnedVariables.map((pv) => (
                <div
                  key={pv.name}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    pv.isCurrentlyInScope
                      ? pv.isModified
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : isDark
                        ? 'bg-[#111722] border-slate-800 hover:border-amber-500/50'
                        : 'bg-white border-amber-200 hover:border-amber-400 shadow-xs'
                      : isDark
                      ? 'bg-[#0B0F15] border-slate-800/80 opacity-75'
                      : 'bg-slate-100/80 border-slate-200 opacity-75'
                  }`}
                >
                  {/* Left: Pin icon + Name + Scope Status */}
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => togglePin(pv.name)}
                      className="p-1 text-amber-500 hover:text-rose-500 rounded transition-colors cursor-pointer"
                      title="Unpin from watchlist"
                    >
                      <Pin className="w-3.5 h-3.5 fill-amber-400" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                          {pv.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({pv.type})
                        </span>
                        {pv.isModified && pv.isCurrentlyInScope && (
                          <span className="text-[9px] font-extrabold px-1 rounded bg-amber-500 text-slate-950 animate-pulse">
                            UPDATED
                          </span>
                        )}
                      </div>

                      {/* Scope Status Badge */}
                      <div className="flex items-center gap-1 text-[10px] mt-0.5 font-mono">
                        {pv.isCurrentlyInScope ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {pv.lastScopeName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Last: {pv.lastScopeName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Value badge */}
                  <div className="flex items-center gap-1.5 pl-2">
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    {renderValueBadge(pv.type, pv.lastKnownValue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CALL STACK SECTION (LIFO FRAMES) */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Call Stack (LIFO Frames)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {stackFrames.length} {stackFrames.length === 1 ? 'frame active' : 'frames active'}
            </span>
          </div>

          {/* Stack Frames (Top frame is current active execution context) */}
          <div className="space-y-2.5">
            {stackFrames.map((frame, frameIdx) => {
              const isTop = frameIdx === stackFrames.length - 1;
              const varEntries = Object.entries(frame.variables || {}) as [string, VariableValue][];

              return (
                <div
                  key={frame.id || frameIdx}
                  className={`rounded-xl border transition-all duration-200 ${
                    isTop
                      ? isDark
                        ? 'bg-[#161E27] border-blue-500/40 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20'
                        : 'bg-white border-blue-300 shadow-md ring-1 ring-blue-400/20'
                      : isDark
                      ? 'bg-[#0D1117] border-slate-800 opacity-90'
                      : 'bg-slate-50 border-slate-200 opacity-90'
                  }`}
                >
                  {/* Frame Header */}
                  <div
                    className={`px-3 py-2 border-b flex items-center justify-between text-xs font-mono rounded-t-xl ${
                      isTop
                        ? isDark
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-300 font-bold'
                          : 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400 font-semibold'
                        : 'bg-slate-100 border-slate-200 text-slate-600 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isTop ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{frame.functionName}</span>
                      {isTop && (
                        <span className="text-[10px] font-sans font-semibold px-2 py-0.2 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
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
                        No local variables allocated in this frame yet.
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
                                ? isDark
                                  ? 'bg-blue-500/15 border-blue-500/40 shadow-sm'
                                  : 'bg-blue-50 border-blue-300 shadow-sm'
                                : isDark
                                ? 'bg-[#0A0E14] border-slate-800/80 hover:border-slate-700'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Pin Toggle Button */}
                              <button
                                onClick={() => togglePin(varName)}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  isPinned
                                    ? 'text-amber-500 bg-amber-500/15'
                                    : 'text-slate-400 group-hover:text-amber-500 hover:bg-amber-500/10'
                                }`}
                                title={isPinned ? `Unpin ${varName} from Watchlist` : `Pin ${varName} to Persistent Watchlist`}
                              >
                                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                              </button>

                              <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200">
                                {varObj.name || varName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                ({varObj.type})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              {renderValueBadge(varObj.type, varObj.value)}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Frame Return Value if returning */}
                    {frame.returnValue !== undefined && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs mt-1">
                        <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Return Value
                        </span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
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

        {/* ========================================================================= */}
        {/* HEAP MEMORY SECTION (DYNAMIC ALLOCATIONS & OBJECTS) */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              <Box className="w-3.5 h-3.5 text-purple-500" />
              <span>Heap Objects (Dynamic Allocations)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {heapObjects.length} {heapObjects.length === 1 ? 'object' : 'objects'}
            </span>
          </div>

          {heapObjects.length === 0 ? (
            <div className={`rounded-xl border p-4 text-center transition-colors ${
              isDark ? 'border-slate-800 bg-[#0A0E14]' : 'border-slate-200 bg-slate-50'
            }`}>
              <Database className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Heap is empty</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dynamic objects, lists, reference dictionaries, and heap allocations will render here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {heapObjects.map((obj) => {
                const isPinned = pinnedNames.includes(obj.id);

                return (
                  <div
                    key={obj.id}
                    className={`rounded-xl border p-2.5 shadow-sm space-y-1.5 transition-colors ${
                      isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-200 bg-purple-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => togglePin(obj.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isPinned ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 hover:text-amber-500'
                          }`}
                          title={isPinned ? 'Unpin heap object' : 'Pin heap object to watchlist'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                        </button>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold border border-purple-500/30">
                          {obj.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{obj.label || obj.type}</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase font-semibold">
                        {obj.type}
                      </span>
                    </div>

                    {/* Object Value representation */}
                    <div className={`p-2 rounded-lg font-mono text-xs overflow-x-auto border ${
                      isDark ? 'bg-[#0A0E14] border-slate-800 text-emerald-300' : 'bg-white border-slate-200 text-emerald-700'
                    }`}>
                      {obj.value}
                    </div>

                    {/* Properties table if any */}
                    {obj.properties && (
                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1">
                        {Object.entries(obj.properties).map(([propKey, propVal]) => (
                          <div key={propKey} className={`px-2 py-0.5 rounded flex justify-between border ${
                            isDark ? 'bg-[#0A0E14] text-slate-400 border-slate-800/60' : 'bg-white text-slate-600 border-slate-200'
                          }`}>
                            <span>{propKey}:</span>
                            <span className="text-blue-600 dark:text-cyan-300 font-semibold">{String(propVal)}</span>
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
