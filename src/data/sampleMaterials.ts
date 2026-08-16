import { StudyMaterial } from '../types';

export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-cs101-stack-memory',
    title: 'CS101_Lecture_04_Stack_Memory_and_Frames.pdf',
    type: 'pdf',
    size: '4.2 MB',
    category: 'Lectures',
    uploadDate: 'Yesterday at 3:15 PM',
    pageCount: 8,
    summary: 'Detailed explanation of runtime call stacks, activation records, stack pointers, local variable scope, and stack frame allocation during function calls.',
    samplePages: [
      {
        pageNum: 1,
        heading: '1. The Runtime Memory Layout',
        text: 'When a program executes, the operating system allocates a virtual memory space divided into 4 primary segments: Text (compiled code instructions), Data/BSS (global & static variables), Heap (dynamically allocated memory), and the Stack (function call frames and local variables).',
        keyPoints: [
          'Stack grows downward (from high memory to low memory in x86/x64).',
          'Heap grows upward toward the stack.',
          'Stack allocation is O(1) through moving the Stack Pointer (RSP/ESP).'
        ]
      },
      {
        pageNum: 2,
        heading: '2. Anatomy of a Stack Frame (Activation Record)',
        text: 'Every time a function is invoked, an activation record is pushed. It stores parameter values, saved instruction pointer (return address), saved base pointer (RBP), local variables, and temporary expression evaluations.',
        keyPoints: [
          'Parameters pushed before call instruction.',
          'Return address saved automatically on stack.',
          'Local variables accessed via fixed offsets from Base Pointer.'
        ]
      },
      {
        pageNum: 3,
        heading: '3. Function Epilogue & Unwinding',
        text: 'When a function reaches its return statement: 1. Return value is placed in accumulator (e.g. RAX or virtual register). 2. Stack pointer is reset to base pointer. 3. Saved base pointer is restored. 4. RET jumps back to saved instruction address.',
        keyPoints: [
          'Stack frames are strictly LIFO (Last In, First Out).',
          'Memory for local variables becomes invalid immediately upon return.'
        ]
      }
    ]
  },
  {
    id: 'mat-cs201-recursion-diagram',
    title: 'Recursion_Stack_Tree_Analysis.png',
    type: 'image',
    size: '1.8 MB',
    category: 'Diagrams',
    uploadDate: 'Aug 14, 2026',
    dimensions: '1920 × 1080 px',
    summary: 'Visual call tree illustrating stack frame growth during recursive Fibonacci & Factorial calculation with branch visualizer and memory footprint.',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%230f172a"/><rect x="20" y="20" width="760" height="410" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/><text x="40" y="55" fill="%2338bdf8" font-family="monospace" font-size="20" font-weight="bold">Recursion Call Tree: factorial(3)</text><line x1="400" y1="100" x2="400" y2="150" stroke="%2364748b" stroke-width="2"/><circle cx="400" cy="100" r="28" fill="%232563eb" stroke="%2360a5fa" stroke-width="2"/><text x="400" y="105" text-anchor="middle" fill="white" font-family="monospace" font-size="12" font-weight="bold">f(3)</text><line x1="400" y1="150" x2="400" y2="210" stroke="%2364748b" stroke-width="2"/><circle cx="400" cy="180" r="28" fill="%230284c7" stroke="%2338bdf8" stroke-width="2"/><text x="400" y="185" text-anchor="middle" fill="white" font-family="monospace" font-size="12" font-weight="bold">f(2)</text><circle cx="400" cy="260" r="28" fill="%23059669" stroke="%2334d399" stroke-width="2"/><text x="400" y="265" text-anchor="middle" fill="white" font-family="monospace" font-size="12" font-weight="bold">f(1)=1</text><path d="M 440 260 C 490 230, 490 190, 440 180" fill="none" stroke="%2310b981" stroke-width="2" stroke-dasharray="4"/><text x="500" y="225" fill="%2334d399" font-family="monospace" font-size="12">returns 1</text><path d="M 440 180 C 500 150, 500 110, 440 100" fill="none" stroke="%2310b981" stroke-width="2" stroke-dasharray="4"/><text x="510" y="145" fill="%2334d399" font-family="monospace" font-size="12">returns 2 * 1 = 2</text><text x="40" y="380" fill="%2394a3b8" font-family="monospace" font-size="13">Base Case Reached at Depth = 3 | Space Complexity = O(N)</text></svg>'
  },
  {
    id: 'mat-pointers-ref-cheatsheet',
    title: 'Pointers_vs_References_Cheatsheet.pdf',
    type: 'pdf',
    size: '2.6 MB',
    category: 'Cheatsheets',
    uploadDate: 'Aug 12, 2026',
    pageCount: 4,
    summary: 'Comprehensive side-by-side comparison of C++ pointers, Java references, Python object identities (id()), pass-by-value vs pass-by-reference.',
    samplePages: [
      {
        pageNum: 1,
        heading: 'Pointers vs. References Quick Reference',
        text: 'In languages like C/C++, a pointer is a variable that stores the numeric memory address of another variable. In Python and Java, all non-primitive variables are object references that automatically dereference.',
        keyPoints: [
          'Address-of operator (&): retrieves hexadecimal RAM address.',
          'Dereference operator (*): accesses value at stored memory location.',
          'Python mutable default argument trap: list is created once at definition time on Heap.'
        ]
      },
      {
        pageNum: 2,
        heading: 'Memory Pitfalls & Best Practices',
        text: 'Dangling pointers occur when memory is freed but pointer continues pointing to old address. Memory leaks occur when heap allocated objects have zero remaining stack references but are never deallocated.',
        keyPoints: [
          'Always set pointers to nullptr after deallocation in C++.',
          'Garbage collector in Java/Python uses Reference Counting & Generational Mark-and-Sweep.'
        ]
      }
    ]
  },
  {
    id: 'mat-heap-allocation-visual',
    title: 'Heap_Memory_and_GC_Architecture.png',
    type: 'image',
    size: '3.1 MB',
    category: 'Diagrams',
    uploadDate: 'Aug 10, 2026',
    dimensions: '2560 × 1440 px',
    summary: 'Architecture visualizer showing how heap objects are tracked by reference counters, generational garbage collection zones, and pointer linking.',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23090d16"/><rect x="20" y="20" width="760" height="410" rx="12" fill="%23131c31" stroke="%231e293b" stroke-width="2"/><text x="40" y="55" fill="%2338bdf8" font-family="monospace" font-size="18" font-weight="bold">Heap vs Stack Memory Map</text><rect x="50" y="90" width="280" height="300" rx="8" fill="%231e293b" stroke="%233b82f6" stroke-width="2"/><text x="70" y="125" fill="%2360a5fa" font-family="monospace" font-size="14" font-weight="bold">STACK (LIFO)</text><rect x="70" y="145" width="240" height="60" rx="6" fill="%230f172a" stroke="%23475569"/><text x="85" y="175" fill="%2394a3b8" font-family="monospace" font-size="12">main(): list_ptr = 0x8F0</text><rect x="70" y="220" width="240" height="60" rx="6" fill="%230f172a" stroke="%23475569"/><text x="85" y="250" fill="%2394a3b8" font-family="monospace" font-size="12">append(): param = 0x8F0</text><path d="M 310 175 C 390 175, 410 200, 460 200" fill="none" stroke="%23a855f7" stroke-width="3" marker-end="url(%23arrow)"/><path d="M 310 250 C 380 250, 410 215, 460 205" fill="none" stroke="%23a855f7" stroke-width="3"/><rect x="460" y="90" width="290" height="300" rx="8" fill="%231e293b" stroke="%23a855f7" stroke-width="2"/><text x="480" y="125" fill="%23c084fc" font-family="monospace" font-size="14" font-weight="bold">HEAP (Dynamic Objects)</text><rect x="480" y="155" width="250" height="100" rx="8" fill="%230f172a" stroke="%239333ea"/><text x="495" y="190" fill="%23e2e8f0" font-family="monospace" font-size="13" font-weight="bold">Object @0x8F0 [List]</text><text x="495" y="215" fill="%2334d399" font-family="monospace" font-size="12">data: [10, 20, 30, 40]</text><text x="495" y="235" fill="%2394a3b8" font-family="monospace" font-size="11">ref_count: 2 (stack ptrs)</text></svg>'
  }
];
