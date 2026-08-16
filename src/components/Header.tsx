import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Bell, 
  Settings, 
  BookOpen, 
  Code2, 
  Layers, 
  Terminal, 
  HelpCircle,
  CheckCircle2,
  Cpu,
  GraduationCap,
  BrainCircuit,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAIExplainer: () => void;
  onOpenQuiz?: () => void;
  onOpenSettings: () => void;
  activeViewTab: 'all' | 'code' | 'memory' | 'console';
  setActiveViewTab: (tab: 'all' | 'code' | 'memory' | 'console') => void;
  isAiExplaining?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAIExplainer,
  onOpenQuiz,
  onOpenSettings,
  activeViewTab,
  setActiveViewTab,
  isAiExplaining = false,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: 1,
      title: 'CS101 Assignment 3 Ready',
      desc: 'Stack frames visualization pack added to study materials.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Memory Pointer Analysis',
      desc: 'New interactive C++ memory diagram available.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Execution Engine Updated',
      desc: 'Added support for JavaScript lexical closures & heap scopes.',
      time: 'Yesterday',
      unread: false,
    },
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800/60 bg-white/90 dark:bg-[#0A0E14]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none transition-colors duration-200">
      {/* Left side: Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                CodeViz <span className="text-blue-600 dark:text-blue-500 font-medium">Hub</span>
              </h1>
              <span className="hidden sm:inline-block text-xs text-slate-300 dark:text-slate-600">|</span>
              <h2 className="hidden sm:inline-block text-xs font-semibold text-slate-600 dark:text-slate-300">Code Visualizer</h2>
            </div>
            <p className="hidden md:block text-[10px] text-slate-500 italic leading-none mt-0.5">
              Understand your code, one step at a time.
            </p>
          </div>
        </div>

        {/* View Layout Tabs */}
        <div className="hidden lg:flex items-center gap-1 ml-3 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800/60 transition-colors">
          <button
            id="view-tab-all"
            onClick={() => setActiveViewTab('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeViewTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Workspace
          </button>
          <button
            id="view-tab-memory"
            onClick={() => setActiveViewTab('memory')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeViewTab === 'memory'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Memory Stack
          </button>
          <button
            id="view-tab-console"
            onClick={() => setActiveViewTab('console')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeViewTab === 'console'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console Output
          </button>
        </div>
      </div>

      {/* Right side: Search, AI Tutor, Theme Toggle, Notifications, Settings, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Search trigger */}
        <button
          id="header-search-btn"
          onClick={onOpenSearch}
          className="flex items-center bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
          title="Search code examples & study materials (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="hidden sm:inline text-slate-600 dark:text-slate-300">Search study materials...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700/60 ml-2 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* AI Step Explainer Button */}
        <button
          id="header-ai-tutor-btn"
          onClick={onOpenAIExplainer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-xs transition-all cursor-pointer"
          title="Open AI Code Tutor for in-depth step analysis"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">AI Step Tutor</span>
        </button>

        {/* AI Quiz Me Button */}
        {onOpenQuiz && (
          <button
            id="header-quiz-me-btn"
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/15 dark:to-orange-500/15 hover:bg-amber-100 dark:hover:from-amber-500/25 dark:hover:to-orange-500/25 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Generate a 3-question AI quiz to test understanding of current logic flow"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>Quiz Me</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800/80 pl-2.5">
          {/* Quick Theme Toggle Button */}
          <button
            id="header-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-12 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (unreadCount > 0) setUnreadCount(0);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 dark:bg-blue-500 border-2 border-white dark:border-[#0A0E14] rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121820] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs transition-colors ${
                        n.unread 
                          ? 'bg-blue-50/70 dark:bg-[#161E27] border border-blue-200 dark:border-blue-500/30' 
                          : 'bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200 mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings button */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            title="Visualizer Settings & Theme"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Student Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white font-semibold text-xs shadow-md">
            AC
          </div>
        </div>
      </div>
    </header>
  );
};
