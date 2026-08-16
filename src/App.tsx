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
import { CodePanel } from './components/panels/CodePanel';
import { MemoryStatePanel } from './components/panels/MemoryStatePanel';
import { ConsolePanel } from './components/panels/ConsolePanel';
import { PdfViewerModal } from './components/modals/PdfViewerModal';
import { ImagePreviewModal } from './components/modals/ImagePreviewModal';
import { AIExplainerModal } from './components/modals/AIExplainerModal';
import { SearchModal } from './components/modals/SearchModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { Sparkles, Layers, Cpu, Terminal, HelpCircle, Code2, AlertCircle } from 'lucide-react';

export default function App() {
  // Programs & Code state
  const [programs] = useState<ExecutionProgram[]>(SAMPLE_PROGRAMS);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(SAMPLE_PROGRAMS[0].id);
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];

  const [code, setCode] = useState<string>(currentProgram.code);
  const [language, setLanguage] = useState<Language>(currentProgram.language);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(currentProgram.steps);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3); // Initialized to Step 4 (index 3) like in prompt: "Step 4 of 6"
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [execStatus, setExecStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('running');

  // Study Materials state
  const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_STUDY_MATERIALS);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAIExplainerOpen, setIsAIExplainerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'code' | 'memory' | 'console'>('all');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    // If code matches current program preset, use its pre-computed rich steps, else generate steps
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
            particleCount: 40,
            spread: 60,
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
      // Don't intercept when typing in textareas or inputs
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
    <div className="h-screen w-screen flex flex-col bg-[#0A0E14] text-slate-300 overflow-hidden font-sans select-none">
      {/* Top Application Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIExplainer={() => setIsAIExplainerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeViewTab={activeViewTab}
        setActiveViewTab={setActiveViewTab}
      />

      {/* Main Developer Workspace: Sidebar + Center Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Study Materials */}
        <Sidebar
          materials={materials}
          selectedMaterial={selectedMaterial}
          onSelectMaterial={(mat) => setSelectedMaterial(mat)}
          onUploadFiles={handleUploadFiles}
          onDeleteMaterial={handleDeleteMaterial}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Primary Workspace Zone */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 sm:p-5 gap-4 bg-[#0A0E14]">
          {/* Top Section: Code Editor & Execution Controls */}
          <div className="grid grid-cols-1 gap-3 shrink-0">
            {/* Editor Panel */}
            <div className="min-h-[290px] h-[34vh] max-h-[420px]">
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

            {/* Execution Controls Bar */}
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
              status={execStatus}
              currentLine={currentLine}
              stepExplanation={currentStep?.explanation}
            />
          </div>

          {/* Visualization Workspace Area */}
          <div className="flex-1 flex flex-col gap-3.5 min-h-[360px]">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Execution Visualization
                </h2>
                <span className="text-[11px] text-slate-400 font-normal">
                  • Live program state
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Running
                </span>
              </div>
            </div>

            {/* Three Visualization Panels Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3.5 min-h-[280px]">
              {/* Panel 1: Code Execution */}
              <div className={`h-full ${activeViewTab === 'all' || activeViewTab === 'code' ? 'block' : 'hidden lg:block'}`}>
                <CodePanel
                  code={code}
                  currentLine={currentLine}
                  language={language}
                  event={currentStep?.event}
                />
              </div>

              {/* Panel 2: Memory State (Stack & Heap) */}
              <div className={`h-full ${activeViewTab === 'all' || activeViewTab === 'memory' ? 'block' : 'hidden lg:block'}`}>
                <MemoryStatePanel
                  stackFrames={currentStep?.callStack || []}
                  heapObjects={currentStep?.heap || []}
                  highlightVariables={currentStep?.highlightVariables}
                  status={execStatus === 'running' || isPlaying ? 'Running' : execStatus === 'completed' ? 'Completed' : 'Paused'}
                />
              </div>

              {/* Panel 3: Console Output */}
              <div className={`h-full ${activeViewTab === 'all' || activeViewTab === 'console' ? 'block' : 'hidden lg:block'}`}>
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
            </div>

            {/* Horizontal Execution Timeline */}
            <div className="shrink-0 pt-1">
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
