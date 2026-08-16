import React from 'react';
import { Code2, CircleDot, PlayCircle } from 'lucide-react';
import { Language } from '../../types';

interface CodePanelProps {
  code: string;
  currentLine: number | null;
  language: Language;
  event?: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  currentLine,
  language,
  event,
}) => {
  const lines = code.split('\n');

  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#121820] shadow-lg flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="h-10 px-3.5 bg-[#161E27] border-b border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">Code</span>
        </div>
        {currentLine ? (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Current line: {currentLine}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">Ready to execute</span>
        )}
      </div>

      {/* Code Display Area */}
      <div className="flex-1 overflow-auto p-2.5 font-mono text-[12.5px] leading-6 bg-[#0D1117]">
        <div className="space-y-0.5">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isCurrent = currentLine === lineNum;

            return (
              <div
                key={lineNum}
                className={`flex items-center rounded-md transition-all duration-150 relative ${
                  isCurrent
                    ? 'bg-blue-500/15 border-l-2 border-blue-500'
                    : 'hover:bg-slate-800/30'
                }`}
              >
                {/* Line number gutter */}
                <div
                  className={`w-9 text-right pr-3 select-none text-[11px] font-mono shrink-0 ${
                    isCurrent ? 'text-blue-400 font-bold' : 'text-slate-600'
                  }`}
                >
                  {lineNum}
                </div>

                {/* Left blue execution arrow indicator */}
                {isCurrent && (
                  <div className="w-3 flex items-center justify-center shrink-0 -ml-1 text-blue-400">
                    <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[5px] border-l-blue-400" />
                  </div>
                )}

                {/* Code line content */}
                <div
                  className={`flex-1 pl-1 whitespace-pre truncate ${
                    isCurrent
                      ? 'text-white font-medium drop-shadow-sm'
                      : 'text-slate-300'
                  }`}
                >
                  {lineText || ' '}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
