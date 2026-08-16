import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Check, Trash2, CheckCircle2, CircleDot } from 'lucide-react';

interface ConsolePanelProps {
  stdout: string[];
  isCompleted?: boolean;
  onClear?: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  stdout,
  isCompleted = false,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [stdout]);

  const handleCopy = () => {
    navigator.clipboard.writeText(stdout.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#121820] shadow-lg flex flex-col h-full overflow-hidden select-none">
      {/* Terminal Header */}
      <div className="h-10 px-3.5 bg-[#161E27] border-b border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">Console Output</span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Process completed successfully
            </span>
          )}

          <button
            id="console-copy-btn"
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs cursor-pointer"
            title="Copy Console Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onClear && (
            <button
              id="console-clear-btn"
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs cursor-pointer"
              title="Clear Console"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 bg-[#0A0E14] font-mono text-[12.5px] leading-relaxed overflow-y-auto space-y-1.5"
      >
        {stdout.length === 0 ? (
          <div className="text-slate-600 italic">
            $ Program output will appear here after execution starts...
          </div>
        ) : (
          stdout.map((line, idx) => {
            const isCommand = line.startsWith('$');
            const isSuccess = line.includes('completed successfully') || line.includes('exit code 0');

            return (
              <div
                key={idx}
                className={`font-mono ${
                  isCommand
                    ? 'text-blue-400 font-semibold flex items-center gap-1.5'
                    : isSuccess
                    ? 'text-emerald-400 font-semibold'
                    : 'text-emerald-300'
                }`}
              >
                {line}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer */}
      <div className="h-6 px-3 bg-[#161E27] border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>tty /dev/pts/1</span>
        <span>encoding: UTF-8</span>
      </div>
    </div>
  );
};
