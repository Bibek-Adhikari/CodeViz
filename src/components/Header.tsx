import React, { useState } from 'react';
import { 
  Menu,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles, 
  Search, 
  Bell, 
  Settings, 
  Code2, 
  Layers, 
  Terminal, 
  Cpu,
  BrainCircuit,
  Sun,
  Moon,
  LayoutGrid,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Tooltip } from './common/Tooltip';
import { ViewTab } from '../types';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAIExplainer: () => void;
  onOpenQuiz?: () => void;
  onOpenSettings: () => void;
  activeViewTab: ViewTab;
  setActiveViewTab: (tab: ViewTab) => void;
  isAiExplaining?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onOpenSearch,
  onOpenAIExplainer,
  onOpenQuiz,
  onOpenSettings,
  activeViewTab,
  setActiveViewTab,
  isAiExplaining = false,
}) => {
  const { toggleTheme, isDark } = useTheme();
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
    <header className="h-[3.25rem] border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0A0E14]/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none transition-colors duration-200">
      {/* Left side: Hamburger Toggle + Logo & View Tabs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sidebar Toggle Button (Explicit & Highly Visible) */}
        <Tooltip content={isSidebarOpen ? 'Close Study Materials Sidebar (⌘B)' : 'Open Study Materials Sidebar (⌘B)'} position="bottom">
          <button
            id="header-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
              isSidebarOpen
                ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/25'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
            aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span className="hidden sm:inline">Open Sidebar</span>
              </>
            )}
          </button>
        </Tooltip>

        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
            <Code2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[0.9375rem] font-bold text-slate-900 dark:text-white tracking-tight">
                CodeViz <span className="text-blue-600 dark:text-blue-400 font-semibold">Hub</span>
              </span>
              <span className="hidden md:inline-block text-[0.6875rem] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-medium border border-blue-200 dark:border-blue-500/20">
                v2.0
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Compact) */}
        <div className="hidden md:flex items-center gap-0.5 ml-2 bg-slate-100 dark:bg-slate-900/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
          <Tooltip content="Show all panels (Code, Memory & Console)" position="bottom">
            <button
              id="view-tab-all"
              onClick={() => setActiveViewTab('all')}
              className={`px-2 py-1 text-[0.75rem] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeViewTab === 'all'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          </Tooltip>

          <Tooltip content="Focus on Code Editor" position="bottom">
            <button
              id="view-tab-code"
              onClick={() => setActiveViewTab('code')}
              className={`px-2 py-1 text-[0.75rem] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeViewTab === 'code'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </Tooltip>

          <Tooltip content="Focus on Stack Frames & Heap" position="bottom">
            <button
              id="view-tab-memory"
              onClick={() => setActiveViewTab('memory')}
              className={`px-2 py-1 text-[0.75rem] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeViewTab === 'memory'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Memory</span>
            </button>
          </Tooltip>

          <Tooltip content="Interactive Algorithm & Data Structure Visualizer" position="bottom">
            <button
              id="view-tab-algorithm"
              onClick={() => setActiveViewTab('algorithm')}
              className={`px-2 py-1 text-[0.75rem] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeViewTab === 'algorithm'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Algorithms</span>
            </button>
          </Tooltip>

          <Tooltip content="Focus on Terminal Output" position="bottom">
            <button
              id="view-tab-console"
              onClick={() => setActiveViewTab('console')}
              className={`px-2 py-1 text-[0.75rem] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeViewTab === 'console'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right side: Compact Icon-First Buttons with Tooltips */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Search button */}
        <Tooltip content="Search study materials & algorithms" shortcut="⌘K" position="bottom">
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline text-[0.75rem]">Search</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 text-[0.625rem] font-mono bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
              ⌘K
            </kbd>
          </button>
        </Tooltip>

        {/* AI Step Explainer Button */}
        <Tooltip content="AI Step-by-Step Code Tutor" position="bottom">
          <button
            id="header-ai-tutor-btn"
            onClick={onOpenAIExplainer}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>
        </Tooltip>

        {/* AI Quiz Me Button */}
        {onOpenQuiz && (
          <Tooltip content="Test understanding with 3 AI Questions" position="bottom">
            <button
              id="header-quiz-me-btn"
              onClick={onOpenQuiz}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.75rem] font-semibold bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 transition-all cursor-pointer"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Quiz</span>
            </button>
          </Tooltip>
        )}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1" />

        {/* Theme Toggle Button */}
        <Tooltip content={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'} position="bottom">
          <button
            id="header-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-12 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </Tooltip>

        {/* Notifications */}
        <div className="relative">
          <Tooltip content="Notifications" position="bottom">
            <button
              id="header-notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (unreadCount > 0) setUnreadCount(0);
              }}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 dark:bg-blue-500 border-2 border-white dark:border-[#0A0E14] rounded-full" />
              )}
            </button>
          </Tooltip>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#121820] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-1.5">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      n.unread 
                        ? 'bg-blue-50/70 dark:bg-[#161E27] border border-blue-200 dark:border-blue-500/30' 
                        : 'bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200 mb-0.5">
                      <span className="text-[11.5px] font-semibold">{n.title}</span>
                      <span className="text-[9.5px] text-slate-400 dark:text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <Tooltip content="Visualizer Settings & Keybindings" position="bottom">
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Student Profile Avatar */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white dark:border-slate-700 flex items-center justify-center text-white font-bold text-[0.6875rem] shadow-xs shrink-0 ml-0.5">
          CS
        </div>
      </div>
    </header>
  );
};
