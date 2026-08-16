import { ExecutionProgram } from '../types';

export const SAMPLE_PROGRAMS: ExecutionProgram[] = [
  {
    id: 'python-add-numbers',
    title: 'Function Call & Stack Frames',
    category: 'Functions & Scope',
    language: 'python',
    description: 'Basic function invocation showing local stack frame allocation, parameter passing, and return value passing back to global scope.',
    complexity: { time: 'O(1)', space: 'O(1)' },
    code: `x = 5
y = 3

def add_numbers(a, b):
    result = a + b
    return result

z = add_numbers(x, y)
print("The result is:", z)`,
    steps: [
      {
        stepNumber: 1,
        line: 1,
        explanation: 'Initialize global variable x with integer value 5 in the GLOBAL stack frame.',
        event: 'assign',
        highlightVariables: ['x'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              x: { name: 'x', type: 'int', value: 5, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 2,
        line: 2,
        explanation: 'Initialize global variable y with integer value 3 in the GLOBAL stack frame.',
        event: 'assign',
        highlightVariables: ['y'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              x: { name: 'x', type: 'int', value: 5 },
              y: { name: 'y', type: 'int', value: 3, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 3,
        line: 4,
        explanation: 'Define function add_numbers(a, b) and register function object reference in global namespace.',
        event: 'init',
        highlightVariables: ['add_numbers'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              x: { name: 'x', type: 'int', value: 5 },
              y: { name: 'y', type: 'int', value: 3 },
              add_numbers: { name: 'add_numbers', type: 'pointer', value: '<function 0x7fa2b1>' }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 4,
        line: 8,
        explanation: 'Calling add_numbers(x, y) with arguments (5, 3). A new stack frame "add_numbers()" is pushed onto the call stack with parameters a=5 and b=3.',
        event: 'call',
        highlightVariables: ['a', 'b'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: {
              x: { name: 'x', type: 'int', value: 5 },
              y: { name: 'y', type: 'int', value: 3 },
              add_numbers: { name: 'add_numbers', type: 'pointer', value: '<function 0x7fa2b1>' }
            }
          },
          {
            id: 'frame-add-numbers',
            functionName: 'add_numbers()',
            isCurrent: true,
            lineCalled: 8,
            returnAddress: 'Line 8 (in global)',
            variables: {
              a: { name: 'a', type: 'int', value: 5, isModified: true },
              b: { name: 'b', type: 'int', value: 3, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 5,
        line: 5,
        explanation: 'Evaluate expression a + b (5 + 3 = 8) and assign to local variable "result" inside add_numbers stack frame.',
        event: 'assign',
        highlightVariables: ['result'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: {
              x: { name: 'x', type: 'int', value: 5 },
              y: { name: 'y', type: 'int', value: 3 },
              add_numbers: { name: 'add_numbers', type: 'pointer', value: '<function 0x7fa2b1>' }
            }
          },
          {
            id: 'frame-add-numbers',
            functionName: 'add_numbers()',
            isCurrent: true,
            lineCalled: 8,
            returnAddress: 'Line 8',
            variables: {
              a: { name: 'a', type: 'int', value: 5 },
              b: { name: 'b', type: 'int', value: 3 },
              result: { name: 'result', type: 'int', value: 8, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 6,
        line: 6,
        explanation: 'Return value 8 from add_numbers(). The stack frame add_numbers() prepares to pop and deliver return value 8 to line 8.',
        event: 'return',
        highlightVariables: ['result'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: {
              x: { name: 'x', type: 'int', value: 5 },
              y: { name: 'y', type: 'int', value: 3 },
              add_numbers: { name: 'add_numbers', type: 'pointer', value: '<function 0x7fa2b1>' }
            }
          },
          {
            id: 'frame-add-numbers',
            functionName: 'add_numbers()',
            isCurrent: true,
            lineCalled: 8,
            returnValue: '8',
            returnAddress: 'Line 8',
            variables: {
              a: { name: 'a', type: 'int', value: 5 },
              b: { name: 'b', type: 'int', value: 3 },
              result: { name: 'result', type: 'int', value: 8 }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 7,
        line: 8,
        explanation: 'add_numbers() stack frame popped. Returned value 8 assigned to global variable z.',
        event: 'assign',
        highlightVariables: ['z'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              x: { name: 'x', type: 'int', value: 5 },
              y: { name: 'y', type: 'int', value: 3 },
              add_numbers: { name: 'add_numbers', type: 'pointer', value: '<function 0x7fa2b1>' },
              z: { name: 'z', type: 'int', value: 8, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 8,
        line: 9,
        explanation: 'Execute print("The result is:", z). Formats output string with z (8) and writes to standard output.',
        event: 'print',
        highlightVariables: ['z'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              x: { name: 'x', type: 'int', value: 5 },
              y: { name: 'y', type: 'int', value: 3 },
              add_numbers: { name: 'add_numbers', type: 'pointer', value: '<function 0x7fa2b1>' },
              z: { name: 'z', type: 'int', value: 8 }
            }
          }
        ],
        heap: [],
        stdout: ['$ python main.py', 'The result is: 8']
      }
    ]
  },
  {
    id: 'python-heap-lists',
    title: 'Heap Objects & Pointer References',
    category: 'Memory & Pointers',
    language: 'python',
    description: 'Demonstrates how mutable data structures (lists) reside in Heap memory while stack frames only store reference pointers to them.',
    complexity: { time: 'O(N)', space: 'O(N)' },
    code: `items = [10, 20, 30]

def append_element(lst, value):
    lst.append(value)
    return len(lst)

total = append_element(items, 40)
print("Updated list:", items)`,
    steps: [
      {
        stepNumber: 1,
        line: 1,
        explanation: 'Create list [10, 20, 30] in Heap memory as Object #001. Store reference pointer in global variable "items".',
        event: 'init',
        highlightVariables: ['items'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              items: { name: 'items', type: 'pointer', value: '→ #001', pointerRef: '#001', isModified: true }
            }
          }
        ],
        heap: [
          {
            id: '#001',
            type: 'list',
            label: 'List Object #001',
            value: '[10, 20, 30]',
            properties: { length: 3, capacity: 4 },
            color: '#a855f7'
          }
        ],
        stdout: []
      },
      {
        stepNumber: 2,
        line: 3,
        explanation: 'Define append_element(lst, value) in global scope.',
        event: 'init',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              items: { name: 'items', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              append_element: { name: 'append_element', type: 'pointer', value: '<function 0x7fa2b2>' }
            }
          }
        ],
        heap: [
          {
            id: '#001',
            type: 'list',
            label: 'List Object #001',
            value: '[10, 20, 30]',
            properties: { length: 3, capacity: 4 }
          }
        ],
        stdout: []
      },
      {
        stepNumber: 3,
        line: 7,
        explanation: 'Call append_element(items, 40). Parameter "lst" receives reference pointer → #001 (pointing to the same heap object!).',
        event: 'call',
        highlightVariables: ['lst', 'value'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: {
              items: { name: 'items', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              append_element: { name: 'append_element', type: 'pointer', value: '<function 0x7fa2b2>' }
            }
          },
          {
            id: 'frame-append',
            functionName: 'append_element()',
            isCurrent: true,
            lineCalled: 7,
            variables: {
              lst: { name: 'lst', type: 'pointer', value: '→ #001', pointerRef: '#001', isModified: true },
              value: { name: 'value', type: 'int', value: 40, isModified: true }
            }
          }
        ],
        heap: [
          {
            id: '#001',
            type: 'list',
            label: 'List Object #001',
            value: '[10, 20, 30]',
            properties: { length: 3, capacity: 4 }
          }
        ],
        stdout: []
      },
      {
        stepNumber: 4,
        line: 4,
        explanation: 'Execute lst.append(value). Mutates Object #001 directly on the Heap from [10, 20, 30] to [10, 20, 30, 40].',
        event: 'assign',
        highlightVariables: ['lst'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: {
              items: { name: 'items', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              append_element: { name: 'append_element', type: 'pointer', value: '<function 0x7fa2b2>' }
            }
          },
          {
            id: 'frame-append',
            functionName: 'append_element()',
            isCurrent: true,
            lineCalled: 7,
            variables: {
              lst: { name: 'lst', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              value: { name: 'value', type: 'int', value: 40 }
            }
          }
        ],
        heap: [
          {
            id: '#001',
            type: 'list',
            label: 'List Object #001 (Mutated)',
            value: '[10, 20, 30, 40]',
            properties: { length: 4, capacity: 8 },
            color: '#10b981'
          }
        ],
        stdout: []
      },
      {
        stepNumber: 5,
        line: 5,
        explanation: 'Return len(lst) = 4. append_element() prepares to exit and return integer 4.',
        event: 'return',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: {
              items: { name: 'items', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              append_element: { name: 'append_element', type: 'pointer', value: '<function 0x7fa2b2>' }
            }
          },
          {
            id: 'frame-append',
            functionName: 'append_element()',
            isCurrent: true,
            returnValue: '4',
            variables: {
              lst: { name: 'lst', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              value: { name: 'value', type: 'int', value: 40 }
            }
          }
        ],
        heap: [
          {
            id: '#001',
            type: 'list',
            label: 'List Object #001',
            value: '[10, 20, 30, 40]',
            properties: { length: 4, capacity: 8 }
          }
        ],
        stdout: []
      },
      {
        stepNumber: 6,
        line: 7,
        explanation: 'Stack frame popped. Global total assigned value 4. Global "items" reflects the mutated heap list!',
        event: 'assign',
        highlightVariables: ['total'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              items: { name: 'items', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              append_element: { name: 'append_element', type: 'pointer', value: '<function 0x7fa2b2>' },
              total: { name: 'total', type: 'int', value: 4, isModified: true }
            }
          }
        ],
        heap: [
          {
            id: '#001',
            type: 'list',
            label: 'List Object #001',
            value: '[10, 20, 30, 40]',
            properties: { length: 4, capacity: 8 }
          }
        ],
        stdout: []
      },
      {
        stepNumber: 7,
        line: 8,
        explanation: 'Print output displaying updated contents of items from heap Object #001.',
        event: 'print',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              items: { name: 'items', type: 'pointer', value: '→ #001', pointerRef: '#001' },
              total: { name: 'total', type: 'int', value: 4 }
            }
          }
        ],
        heap: [
          {
            id: '#001',
            type: 'list',
            label: 'List Object #001',
            value: '[10, 20, 30, 40]',
            properties: { length: 4, capacity: 8 }
          }
        ],
        stdout: ['$ python main.py', 'Updated list: [10, 20, 30, 40]']
      }
    ]
  },
  {
    id: 'python-recursion-factorial',
    title: 'Recursion & Stack Depth',
    category: 'Recursion',
    language: 'python',
    description: 'Visualizes recursive stack frame accumulation and subsequent unwinding during base condition evaluation.',
    complexity: { time: 'O(N)', space: 'O(N)' },
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

ans = factorial(3)
print("3! =", ans)`,
    steps: [
      {
        stepNumber: 1,
        line: 1,
        explanation: 'Define recursive function factorial(n) in GLOBAL scope.',
        event: 'init',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 2,
        line: 6,
        explanation: 'Initial call factorial(3). Pushes 1st recursive frame factorial(n=3) onto call stack.',
        event: 'call',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: { factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' } }
          },
          {
            id: 'frame-fact-3',
            functionName: 'factorial(n=3)',
            isCurrent: true,
            lineCalled: 6,
            variables: { n: { name: 'n', type: 'int', value: 3, isModified: true } }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 3,
        line: 4,
        explanation: 'Inside factorial(n=3): n > 1, so evaluates 3 * factorial(2). Pushes 2nd recursive frame factorial(n=2).',
        event: 'call',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: { factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' } }
          },
          {
            id: 'frame-fact-3',
            functionName: 'factorial(n=3)',
            isCurrent: false,
            lineCalled: 6,
            variables: { n: { name: 'n', type: 'int', value: 3 } }
          },
          {
            id: 'frame-fact-2',
            functionName: 'factorial(n=2)',
            isCurrent: true,
            lineCalled: 4,
            variables: { n: { name: 'n', type: 'int', value: 2, isModified: true } }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 4,
        line: 4,
        explanation: 'Inside factorial(n=2): n > 1, evaluates 2 * factorial(1). Pushes 3rd recursive frame factorial(n=1) (Base Case!).',
        event: 'call',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: { factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' } }
          },
          {
            id: 'frame-fact-3',
            functionName: 'factorial(n=3)',
            isCurrent: false,
            variables: { n: { name: 'n', type: 'int', value: 3 } }
          },
          {
            id: 'frame-fact-2',
            functionName: 'factorial(n=2)',
            isCurrent: false,
            variables: { n: { name: 'n', type: 'int', value: 2 } }
          },
          {
            id: 'frame-fact-1',
            functionName: 'factorial(n=1)',
            isCurrent: true,
            lineCalled: 4,
            variables: { n: { name: 'n', type: 'int', value: 1, isModified: true } }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 5,
        line: 3,
        explanation: 'Base case reached (n <= 1). factorial(n=1) returns 1 and pops from call stack.',
        event: 'return',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: { factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' } }
          },
          {
            id: 'frame-fact-3',
            functionName: 'factorial(n=3)',
            isCurrent: false,
            variables: { n: { name: 'n', type: 'int', value: 3 } }
          },
          {
            id: 'frame-fact-2',
            functionName: 'factorial(n=2)',
            isCurrent: true,
            returnValue: '1',
            variables: { n: { name: 'n', type: 'int', value: 2 } }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 6,
        line: 4,
        explanation: 'factorial(n=2) receives 1: computes 2 * 1 = 2, returns 2 and pops.',
        event: 'return',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: false,
            variables: { factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' } }
          },
          {
            id: 'frame-fact-3',
            functionName: 'factorial(n=3)',
            isCurrent: true,
            returnValue: '2',
            variables: { n: { name: 'n', type: 'int', value: 3 } }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 7,
        line: 6,
        explanation: 'factorial(n=3) receives 2: computes 3 * 2 = 6, returns 6 to global ans variable.',
        event: 'assign',
        highlightVariables: ['ans'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' },
              ans: { name: 'ans', type: 'int', value: 6, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 8,
        line: 7,
        explanation: 'Print output showing computed result 6.',
        event: 'print',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: {
              factorial: { name: 'factorial', type: 'pointer', value: '<function 0x7fa3a1>' },
              ans: { name: 'ans', type: 'int', value: 6 }
            }
          }
        ],
        heap: [],
        stdout: ['$ python main.py', '3! = 6']
      }
    ]
  },
  {
    id: 'cpp-pointers-memory',
    title: 'C++ Pointers & Direct Memory Addresses',
    category: 'Memory & Pointers',
    language: 'cpp',
    description: 'Track how pointer variables hold hex memory addresses and dereference operator (*) directly modifies target memory locations.',
    complexity: { time: 'O(1)', space: 'O(1)' },
    code: `#include <iostream>
using namespace std;

int main() {
    int count = 10;
    int* ptr = &count;
    *ptr = 25;
    cout << "Val: " << count << endl;
    return 0;
}`,
    steps: [
      {
        stepNumber: 1,
        line: 5,
        explanation: 'Allocate integer "count" at memory address 0x7ffeefbff568 with value 10 inside main() stack frame.',
        event: 'assign',
        highlightVariables: ['count'],
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main()',
            isCurrent: true,
            variables: {
              count: { name: 'count (0x7ffeefbff568)', type: 'int', value: 10, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 2,
        line: 6,
        explanation: 'Declare pointer "ptr" (int*) and assign address of count: &count (0x7ffeefbff568).',
        event: 'assign',
        highlightVariables: ['ptr'],
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main()',
            isCurrent: true,
            variables: {
              count: { name: 'count (0x7ffeefbff568)', type: 'int', value: 10 },
              ptr: { name: 'ptr (int*)', type: 'pointer', value: '→ 0x7ffeefbff568', isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 3,
        line: 7,
        explanation: 'Dereference pointer *ptr = 25. Writes 25 directly into memory address 0x7ffeefbff568 (modifying "count").',
        event: 'assign',
        highlightVariables: ['count'],
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main()',
            isCurrent: true,
            variables: {
              count: { name: 'count (0x7ffeefbff568)', type: 'int', value: 25, isModified: true },
              ptr: { name: 'ptr (int*)', type: 'pointer', value: '→ 0x7ffeefbff568' }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 4,
        line: 8,
        explanation: 'cout outputs modified value of count (25) to standard output stream.',
        event: 'print',
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main()',
            isCurrent: true,
            variables: {
              count: { name: 'count', type: 'int', value: 25 },
              ptr: { name: 'ptr', type: 'pointer', value: '→ 0x7ffeefbff568' }
            }
          }
        ],
        heap: [],
        stdout: ['$ g++ -O2 main.cpp && ./a.out', 'Val: 25']
      }
    ]
  },
  {
    id: 'java-oop-classes',
    title: 'Java Object Instantiation & Heap',
    category: 'Object-Oriented Programming',
    language: 'java',
    description: 'Explore "new" keyword allocation in JVM Heap, constructor execution, and instance method field updates.',
    complexity: { time: 'O(1)', space: 'O(1)' },
    code: `class Student {
    String name;
    int score;
    Student(String n, int s) {
        this.name = n;
        this.score = s;
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Alex", 92);
        System.out.println(s1.name + ": " + s1.score);
    }
}`,
    steps: [
      {
        stepNumber: 1,
        line: 11,
        explanation: 'JVM main thread enters public static void main(String[] args).',
        event: 'init',
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main(String[] args)',
            isCurrent: true,
            variables: {
              args: { name: 'args', type: 'pointer', value: '→ String[0]' }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 2,
        line: 12,
        explanation: 'Execute "new Student(...)". Allocates Student instance @0x5b21 on Java Heap with initial null/0 fields.',
        event: 'call',
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main(String[] args)',
            isCurrent: false,
            variables: { args: { name: 'args', type: 'pointer', value: '→ String[0]' } }
          },
          {
            id: 'frame-ctor',
            functionName: 'Student.<init>()',
            isCurrent: true,
            lineCalled: 12,
            variables: {
              this: { name: 'this', type: 'pointer', value: '→ @0x5b21' },
              n: { name: 'n', type: 'string', value: '"Alex"' },
              s: { name: 's', type: 'int', value: 92 }
            }
          }
        ],
        heap: [
          {
            id: '@0x5b21',
            type: 'Student Object',
            label: 'Instance @0x5b21',
            value: 'Student { name: null, score: 0 }',
            properties: { name: 'null', score: 0 },
            color: '#3b82f6'
          }
        ],
        stdout: []
      },
      {
        stepNumber: 3,
        line: 5,
        explanation: 'Constructor assigns this.name = "Alex" and this.score = 92. Updates fields on Heap Object @0x5b21.',
        event: 'assign',
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main(String[] args)',
            isCurrent: false,
            variables: { args: { name: 'args', type: 'pointer', value: '→ String[0]' } }
          },
          {
            id: 'frame-ctor',
            functionName: 'Student.<init>()',
            isCurrent: true,
            lineCalled: 12,
            variables: {
              this: { name: 'this', type: 'pointer', value: '→ @0x5b21' },
              n: { name: 'n', type: 'string', value: '"Alex"' },
              s: { name: 's', type: 'int', value: 92 }
            }
          }
        ],
        heap: [
          {
            id: '@0x5b21',
            type: 'Student Object',
            label: 'Instance @0x5b21',
            value: 'Student { name: "Alex", score: 92 }',
            properties: { name: '"Alex"', score: 92 },
            color: '#10b981'
          }
        ],
        stdout: []
      },
      {
        stepNumber: 4,
        line: 12,
        explanation: 'Constructor finishes. Reference @0x5b21 assigned to local variable s1 in main frame.',
        event: 'assign',
        highlightVariables: ['s1'],
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main(String[] args)',
            isCurrent: true,
            variables: {
              args: { name: 'args', type: 'pointer', value: '→ String[0]' },
              s1: { name: 's1', type: 'pointer', value: '→ @0x5b21', pointerRef: '@0x5b21', isModified: true }
            }
          }
        ],
        heap: [
          {
            id: '@0x5b21',
            type: 'Student Object',
            label: 'Instance @0x5b21',
            value: 'Student { name: "Alex", score: 92 }',
            properties: { name: '"Alex"', score: 92 }
          }
        ],
        stdout: []
      },
      {
        stepNumber: 5,
        line: 13,
        explanation: 'System.out.println prints formatted fields extracted from Student instance @0x5b21.',
        event: 'print',
        callStack: [
          {
            id: 'frame-main',
            functionName: 'main(String[] args)',
            isCurrent: true,
            variables: {
              args: { name: 'args', type: 'pointer', value: '→ String[0]' },
              s1: { name: 's1', type: 'pointer', value: '→ @0x5b21', pointerRef: '@0x5b21' }
            }
          }
        ],
        heap: [
          {
            id: '@0x5b21',
            type: 'Student Object',
            label: 'Instance @0x5b21',
            value: 'Student { name: "Alex", score: 92 }',
            properties: { name: '"Alex"', score: 92 }
          }
        ],
        stdout: ['$ javac Main.java && java Main', 'Alex: 92']
      }
    ]
  },
  {
    id: 'js-closures-scope',
    title: 'JavaScript Closures & Lexical Scope',
    category: 'Functions & Scope',
    language: 'javascript',
    description: 'Understand how returned functions retain references to outer scope variables within their lexical closure environment.',
    complexity: { time: 'O(1)', space: 'O(1)' },
    code: `function createCounter(start) {
    let count = start;
    return function increment() {
        count += 1;
        return count;
    };
}

const c1 = createCounter(10);
console.log("Count:", c1());`,
    steps: [
      {
        stepNumber: 1,
        line: 1,
        explanation: 'Register createCounter in Global Scope.',
        event: 'init',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'Global Execution Context',
            isCurrent: true,
            variables: {
              createCounter: { name: 'createCounter', type: 'pointer', value: 'ƒ ()' }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 2,
        line: 9,
        explanation: 'Call createCounter(10). Creates Execution Context with local variable count = 10.',
        event: 'call',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'Global Execution Context',
            isCurrent: false,
            variables: { createCounter: { name: 'createCounter', type: 'pointer', value: 'ƒ ()' } }
          },
          {
            id: 'frame-create-counter',
            functionName: 'createCounter(start=10)',
            isCurrent: true,
            lineCalled: 9,
            variables: {
              start: { name: 'start', type: 'int', value: 10 },
              count: { name: 'count', type: 'int', value: 10, isModified: true }
            }
          }
        ],
        heap: [],
        stdout: []
      },
      {
        stepNumber: 3,
        line: 3,
        explanation: 'createCounter creates function increment with Closure [[Scopes]] pointing to { count: 10 } and returns it.',
        event: 'return',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'Global Execution Context',
            isCurrent: false,
            variables: { createCounter: { name: 'createCounter', type: 'pointer', value: 'ƒ ()' } }
          },
          {
            id: 'frame-create-counter',
            functionName: 'createCounter(start=10)',
            isCurrent: true,
            returnValue: 'ƒ increment (Closure)',
            variables: {
              start: { name: 'start', type: 'int', value: 10 },
              count: { name: 'count', type: 'int', value: 10 }
            }
          }
        ],
        heap: [
          {
            id: '#Closure-01',
            type: 'Closure Scope',
            label: 'Closure (createCounter)',
            value: '{ count: 10 }',
            properties: { count: 10 },
            color: '#06b6d4'
          }
        ],
        stdout: []
      },
      {
        stepNumber: 4,
        line: 9,
        explanation: 'c1 stores reference to closure function. createCounter frame is destroyed, but closure environment survives on Heap!',
        event: 'assign',
        highlightVariables: ['c1'],
        callStack: [
          {
            id: 'frame-global',
            functionName: 'Global Execution Context',
            isCurrent: true,
            variables: {
              createCounter: { name: 'createCounter', type: 'pointer', value: 'ƒ ()' },
              c1: { name: 'c1', type: 'pointer', value: 'ƒ increment → #Closure-01', pointerRef: '#Closure-01', isModified: true }
            }
          }
        ],
        heap: [
          {
            id: '#Closure-01',
            type: 'Closure Scope',
            label: 'Closure (createCounter)',
            value: '{ count: 10 }',
            properties: { count: 10 }
          }
        ],
        stdout: []
      },
      {
        stepNumber: 5,
        line: 10,
        explanation: 'Invoking c1(). increment() executes in its context and increments closure variable count from 10 to 11.',
        event: 'call',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'Global Execution Context',
            isCurrent: false,
            variables: {
              c1: { name: 'c1', type: 'pointer', value: 'ƒ increment' }
            }
          },
          {
            id: 'frame-increment',
            functionName: 'c1() [Closure: count=11]',
            isCurrent: true,
            lineCalled: 10,
            variables: {
              '[[Scope:Closure]].count': { name: 'count', type: 'int', value: 11, isModified: true }
            }
          }
        ],
        heap: [
          {
            id: '#Closure-01',
            type: 'Closure Scope (Updated)',
            label: 'Closure (createCounter)',
            value: '{ count: 11 }',
            properties: { count: 11 },
            color: '#10b981'
          }
        ],
        stdout: []
      },
      {
        stepNumber: 6,
        line: 10,
        explanation: 'Console logs the returned count (11).',
        event: 'print',
        callStack: [
          {
            id: 'frame-global',
            functionName: 'Global Execution Context',
            isCurrent: true,
            variables: {
              c1: { name: 'c1', type: 'pointer', value: 'ƒ increment' }
            }
          }
        ],
        heap: [
          {
            id: '#Closure-01',
            type: 'Closure Scope',
            label: 'Closure (createCounter)',
            value: '{ count: 11 }',
            properties: { count: 11 }
          }
        ],
        stdout: ['$ node index.js', 'Count: 11']
      }
    ]
  }
];
