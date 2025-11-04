/**
 * Python extractor using regex patterns
 */

import { readFileSync } from 'fs';
import type { ModuleInfo, ModuleExport } from '../types.js';

function countLines(content: string): number {
  return content.split('\n').length;
}

export function extractPython(filePath: string): ModuleInfo {
  const content = readFileSync(filePath, 'utf-8');
  const lineCount = countLines(content);
  const exports: ModuleExport[] = [];

  // Extract function definitions
  const functionMatches = content.matchAll(/^def\s+(\w+)\s*\(/gm);
  for (const match of functionMatches) {
    if (!match[1].startsWith('_')) {  // Skip private functions
      exports.push({ name: match[1], kind: 'function' });
    }
  }

  // Extract class definitions
  const classMatches = content.matchAll(/^class\s+(\w+)/gm);
  for (const match of classMatches) {
    if (!match[1].startsWith('_')) {  // Skip private classes
      exports.push({ name: match[1], kind: 'class' });
    }
  }

  return {
    path: filePath,
    language: 'python',
    exports,
    imports: [],  // Python imports can be complex, skip for now
    lineCount,
  };
}
