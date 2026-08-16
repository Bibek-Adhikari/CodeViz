export type Language = 'python' | 'java' | 'cpp' | 'javascript';

export type Theme = 'dark' | 'light';

export type ViewTab = 'all' | 'code' | 'memory' | 'algorithm' | 'console';

export type VariableType = 'int' | 'float' | 'string' | 'bool' | 'list' | 'dict' | 'pointer' | 'object' | 'none';

export type AlgorithmVisualizerMode = 'array_sort' | 'binary_search' | 'two_pointers' | 'recursion_tree' | 'linked_list' | 'binary_tree' | 'graph_bfs_dfs';

export interface ArrayElementState {
  value: number;
  index: number;
  status: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'active_range' | 'found' | 'eliminated';
  pointers?: string[]; // e.g. ['low', 'mid', 'high', 'i', 'j', 'left', 'right']
}

export interface RecursionTreeNode {
  id: string;
  name: string;
  args: string;
  returnValue?: string | number;
  depth: number;
  status: 'calling' | 'active' | 'returned';
  children?: RecursionTreeNode[];
}

export interface LinkedListVisualNode {
  id: string;
  value: string | number;
  nextId: string | null;
  pointers?: string[]; // e.g. ['HEAD', 'CURR', 'PREV']
  status: 'default' | 'active' | 'modified' | 'visited';
}

export interface VariableValue {
  name: string;
  type: VariableType;
  value: string | number | boolean | Array<unknown>;
  pointerRef?: string;
  isModified?: boolean;
}

export interface StackFrame {
  id: string;
  functionName: string;
  isCurrent: boolean;
  variables: Record<string, VariableValue>;
  lineCalled?: number;
  returnAddress?: string;
  returnValue?: string;
}

export interface HeapObject {
  id: string;
  type: string;
  label: string;
  value: string;
  properties?: Record<string, string | number>;
  color?: string;
}

export interface ExecutionStep {
  stepNumber: number;
  line: number;
  codeSnippet?: string;
  explanation: string;
  callStack: StackFrame[];
  heap: HeapObject[];
  stdout: string[];
  highlightVariables?: string[];
  event?: 'init' | 'assign' | 'call' | 'return' | 'print' | 'loop' | 'condition';
}

export interface ExecutionProgram {
  id: string;
  title: string;
  category: string;
  language: Language;
  code: string;
  steps: ExecutionStep[];
  description: string;
  complexity?: {
    time: string;
    space: string;
  };
}

export interface StudyPage {
  pageNum: number;
  heading: string;
  text: string;
  codeExample?: string;
  diagramSvg?: string;
  keyPoints?: string[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'notes';
  size: string;
  category: 'Lectures' | 'Cheatsheets' | 'Assignments' | 'Diagrams';
  uploadDate: string;
  pageCount?: number;
  dimensions?: string;
  url?: string;
  summary: string;
  samplePages?: StudyPage[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topicCategory: 'Logic Flow' | 'Memory & Stack' | 'Algorithm Complexity' | 'Scope & Variables';
  hint?: string;
}

export interface PinnedVariable {
  name: string;
  type: VariableType;
  lastKnownValue: string | number | boolean | Array<unknown>;
  lastScopeName: string;
  isCurrentlyInScope: boolean;
  isModified?: boolean;
}
