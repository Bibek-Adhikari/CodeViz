export type Language = 'python' | 'java' | 'cpp' | 'javascript';

export type VariableType = 'int' | 'float' | 'string' | 'bool' | 'list' | 'dict' | 'pointer' | 'object' | 'none';

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
