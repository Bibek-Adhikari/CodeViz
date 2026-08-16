import { Language } from '../types';

export interface SyntaxErrorDetail {
  line: number; // 1-indexed
  column?: number; // 1-indexed
  message: string;
  rule: string;
  suggestion?: string;
  severity: 'error' | 'warning';
}

/**
 * Real-time syntax validator for student code in Python, JavaScript, Java, and C++
 */
export function validateSyntax(code: string, language: Language): SyntaxErrorDetail[] {
  const errors: SyntaxErrorDetail[] = [];
  const lines = code.split('\n');

  if (!code.trim()) {
    return errors;
  }

  // 1. Bracket Matching Stack
  const bracketStack: Array<{ char: string; line: number; col: number }> = [];
  const bracketPairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const openBrackets = new Set(['(', '[', '{']);
  const closeBrackets = new Set([')', ']', '}']);

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    const lineNum = lineIdx + 1;
    let inString: string | null = null;
    let isEscaped = false;

    // Check for comment start
    const isPython = language === 'python';
    const commentIdx = isPython ? rawLine.indexOf('#') : rawLine.indexOf('//');
    const lineToCheck = commentIdx !== -1 ? rawLine.substring(0, commentIdx) : rawLine;

    for (let colIdx = 0; colIdx < lineToCheck.length; colIdx++) {
      const char = lineToCheck[colIdx];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      // String delimiter tracking
      if (char === '"' || char === "'" || (char === '`' && language === 'javascript')) {
        if (!inString) {
          inString = char;
        } else if (inString === char) {
          inString = null;
        }
        continue;
      }

      if (inString) continue;

      if (openBrackets.has(char)) {
        bracketStack.push({ char, line: lineNum, col: colIdx + 1 });
      } else if (closeBrackets.has(char)) {
        if (bracketStack.length === 0) {
          errors.push({
            line: lineNum,
            column: colIdx + 1,
            message: `Unmatched closing '${char}' without opening bracket`,
            rule: 'bracket-mismatch',
            suggestion: `Remove this extra '${char}' or add the matching opening bracket`,
            severity: 'error',
          });
        } else {
          const last = bracketStack.pop()!;
          const expectedOpen = bracketPairs[char];
          if (last.char !== expectedOpen) {
            errors.push({
              line: lineNum,
              column: colIdx + 1,
              message: `Mismatched bracket: closed '${char}', but opened '${last.char}' at Line ${last.line}`,
              rule: 'bracket-mismatch',
              suggestion: `Change '${char}' to match '${last.char === '(' ? ')' : last.char === '[' ? ']' : '}'}' or fix the open bracket on Line ${last.line}`,
              severity: 'error',
            });
          }
        }
      }
    }

    // Check for unclosed string on the same line (unless multiline triple quote)
    if (inString && !rawLine.includes('"""') && !rawLine.includes("'''")) {
      errors.push({
        line: lineNum,
        message: `Unterminated string literal: missing closing ${inString}`,
        rule: 'unterminated-string',
        suggestion: `Add closing ${inString} before the end of the line`,
        severity: 'error',
      });
    }
  }

  // Any remaining unclosed brackets in the stack
  if (bracketStack.length > 0) {
    // Only report the first 2 unclosed brackets to avoid overwhelming
    bracketStack.slice(0, 2).forEach((unclosed) => {
      const matchClose = unclosed.char === '(' ? ')' : unclosed.char === '[' ? ']' : '}';
      errors.push({
        line: unclosed.line,
        column: unclosed.col,
        message: `Unclosed '${unclosed.char}' - missing corresponding '${matchClose}'`,
        rule: 'unclosed-bracket',
        suggestion: `Add '${matchClose}' to close the expression opened here`,
        severity: 'error',
      });
    });
  }

  // 2. Line-by-Line Language Specific Grammar & Common Student Mistake Rules
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    const lineNum = lineIdx + 1;
    const trimmed = rawLine.trim();

    // Skip empty lines or pure comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    const cleanLine = (trimmed.split('#')[0] || '').split('//')[0].trim();
    if (!cleanLine) continue;

    if (language === 'python') {
      validatePythonLine(cleanLine, lineNum, lines, lineIdx, errors);
    } else if (language === 'javascript') {
      validateJavaScriptLine(cleanLine, lineNum, errors);
    } else if (language === 'java' || language === 'cpp') {
      validateJavaCppLine(cleanLine, lineNum, language, errors);
    }
  }

  // Deduplicate errors on the same line with same message
  const uniqueErrors: SyntaxErrorDetail[] = [];
  const seenKeys = new Set<string>();

  for (const err of errors) {
    const key = `${err.line}:${err.message}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueErrors.push(err);
    }
  }

  // Sort by line number ascending
  return uniqueErrors.sort((a, b) => a.line - b.line);
}

function validatePythonLine(
  line: string,
  lineNum: number,
  allLines: string[],
  lineIdx: number,
  errors: SyntaxErrorDetail[]
) {
  // 1. Missing colon on compound statements
  const colonKeywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with'];
  for (const kw of colonKeywords) {
    // Regex matches e.g. "def foo():" or "if x > 5"
    const regex = new RegExp(`^${kw}(\\s+.*|\\s*)?$`);
    if (regex.test(line)) {
      if (!line.endsWith(':') && !line.endsWith('\\')) {
        // Special check: ensure it's not a function call or variable named def/class/etc
        if (
          kw === 'else' ||
          kw === 'try' ||
          kw === 'finally' ||
          line.startsWith(`${kw} `) ||
          line.startsWith(`${kw}(`)
        ) {
          errors.push({
            line: lineNum,
            message: `SyntaxError: expected ':' at end of '${kw}' statement`,
            rule: 'missing-colon',
            suggestion: `Add ':' at the end of line ${lineNum} (e.g. \`${line}:\`)`,
            severity: 'error',
          });
        }
      }
    }
  }

  // 2. Common typo: "elseif" instead of "elif"
  if (/^elseif\b/.test(line)) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: invalid keyword 'elseif'. Python uses 'elif'`,
      rule: 'invalid-keyword-python',
      suggestion: `Replace 'elseif' with 'elif'`,
      severity: 'error',
    });
  }

  // 3. Common typo: "function" instead of "def"
  if (/^function\s+[a-zA-Z_]/.test(line)) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: 'function' keyword is JavaScript/C. In Python, use 'def'`,
      rule: 'invalid-keyword-python',
      suggestion: `Replace 'function' with 'def'`,
      severity: 'error',
    });
  }

  // 4. Common mistake: JS var/let/const in Python
  if (/^(let|const|var)\s+[a-zA-Z_]\w*\s*=/.test(line)) {
    const match = line.match(/^(let|const|var)\s+/);
    errors.push({
      line: lineNum,
      message: `SyntaxError: '${match ? match[1] : 'let'}' is not used in Python variable declarations`,
      rule: 'invalid-declaration-python',
      suggestion: `Remove '${match ? match[1] : 'let'}' and assign directly: \`${line.replace(/^(let|const|var)\s+/, '')}\``,
      severity: 'error',
    });
  }

  // 5. Common typo: single '=' in if/while condition
  if (/^(if|elif|while)\s+[^=]*\s+=\s+[^=]/.test(line) && !line.includes('==') && !line.includes('!=') && !line.includes('<=') && !line.includes('>=')) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: assignment '=' used in conditional. Did you mean comparison '=='?`,
      rule: 'assignment-in-condition',
      suggestion: `Use '==' for equality comparison instead of '='`,
      severity: 'warning',
    });
  }

  // 6. Invalid left-hand side assignment: e.g. "5 = x" or "x + 2 = y"
  if (line.includes('=') && !line.startsWith('def ') && !line.startsWith('if ') && !line.startsWith('elif ') && !line.startsWith('while ') && !line.includes('==') && !line.includes('!=') && !line.includes('<=') && !line.includes('>=')) {
    const lhs = line.split('=')[0].trim();
    if (/^[0-9]+$/.test(lhs)) {
      errors.push({
        line: lineNum,
        message: `SyntaxError: cannot assign to literal constant '${lhs}'`,
        rule: 'invalid-lhs-assignment',
        suggestion: `Assign to a variable identifier instead: \`variable_name = ${lhs}\``,
        severity: 'error',
      });
    } else if (lhs.includes('+') || lhs.includes('-') || lhs.includes('*') || lhs.includes('/')) {
      errors.push({
        line: lineNum,
        message: `SyntaxError: cannot assign to operator expression '${lhs}'`,
        rule: 'invalid-lhs-assignment',
        suggestion: `Move the expression to the right-hand side of the '='`,
        severity: 'error',
      });
    }
  }

  // 7. Trailing hanging operator (e.g. "x = 5 +")
  if (/[+\-*/%&|^=]\s*$/.test(line) && !line.endsWith('==') && !line.endsWith('!=')) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: incomplete expression ending with operator '${line.slice(-1)}'`,
      rule: 'hanging-operator',
      suggestion: `Provide an operand after '${line.slice(-1)}'`,
      severity: 'error',
    });
  }

  // 8. Python def without parameter parentheses: "def my_func:"
  if (/^def\s+[a-zA-Z_]\w*\s*:/.test(line)) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: function definition missing parameter parentheses '()'`,
      rule: 'missing-function-parens',
      suggestion: `Add '()' after the function name: \`${line.replace(':', '():')}\``,
      severity: 'error',
    });
  }

  // 9. Python boolean case typo: "true" or "false" or "none"
  if (/\b(true|false|null|none)\b/.test(line) && !line.includes('"') && !line.includes("'")) {
    const match = line.match(/\b(true|false|null|none)\b/);
    if (match) {
      const proper = match[1] === 'true' ? 'True' : match[1] === 'false' ? 'False' : match[1] === 'null' ? 'None' : 'None';
      errors.push({
        line: lineNum,
        message: `NameError: '${match[1]}' is not defined in Python. Python uses capitalized '${proper}'`,
        rule: 'python-case-sensitivity',
        suggestion: `Change '${match[1]}' to '${proper}'`,
        severity: 'warning',
      });
    }
  }
}

function validateJavaScriptLine(line: string, lineNum: number, errors: SyntaxErrorDetail[]) {
  // 1. Python keywords used in JS
  if (/^def\s+/.test(line)) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: 'def' is Python syntax. Use 'function' or 'const fn = () =>' in JavaScript`,
      rule: 'invalid-keyword-js',
      suggestion: `Replace 'def' with 'function'`,
      severity: 'error',
    });
  }

  if (/^elif\b/.test(line)) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: 'elif' is Python. JavaScript uses 'else if'`,
      rule: 'invalid-keyword-js',
      suggestion: `Replace 'elif' with 'else if'`,
      severity: 'error',
    });
  }

  // 2. if/while/for without parentheses: e.g. "if x > 5 {"
  if (/^(if|while|for)\s+[^(].*\{?$/.test(line)) {
    const kw = line.split(' ')[0];
    errors.push({
      line: lineNum,
      message: `SyntaxError: condition in '${kw}' statement must be enclosed in parentheses '( ... )'`,
      rule: 'missing-condition-parens',
      suggestion: `Wrap condition with parentheses: \`${kw} (condition) {\``,
      severity: 'error',
    });
  }

  // 3. Assignment in condition warning
  if (/^if\s*\([^=]*\s+=\s+[^=]/.test(line) && !line.includes('===') && !line.includes('==') && !line.includes('!=')) {
    errors.push({
      line: lineNum,
      message: `Warning: assignment '=' inside 'if' condition. Expected '===' or '=='`,
      rule: 'assignment-in-condition',
      suggestion: `Use '===' for comparison`,
      severity: 'warning',
    });
  }
}

function validateJavaCppLine(
  line: string,
  lineNum: number,
  language: Language,
  errors: SyntaxErrorDetail[]
) {
  // 1. Python/JS keywords in Java/C++
  if (/^def\s+/.test(line)) {
    errors.push({
      line: lineNum,
      message: `SyntaxError: 'def' is not valid in ${language === 'cpp' ? 'C++' : 'Java'}. Specify a return type (e.g. 'int', 'void')`,
      rule: 'invalid-keyword-compiled',
      suggestion: `Replace 'def' with return type: \`int function_name(...)\``,
      severity: 'error',
    });
  }

  // 2. Control flow without parentheses: "if x > 5 {"
  if (/^(if|while|for)\s+[^(].*\{?$/.test(line)) {
    const kw = line.split(' ')[0];
    errors.push({
      line: lineNum,
      message: `SyntaxError: '${kw}' statement requires parentheses around condition`,
      rule: 'missing-condition-parens',
      suggestion: `Enclose condition in parentheses: \`${kw} (condition)\``,
      severity: 'error',
    });
  }

  // 3. Semicolon check on typical statement lines
  const needsSemicolon =
    !line.endsWith(';') &&
    !line.endsWith('{') &&
    !line.endsWith('}') &&
    !line.endsWith(':') &&
    !line.startsWith('#') &&
    !line.startsWith('//') &&
    !line.startsWith('if') &&
    !line.startsWith('else') &&
    !line.startsWith('while') &&
    !line.startsWith('for') &&
    !line.startsWith('switch') &&
    !line.startsWith('case') &&
    !line.startsWith('default') &&
    !line.startsWith('class') &&
    !line.startsWith('struct') &&
    !line.startsWith('public') &&
    !line.startsWith('private') &&
    !line.startsWith('protected') &&
    !line.endsWith('\\');

  if (needsSemicolon && line.length > 2) {
    // Check if it's an assignment, print, return, break, or variable declaration
    if (
      line.includes('=') ||
      line.startsWith('return') ||
      line.startsWith('cout') ||
      line.startsWith('System.out') ||
      line.startsWith('printf') ||
      line.startsWith('break') ||
      line.startsWith('continue') ||
      /^(int|float|double|char|bool|string|String|auto)\s+/.test(line)
    ) {
      errors.push({
        line: lineNum,
        message: `SyntaxError: missing semicolon ';' at end of statement`,
        rule: 'missing-semicolon',
        suggestion: `Add ';' at the end: \`${line}; \``,
        severity: 'error',
      });
    }
  }
}
