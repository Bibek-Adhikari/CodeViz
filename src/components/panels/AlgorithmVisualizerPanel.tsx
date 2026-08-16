import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  GitBranch, 
  BarChart3, 
  Search, 
  Layers, 
  Link2, 
  Network, 
  Workflow, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Shuffle, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Activity, 
  HelpCircle, 
  ChevronDown, 
  Plus, 
  TrendingUp, 
  Compass, 
  Code2, 
  Info,
  Maximize2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Tooltip } from '../common/Tooltip';
import { ExecutionStep, AlgorithmVisualizerMode, ArrayElementState } from '../../types';

interface AlgorithmVisualizerPanelProps {
  currentStep?: ExecutionStep;
  programId?: string;
  onSelectProgram?: (programId: string) => void;
}

export const AlgorithmVisualizerPanel: React.FC<AlgorithmVisualizerPanelProps> = ({
  currentStep,
  programId,
  onSelectProgram,
}) => {
  const { isDark } = useTheme();

  // Mode Selection
  const [activeMode, setActiveMode] = useState<AlgorithmVisualizerMode>('binary_search');
  
  // Standalone algorithm simulator state
  const [arrayData, setArrayData] = useState<number[]>([4, 12, 19, 23, 35, 42, 58, 67, 81, 95]);
  const [targetValue, setTargetValue] = useState<number>(42);
  const [customInputText, setCustomInputText] = useState<string>('4, 12, 19, 23, 35, 42, 58, 67, 81, 95');
  const [isEditingInput, setIsEditingInput] = useState<boolean>(false);
  const [sortAlgo, setSortAlgo] = useState<'bubble' | 'selection' | 'insertion' | 'quick'>('bubble');

  // Interactive standalone stepping state
  const [internalStepIdx, setInternalStepIdx] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [playSpeedMs, setPlaySpeedMs] = useState<number>(600);
  const [comparisonsCount, setComparisonsCount] = useState<number>(0);
  const [swapsCount, setSwapsCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mode based on currently selected execution program
  useEffect(() => {
    if (programId) {
      if (programId.includes('binary-search')) {
        setActiveMode('binary_search');
      } else if (programId.includes('bubble-sort') || programId.includes('sort')) {
        setActiveMode('array_sort');
      } else if (programId.includes('recursion') || programId.includes('factorial') || programId.includes('fibonacci')) {
        setActiveMode('recursion_tree');
      } else if (programId.includes('linked-list') || programId.includes('pointers') || programId.includes('heap-lists')) {
        setActiveMode('linked_list');
      } else if (programId.includes('two-pointer') || programId.includes('two-sum')) {
        setActiveMode('two_pointers');
      }
    }
  }, [programId]);

  // Extract real-time variable bindings from current execution step if available
  const executionBinding = useMemo(() => {
    if (!currentStep) return null;

    let boundArray: number[] | null = null;
    let low: number | null = null;
    let mid: number | null = null;
    let high: number | null = null;
    let i: number | null = null;
    let j: number | null = null;
    let left: number | null = null;
    let right: number | null = null;
    let target: number | null = null;

    // Search stack frames for array and pointer variables
    for (let frameIdx = currentStep.callStack.length - 1; frameIdx >= 0; frameIdx--) {
      const vars = currentStep.callStack[frameIdx].variables || {};

      // Check array / list
      for (const [key, val] of Object.entries(vars)) {
        if (Array.isArray(val.value)) {
          const numArr = (val.value as any[]).map(n => Number(n)).filter(n => !isNaN(n));
          if (numArr.length > 0) boundArray = numArr;
        } else if (typeof val.value === 'string' && val.value.startsWith('[') && val.value.endsWith(']')) {
          try {
            const parsed = JSON.parse(val.value);
            if (Array.isArray(parsed)) {
              boundArray = parsed.map(n => Number(n)).filter(n => !isNaN(n));
            }
          } catch {
            // ignore
          }
        }

        const kLower = key.toLowerCase();
        const numVal = typeof val.value === 'number' ? val.value : parseInt(String(val.value), 10);

        if (!isNaN(numVal)) {
          if (kLower === 'low' || kLower === 'l' || kLower === 'start') low = numVal;
          if (kLower === 'mid' || kLower === 'm' || kLower === 'middle') mid = numVal;
          if (kLower === 'high' || kLower === 'h' || kLower === 'end') high = numVal;
          if (kLower === 'i') i = numVal;
          if (kLower === 'j') j = numVal;
          if (kLower === 'left' || kLower === 'ptr1') left = numVal;
          if (kLower === 'right' || kLower === 'ptr2') right = numVal;
          if (kLower === 'target' || kLower === 'val' || kLower === 'key' || kLower === 'x') target = numVal;
        }
      }
    }

    return {
      boundArray,
      low,
      mid,
      high,
      i,
      j,
      left,
      right,
      target
    };
  }, [currentStep]);

  // Compute Binary Search simulator steps
  const binarySearchTrace = useMemo(() => {
    const arr = [...arrayData].sort((a, b) => a - b);
    const steps: {
      low: number;
      mid: number;
      high: number;
      foundIndex: number | null;
      statusText: string;
      comparisons: number;
    }[] = [];

    let l = 0;
    let r = arr.length - 1;
    let comps = 0;

    steps.push({
      low: l,
      mid: Math.floor((l + r) / 2),
      high: r,
      foundIndex: null,
      statusText: `Initialize search range: low = 0 (val=${arr[0]}), high = ${r} (val=${arr[r]}), target = ${targetValue}.`,
      comparisons: 0
    });

    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      comps++;
      const midVal = arr[m];

      if (midVal === targetValue) {
        steps.push({
          low: l,
          mid: m,
          high: r,
          foundIndex: m,
          statusText: `🎯 Target ${targetValue} found at index ${m}! (arr[${m}] == ${targetValue})`,
          comparisons: comps
        });
        break;
      } else if (midVal < targetValue) {
        steps.push({
          low: l,
          mid: m,
          high: r,
          foundIndex: null,
          statusText: `arr[${m}] = ${midVal} < target (${targetValue}). Discard left half, move low to mid + 1 (${m + 1}).`,
          comparisons: comps
        });
        l = m + 1;
      } else {
        steps.push({
          low: l,
          mid: m,
          high: r,
          foundIndex: null,
          statusText: `arr[${m}] = ${midVal} > target (${targetValue}). Discard right half, move high to mid - 1 (${m - 1}).`,
          comparisons: comps
        });
        r = m - 1;
      }
    }

    if (l > r && (steps.length === 0 || steps[steps.length - 1].foundIndex === null)) {
      steps.push({
        low: l,
        mid: -1,
        high: r,
        foundIndex: -1,
        statusText: `❌ Target ${targetValue} not found in array (low > high range exhausted).`,
        comparisons: comps
      });
    }

    return { arr, steps };
  }, [arrayData, targetValue]);

  // Compute Sorting Simulator steps (Bubble Sort demo)
  const sortingTrace = useMemo(() => {
    const original = [...arrayData];
    const steps: {
      arr: number[];
      comparing: [number, number] | null;
      swapped: boolean;
      sortedIndices: number[];
      explanation: string;
      comparisons: number;
      swaps: number;
    }[] = [];

    const a = [...original];
    let comps = 0;
    let totalSwaps = 0;
    const sorted: number[] = [];

    steps.push({
      arr: [...a],
      comparing: null,
      swapped: false,
      sortedIndices: [],
      explanation: `Starting ${sortAlgo.toUpperCase()} Sort on ${a.length} elements.`,
      comparisons: 0,
      swaps: 0
    });

    if (sortAlgo === 'bubble') {
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          comps++;
          const willSwap = a[j] > a[j + 1];
          if (willSwap) {
            totalSwaps++;
            const temp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = temp;
          }
          steps.push({
            arr: [...a],
            comparing: [j, j + 1],
            swapped: willSwap,
            sortedIndices: [...sorted],
            explanation: willSwap 
              ? `Swap arr[${j}] (${a[j + 1]}) and arr[${j + 1}] (${a[j]}) because ${a[j + 1]} > ${a[j]}.`
              : `Compare arr[${j}] (${a[j]}) ≤ arr[${j + 1}] (${a[j + 1]}). No swap needed.`,
            comparisons: comps,
            swaps: totalSwaps
          });
        }
        sorted.push(n - 1 - i);
      }
      sorted.push(0);
    } else if (sortAlgo === 'selection') {
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          comps++;
          if (a[j] < a[minIdx]) minIdx = j;
          steps.push({
            arr: [...a],
            comparing: [i, j],
            swapped: false,
            sortedIndices: [...sorted],
            explanation: `Scanning for minimum: comparing arr[${j}] (${a[j]}) with current min arr[${minIdx}] (${a[minIdx]}).`,
            comparisons: comps,
            swaps: totalSwaps
          });
        }
        if (minIdx !== i) {
          totalSwaps++;
          const t = a[i];
          a[i] = a[minIdx];
          a[minIdx] = t;
        }
        sorted.push(i);
        steps.push({
          arr: [...a],
          comparing: [i, minIdx],
          swapped: minIdx !== i,
          sortedIndices: [...sorted],
          explanation: `Placed minimum value ${a[i]} into sorted position at index ${i}.`,
          comparisons: comps,
          swaps: totalSwaps
        });
      }
      sorted.push(n - 1);
    }

    steps.push({
      arr: [...a],
      comparing: null,
      swapped: false,
      sortedIndices: a.map((_, idx) => idx),
      explanation: `🎉 Array fully sorted in ascending order! Total comparisons: ${comps}, swaps: ${totalSwaps}.`,
      comparisons: comps,
      swaps: totalSwaps
    });

    return steps;
  }, [arrayData, sortAlgo]);

  // Handle auto-play timer
  useEffect(() => {
    if (isAutoPlaying) {
      const maxSteps = activeMode === 'binary_search' 
        ? binarySearchTrace.steps.length 
        : sortingTrace.length;

      timerRef.current = setInterval(() => {
        setInternalStepIdx((prev) => {
          if (prev >= maxSteps - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, activeMode, binarySearchTrace, sortingTrace, playSpeedMs]);

  // Handle shuffle / randomize array
  const handleShuffleArray = () => {
    const count = 10;
    const randomized: number[] = [];
    while (randomized.length < count) {
      const val = Math.floor(Math.random() * 90) + 5;
      if (!randomized.includes(val)) randomized.push(val);
    }
    setArrayData(randomized);
    setCustomInputText(randomized.join(', '));
    setInternalStepIdx(0);
    setIsAutoPlaying(false);
    // pick a random target
    setTargetValue(randomized[Math.floor(Math.random() * randomized.length)]);
  };

  // Handle custom input submit
  const handleApplyCustomInput = () => {
    const parsed = customInputText
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (parsed.length >= 2) {
      setArrayData(parsed.slice(0, 16));
      setInternalStepIdx(0);
      setIsAutoPlaying(false);
      setIsEditingInput(false);
      if (!parsed.includes(targetValue)) {
        setTargetValue(parsed[Math.floor(parsed.length / 2)]);
      }
    }
  };

  // Render Array Visualizer Bars (for Binary Search or Sorting)
  const renderArrayCanvas = () => {
    let elements: ArrayElementState[] = [];
    let statusText = '';
    let isFound = false;

    if (activeMode === 'binary_search') {
      const { arr, steps } = binarySearchTrace;
      const current = steps[Math.min(internalStepIdx, steps.length - 1)] || steps[0];
      statusText = current.statusText;
      isFound = current.foundIndex !== null && current.foundIndex >= 0;

      const maxVal = Math.max(...arr, 1);

      elements = arr.map((val, idx) => {
        const pointers: string[] = [];
        if (idx === current.low) pointers.push('low');
        if (idx === current.mid) pointers.push('mid');
        if (idx === current.high) pointers.push('high');

        // Check if executionBinding has real-time pointers
        if (executionBinding?.low === idx) pointers.push('L_code');
        if (executionBinding?.mid === idx) pointers.push('M_code');
        if (executionBinding?.high === idx) pointers.push('H_code');

        let status: ArrayElementState['status'] = 'default';
        if (idx === current.foundIndex) {
          status = 'found';
        } else if (idx === current.mid) {
          status = 'pivot';
        } else if (idx >= current.low && idx <= current.high) {
          status = 'active_range';
        } else {
          status = 'eliminated';
        }

        return {
          value: val,
          index: idx,
          status,
          pointers
        };
      });

      return (
        <div className="space-y-4">
          {/* Status Explanation Banner */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
            isFound
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold'
              : isDark
              ? 'bg-[#151D28] border-blue-500/30 text-slate-200'
              : 'bg-blue-50/80 border-blue-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                Step {internalStepIdx + 1}/{steps.length}
              </span>
              <span className="text-xs leading-relaxed font-medium">
                {statusText}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-cyan-300 font-bold border border-blue-500/30">
                Target: {targetValue}
              </span>
            </div>
          </div>

          {/* Interactive Visual Array Bars Container */}
          <div className={`p-4 sm:p-6 rounded-xl border flex flex-col items-center justify-center min-h-[16rem] transition-colors ${
            isDark ? 'bg-[#0A0E14] border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="w-full flex items-end justify-center gap-2 sm:gap-3 h-48 px-2">
              {elements.map((el) => {
                const heightPercent = Math.max(18, Math.min(100, (el.value / Math.max(...arrayData, 100)) * 100));

                let barColor = isDark ? 'bg-blue-600/60 border-blue-500/80 text-white' : 'bg-blue-100 border-blue-300 text-blue-900';
                if (el.status === 'found') {
                  barColor = 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400';
                } else if (el.status === 'pivot') {
                  barColor = 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/30 font-bold';
                } else if (el.status === 'active_range') {
                  barColor = isDark ? 'bg-blue-500/40 border-cyan-400 text-cyan-200' : 'bg-blue-200 border-blue-400 text-blue-900';
                } else if (el.status === 'eliminated') {
                  barColor = isDark ? 'bg-slate-900/60 border-slate-800/80 text-slate-600 opacity-40' : 'bg-slate-200/70 border-slate-300 text-slate-400 opacity-40';
                }

                return (
                  <div key={el.index} className="flex-1 max-w-[3.5rem] flex flex-col items-center h-full justify-end group">
                    {/* Top Pointer Badges */}
                    <div className="h-6 flex items-center justify-center gap-0.5 mb-1">
                      {el.pointers?.map((p) => (
                        <span
                          key={p}
                          className={`text-[9px] font-mono font-extrabold px-1 py-0.2 rounded tracking-tighter uppercase shadow-xs ${
                            p === 'mid'
                              ? 'bg-amber-500 text-slate-950 animate-bounce'
                              : p === 'low'
                              ? 'bg-blue-600 text-white'
                              : p === 'high'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Bar Pillar with Dynamic Height */}
                    <div
                      className={`w-full rounded-t-lg border-t-2 border-x transition-all duration-300 flex flex-col justify-between items-center py-1.5 cursor-pointer hover:scale-105 shadow-xs ${barColor}`}
                      style={{ height: `${heightPercent}%` }}
                      onClick={() => setTargetValue(el.value)}
                      title={`Index: ${el.index}, Value: ${el.value} (Click to set as target)`}
                    >
                      <span className="font-mono text-xs font-bold leading-none">
                        {el.value}
                      </span>
                    </div>

                    {/* Index Label beneath bar */}
                    <div className="mt-2 text-center">
                      <span className="font-mono text-[10.5px] text-slate-400 font-semibold">
                        [{el.index}]
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Default: Sorting Array Visualizer (Bubble / Selection Sort)
    const currentSort = sortingTrace[Math.min(internalStepIdx, sortingTrace.length - 1)] || sortingTrace[0];
    const maxVal = Math.max(...currentSort.arr, 100);

    return (
      <div className="space-y-4">
        {/* Status Explanation Banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
          currentSort.sortedIndices.length === currentSort.arr.length
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold'
            : isDark
            ? 'bg-[#151D28] border-blue-500/30 text-slate-200'
            : 'bg-blue-50/80 border-blue-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
              Step {internalStepIdx + 1}/{sortingTrace.length}
            </span>
            <span className="text-xs leading-relaxed font-medium">
              {currentSort.explanation}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-cyan-300 font-bold border border-blue-500/30">
              Comps: {currentSort.comparisons} | Swaps: {currentSort.swaps}
            </span>
          </div>
        </div>

        {/* Visual Array Bars Container */}
        <div className={`p-4 sm:p-6 rounded-xl border flex flex-col items-center justify-center min-h-[16rem] transition-colors ${
          isDark ? 'bg-[#0A0E14] border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="w-full flex items-end justify-center gap-2 sm:gap-3 h-48 px-2">
            {currentSort.arr.map((val, idx) => {
              const heightPercent = Math.max(18, Math.min(100, (val / maxVal) * 100));
              const isComparing = currentSort.comparing && (currentSort.comparing[0] === idx || currentSort.comparing[1] === idx);
              const isSorted = currentSort.sortedIndices.includes(idx);

              let barColor = isDark ? 'bg-blue-600/60 border-blue-500 text-white' : 'bg-blue-100 border-blue-300 text-blue-900';
              if (isSorted) {
                barColor = 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30';
              } else if (isComparing) {
                barColor = currentSort.swapped
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/30';
              }

              return (
                <div key={idx} className="flex-1 max-w-[3.5rem] flex flex-col items-center h-full justify-end group">
                  <div className="h-6 flex items-center justify-center mb-1">
                    {isComparing && (
                      <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-amber-500 text-slate-950 uppercase shadow-xs">
                        {currentSort.swapped ? 'SWAP' : 'CMP'}
                      </span>
                    )}
                    {isSorted && (
                      <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-emerald-600 text-white">
                        ✓
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-full rounded-t-lg border-t-2 border-x transition-all duration-300 flex flex-col justify-between items-center py-1.5 cursor-pointer hover:scale-105 shadow-xs ${barColor}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    <span className="font-mono text-xs font-bold leading-none">
                      {val}
                    </span>
                  </div>

                  <div className="mt-2 text-center">
                    <span className="font-mono text-[10.5px] text-slate-400 font-semibold">
                      [{idx}]
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Recursion Call Tree Visualizer
  const renderRecursionTreeCanvas = () => {
    // Dynamic recursive call tree representation for Fibonacci / Factorial
    return (
      <div className="space-y-4">
        <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center justify-between ${
          isDark ? 'bg-[#151D28] border-blue-500/30 text-slate-200' : 'bg-blue-50/80 border-blue-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">
              Recursion Tree DAG
            </span>
            <span>Visualizes function call branching, parameter passing, and recursive return unwinding.</span>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
            Depth: 4 Levels
          </span>
        </div>

        {/* Tree Nodes Visual Network */}
        <div className={`p-6 rounded-xl border flex flex-col items-center justify-center min-h-[19rem] overflow-x-auto transition-colors ${
          isDark ? 'bg-[#0A0E14] border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="flex flex-col items-center gap-6 min-w-max">
            {/* Level 0: Root Call */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold shadow-lg shadow-blue-500/30 border border-blue-400 flex items-center gap-2">
                <span>fib(4)</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[10px]">ret: 3</span>
              </div>
              <div className="w-0.5 h-6 bg-slate-400 dark:bg-slate-700" />
            </div>

            {/* Level 1: fib(3) and fib(2) */}
            <div className="grid grid-cols-2 gap-16 relative">
              <div className="flex flex-col items-center">
                <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold shadow-md shadow-indigo-500/20 border border-indigo-400 flex items-center gap-1.5">
                  <span>fib(3)</span>
                  <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px]">ret: 2</span>
                </div>
                <div className="w-0.5 h-6 bg-slate-400 dark:bg-slate-700" />
              </div>

              <div className="flex flex-col items-center">
                <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold shadow-md shadow-indigo-500/20 border border-indigo-400 flex items-center gap-1.5">
                  <span>fib(2)</span>
                  <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px]">ret: 1</span>
                </div>
                <div className="w-0.5 h-6 bg-slate-400 dark:bg-slate-700" />
              </div>
            </div>

            {/* Level 2: Leaves / Sub-calls */}
            <div className="grid grid-cols-4 gap-6">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-[11px] font-bold shadow-xs border border-emerald-400 flex items-center justify-between gap-1">
                <span>fib(2)</span>
                <span className="text-[9px] bg-emerald-800 px-1 rounded">1</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-700 text-white font-mono text-[11px] font-bold shadow-xs border border-slate-600 flex items-center justify-between gap-1">
                <span>fib(1)</span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded font-extrabold">1</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-700 text-white font-mono text-[11px] font-bold shadow-xs border border-slate-600 flex items-center justify-between gap-1">
                <span>fib(1)</span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded font-extrabold">1</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-700 text-white font-mono text-[11px] font-bold shadow-xs border border-slate-600 flex items-center justify-between gap-1">
                <span>fib(0)</span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded font-extrabold">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Singly Linked List Visualizer
  const renderLinkedListCanvas = () => {
    const listNodes = [
      { id: 'node1', val: 10, next: 'node2', isHead: true, ptrs: ['HEAD', 'PREV'] },
      { id: 'node2', val: 20, next: 'node3', isHead: false, ptrs: ['CURR'] },
      { id: 'node3', val: 30, next: 'node4', isHead: false, ptrs: ['NEXT'] },
      { id: 'node4', val: 40, next: null, isHead: false, ptrs: [] },
    ];

    return (
      <div className="space-y-4">
        <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center justify-between ${
          isDark ? 'bg-[#151D28] border-blue-500/30 text-slate-200' : 'bg-blue-50/80 border-blue-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-600 text-white font-mono text-[10px] font-bold">
              Linked List Memory Chain
            </span>
            <span>Dynamic heap node pointers with pointer traversal markers.</span>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
            Size: 4 Nodes
          </span>
        </div>

        {/* Node Chain visualizer */}
        <div className={`p-6 rounded-xl border flex items-center justify-start sm:justify-center min-h-[17rem] overflow-x-auto transition-colors ${
          isDark ? 'bg-[#0A0E14] border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="flex items-center gap-3 min-w-max py-4">
            {listNodes.map((node) => (
              <div key={node.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {/* Top Pointer Tags */}
                  <div className="h-6 flex items-center gap-1 mb-1">
                    {node.ptrs.map((p) => (
                      <span
                        key={p}
                        className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded shadow-xs ${
                          p === 'HEAD'
                            ? 'bg-blue-600 text-white'
                            : p === 'CURR'
                            ? 'bg-amber-500 text-slate-950 font-extrabold animate-bounce'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Node Box with Data & Next Fields */}
                  <div className={`rounded-xl border shadow-md flex overflow-hidden ${
                    node.ptrs.includes('CURR')
                      ? 'border-amber-500 ring-2 ring-amber-400/40'
                      : isDark
                      ? 'border-purple-500/40 bg-[#161C26]'
                      : 'border-purple-300 bg-white'
                  }`}>
                    {/* Data Partition */}
                    <div className="px-3.5 py-2.5 flex flex-col items-center justify-center border-r border-slate-700/40">
                      <span className="text-[9.5px] text-slate-400 font-mono">val</span>
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {node.val}
                      </span>
                    </div>

                    {/* Next Pointer Partition */}
                    <div className="px-3 py-2.5 bg-purple-500/10 flex flex-col items-center justify-center">
                      <span className="text-[9.5px] text-purple-600 dark:text-purple-300 font-mono">next</span>
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        •
                      </span>
                    </div>
                  </div>

                  {/* Node Hex Address */}
                  <span className="text-[9.5px] font-mono text-slate-400 mt-1.5">
                    @{node.id}
                  </span>
                </div>

                {/* Arrow Connector to Next Node */}
                {node.next ? (
                  <div className="flex items-center text-purple-500">
                    <div className="w-6 sm:w-8 h-0.5 bg-purple-500" />
                    <ArrowRight className="w-4 h-4 -ml-1 text-purple-500" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 pl-1 text-xs font-mono text-rose-500 font-bold">
                    <div className="w-4 h-0.5 bg-rose-400" />
                    <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                      NULL
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Two Pointers Visualizer (Two Sum / Palindrome)
  const renderTwoPointersCanvas = () => {
    const twoPtrArray = [2, 7, 11, 15, 18, 22, 29];
    const targetSum = 25; // 7 + 18
    const leftPtr = 1; // val = 7
    const rightPtr = 4; // val = 18

    return (
      <div className="space-y-4">
        <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center justify-between ${
          isDark ? 'bg-[#151D28] border-blue-500/30 text-slate-200' : 'bg-blue-50/80 border-blue-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-600 text-white font-mono text-[10px] font-bold">
              Two Pointers
            </span>
            <span>Converging left and right pointer strategy for sorted pairs (Two Sum).</span>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
            Target Sum: {targetSum}
          </span>
        </div>

        <div className={`p-6 rounded-xl border flex flex-col items-center justify-center min-h-[16rem] transition-colors ${
          isDark ? 'bg-[#0A0E14] border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="w-full flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {twoPtrArray.map((val, idx) => {
              const isLeft = idx === leftPtr;
              const isRight = idx === rightPtr;
              const isInWindow = idx >= leftPtr && idx <= rightPtr;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  {/* Top Pointer Badge */}
                  <div className="h-6 flex items-center justify-center">
                    {isLeft && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-600 text-white shadow-xs">
                        LEFT ↑
                      </span>
                    )}
                    {isRight && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-600 text-white shadow-xs">
                        RIGHT ↑
                      </span>
                    )}
                  </div>

                  {/* Array Cell */}
                  <div className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-center font-mono font-bold transition-all ${
                    isLeft || isRight
                      ? 'bg-teal-500 text-slate-950 border-teal-400 ring-2 ring-teal-400 shadow-lg shadow-teal-500/30 scale-105'
                      : isInWindow
                      ? isDark
                        ? 'bg-[#151D28] text-slate-200 border-teal-500/30'
                        : 'bg-teal-50 text-slate-800 border-teal-200'
                      : isDark
                      ? 'bg-[#0D1117] text-slate-600 border-slate-800 opacity-40'
                      : 'bg-slate-200 text-slate-400 border-slate-300 opacity-40'
                  }`}>
                    <span className="text-sm">{val}</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-bold">
              arr[left] + arr[right] = {twoPtrArray[leftPtr]} + {twoPtrArray[rightPtr]} = 25 (TARGET MATCH!)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-xl border shadow-lg flex flex-col h-full overflow-hidden select-none transition-colors ${
      isDark ? 'border-slate-800/80 bg-[#121820]' : 'border-slate-200 bg-white'
    }`}>
      {/* Header with Mode Switcher & Execution Sync Status */}
      <div className={`px-3.5 py-2.5 border-b flex items-center justify-between flex-wrap gap-2 shrink-0 transition-colors ${
        isDark ? 'bg-[#161E27] border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Algorithm & Data Structure Visualizer
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Stepper Synced
              </span>
            </div>
          </div>
        </div>

        {/* Algorithm Modes Pills */}
        <div className={`flex items-center p-0.5 rounded-lg border text-xs font-medium ${
          isDark ? 'bg-[#0D1117] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {[
            { id: 'binary_search', label: 'Binary Search', icon: Search },
            { id: 'array_sort', label: 'Sorting', icon: BarChart3 },
            { id: 'recursion_tree', label: 'Recursion Tree', icon: Workflow },
            { id: 'linked_list', label: 'Linked List', icon: Link2 },
            { id: 'two_pointers', label: 'Two Pointers', icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveMode(tab.id as AlgorithmVisualizerMode);
                  setInternalStepIdx(0);
                  setIsAutoPlaying(false);
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visualizer Content Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors ${
        isDark ? 'bg-[#0D1117]' : 'bg-slate-50/50'
      }`}>
        {/* Interactive Algorithm Sandbox Toolbar */}
        <div className={`p-3 rounded-xl border flex items-center justify-between flex-wrap gap-2.5 transition-colors ${
          isDark ? 'bg-[#151D28] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Left: Input values & target selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeMode === 'binary_search' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Target Value:</span>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => {
                    setTargetValue(Number(e.target.value));
                    setInternalStepIdx(0);
                  }}
                  className={`w-16 px-2 py-1 font-mono text-xs rounded-lg border font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-[#0D1117] text-cyan-300 border-slate-700' : 'bg-slate-50 text-blue-900 border-slate-300'
                  }`}
                />
              </div>
            )}

            {activeMode === 'array_sort' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Algorithm:</span>
                <select
                  value={sortAlgo}
                  onChange={(e) => {
                    setSortAlgo(e.target.value as any);
                    setInternalStepIdx(0);
                  }}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-[#0D1117] text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="bubble">Bubble Sort</option>
                  <option value="selection">Selection Sort</option>
                </select>
              </div>
            )}

            {/* Randomize / Shuffle Button */}
            <button
              onClick={handleShuffleArray}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#161F2C] hover:bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Generate new random dataset"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-500" />
              <span>Randomize</span>
            </button>
          </div>

          {/* Right: Stepper & Playback Controls */}
          <div className="flex items-center gap-1.5">
            <Tooltip content="Reset visualization" position="top">
              <button
                onClick={() => setInternalStepIdx(0)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'bg-[#0D1117] text-slate-400 hover:text-white border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <Tooltip content="Step backward" position="top">
              <button
                onClick={() => setInternalStepIdx(Math.max(0, internalStepIdx - 1))}
                disabled={internalStepIdx <= 0}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 text-white transition-all shadow-xs cursor-pointer ${
                isAutoPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAutoPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <Tooltip content="Step forward" position="top">
              <button
                onClick={() => {
                  const max = activeMode === 'binary_search' 
                    ? binarySearchTrace.steps.length - 1 
                    : sortingTrace.length - 1;
                  setInternalStepIdx(Math.min(max, internalStepIdx + 1));
                }}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Speed toggle */}
            <div className={`flex items-center p-0.5 rounded-lg border text-[10.5px] font-mono ${
              isDark ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {[
                { label: '1x', ms: 700 },
                { label: '2x', ms: 350 },
                { label: '5x', ms: 150 },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setPlaySpeedMs(s.ms)}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    playSpeedMs === s.ms
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Rendering by Mode */}
        {activeMode === 'binary_search' && renderArrayCanvas()}
        {activeMode === 'array_sort' && renderArrayCanvas()}
        {activeMode === 'recursion_tree' && renderRecursionTreeCanvas()}
        {activeMode === 'linked_list' && renderLinkedListCanvas()}
        {activeMode === 'two_pointers' && renderTwoPointersCanvas()}

        {/* Complexity & Algorithm Properties Card */}
        <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs transition-colors ${
          isDark ? 'bg-[#151D28] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-1">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Time Complexity:
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {activeMode === 'binary_search' ? 'O(log N)' : activeMode === 'array_sort' ? 'O(N²)' : activeMode === 'two_pointers' ? 'O(N)' : 'O(2ᴺ)'}
            </div>
            <p className="text-[10.5px] text-slate-500">
              {activeMode === 'binary_search' 
                ? 'Halves search space in every comparison' 
                : activeMode === 'array_sort'
                ? 'Nested comparison passes through array'
                : 'Linear single-pass convergence'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-500" /> Space Complexity:
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {activeMode === 'binary_search' ? 'O(1) Auxiliary' : activeMode === 'recursion_tree' ? 'O(N) Stack' : 'O(1) In-Place'}
            </div>
            <p className="text-[10.5px] text-slate-500">
              Constant extra memory for pointers & indices
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Key Invariant:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeMode === 'binary_search' 
                ? 'If target exists, it is strictly within the closed sub-range [low ... high].'
                : activeMode === 'array_sort'
                ? 'The sub-array [N-i ... N-1] is guaranteed sorted after pass i.'
                : 'Pointers left and right bound all remaining valid candidate pairs.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
