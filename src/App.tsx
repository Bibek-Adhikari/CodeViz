import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  SAMPLE_PROGRAMS 
} from './data/samplePrograms';
import { 
  INITIAL_STUDY_MATERIALS 
} from './data/sampleMaterials';
import { 
  Language, 
  ExecutionProgram, 
  ExecutionStep, 
  StudyMaterial 
} from './types';
import { generateExecutionSteps } from './utils/codeInterpreter';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { ExecutionControls } from './components/ExecutionControls';
import { ExecutionTimeline } from './components/ExecutionTimeline';
import { MemoryStatePanel } from './components/panels/MemoryStatePanel';
import { ConsolePanel } from './components/panels/ConsolePanel';
import { PdfViewerModal } from './components/modals/PdfViewerModal';
import { ImagePreviewModal } from './components/modals/ImagePreviewModal';
import { AIExplainerModal } from './components/modals/AIExplainerModal';
import { SearchModal } from './components/modals/SearchModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AIQuizModal } from './components/modals/AIQuizModal';
import { useTheme } from './context/ThemeContext';
import { LayoutGrid, Code2, Cpu, Terminal, PanelLeft } from 'lucide-react';

export default function App() {
  const { isDark } = useTheme();

  // Programs & Code state
  const [programs] = useState<ExecutionProgram[]>(SAMPLE_PROGRAMS);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(SAMPLE_PROGRAMS[0].id);
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];

  const [code, setCode] = useState<string>(currentProgram.code);
  const [language, setLanguage] = useState<Language>(currentProgram.language);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(currentProgram.steps);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3); // Initialized to Step 4 (index 3)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [execStatus, setExecStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('running');

  // Persistent Pinned Variables Watchlist
  const [pinnedVarNames, setPinnedVarNames] = useState<string[]>(['x', 'y', 'z']);

  // Study Materials state
  const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_STUDY_MATERIALS);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  // Responsive Sidebar State: open on desktop by default, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAIExplainerOpen, setIsAIExplainerOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'code' | 'memory' | 'console'>('all');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTogglePinVariable = (varName: string) => {
    setPinnedVarNames((prev) =>
      prev.includes(varName) ? prev.filter((v) => v !== varName) : [...prev, varName]
    );
  };

  // Sync program changes
  const handleSelectProgram = (programId: string) => {
    const prog = programs.find(p => p.id === programId);
    if (prog) {
      setSelectedProgramId(programId);
      setCode(prog.code);
      setLanguage(prog.language);
      setExecutionSteps(prog.steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setExecStatus('idle');
    }
  };

  // Re-run visualization
  const handleRunVisualize = () => {
    let steps: ExecutionStep[];
    if (code.trim() === currentProgram.code.trim()) {
      steps = currentProgram.steps;
    } else {
      steps = generateExecutionSteps(code, language);
    }

    setExecutionSteps(steps);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setExecStatus('running');
  };

  // Step Forward
  const handleStepForward = () => {
    if (currentStepIndex < executionSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (nextIdx === executionSteps.length - 1) {
        setExecStatus('completed');
        setIsPlaying(false);
        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#3b82f6', '#06b6d4', '#10b981']
          });
        } catch {
          // ignore
        }
      } else {
        setExecStatus('running');
      }
    }
  };

  // Step Backward
  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setIsPlaying(false);
      setExecStatus('paused');
    }
  };

  // Reset
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setExecStatus('idle');
  };

  // Export Execution Trace as JSON for offline study
  const handleExportTrace = () => {
    const stepsToExport = executionSteps.length > 0 ? executionSteps : currentProgram.steps;
    const currentProgTitle = currentProgram?.title || 'Execution Trace';

    const traceData = {
      app: 'CodeViz Study Hub',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      program: {
        id: selectedProgramId,
        title: currentProgTitle,
        language: language,
        complexity: currentProgram?.complexity || { time: 'O(N)', space: 'O(N)' },
        totalSteps: stepsToExport.length,
        code: code,
      },
      currentStepIndex: currentStepIndex,
      trace: stepsToExport.map((step, idx) => ({
        stepIndex: idx,
        stepNumber: idx + 1,
        line: step.line,
        event: step.event,
        explanation: step.explanation,
        callStack: step.callStack,
        heap: step.heap,
        stdout: step.stdout,
        highlightVariables: step.highlightVariables || [],
      })),
    };

    const blob = new Blob([JSON.stringify(traceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    const sanitizedTitle = currentProgTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadAnchor.href = url;
    downloadAnchor.download = `execution-trace-${sanitizedTitle}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  // Toggle Auto-play
  const handleTogglePlay = () => {
    if (currentStepIndex >= executionSteps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setExecStatus('running');
    } else {
      setIsPlaying(!isPlaying);
      setExecStatus(!isPlaying ? 'running' : 'paused');
    }
  };

  // Auto-play interval timer
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(250, 1500 / speed);
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < executionSteps.length - 1) {
          handleStepForward();
        } else {
          setIsPlaying(false);
          setExecStatus('completed');
        }
      }, delay);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, executionSteps.length, speed]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['TEXTAREA', 'INPUT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepBack();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, executionSteps.length, isPlaying]);

  // Upload handling for Study Materials
  const handleUploadFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: StudyMaterial[] = [];
    Array.from(files).forEach((file, idx) => {
      const isPdf = file.name.endsWith('.pdf') || file.type.includes('pdf');
      const isImage = file.type.startsWith('image/');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

      newItems.push({
        id: `custom-file-${Date.now()}-${idx}`,
        title: file.name,
        type: isPdf ? 'pdf' : 'image',
        size: `${sizeMB || '0.5'} MB`,
        category: isPdf ? 'Lectures' : 'Diagrams',
        uploadDate: 'Just now',
        pageCount: isPdf ? 5 : undefined,
        dimensions: isImage ? '1920 × 1080 px' : undefined,
        url: isImage ? URL.createObjectURL(file) : undefined,
        summary: `Uploaded study resource "${file.name}" ready for inspection and reference beside code.`,
        samplePages: isPdf ? [
          {
            pageNum: 1,
            heading: file.name.replace('.pdf', ''),
            text: 'Uploaded course notes and execution diagrams for active study session.',
            keyPoints: [
              'Custom uploaded study material.',
              'Referenced alongside current code execution model.'
            ]
          }
        ] : undefined
      });
    });

    setMaterials([...newItems, ...materials]);
    if (newItems.length > 0) {
      setSelectedMaterial(newItems[0]);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    if (selectedMaterial?.id === id) {
      setSelectedMaterial(null);
    }
  };

  const currentStep = executionSteps[currentStepIndex] || executionSteps[0];
  const currentLine = currentStep ? currentStep.line : null;

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none transition-colors duration-200 ${
      isDark ? 'bg-[#0A0E14] text-slate-300' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Top Application Header with Hamburger Sidebar Toggle */}
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIExplainer={() => setIsAIExplainerOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeViewTab={activeViewTab}
        setActiveViewTab={setActiveViewTab}
      />

      {/* Main Workspace Layout Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Drawer */}
        <Sidebar
          materials={materials}
          selectedMaterial={selectedMaterial}
          onSelectMaterial={(mat) => setSelectedMaterial(mat)}
          onUploadFiles={handleUploadFiles}
          onDeleteMaterial={handleDeleteMaterial}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Docked Left Edge Toggle Button when Sidebar is Collapsed */}
        {!isSidebarOpen && (
          <button
            id="workspace-open-sidebar-edge-btn"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-0 top-[4.5rem] z-30 flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-r-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md border-y border-r border-blue-400/50 transition-all cursor-pointer group active:scale-95 animate-in fade-in slide-in-from-left-2 duration-200"
            title="Open Study Library & Materials (⌘B)"
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Study Library</span>
          </button>
        )}

        {/* Primary Workspace: Expands to 100% width when sidebar is collapsed */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3 sm:p-4 gap-3 sm:gap-3.5">
          {/* Mobile Tab Bar (< md screens) */}
          <div className="flex md:hidden items-center justify-between bg-white dark:bg-[#121820] p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
            <button
              onClick={() => setActiveViewTab('all')}
              className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeViewTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setActiveViewTab('code')}
              className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeViewTab === 'code'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setActiveViewTab('memory')}
              className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeViewTab === 'memory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>Memory</span>
            </button>
            <button
              onClick={() => setActiveViewTab('console')}
              className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeViewTab === 'console'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Console</span>
            </button>
          </div>

          {/* Section 1: Code Editor & Execution Controls */}
          {(activeViewTab === 'all' || activeViewTab === 'code') && (
            <div className="flex flex-col gap-2.5 shrink-0">
              {/* Code Editor Container */}
              <div className="min-h-[17rem] h-[32vh] max-h-[26rem]">
                <CodeEditor
                  code={code}
                  onChangeCode={setCode}
                  language={language}
                  onChangeLanguage={setLanguage}
                  currentLine={currentLine}
                  onRunVisualize={handleRunVisualize}
                  onReset={handleReset}
                  programs={programs}
                  selectedProgramId={selectedProgramId}
                  onSelectProgram={handleSelectProgram}
                  isRunning={isPlaying}
                />
              </div>

              {/* Compact Execution Controls Bar */}
              <ExecutionControls
                currentStepIndex={currentStepIndex}
                totalSteps={executionSteps.length}
                isPlaying={isPlaying}
                speed={speed}
                onStepBack={handleStepBack}
                onStepForward={handleStepForward}
                onTogglePlay={handleTogglePlay}
                onReset={handleReset}
                onChangeSpeed={setSpeed}
                onExportTrace={handleExportTrace}
                onOpenQuiz={() => setIsQuizOpen(true)}
                status={execStatus}
                currentLine={currentLine}
                stepExplanation={currentStep?.explanation}
                programs={programs}
                selectedProgramId={selectedProgramId}
                onSelectProgram={handleSelectProgram}
              />
            </div>
          )}

          {/* Section 2: Visualization Panels (Memory Stack & Heap + Console Output) */}
          {(activeViewTab === 'all' || activeViewTab === 'memory' || activeViewTab === 'console') && (
            <div className="flex-1 flex flex-col gap-2.5 min-h-[22rem]">
              {/* Memory Stack & Console Output Panels Grid */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[19rem]">
                {/* Panel 1: Memory State */}
                {(activeViewTab === 'all' || activeViewTab === 'memory') && (
                  <div
                    className={`h-full min-h-[18rem] ${
                      activeViewTab === 'all'
                        ? 'lg:col-span-7 xl:col-span-8'
                        : 'lg:col-span-12'
                    }`}
                  >
                    <MemoryStatePanel
                      stackFrames={currentStep?.callStack || []}
                      heapObjects={currentStep?.heap || []}
                      highlightVariables={currentStep?.highlightVariables}
                      status={execStatus === 'running' || isPlaying ? 'Running' : execStatus === 'completed' ? 'Completed' : 'Paused'}
                      pinnedVarNames={pinnedVarNames}
                      onTogglePinVariable={handleTogglePinVariable}
                    />
                  </div>
                )}

                {/* Panel 2: Console Output */}
                {(activeViewTab === 'all' || activeViewTab === 'console') && (
                  <div
                    className={`h-full min-h-[18rem] ${
                      activeViewTab === 'all'
                        ? 'lg:col-span-5 xl:col-span-4'
                        : 'lg:col-span-12'
                    }`}
                  >
                    <ConsolePanel
                      stdout={currentStep?.stdout || []}
                      isCompleted={currentStepIndex === executionSteps.length - 1}
                      onClear={() => {
                        const updated = [...executionSteps];
                        if (updated[currentStepIndex]) {
                          updated[currentStepIndex].stdout = [];
                          setExecutionSteps(updated);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Horizontal Execution Timeline */}
              <div className="shrink-0 pt-0.5">
                <ExecutionTimeline
                  steps={executionSteps}
                  currentStepIndex={currentStepIndex}
                  onSelectStep={(idx) => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                    setExecStatus(idx === executionSteps.length - 1 ? 'completed' : 'paused');
                  }}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Study Material PDF Viewer Modal */}
      <PdfViewerModal
        material={selectedMaterial?.type === 'pdf' ? selectedMaterial : null}
        onClose={() => setSelectedMaterial(null)}
      />

      {/* Study Material Image Preview Modal */}
      <ImagePreviewModal
        material={selectedMaterial?.type === 'image' ? selectedMaterial : null}
        onClose={() => setSelectedMaterial(null)}
      />

      {/* AI Code Explainer Tutor Modal */}
      <AIExplainerModal
        isOpen={isAIExplainerOpen}
        onClose={() => setIsAIExplainerOpen(false)}
        currentStep={currentStep}
        program={currentProgram}
        onOpenQuiz={() => setIsQuizOpen(true)}
      />

      {/* AI 3-Question Code & Logic Quiz Modal */}
      <AIQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        code={code}
        language={language}
        program={currentProgram}
        currentStep={currentStep}
        totalSteps={executionSteps.length}
      />

      {/* Global Search Command Palette */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        programs={programs}
        materials={materials}
        onSelectProgram={handleSelectProgram}
        onSelectMaterial={(mat) => setSelectedMaterial(mat)}
      />

      {/* Workspace Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
