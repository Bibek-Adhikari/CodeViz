import React, { useState, useMemo } from 'react';
import {
  X,
  GitCompare,
  Columns,
  ListFilter,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  FileCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeftRight,
  ChevronRight,
  Maximize2,
  Minimize2,
  Layers,
  CornerDownRight
} from 'lucide-react';
import { Language, ExecutionProgram } from '../../types';
import { generateCodeDiff, DiffResult, DiffLine, SideBySideDiffPair } from '../../utils/diffUtils';

interface CompareVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  originalCode: string;
  program: ExecutionProgram | null;
  language: Language;
  onRevertToOriginal: () => void;
}

export const CompareVersionsModal: React.FC<CompareVersionsModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  originalCode,
  program,
  language,
  onRevertToOriginal,
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [copiedType, setCopiedType] = useState<'diff' | 'original' | 'current' | null>(null);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [confirmRevert, setConfirmRevert] = useState(false);

  // Compute diff
  const diffResult: DiffResult = useMemo(() => {
    return generateCodeDiff(originalCode, currentCode);
  }, [originalCode, currentCode]);

  if (!isOpen) return null;

  const handleCopyDiff = () => {
    const patch = diffResult.unifiedLines
      .map((l) => {
        const prefix = l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  ';
        return `${prefix}${l.content}`;
      })
      .join('\n');
    navigator.clipboard.writeText(patch);
    setCopiedType('diff');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedType('current');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalCode);
    setCopiedType('original');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleExecuteRevert = () => {
    onRevertToOriginal();
    setConfirmRevert(false);
    onClose();
  };

  const filteredSideBySide = showOnlyChanges
    ? diffResult.sideBySidePairs.filter((pair) => {
        return (
          (pair.left && pair.left.type !== 'equal') ||
          (pair.right && pair.right.type !== 'equal')
        );
      })
    : diffResult.sideBySidePairs;

  const filteredUnified = showOnlyChanges
    ? diffResult.unifiedLines.filter((l) => l.type !== 'equal')
    : diffResult.unifiedLines;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-[#121820] border border-slate-800/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-6xl h-[90vh] max-h-[850px]">
        {/* Modal Header */}
        <div className="h-14 px-5 bg-[#161E27] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Compare Code Versions
                </h3>
                {diffResult.isIdentical ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Identical
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Modified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Baseline:{' '}
                <strong className="text-slate-300">
                  {program?.title || 'Selected Program Preset'}
                </strong>{' '}
                ({language.toUpperCase()}) vs Working Copy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Side-by-Side vs Unified */}
            <div className="flex items-center bg-[#0D1117] p-1 rounded-lg border border-slate-800">
              <button
                id="diff-mode-split"
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Side-by-side split comparison"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                id="diff-mode-unified"
                onClick={() => setViewMode('unified')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'unified'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Unified inline diff view"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unified</span>
              </button>
            </div>

            <button
              id="diff-modal-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="Close Comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Statistics & Controls Toolbar */}
        <div className="h-11 px-5 bg-[#121820] border-b border-slate-800/80 flex items-center justify-between text-xs shrink-0 select-none">
          {/* Left stats pills */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono">
            <span className="text-slate-400 text-[11px] font-sans font-medium hidden sm:inline">
              Changes:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
              +{diffResult.additionsCount} added
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold">
              -{diffResult.deletionsCount} deleted
            </span>
            {diffResult.modifiedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                ~{diffResult.modifiedCount} modified
              </span>
            )}
            <span className="text-[11px] text-slate-500 hidden md:inline">
              Similarity: <strong className="text-slate-300">{diffResult.similarityPercentage}%</strong>
            </span>
          </div>

          {/* Right action tools */}
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={showOnlyChanges}
                onChange={(e) => setShowOnlyChanges(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span className="hidden sm:inline">Only show changed lines</span>
            </label>

            <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            {/* Copy Diff Button */}
            <button
              id="diff-copy-patch-btn"
              onClick={handleCopyDiff}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Git-style diff patch"
            >
              {copiedType === 'diff' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Copy Patch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diff Content View Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#0D1117]">
          {diffResult.isIdentical ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-base font-bold text-white">Codes Are Identical</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your current editor code matches the original program baseline{' '}
                  <span className="text-slate-200 font-semibold">
                    "{program?.title || 'Preset'}"
                  </span>{' '}
                  exactly. No differences found.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#161E27] border border-slate-800 text-xs font-mono text-slate-300 max-w-lg w-full text-left overflow-x-auto max-h-48">
                <pre>{currentCode}</pre>
              </div>
            </div>
          ) : viewMode === 'side-by-side' ? (
            /* ==========================================================
               SIDE-BY-SIDE (SPLIT) DIFF VIEW
               ========================================================== */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Split Column Headers */}
              <div className="grid grid-cols-2 bg-[#141A23] border-b border-slate-800/80 text-xs font-semibold select-none shrink-0">
                <div className="px-4 py-2 flex items-center justify-between border-r border-slate-800/80 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                    <span>Original Version ({program?.title || 'Baseline'})</span>
                  </div>
                  <button
                    onClick={handleCopyOriginal}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedType === 'original' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Original</span>
                  </button>
                </div>

                <div className="px-4 py-2 flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    <span>Current Working Copy (Edited)</span>
                  </div>
                  <button
                    onClick={handleCopyCurrent}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedType === 'current' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Current</span>
                  </button>
                </div>
              </div>

              {/* Split Content Scrollable Body */}
              <div className="flex-1 overflow-auto font-mono text-[12px] leading-6">
                {filteredSideBySide.map((pair, rowIdx) => {
                  const left = pair.left;
                  const right = pair.right;

                  const isLeftRemoved = left && (left.type === 'removed' || left.type === 'modified');
                  const isRightAdded = right && (right.type === 'added' || right.type === 'modified');

                  return (
                    <div
                      key={rowIdx}
                      className="grid grid-cols-2 border-b border-slate-900/60 hover:bg-[#161D27]/40 transition-colors"
                    >
                      {/* Left Column (Original) */}
                      <div
                        className={`flex border-r border-slate-800/80 min-h-[24px] ${
                          !left
                            ? 'bg-slate-900/40 text-slate-600'
                            : left.type === 'removed'
                            ? 'bg-rose-500/15 text-rose-200 border-l-2 border-l-rose-500'
                            : left.type === 'modified'
                            ? 'bg-amber-500/10 text-amber-200 border-l-2 border-l-amber-500/80'
                            : 'text-slate-300'
                        }`}
                      >
                        {/* Gutter Line Number */}
                        <div className="w-10 py-0.5 px-1.5 text-right select-none text-[11px] text-slate-600 bg-black/20 border-r border-slate-800/40 shrink-0">
                          {left?.oldLineNumber ?? ''}
                        </div>

                        {/* Sign Indicator */}
                        <div className="w-5 text-center select-none font-bold text-[11px] shrink-0 pt-0.5">
                          {left?.type === 'removed' ? (
                            <span className="text-rose-400">-</span>
                          ) : left?.type === 'modified' ? (
                            <span className="text-amber-400">~</span>
                          ) : null}
                        </div>

                        {/* Line text */}
                        <div className="px-2 py-0.5 whitespace-pre overflow-x-auto flex-1">
                          {left ? (
                            left.wordDiffs ? (
                              left.wordDiffs.map((w, widx) => (
                                <span
                                  key={widx}
                                  className={
                                    w.type === 'removed'
                                      ? 'bg-rose-500/30 text-rose-100 rounded px-0.5 underline decoration-rose-400'
                                      : ''
                                  }
                                >
                                  {w.text}
                                </span>
                              ))
                            ) : (
                              left.content || <span>&nbsp;</span>
                            )
                          ) : (
                            <span className="text-slate-700 italic select-none">···</span>
                          )}
                        </div>
                      </div>

                      {/* Right Column (Current) */}
                      <div
                        className={`flex min-h-[24px] ${
                          !right
                            ? 'bg-slate-900/40 text-slate-600'
                            : right.type === 'added'
                            ? 'bg-emerald-500/15 text-emerald-200 border-l-2 border-l-emerald-500'
                            : right.type === 'modified'
                            ? 'bg-amber-500/10 text-emerald-200 border-l-2 border-l-emerald-500/80'
                            : 'text-slate-300'
                        }`}
                      >
                        {/* Gutter Line Number */}
                        <div className="w-10 py-0.5 px-1.5 text-right select-none text-[11px] text-slate-600 bg-black/20 border-r border-slate-800/40 shrink-0">
                          {right?.newLineNumber ?? ''}
                        </div>

                        {/* Sign Indicator */}
                        <div className="w-5 text-center select-none font-bold text-[11px] shrink-0 pt-0.5">
                          {right?.type === 'added' ? (
                            <span className="text-emerald-400">+</span>
                          ) : right?.type === 'modified' ? (
                            <span className="text-emerald-400">+</span>
                          ) : null}
                        </div>

                        {/* Line text */}
                        <div className="px-2 py-0.5 whitespace-pre overflow-x-auto flex-1">
                          {right ? (
                            right.wordDiffs ? (
                              right.wordDiffs.map((w, widx) => (
                                <span
                                  key={widx}
                                  className={
                                    w.type === 'added'
                                      ? 'bg-emerald-500/30 text-emerald-100 rounded px-0.5 underline decoration-emerald-400 font-semibold'
                                      : ''
                                  }
                                >
                                  {w.text}
                                </span>
                              ))
                            ) : (
                              right.content || <span>&nbsp;</span>
                            )
                          ) : (
                            <span className="text-slate-700 italic select-none">···</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ==========================================================
               UNIFIED DIFF VIEW
               ========================================================== */
            <div className="flex-1 overflow-auto font-mono text-[12px] leading-6">
              {filteredUnified.map((line, idx) => {
                const isAdded = line.type === 'added';
                const isRemoved = line.type === 'removed';
                const isEqual = line.type === 'equal';

                return (
                  <div
                    key={idx}
                    className={`flex items-stretch border-b border-slate-900/40 hover:bg-[#161D27]/40 transition-colors ${
                      isAdded
                        ? 'bg-emerald-500/15 text-emerald-200 border-l-2 border-l-emerald-500'
                        : isRemoved
                        ? 'bg-rose-500/15 text-rose-200 border-l-2 border-l-rose-500'
                        : 'text-slate-300'
                    }`}
                  >
                    {/* Old Line Number */}
                    <div className="w-10 py-0.5 px-1.5 text-right select-none text-[11px] text-slate-600 bg-black/20 border-r border-slate-800/40 shrink-0">
                      {line.oldLineNumber ?? ''}
                    </div>

                    {/* New Line Number */}
                    <div className="w-10 py-0.5 px-1.5 text-right select-none text-[11px] text-slate-600 bg-black/20 border-r border-slate-800/40 shrink-0">
                      {line.newLineNumber ?? ''}
                    </div>

                    {/* Marker (+ / - / space) */}
                    <div className="w-6 text-center select-none font-bold text-[12px] shrink-0 pt-0.5">
                      {isAdded ? (
                        <span className="text-emerald-400">+</span>
                      ) : isRemoved ? (
                        <span className="text-rose-400">-</span>
                      ) : (
                        <span className="text-slate-600">&nbsp;</span>
                      )}
                    </div>

                    {/* Code Content */}
                    <div className="px-2 py-0.5 whitespace-pre overflow-x-auto flex-1 font-mono">
                      {line.content || <span>&nbsp;</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-14 px-5 bg-[#161E27] border-t border-slate-800/80 flex items-center justify-between shrink-0 select-none">
          <div>
            {confirmRevert ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Discard your edits and restore original?
                </span>
                <button
                  id="diff-confirm-revert-btn"
                  onClick={handleExecuteRevert}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Yes, Revert Code
                </button>
                <button
                  onClick={() => setConfirmRevert(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="diff-revert-btn"
                onClick={() => setConfirmRevert(true)}
                disabled={diffResult.isIdentical}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  diffResult.isIdentical
                    ? 'text-slate-600 bg-slate-800/40 cursor-not-allowed'
                    : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
                title="Replace your current code with the original program code"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Revert to Original Code</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="diff-close-btn"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md shadow-blue-500/20"
            >
              Done / Keep My Edits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
