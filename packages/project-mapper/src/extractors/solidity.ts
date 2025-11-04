/**
 * Solidity extractor using regex patterns
 */

import { readFileSync } from 'fs';
import type { ModuleInfo, ModuleExport } from '../types.js';

function countLines(content: string): number {
  return content.split('\n').length;
}

export function extractSolidity(filePath: string): ModuleInfo {
  const content = readFileSync(filePath, 'utf-8');
  const lineCount = countLines(content);
  const exports: ModuleExport[] = [];

  // Extract contracts
  const contractMatches = content.matchAll(/contract\s+(\w+)/g);
  for (const match of contractMatches) {
    exports.push({ name: match[1], kind: 'class' });
  }

  // Extract interfaces
  const interfaceMatches = content.matchAll(/interface\s+(\w+)/g);
  for (const match of interfaceMatches) {
    exports.push({ name: match[1], kind: 'interface' });
  }

  // Extract libraries
  const libraryMatches = content.matchAll(/library\s+(\w+)/g);
  for (const match of libraryMatches) {
    exports.push({ name: match[1], kind: 'class' });
  }

  // Extract public/external functions
  const functionMatches = content.matchAll(/function\s+(\w+)\s*\([^)]*\)\s+(?:public|external)/g);
  for (const match of functionMatches) {
    exports.push({ name: match[1], kind: 'function' });
  }

  return {
    path: filePath,
    language: 'solidity',
    exports,
    imports: [],  // Solidity imports are typically contract dependencies, handled separately
    lineCount,
  };
}
