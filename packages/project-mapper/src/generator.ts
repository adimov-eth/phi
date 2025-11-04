/**
 * PROJECT-MAP generator orchestrator
 */

import { glob } from 'glob';
import { relative } from 'path';
import type { ProjectMap, ModuleInfo } from './types.js';
import { extractTypeScript } from './extractors/typescript.js';
import { extractSolidity } from './extractors/solidity.js';
import { extractPython } from './extractors/python.js';
import { formatProjectMap } from './s-expr.js';

interface GeneratorOptions {
  rootDir: string;
  ignorePatterns?: string[];
}

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/coverage/**',
  '**/*.test.ts',
  '**/*.test.js',
  '**/*.spec.ts',
  '**/*.spec.js',
];

function extractModule(filePath: string): ModuleInfo | null {
  try {
    if (filePath.match(/\.(ts|tsx|js|jsx)$/)) {
      return extractTypeScript(filePath);
    } else if (filePath.endsWith('.sol')) {
      return extractSolidity(filePath);
    } else if (filePath.endsWith('.py')) {
      return extractPython(filePath);
    }
  } catch (error) {
    console.warn(`Failed to extract ${filePath}:`, (error as Error).message);
  }
  return null;
}

export async function generateProjectMap(options: GeneratorOptions): Promise<string> {
  const { rootDir, ignorePatterns = DEFAULT_IGNORE } = options;

  // Find all source files
  const patterns = [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.sol',
    '**/*.py',
  ];

  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: rootDir,
      absolute: true,
      ignore: ignorePatterns,
    });
    files.push(...matches);
  }

  console.log(`Found ${files.length} files to process`);

  // Extract module info
  const modules: ModuleInfo[] = [];
  for (const file of files) {
    const mod = extractModule(file);
    if (mod) {
      // Make paths relative to root
      mod.path = relative(rootDir, file);
      modules.push(mod);
    }
  }

  // Build project map
  const projectMap: ProjectMap = {
    generated: new Date().toISOString(),
    root: rootDir,
    files: modules.length,
    modules,
  };

  // Format as S-expression
  return formatProjectMap(projectMap);
}
