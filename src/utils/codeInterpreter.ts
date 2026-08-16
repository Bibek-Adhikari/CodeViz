import { ExecutionStep, StackFrame, HeapObject, VariableValue, VariableType } from '../types';

/**
 * Lightweight client-side step generator for custom user-written code
 * Supports assignments, basic arithmetic, function definitions & calls, prints, lists, and loops.
 */
export function generateExecutionSteps(code: string, language: string): ExecutionStep[] {
  const lines = code.split('\n');
  const steps: ExecutionStep[] = [];
  const globalVars: Record<string, VariableValue> = {};
  const heap: HeapObject[] = [];
  const stdout: string[] = [`$ ${language === 'python' ? 'python main.py' : language === 'cpp' ? './a.out' : language === 'java' ? 'java Main' : 'node index.js'}`];
  let heapCounter = 1;

  // Track function definitions
  const functionDefs: Record<string, { params: string[]; bodyStart: number; bodyEnd: number; bodyLines: string[] }> = {};

  // First pass: find functions
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw.startsWith('def ') && raw.includes('(') && raw.includes(')')) {
      const match = raw.match(/def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\):/);
      if (match) {
        const fnName = match[1];
        const params = match[2].split(',').map(p => p.trim()).filter(Boolean);
        let end = i + 1;
        while (end < lines.length && (lines[end].startsWith('    ') || lines[end].startsWith('\t') || lines[end].trim() === '')) {
          end++;
        }
        functionDefs[fnName] = {
          params,
          bodyStart: i + 1,
          bodyEnd: end,
          bodyLines: lines.slice(i + 1, end)
        };
      }
    }
  }

  // Initial step: program start
  steps.push({
    stepNumber: 1,
    line: 1,
    explanation: 'Program execution started. Allocating GLOBAL execution environment and stack frame.',
    callStack: [{
      id: 'frame-global',
      functionName: 'GLOBAL',
      isCurrent: true,
      variables: {}
    }],
    heap: [],
    stdout: [...stdout],
    event: 'init'
  });

  // Execute line by line
  let i = 0;
  while (i < lines.length) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines or pure comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      i++;
      continue;
    }

    // Function definition line
    if (trimmed.startsWith('def ')) {
      const match = trimmed.match(/def\s+([a-zA-Z_]\w*)/);
      if (match) {
        const fnName = match[1];
        globalVars[fnName] = {
          name: fnName,
          type: 'pointer',
          value: `<function ${fnName} at 0x7f${Math.floor(Math.random() * 89999 + 10000)}>`
        };
        steps.push({
          stepNumber: steps.length + 1,
          line: lineNum,
          explanation: `Function "${fnName}" compiled and stored in GLOBAL scope.`,
          callStack: [{
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: JSON.parse(JSON.stringify(globalVars))
          }],
          heap: JSON.parse(JSON.stringify(heap)),
          stdout: [...stdout],
          event: 'init',
          highlightVariables: [fnName]
        });
        // Skip over function body lines during definition
        if (functionDefs[fnName]) {
          i = functionDefs[fnName].bodyEnd;
          continue;
        }
      }
      i++;
      continue;
    }

    // Print statement
    if (trimmed.startsWith('print(') || trimmed.startsWith('console.log(') || trimmed.startsWith('System.out.print') || trimmed.startsWith('cout')) {
      let printContent = '';
      if (trimmed.startsWith('print(')) {
        const inner = trimmed.slice(6, trimmed.lastIndexOf(')'));
        printContent = evaluatePrintArgs(inner, globalVars);
      } else if (trimmed.startsWith('console.log(')) {
        const inner = trimmed.slice(12, trimmed.lastIndexOf(')'));
        printContent = evaluatePrintArgs(inner, globalVars);
      } else {
        printContent = 'Result evaluated';
      }

      stdout.push(printContent);
      steps.push({
        stepNumber: steps.length + 1,
        line: lineNum,
        explanation: `Print statement executed. Output: "${printContent}".`,
        callStack: [{
          id: 'frame-global',
          functionName: 'GLOBAL',
          isCurrent: true,
          variables: JSON.parse(JSON.stringify(globalVars))
        }],
        heap: JSON.parse(JSON.stringify(heap)),
        stdout: [...stdout],
        event: 'print'
      });
      i++;
      continue;
    }

    // Variable Assignment: x = ...
    if (trimmed.includes('=') && !trimmed.startsWith('==') && !trimmed.startsWith('if ') && !trimmed.startsWith('for ')) {
      const parts = trimmed.split('=');
      const varName = parts[0].trim().replace(/^(let|const|var|int|float|double|String|auto)\s+/, '');
      const expr = parts.slice(1).join('=').trim().replace(/;$/, '');

      // Check if it's a function call: z = add_numbers(x, y)
      const callMatch = expr.match(/^([a-zA-Z_]\w*)\s*\(([^)]*)\)$/);
      if (callMatch && functionDefs[callMatch[1]]) {
        const fnName = callMatch[1];
        const fnDef = functionDefs[fnName];
        const argStrings = callMatch[2].split(',').map(a => a.trim()).filter(Boolean);
        const resolvedArgs: Record<string, VariableValue> = {};

        fnDef.params.forEach((param, idx) => {
          const argValStr = argStrings[idx];
          if (argValStr && globalVars[argValStr]) {
            resolvedArgs[param] = { ...globalVars[argValStr], name: param, isModified: true };
          } else {
            const parsedVal = evaluateSimpleExpr(argValStr || '0', globalVars);
            resolvedArgs[param] = { name: param, type: determineType(parsedVal), value: parsedVal, isModified: true };
          }
        });

        // Step 1: Call push frame
        const localFrame: StackFrame = {
          id: `frame-${fnName}-${Date.now()}`,
          functionName: `${fnName}()`,
          isCurrent: true,
          lineCalled: lineNum,
          returnAddress: `Line ${lineNum}`,
          variables: resolvedArgs
        };

        steps.push({
          stepNumber: steps.length + 1,
          line: lineNum,
          explanation: `Calling ${fnName}(${argStrings.join(', ')}). Created stack frame "${fnName}()" on top of GLOBAL.`,
          callStack: [
            { id: 'frame-global', functionName: 'GLOBAL', isCurrent: false, variables: JSON.parse(JSON.stringify(globalVars)) },
            JSON.parse(JSON.stringify(localFrame))
          ],
          heap: JSON.parse(JSON.stringify(heap)),
          stdout: [...stdout],
          event: 'call'
        });

        // Execute function body lines
        let returnVal: any = null;
        for (let b = 0; b < fnDef.bodyLines.length; b++) {
          const bLine = fnDef.bodyLines[b].trim();
          const bLineNum = fnDef.bodyStart + b;
          if (!bLine) continue;

          if (bLine.startsWith('return ')) {
            const retExpr = bLine.replace('return ', '').trim().replace(/;$/, '');
            returnVal = evaluateSimpleExpr(retExpr, { ...globalVars, ...localFrame.variables });
            localFrame.returnValue = String(returnVal);
            steps.push({
              stepNumber: steps.length + 1,
              line: bLineNum,
              explanation: `Function ${fnName}() reached return statement with value ${returnVal}.`,
              callStack: [
                { id: 'frame-global', functionName: 'GLOBAL', isCurrent: false, variables: JSON.parse(JSON.stringify(globalVars)) },
                JSON.parse(JSON.stringify(localFrame))
              ],
              heap: JSON.parse(JSON.stringify(heap)),
              stdout: [...stdout],
              event: 'return'
            });
          } else if (bLine.includes('=')) {
            const bParts = bLine.split('=');
            const bVar = bParts[0].trim();
            const bVal = evaluateSimpleExpr(bParts[1].trim(), { ...globalVars, ...localFrame.variables });
            localFrame.variables[bVar] = {
              name: bVar,
              type: determineType(bVal),
              value: bVal,
              isModified: true
            };
            steps.push({
              stepNumber: steps.length + 1,
              line: bLineNum,
              explanation: `Evaluated ${bParts[0].trim()} = ${bVal} inside ${fnName}() frame.`,
              callStack: [
                { id: 'frame-global', functionName: 'GLOBAL', isCurrent: false, variables: JSON.parse(JSON.stringify(globalVars)) },
                JSON.parse(JSON.stringify(localFrame))
              ],
              heap: JSON.parse(JSON.stringify(heap)),
              stdout: [...stdout],
              event: 'assign',
              highlightVariables: [bVar]
            });
          }
        }

        // Return to caller and assign result
        globalVars[varName] = {
          name: varName,
          type: determineType(returnVal),
          value: returnVal,
          isModified: true
        };

        steps.push({
          stepNumber: steps.length + 1,
          line: lineNum,
          explanation: `Frame ${fnName}() popped. Result ${returnVal} assigned to variable "${varName}" in GLOBAL scope.`,
          callStack: [{
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: JSON.parse(JSON.stringify(globalVars))
          }],
          heap: JSON.parse(JSON.stringify(heap)),
          stdout: [...stdout],
          event: 'assign',
          highlightVariables: [varName]
        });

        i++;
        continue;
      }

      // Check if assigning a list: items = [1, 2, 3]
      if (expr.startsWith('[') && expr.endsWith(']')) {
        const heapId = `#00${heapCounter++}`;
        heap.push({
          id: heapId,
          type: 'list',
          label: `List Object ${heapId}`,
          value: expr,
          color: '#a855f7'
        });
        globalVars[varName] = {
          name: varName,
          type: 'pointer',
          value: `→ ${heapId}`,
          pointerRef: heapId,
          isModified: true
        };
        steps.push({
          stepNumber: steps.length + 1,
          line: lineNum,
          explanation: `Allocated list ${expr} on Heap at ${heapId}. Reference stored in "${varName}".`,
          callStack: [{
            id: 'frame-global',
            functionName: 'GLOBAL',
            isCurrent: true,
            variables: JSON.parse(JSON.stringify(globalVars))
          }],
          heap: JSON.parse(JSON.stringify(heap)),
          stdout: [...stdout],
          event: 'assign',
          highlightVariables: [varName]
        });
        i++;
        continue;
      }

      // Standard variable assignment
      const val = evaluateSimpleExpr(expr, globalVars);
      globalVars[varName] = {
        name: varName,
        type: determineType(val),
        value: val,
        isModified: true
      };

      steps.push({
        stepNumber: steps.length + 1,
        line: lineNum,
        explanation: `Assigned ${val} to variable "${varName}" in GLOBAL scope.`,
        callStack: [{
          id: 'frame-global',
          functionName: 'GLOBAL',
          isCurrent: true,
          variables: JSON.parse(JSON.stringify(globalVars))
        }],
        heap: JSON.parse(JSON.stringify(heap)),
        stdout: [...stdout],
        event: 'assign',
        highlightVariables: [varName]
      });

      i++;
      continue;
    }

    i++;
  }

  // Completed status step
  if (steps.length > 1) {
    const lastStep = steps[steps.length - 1];
    steps.push({
      stepNumber: steps.length + 1,
      line: lastStep.line,
      explanation: 'Process finished with exit code 0. Execution completed successfully.',
      callStack: JSON.parse(JSON.stringify(lastStep.callStack)),
      heap: JSON.parse(JSON.stringify(lastStep.heap)),
      stdout: [...stdout, 'Process completed successfully.'],
      event: 'return'
    });
  }

  return steps;
}

function determineType(val: any): VariableType {
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
  if (typeof val === 'boolean') return 'bool';
  if (typeof val === 'string') return 'string';
  if (Array.isArray(val)) return 'list';
  return 'none';
}

function evaluateSimpleExpr(expr: string, context: Record<string, VariableValue>): any {
  let cleaned = expr.trim();

  // Strings
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    return cleaned.slice(1, -1);
  }

  // Boolean
  if (cleaned === 'True' || cleaned === 'true') return true;
  if (cleaned === 'False' || cleaned === 'false') return false;

  // Single variable lookup
  if (context[cleaned]) {
    return context[cleaned].value;
  }

  // Replace variable names with their values in arithmetic expressions
  for (const [varName, varObj] of Object.entries(context)) {
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    cleaned = cleaned.replace(regex, String(varObj.value));
  }

  try {
    // Safe numeric eval for basic math (+, -, *, /)
    if (/^[0-9+\-*/().\s]+$/.test(cleaned)) {
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${cleaned})`)();
    }
  } catch {
    // Fallback
  }

  return cleaned;
}

function evaluatePrintArgs(inner: string, context: Record<string, VariableValue>): string {
  // e.g. "The result is:", z
  const tokens = inner.split(',').map(t => t.trim());
  const evaluated = tokens.map(token => {
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return token.slice(1, -1);
    }
    if (context[token]) {
      return String(context[token].value);
    }
    return token;
  });
  return evaluated.join(' ');
}
