import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  Maximize2, 
  Minimize2,
  ChevronDown,
  Layers,
  CircleDot
} from 'lucide-react';
import { Language, ExecutionProgram } from '../types';

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
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');

  const toggleBreakpoint = (lineNum: number) => {
    if (breakpoints.includes(lineNum)) {
      setBreakpoints(breakpoints.filter(b => b !== lineNum));
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

  // Syntax highlighting helper for code view
  const renderHighlightedLine = (text: string, lang: Language) => {
    // Basic tokenizer for syntax presentation
    if (!text.trim()) return <span>&nbsp;</span>;

    // Check for comments
    if (text.trim().startsWith('#') || text.trim().startsWith('//')) {
      return <span className="text-slate-500 italic">{text}</span>;
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
            return <span key={idx} className="text-pink-400 font-semibold">{token}</span>;
          }
          if (builtins.has(token)) {
            return <span key={idx} className="text-cyan-400 font-medium">{token}</span>;
          }
          if (/^[0-9]+$/.test(token)) {
            return <span key={idx} className="text-amber-400">{token}</span>;
          }
          if (token.startsWith('"') || token.startsWith("'") || token.endsWith('"') || token.endsWith("'")) {
            return <span key={idx} className="text-emerald-400">{token}</span>;
          }
          if (['=', '+', '-', '*', '/', '<', '>', '==', '!=', '&', '|', '!'].includes(token)) {
            return <span key={idx} className="text-cyan-300">{token}</span>;
          }
          if (['(', ')', '{', '}', '[', ']'].includes(token)) {
            return <span key={idx} className="text-slate-300 font-bold">{token}</span>;
          }
          return <span key={idx} className="text-slate-200">{token}</span>;
        })}
      </span>
    );
  };

  return (
    <div 
      ref={editorContainerRef}
      className={`rounded-xl border border-slate-800/60 bg-[#121820] shadow-xl flex flex-col overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 bg-[#121820]' : 'h-full min-h-[380px]'
      }`}
    >
      {/* Editor Header Bar */}
      <div className="h-11 px-4 bg-[#161E27] border-b border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">Code Editor</span>
          </div>

          {/* Preset Example Picker */}
          <div className="relative flex items-center">
            <select
              id="editor-preset-select"
              value={selectedProgramId}
              onChange={(e) => onSelectProgram(e.target.value)}
              className="text-xs bg-[#0D1117] text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 pr-6 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {programs.map(p => (
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
              className="text-xs bg-[#0D1117] text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1 pr-6 font-mono font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ 20</option>
              <option value="javascript">JavaScript (Node)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="editor-copy-btn"
            onClick={handleCopyCode}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            id="editor-reset-btn"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="editor-fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Prominent Blue Run/Visualize Button */}
          <button
            id="editor-run-visualize-btn"
            onClick={onRunVisualize}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            title="Run and visualize code execution step-by-step"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run / Visualize</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-[13px] leading-6 bg-[#0D1117]">
        {/* Line Numbers & Gutter Column */}
        <div className="w-12 py-3 bg-[#0D1117] border-r border-slate-800 select-none flex flex-col shrink-0 text-slate-600 text-right pr-3 font-mono">
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = currentLine === lineNum;
            const hasBreakpoint = breakpoints.includes(lineNum);

            return (
              <div
                key={lineNum}
                onClick={() => toggleBreakpoint(lineNum)}
                className={`h-6 flex items-center justify-between cursor-pointer group hover:text-slate-300 transition-colors relative ${
                  isCurrent ? 'text-blue-400 font-bold' : ''
                }`}
                title={`Line ${lineNum} - Click to toggle breakpoint`}
              >
                {/* Breakpoint Dot */}
                <span className="w-2.5 h-2.5 flex items-center justify-center">
                  {hasBreakpoint ? (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500/0 group-hover:bg-rose-500/40 transition-colors" />
                  )}
                </span>

                {/* Line Number */}
                <span className="text-[12px]">{lineNum}</span>

                {/* Gutter active indicator arrow */}
                {isCurrent && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-blue-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Code Content & Overlay Layer */}
        <div className="flex-1 relative overflow-auto p-3">
          {/* Active Line Highlight Background */}
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = currentLine === lineNum;
            if (!isCurrent) return null;

            return (
              <div
                key={`highlight-${lineNum}`}
                className="absolute left-0 right-0 h-6 bg-blue-500/15 border-l-2 border-blue-500 pointer-events-none z-0"
                style={{ top: `${idx * 24 + 12}px` }}
              />
            );
          })}

          {/* Interactive Textarea & Code Renderer */}
          <div className="relative z-10">
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isCurrent = currentLine === lineNum;

              return (
                <div
                  key={idx}
                  className={`h-6 flex items-center whitespace-pre px-2 transition-colors ${
                    isCurrent ? 'text-white font-medium drop-shadow-sm' : 'text-slate-300'
                  }`}
                >
                  {renderHighlightedLine(lineText, language)}
                </div>
              );
            })}
          </div>

          {/* Transparent editable textarea directly synced */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="absolute inset-0 p-3 pl-5 bg-transparent text-transparent caret-blue-400 resize-none font-mono text-[13px] leading-6 focus:outline-none z-20 whitespace-pre overflow-hidden"
            style={{ tabSize: 4 }}
          />
        </div>
      </div>

      {/* Editor Footer Info */}
      <div className="h-6 px-4 bg-[#161E27] border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span>Lines: {lines.length}</span>
          <span>Chars: {code.length}</span>
          {currentLine && (
            <span className="text-blue-400 font-semibold flex items-center gap-1">
              <CircleDot className="w-3 h-3 text-blue-400" />
              Exec Line: {currentLine}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>Tab: 4 spaces</span>
          <span className="text-slate-400">{language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
