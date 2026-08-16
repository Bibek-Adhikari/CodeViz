import { QuizQuestion, Language, ExecutionProgram, ExecutionStep } from '../types';

/**
 * Intelligent AI Quiz Generator for Code Visualization
 * Generates 3-question short quizzes tailored to the code and logic flow currently being visualized.
 */
export function generateQuizForCode(
  code: string,
  language: Language,
  program?: ExecutionProgram | null,
  currentStep?: ExecutionStep | null,
  totalSteps?: number
): QuizQuestion[] {
  const codeLower = code.toLowerCase();
  const title = program?.title || '';
  const progDesc = program?.description || '';
  const progComplexity = program?.complexity;

  // Question bank tailored by algorithmic domain
  const isRecursion = codeLower.includes('def') && (code.includes('fib') || code.includes('factorial') || code.includes('recur') || (title.toLowerCase().includes('recursion') || title.toLowerCase().includes('fibonacci')));
  const isSorting = codeLower.includes('sort') || codeLower.includes('partition') || codeLower.includes('pivot') || title.toLowerCase().includes('sort');
  const isBinarySearch = codeLower.includes('mid') || codeLower.includes('binary_search') || codeLower.includes('binary search') || title.toLowerCase().includes('binary');
  const isPointer = codeLower.includes('*') || codeLower.includes('&') || codeLower.includes('ptr') || codeLower.includes('malloc') || title.toLowerCase().includes('pointer') || language === 'cpp';
  const isClosure = codeLower.includes('closure') || codeLower.includes('function') && codeLower.includes('return function') || title.toLowerCase().includes('closure');
  const isLinkedList = codeLower.includes('node') || codeLower.includes('next') || title.toLowerCase().includes('linked list');

  if (isRecursion) {
    return [
      {
        id: 1,
        topicCategory: 'Logic Flow',
        question: 'In this recursive routine, what is the primary role of the base condition (e.g. n <= 1 or n == 0)?',
        codeSnippet: code.split('\n').slice(0, 5).join('\n'),
        options: [
          'It forces the stack frame to allocate additional heap memory.',
          'It terminates the recursion chain to prevent an infinite call stack (Stack Overflow).',
          'It resets all global variables back to zero.',
          'It converts the recursive calls into an iterative loop automatically.'
        ],
        correctAnswerIndex: 1,
        explanation: 'The base condition is essential in recursion: once met, the function stops issuing new recursive calls and begins returning values back up the call stack, preventing a Stack Overflow error.',
        hint: 'Think about what happens to the call stack if a recursive function never stops calling itself.'
      },
      {
        id: 2,
        topicCategory: 'Memory & Stack',
        question: 'When a recursive call is made (e.g. fib(n - 1)), how does the runtime environment manage memory?',
        options: [
          'It overwrites the current stack frame with new arguments to save RAM.',
          'It moves all local variables directly onto the permanent heap storage.',
          'It pushes a new activation record (stack frame) onto the Call Stack with its own local scope.',
          'It pauses the CPU until the operating system restarts the process.'
        ],
        correctAnswerIndex: 2,
        explanation: 'Each function invocation allocates a distinct activation record (stack frame) on top of the call stack containing its local parameters and return address. When the function returns, its frame is popped (LIFO).',
        hint: 'Remember the LIFO (Last-In, First-Out) structure visualized in the Memory State panel.'
      },
      {
        id: 3,
        topicCategory: 'Algorithm Complexity',
        question: progComplexity 
          ? `What is the time complexity and call behavior of this recursive implementation (${progComplexity.time})?`
          : 'What characterizes the time complexity of naive unmemoized recursion compared to iterative approaches?',
        options: [
          'O(1) constant time because all function calls execute simultaneously.',
          'O(2^N) exponential time in unmemoized branching recursion due to redundant sub-problem recomputations.',
          'O(log N) because half the inputs are discarded on each recursive branch.',
          'O(N!) factorial time because all permutations of inputs are explored.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Without memoization or dynamic programming, branching recursion (like fib(n-1) + fib(n-2)) creates a binary call tree of height N, resulting in O(2^N) redundant evaluations.',
        hint: 'Notice how multiple identical sub-calls appear in the execution call tree.'
      }
    ];
  }

  if (isBinarySearch) {
    return [
      {
        id: 1,
        topicCategory: 'Logic Flow',
        question: 'Why does Binary Search require the input dataset to be sorted beforehand?',
        codeSnippet: code.split('\n').slice(0, 6).join('\n'),
        options: [
          'Because unsorted arrays cannot be stored in heap memory.',
          'Because the divide-and-conquer elimination of half the search space relies on ordered comparison.',
          'Because CPU cache lines only support indexing on ascending integers.',
          'Because the call stack requires monotonic line numbers.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Binary search compares the target against the middle element. Because the array is ordered, if target < mid, we can safely discard the entire upper half, cutting the search space by half each iteration.',
        hint: 'Consider how we decide whether to search the left or right sub-array.'
      },
      {
        id: 2,
        topicCategory: 'Scope & Variables',
        question: 'How do the pointer/index variables (low, high, mid) update when the target is greater than the middle element?',
        options: [
          'high is updated to mid - 1',
          'low is updated to mid + 1',
          'both low and high are reset to 0',
          'mid is decremented by 1'
        ],
        correctAnswerIndex: 1,
        explanation: 'When target > arr[mid], the target must lie in the right subarray, so low is moved to mid + 1, discarding the left half including mid.',
        hint: 'Look at the `if target > arr[mid]` branch in the code.'
      },
      {
        id: 3,
        topicCategory: 'Algorithm Complexity',
        question: 'What is the worst-case time complexity of Binary Search on an array of size N?',
        options: [
          'O(N) linear time',
          'O(N log N) linearithmic time',
          'O(log N) logarithmic time',
          'O(1) constant time'
        ],
        correctAnswerIndex: 2,
        explanation: 'Since the search space is halved on each step (N, N/2, N/4, ... 1), the algorithm runs in O(log N) time and takes at most ~log2(N) comparisons.',
        hint: 'How many times can you divide N by 2 before reaching 1?'
      }
    ];
  }

  if (isSorting) {
    return [
      {
        id: 1,
        topicCategory: 'Logic Flow',
        question: 'What is the primary mechanism of the partitioning step in QuickSort / sorting routines?',
        codeSnippet: code.split('\n').slice(0, 6).join('\n'),
        options: [
          'Selecting a pivot and rearranging elements so smaller items go left and larger items go right.',
          'Reversing the entire array before performing sequential linear scans.',
          'Allocating a brand new heap array for each individual integer.',
          'Sorting elements strictly by memory address rather than numeric value.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Partitioning picks a pivot and partitions the subarray such that all elements less than the pivot precede it, and elements greater follow it, placing the pivot at its final sorted position.',
        hint: 'Look at how elements swap relative to the chosen pivot.'
      },
      {
        id: 2,
        topicCategory: 'Memory & Stack',
        question: 'In in-place sorting algorithms like QuickSort, why is auxiliary heap space minimal O(log N)?',
        options: [
          'Because arrays are permanently copied into CPU registers.',
          'Because swaps are performed directly in-place within the existing array, using stack space only for recursive frames.',
          'Because the operating system executes the sort entirely in hardware.',
          'Because all stack frames are combined into a single global variable.'
        ],
        correctAnswerIndex: 1,
        explanation: 'In-place algorithms modify the original array via index swaps, avoiding secondary array allocations and only using stack space proportional to recursion depth O(log N).',
        hint: 'Check the heap panel: is a new array created on every step, or is the existing one modified?'
      },
      {
        id: 3,
        topicCategory: 'Algorithm Complexity',
        question: 'What is the average-case time complexity of QuickSort on randomized input?',
        options: [
          'O(N^2) quadratic time',
          'O(N log N) linearithmic time',
          'O(N) linear time',
          'O(2^N) exponential time'
        ],
        correctAnswerIndex: 1,
        explanation: 'On average, partitioning splits the list roughly in half across O(log N) recursive levels, with O(N) work per level, yielding an average time of O(N log N).',
        hint: 'Standard comparison-based optimal sorts achieve this linearithmic bound.'
      }
    ];
  }

  if (isPointer) {
    return [
      {
        id: 1,
        topicCategory: 'Memory & Stack',
        question: 'What is the difference between a stack pointer variable and the data it points to on the heap?',
        options: [
          'The pointer variable stores a memory address; the heap holds the actual allocated object or data.',
          'The pointer holds the full object and the heap only stores the variable name.',
          'Stack pointers cannot be modified once initialized.',
          'Heap data is automatically freed every time any statement executes.'
        ],
        correctAnswerIndex: 0,
        explanation: 'A pointer is a variable on the stack storing a memory address (e.g. 0x7ffd or #001). Dereferencing the pointer reads or writes the actual data residing in heap or stack memory at that address.',
        hint: 'Check how the memory visualizer draws arrows from stack variables to heap objects.'
      },
      {
        id: 2,
        topicCategory: 'Scope & Variables',
        question: 'What happens when two pointer variables are assigned the same address (e.g., ptrB = ptrA)?',
        options: [
          'The memory at that address is duplicated immediately.',
          'Both pointers now reference the same underlying memory block; modifying through one affects both.',
          'ptrA is automatically set to null/nullptr.',
          'The operating system throws a segmentation fault.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Aliasing occurs when two pointers refer to the exact same memory location. Any modification via one pointer will be visible when reading through the other.',
        hint: 'Think of two bookmarks pointing to the exact same page in a book.'
      },
      {
        id: 3,
        topicCategory: 'Logic Flow',
        question: 'Why is manual memory management or pointer tracking important in systems programming (C/C++)?',
        options: [
          'To prevent memory leaks (unfreed heap allocations) and dangling pointer bugs.',
          'Because C++ cannot execute mathematical operations without pointers.',
          'To ensure all variables are converted to global scope.',
          'Because the CPU only has 64 bytes of total RAM.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Without automatic garbage collection, failing to free dynamically allocated heap memory results in memory leaks, while using deleted memory creates dangling pointers and undefined behavior.',
        hint: 'Consider what happens if memory allocated with `new` or `malloc` is never freed.'
      }
    ];
  }

  // General Program Quiz for arbitrary code
  return [
    {
      id: 1,
      topicCategory: 'Logic Flow',
      question: 'Looking at the currently visualized program, how does execution control flow through the statements?',
      codeSnippet: code.split('\n').slice(0, 6).join('\n'),
      options: [
        'Statements execute sequentially from top to bottom, altering control flow at branches, loops, and function calls.',
        'All lines of code are executed simultaneously in parallel.',
        'Functions execute before variable declarations regardless of code position.',
        'The runtime executes only odd-numbered lines first.'
      ],
      correctAnswerIndex: 0,
      explanation: 'In procedural execution, the instruction pointer steps sequentially through statements, jumping when encountering conditionals (if/else), loop iterations (for/while), or subroutine calls (def/function).',
      hint: 'Watch the blue execution arrow in the code gutter as you step through.'
    },
    {
      id: 2,
      topicCategory: 'Scope & Variables',
      question: 'When a variable is declared or updated in the current line, where is its state tracked in memory?',
      options: [
        'In the local symbol table of the active Stack Frame, or on the Heap if it is a dynamic reference object.',
        'Exclusively in browser cookies.',
        'Directly in the source code file without allocating RAM.',
        'In a temporary buffer that is cleared after every single line.'
      ],
      correctAnswerIndex: 0,
      explanation: 'Local variables and primitive values are stored inside the active stack frame of the executing function. Complex dynamic data structures are allocated on the Heap and referenced via pointers.',
      hint: 'Look at the Stack and Heap sections in the Memory State panel.'
    },
    {
      id: 3,
      topicCategory: 'Algorithm Complexity',
      question: progComplexity 
        ? `What are the computational complexity characteristics of this routine (Time: ${progComplexity.time}, Space: ${progComplexity.space})?`
        : 'How does memory consumption scale as more functions are called or more variables are allocated?',
      options: [
        progComplexity ? `Time complexity is ${progComplexity.time} and auxiliary space is ${progComplexity.space}.` : 'Each active function call pushes a frame onto the stack, scaling memory with call depth.',
        'Memory usage remains strictly 0 bytes regardless of input size.',
        'Time complexity is always O(1) regardless of loop iterations.',
        'Stack space is infinite and never consumes RAM.'
      ],
      correctAnswerIndex: 0,
      explanation: progComplexity 
        ? `This algorithm demonstrates ${progComplexity.time} time complexity and ${progComplexity.space} space complexity based on its loop and recursion structures.`
        : 'Call stack memory scales linearly with recursive depth (O(N)), while loop variables in a single frame use O(1) constant auxiliary space.',
      hint: 'Check the Big-O metrics in the AI Step Tutor or program details.'
    }
  ];
}
