import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2,
  ChevronDown,
  CircleDot,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Wrench,
  X,
  ArrowRight,
  GitCompare
} from 'lucide-react';
import { Language, ExecutionProgram } from '../types';
import { validateSyntax, SyntaxErrorDetail } from '../utils/syntaxValidator';
import { CompareVersionsModal } from './modals/CompareVersionsModal';
import { useTheme } from '../context/ThemeContext';

interface CodeEditorProps {
  code: string;
  onChangeCode: (newCode: string) => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  currentLine: number | null;
  onRunVisualize: () => void;
  onReset: () => void;
  programs: ExecutionProgram[];
  selectedProgramId: string;
  onSelectProgram: (programId: string) => void;
  isRunning?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  language,
  onChangeLanguage,
  currentLine,
  onRunVisualize,
  onReset,
  programs,
  selectedProgramId,
  onSelectProgram,
  isRunning = false,
}) => {
  const { isDark } = useTheme();
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredErrorLine, setHoveredErrorLine] = useState<number | null>(null);
  const [pinnedErrorLine, setPinnedErrorLine] = useState<number | null>(null);
  const [activeFixLine, setActiveFixLine] = useState<number | null>(null);
  const [syntaxWarningBanner, setSyntaxWarningBanner] = useState<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorBodyRef = useRef<HTMLDivElement>(null);

  const originalProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) || null,
    [programs, selectedProgramId]
  );
  const originalCode = originalProgram?.code || '';
  const isModified = code.trim() !== originalCode.trim();

  const handleRevertToOriginal = () => {
    if (originalCode) {
      onChangeCode(originalCode);
    }
  };

  const lines = useMemo(() => code.split('\n'), [code]);

  // Real-time syntax validation
  const syntaxErrors = useMemo(() => {
    return validateSyntax(code, language);
  }, [code, language]);

  // Group errors by line number (1-indexed)
  const errorsByLine = useMemo(() => {
    const map: Record<number, SyntaxErrorDetail[]> = {};
    syntaxErrors.forEach((err) => {
      if (!map[err.line]) map[err.line] = [];
      map[err.line].push(err);
    });
    return map;
  }, [syntaxErrors]);

  const activeErrorLine = pinnedErrorLine ?? hoveredErrorLine;
  const activeErrors = activeErrorLine ? errorsByLine[activeErrorLine] || [] : [];

  const toggleBreakpoint = (lineNum: number) => {
    if (breakpoints.includes(lineNum)) {
      setBreakpoints(breakpoints.filter((b) => b !== lineNum));
    } else {
      setBreakpoints([...breakpoints, lineNum]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Detect which line is hovered by mouse coordinates on the textarea
  const handleMouseMoveTextarea = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (pinnedErrorLine) return; // don't override pinned modal
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top + e.currentTarget.scrollTop - 12; // 12px top padding
    const lineIdx = Math.floor(offsetY / 24); // 24px line-height (leading-6)
    const lineNum = lineIdx + 1;

    if (lineNum >= 1 && lineNum <= lines.length && errorsByLine[lineNum]) {
      setHoveredErrorLine(lineNum);
    } else if (hoveredErrorLine !== null && !errorsByLine[lineNum]) {
      setHoveredErrorLine(null);
    }
  };

  const handleMouseLeaveEditor = () => {
    if (!pinnedErrorLine) {
      setHoveredErrorLine(null);
    }
  };

  // Quick auto-fix helper
  const handleApplyFix = (err: SyntaxErrorDetail) => {
    const lineIdx = err.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) return;

    const lineContent = lines[lineIdx];
    let fixedLine = lineContent;

    if (err.rule === 'missing-colon') {
      fixedLine = lineContent.trimEnd() + ':';
    } else if (err.rule === 'missing-semicolon') {
      fixedLine = lineContent.trimEnd() + ';';
    } else if (err.rule === 'invalid-keyword-python' && lineContent.includes('elseif')) {
      fixedLine = lineContent.replace(/\belseif\b/, 'elif');
    } else if (err.rule === 'invalid-keyword-python' && lineContent.includes('function')) {
      fixedLine = lineContent.replace(/\bfunction\b/, 'def');
    } else if (err.rule === 'invalid-declaration-python') {
      fixedLine = lineContent.replace(/^(let|const|var)\s+/, '');
    } else if (err.rule === 'python-case-sensitivity') {
      fixedLine = lineContent
        .replace(/\btrue\b/g, 'True')
        .replace(/\bfalse\b/g, 'False')
        .replace(/\bnull\b/g, 'None')
        .replace(/\bnone\b/g, 'None');
    } else if (err.rule === 'missing-function-parens') {
      fixedLine = lineContent.replace(':', '():');
    } else if (err.rule === 'unterminated-string') {
      fixedLine = lineContent + (lineContent.includes('"') ? '"' : "'");
    } else if (err.rule === 'invalid-keyword-js' && lineContent.includes('def ')) {
      fixedLine = lineContent.replace(/^(\s*)def\s+/, '$1function ');
    } else if (err.rule === 'invalid-keyword-js' && lineContent.includes('elif')) {
      fixedLine = lineContent.replace(/\belif\b/, 'else if');
    }

    const newLines = [...lines];
    newLines[lineIdx] = fixedLine;
    onChangeCode(newLines.join('\n'));

    setActiveFixLine(err.line);
    setTimeout(() => {
      setActiveFixLine(null);
      setPinnedErrorLine(null);
      setHoveredErrorLine(null);
    }, 800);
  };

  const handleRunClick = () => {
    if (syntaxErrors.length > 0) {
      setSyntaxWarningBanner(`Found ${syntaxErrors.length} syntax ${syntaxErrors.length === 1 ? 'error' : 'errors'}. Offending Line ${syntaxErrors[0].line}: ${syntaxErrors[0].message}`);
      setPinnedErrorLine(syntaxErrors[0].line);
      setTimeout(() => {
        setSyntaxWarningBanner(null);
      }, 5000);
      return;
    }
    setSyntaxWarningBanner(null);
    setPinnedErrorLine(null);
    onRunVisualize();
  };

  // Syntax highlighting helper for code view
  const renderHighlightedLine = (text: string, lang: Language) => {
    if (!text.trim()) return <span>&nbsp;</span>;

    // Check for comments
    if (text.trim().startsWith('#') || text.trim().startsWith('//')) {
      return (
        <span className={isDark ? "text-slate-500 italic" : "text-emerald-700/80 italic font-medium"}>
          {text}
        </span>
      );
    }

    // Split words and retain tokens
    const tokens = text.split(/(\s+|[()[\]{},.:;+\-*/=<>!&|"'`])/g);

    const keywords = new Set([
      'def', 'return', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'in',
      'function', 'let', 'const', 'var', 'public', 'static', 'void', 'int', 'float', 'double',
      'String', 'new', 'include', 'using', 'namespace', 'cout', 'endl', 'true', 'false', 'True', 'False',
      'null', 'None', 'undefined', 'this'
    ]);

    const builtins = new Set([
      'print', 'len', 'range', 'append', 'System.out.println', 'console.log', 'main', 'add_numbers', 'factorial'
    ]);

    return (
      <span>
        {tokens.map((token, idx) => {
          if (!token) return null;
          if (keywords.has(token)) {
            return (
              <span 
                key={idx} 
                className={isDark ? "text-pink-400 font-semibold" : "text-purple-700 font-bold"}
              >
                {token}
              </span>
            );
          }
          if (builtins.has(token)) {
            return (
              <span 
                key={idx} 
                className={isDark ? "text-cyan-400 font-medium" : "text-blue-700 font-semibold"}
              >
                {token}
              </span>
            );
          }
          if (/^[0-9]+$/.test(token)) {
            return (
              <span 
                key={idx} 
                className={isDark ? "text-amber-400" : "text-amber-800 font-semibold"}
              >
                {token}
              </span>
            );
          }
          if (token.startsWith('"') || token.startsWith("'") || token.endsWith('"') || token.endsWith("'")) {
            return (
              <span 
                key={idx} 
                className={isDark ? "text-emerald-400" : "text-emerald-700 font-medium"}
              >
                {token}
              </span>
            );
          }
          if (['=', '+', '-', '*', '/', '<', '>', '==', '!=', '&', '|', '!'].includes(token)) {
            return (
              <span 
                key={idx} 
                className={isDark ? "text-cyan-300" : "text-indigo-600 font-bold"}
              >
                {token}
              </span>
            );
          }
          if (['(', ')', '{', '}', '[', ']'].includes(token)) {
            return (
              <span 
                key={idx} 
                className={isDark ? "text-slate-300 font-bold" : "text-slate-700 font-bold"}
              >
                {token}
              </span>
            );
          }
          return (
            <span 
              key={idx} 
              className={isDark ? "text-slate-200" : "text-slate-900 font-medium"}
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div 
      ref={editorContainerRef}
      className={`rounded-xl border shadow-xl flex flex-col overflow-hidden transition-all duration-200 ${
        isDark 
          ? 'border-slate-800/60 bg-[#121820]' 
          : 'border-slate-200 bg-white shadow-slate-200/50'
      } ${
        isFullscreen ? (isDark ? 'fixed inset-4 z-50 bg-[#121820]' : 'fixed inset-4 z-50 bg-white') : 'h-full min-h-[380px]'
      }`}
    >
      {/* Editor Header Bar */}
      <div className={`h-11 px-4 border-b flex items-center justify-between shrink-0 transition-colors ${
        isDark ? 'bg-[#161E27] border-slate-800/60' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">Code Editor</span>
          </div>

          {/* Preset Example Picker */}
          <div className="relative flex items-center">
            <select
              id="editor-preset-select"
              value={selectedProgramId}
              onChange={(e) => onSelectProgram(e.target.value)}
              className="text-xs bg-white dark:bg-[#0D1117] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 pr-6 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs transition-colors"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.language})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Language dropdown */}
          <div className="relative hidden sm:flex items-center">
            <select
              id="editor-language-select"
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as Language)}
              className="text-xs bg-white dark:bg-[#0D1117] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 pr-6 font-mono font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs transition-colors"
            >
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ 20</option>
              <option value="javascript">JavaScript (Node)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Real-time Syntax Status Indicator */}
          {syntaxErrors.length > 0 ? (
            <button
              id="syntax-error-pill-btn"
              onClick={() => setPinnedErrorLine(pinnedErrorLine === syntaxErrors[0].line ? null : syntaxErrors[0].line)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-[11px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-all cursor-pointer shadow-xs animate-pulse"
              title="Click to view syntax errors and quick fixes"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>
                {syntaxErrors.length} {syntaxErrors.length === 1 ? 'Syntax Error' : 'Syntax Errors'} (Line {syntaxErrors[0].line})
              </span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Syntax Valid</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Compare Versions Button */}
          <button
            id="editor-compare-versions-btn"
            onClick={() => setIsCompareModalOpen(true)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer border shadow-xs ${
              isModified
                ? 'bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                : 'bg-white dark:bg-[#0D1117] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'
            }`}
            title={
              isModified
                ? 'Your code has been edited. Click to view diff vs original program baseline.'
                : 'Compare current code with original program baseline.'
            }
          >
            <GitCompare className={`w-3.5 h-3.5 ${isModified ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
            <span className="hidden sm:inline">Compare Versions</span>
            {isModified && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </button>

          <button
            id="editor-copy-btn"
            onClick={handleCopyCode}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            id="editor-reset-btn"
            onClick={onReset}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="editor-fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Prominent Run/Visualize Button */}
          <button
            id="editor-run-visualize-btn"
            onClick={handleRunClick}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-md ${
              syntaxErrors.length > 0
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-500/20'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/20'
            }`}
            title={syntaxErrors.length > 0 ? 'Fix syntax errors before execution' : 'Run and visualize code execution step-by-step'}
          >
            {syntaxErrors.length > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 fill-current text-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{syntaxErrors.length > 0 ? 'Fix Syntax' : 'Run / Visualize'}</span>
          </button>
        </div>
      </div>

      {/* Syntax Error Warning Banner */}
      {syntaxWarningBanner && (
        <div className="bg-rose-50 dark:bg-rose-500/15 border-b border-rose-200 dark:border-rose-500/30 px-4 py-2 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{syntaxWarningBanner}</span>
          </div>
          <button
            onClick={() => setSyntaxWarningBanner(null)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded text-rose-700 dark:text-rose-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div 
        ref={editorBodyRef}
        onMouseLeave={handleMouseLeaveEditor}
        className={`flex-1 relative flex overflow-hidden font-mono text-[13px] leading-6 transition-colors ${
          isDark ? 'bg-[#0D1117]' : 'bg-[#FAFBFD]'
        }`}
      >
        {/* Line Numbers & Gutter Column */}
        <div className={`w-12 py-3 select-none flex flex-col shrink-0 text-right pr-2.5 font-mono z-30 transition-colors ${
          isDark ? 'bg-[#0D1117] border-r border-slate-800 text-slate-600' : 'bg-slate-50 border-r border-slate-200 text-slate-400'
        }`}>
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = currentLine === lineNum;
            const hasBreakpoint = breakpoints.includes(lineNum);
            const lineErrors = errorsByLine[lineNum];
            const hasError = !!lineErrors && lineErrors.length > 0;

            return (
              <div
                key={lineNum}
                onClick={() => {
                  if (hasError) {
                    setPinnedErrorLine(pinnedErrorLine === lineNum ? null : lineNum);
                  } else {
                    toggleBreakpoint(lineNum);
                  }
                }}
                onMouseEnter={() => {
                  if (hasError) setHoveredErrorLine(lineNum);
                }}
                className={`h-6 flex items-center justify-between cursor-pointer group transition-colors relative ${
                  isCurrent 
                    ? (isDark ? 'text-blue-400 font-bold' : 'text-blue-600 font-bold') 
                    : hasError 
                      ? (isDark ? 'text-rose-400 font-bold' : 'text-rose-600 font-bold') 
                      : (isDark ? 'hover:text-slate-300' : 'hover:text-slate-700')
                }`}
                title={hasError ? `Line ${lineNum} Error: ${lineErrors[0].message}` : `Line ${lineNum} - Click to toggle breakpoint`}
              >
                {/* Error Icon OR Breakpoint Dot */}
                <span className="w-3 h-3 flex items-center justify-center">
                  {hasError ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                  ) : hasBreakpoint ? (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500/0 group-hover:bg-rose-500/40 transition-colors" />
                  )}
                </span>

                {/* Line Number */}
                <span className={`text-[12px] ${hasError ? 'text-rose-500 font-bold' : ''}`}>
                  {lineNum}
                </span>

                {/* Gutter active execution indicator arrow */}
                {isCurrent && (
                  <div className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent ${
                    isDark ? 'border-l-[6px] border-l-blue-400' : 'border-l-[6px] border-l-blue-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Code Content & Overlay Layer */}
        <div className="flex-1 relative overflow-auto p-3">
          {/* Line Highlights Background (Execution Current Line & Syntax Error Lines) */}
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = currentLine === lineNum;
            const lineErrors = errorsByLine[lineNum];
            const hasError = !!lineErrors && lineErrors.length > 0;
            const isHovered = hoveredErrorLine === lineNum || pinnedErrorLine === lineNum;

            if (!isCurrent && !hasError) return null;

            return (
              <div
                key={`line-bg-${lineNum}`}
                className={`absolute left-0 right-0 h-6 pointer-events-none z-0 transition-colors duration-150 ${
                  isCurrent 
                    ? (isDark ? 'bg-blue-500/15 border-l-2 border-blue-500' : 'bg-blue-100/70 border-l-2 border-blue-600') 
                    : hasError 
                      ? isHovered 
                        ? (isDark ? 'bg-rose-500/20 border-l-2 border-rose-500' : 'bg-rose-100 border-l-2 border-rose-600') 
                        : (isDark ? 'bg-rose-500/10 border-l-2 border-rose-500/60' : 'bg-rose-50 border-l-2 border-rose-500/60')
                      : ''
                }`}
                style={{ top: `${idx * 24 + 12}px` }}
              />
            );
          })}

          {/* Interactive Textarea & Code Renderer */}
          <div className="relative z-10">
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isCurrent = currentLine === lineNum;
              const lineErrors = errorsByLine[lineNum];
              const hasError = !!lineErrors && lineErrors.length > 0;

              return (
                <div
                  key={idx}
                  className={`h-6 flex items-center whitespace-pre px-2 transition-colors ${
                    isCurrent 
                      ? (isDark ? 'text-white font-medium drop-shadow-sm' : 'text-slate-950 font-semibold') 
                      : hasError 
                        ? (isDark ? 'text-slate-200' : 'text-slate-900') 
                        : (isDark ? 'text-slate-300' : 'text-slate-800')
                  }`}
                >
                  <span
                    className={
                      hasError
                        ? 'underline decoration-wavy decoration-rose-500 underline-offset-4 decoration-1 inline-block'
                        : ''
                    }
                  >
                    {renderHighlightedLine(lineText, language)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Transparent editable textarea directly synced with real-time error hover tracking */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onMouseMove={handleMouseMoveTextarea}
            spellCheck={false}
            className={`absolute inset-0 p-3 pl-5 bg-transparent text-transparent resize-none font-mono text-[13px] leading-6 focus:outline-none z-20 whitespace-pre overflow-hidden ${
              isDark ? 'caret-blue-400' : 'caret-blue-600'
            }`}
            style={{ tabSize: 4 }}
          />

          {/* Interactive Error Tooltip Floating Card */}
          {activeErrorLine && activeErrors.length > 0 && (
            <div
              id={`error-tooltip-line-${activeErrorLine}`}
              className={`absolute z-40 max-w-md w-full border rounded-xl shadow-2xl p-3.5 space-y-2.5 text-xs select-none backdrop-blur-md animate-in fade-in duration-150 ${
                isDark ? 'bg-[#161E27] border-rose-500/40 text-slate-200' : 'bg-white border-rose-300 text-slate-800 shadow-rose-900/10'
              }`}
              style={{
                top: `${Math.min(Math.max(12, (activeErrorLine - 1) * 24 + 36), (lines.length * 24) + 12)}px`,
                left: '28px',
              }}
            >
              {/* Tooltip Header */}
              <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
                    Syntax Error on Line {activeErrorLine}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    {activeErrors[0].rule}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setPinnedErrorLine(null);
                    setHoveredErrorLine(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Close Tooltip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Error Messages List */}
              <div className="space-y-2">
                {activeErrors.map((err, errIdx) => (
                  <div key={errIdx} className="space-y-2">
                    <p className={`font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {err.message}
                    </p>

                    {/* CS Learning Suggestion Card */}
                    {err.suggestion && (
                      <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                        isDark 
                          ? 'bg-[#0D1117] border-amber-500/30 text-amber-200' 
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className={`font-semibold text-[11px] block ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                            Student Tip / Suggested Fix:
                          </span>
                          <span className={`text-[11px] font-mono break-all ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {err.suggestion}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quick Fix Button */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => handleApplyFix(err)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        {activeFixLine === err.line ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Fixed!</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Apply Fix Automatically</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {language.toUpperCase()} Linter
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Footer Info */}
      <div className={`h-6 px-4 border-t flex items-center justify-between text-[10px] select-none transition-colors ${
        isDark ? 'bg-[#161E27] border-slate-800/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <span>Lines: {lines.length}</span>
          <span>Chars: {code.length}</span>
          {currentLine && (
            <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              <CircleDot className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Exec Line: {currentLine}
            </span>
          )}
          {syntaxErrors.length > 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setPinnedErrorLine(syntaxErrors[0].line)}>
              <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              {syntaxErrors.length} {syntaxErrors.length === 1 ? 'Error' : 'Errors'} Found
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              All Syntax Valid
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>Tab: 4 spaces</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{language.toUpperCase()}</span>
        </div>
      </div>

      {/* Code Version Comparison Diff Modal */}
      <CompareVersionsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        currentCode={code}
        originalCode={originalCode}
        program={originalProgram}
        language={language}
        onRevertToOriginal={handleRevertToOriginal}
      />
    </div>
  );
};
