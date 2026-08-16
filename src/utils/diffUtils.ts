/**
 * Line-level and word-level Diff Algorithm for Code Version Comparison
 */

export type DiffLineType = 'equal' | 'added' | 'removed' | 'modified';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number | null;
  newLineNumber?: number | null;
  wordDiffs?: { text: string; type: 'equal' | 'added' | 'removed' }[];
}

export interface SideBySideDiffPair {
  left: DiffLine | null;  // Original / Before
  right: DiffLine | null; // Current / After
}

export interface DiffResult {
  isIdentical: boolean;
  additionsCount: number;
  deletionsCount: number;
  modifiedCount: number;
  unchangedCount: number;
  similarityPercentage: number;
  unifiedLines: DiffLine[];
  sideBySidePairs: SideBySideDiffPair[];
}

/**
 * Computes Longest Common Subsequence (LCS) table between two string arrays
 */
function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Computes simple word diff between two single lines of code
 */
export function computeWordDiff(
  oldLine: string,
  newLine: string
): {
  oldWords: { text: string; type: 'equal' | 'removed' }[];
  newWords: { text: string; type: 'equal' | 'added' }[];
} {
  const splitTokens = (str: string) => str.split(/(\s+|[()[\]{},.:;+\-*/=<>!&|"'`])/g).filter(Boolean);
  const wordsA = splitTokens(oldLine);
  const wordsB = splitTokens(newLine);

  const dp = computeLCS(wordsA, wordsB);
  let i = wordsA.length;
  let j = wordsB.length;

  const oldWords: { text: string; type: 'equal' | 'removed' }[] = [];
  const newWords: { text: string; type: 'equal' | 'added' }[] = [];

  const tempOld: { text: string; type: 'equal' | 'removed' }[] = [];
  const tempNew: { text: string; type: 'equal' | 'added' }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      tempOld.unshift({ text: wordsA[i - 1], type: 'equal' });
      tempNew.unshift({ text: wordsB[j - 1], type: 'equal' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempNew.unshift({ text: wordsB[j - 1], type: 'added' });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tempOld.unshift({ text: wordsA[i - 1], type: 'removed' });
      i--;
    }
  }

  return {
    oldWords: tempOld,
    newWords: tempNew,
  };
}

/**
 * Generates structured diff result comparing original code against current working code
 */
export function generateCodeDiff(originalCode: string, currentCode: string): DiffResult {
  const origLines = originalCode.replace(/\r\n/g, '\n').split('\n');
  const currLines = currentCode.replace(/\r\n/g, '\n').split('\n');

  if (originalCode.trim() === currentCode.trim()) {
    const unified: DiffLine[] = currLines.map((line, idx) => ({
      type: 'equal',
      content: line,
      oldLineNumber: idx + 1,
      newLineNumber: idx + 1,
    }));

    const sideBySide: SideBySideDiffPair[] = currLines.map((line, idx) => ({
      left: {
        type: 'equal',
        content: line,
        oldLineNumber: idx + 1,
      },
      right: {
        type: 'equal',
        content: line,
        newLineNumber: idx + 1,
      },
    }));

    return {
      isIdentical: true,
      additionsCount: 0,
      deletionsCount: 0,
      modifiedCount: 0,
      unchangedCount: currLines.length,
      similarityPercentage: 100,
      unifiedLines: unified,
      sideBySidePairs: sideBySide,
    };
  }

  const dp = computeLCS(origLines, currLines);
  let i = origLines.length;
  let j = currLines.length;

  const rawDiff: {
    type: 'equal' | 'added' | 'removed';
    content: string;
    oldLine?: number;
    newLine?: number;
  }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === currLines[j - 1]) {
      rawDiff.unshift({
        type: 'equal',
        content: origLines[i - 1],
        oldLine: i,
        newLine: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'added',
        content: currLines[j - 1],
        newLine: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'removed',
        content: origLines[i - 1],
        oldLine: i,
      });
      i--;
    }
  }

  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  let modified = 0;

  const unifiedLines: DiffLine[] = [];
  const sideBySidePairs: SideBySideDiffPair[] = [];

  // Group adjacent deletions and additions into modifications where possible
  let k = 0;
  while (k < rawDiff.length) {
    const item = rawDiff[k];

    if (item.type === 'equal') {
      unchanged++;
      unifiedLines.push({
        type: 'equal',
        content: item.content,
        oldLineNumber: item.oldLine,
        newLineNumber: item.newLine,
      });
      sideBySidePairs.push({
        left: {
          type: 'equal',
          content: item.content,
          oldLineNumber: item.oldLine,
        },
        right: {
          type: 'equal',
          content: item.content,
          newLineNumber: item.newLine,
        },
      });
      k++;
    } else if (item.type === 'removed') {
      // Check if next consecutive items are additions to align side-by-side
      const removedGroup: typeof rawDiff = [];
      while (k < rawDiff.length && rawDiff[k].type === 'removed') {
        removedGroup.push(rawDiff[k]);
        k++;
      }
      const addedGroup: typeof rawDiff = [];
      while (k < rawDiff.length && rawDiff[k].type === 'added') {
        addedGroup.push(rawDiff[k]);
        k++;
      }

      // Add to unified list
      removedGroup.forEach((r) => {
        deletions++;
        unifiedLines.push({
          type: 'removed',
          content: r.content,
          oldLineNumber: r.oldLine,
        });
      });
      addedGroup.forEach((a) => {
        additions++;
        unifiedLines.push({
          type: 'added',
          content: a.content,
          newLineNumber: a.newLine,
        });
      });

      // Align for side-by-side
      const maxLen = Math.max(removedGroup.length, addedGroup.length);
      for (let idx = 0; idx < maxLen; idx++) {
        const leftItem = removedGroup[idx] || null;
        const rightItem = addedGroup[idx] || null;

        if (leftItem && rightItem) {
          modified++;
          // Compute sub-line token diff
          const wordDiff = computeWordDiff(leftItem.content, rightItem.content);
          sideBySidePairs.push({
            left: {
              type: 'modified',
              content: leftItem.content,
              oldLineNumber: leftItem.oldLine,
              wordDiffs: wordDiff.oldWords,
            },
            right: {
              type: 'modified',
              content: rightItem.content,
              newLineNumber: rightItem.newLine,
              wordDiffs: wordDiff.newWords,
            },
          });
        } else if (leftItem) {
          sideBySidePairs.push({
            left: {
              type: 'removed',
              content: leftItem.content,
              oldLineNumber: leftItem.oldLine,
            },
            right: null,
          });
        } else if (rightItem) {
          sideBySidePairs.push({
            left: null,
            right: {
              type: 'added',
              content: rightItem.content,
              newLineNumber: rightItem.newLine,
            },
          });
        }
      }
    } else if (item.type === 'added') {
      additions++;
      unifiedLines.push({
        type: 'added',
        content: item.content,
        newLineNumber: item.newLine,
      });
      sideBySidePairs.push({
        left: null,
        right: {
          type: 'added',
          content: item.content,
          newLineNumber: item.newLine,
        },
      });
      k++;
    }
  }

  const totalLines = Math.max(origLines.length, currLines.length);
  const similarity = totalLines > 0 ? Math.round((unchanged / totalLines) * 100) : 100;

  return {
    isIdentical: additions === 0 && deletions === 0,
    additionsCount: additions,
    deletionsCount: deletions,
    modifiedCount: modified,
    unchangedCount: unchanged,
    similarityPercentage: similarity,
    unifiedLines,
    sideBySidePairs,
  };
}
