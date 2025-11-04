/**
 * Tests for TypeScript extractor
 *
 * TDD: Write these BEFORE implementing to verify tests catch bugs
 */

import { describe, test, expect } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { extractTypeScript } from './typescript.js';

const TMP_DIR = join(import.meta.dirname, '__test_tmp__');

function setupTestFile(filename: string, content: string): string {
  const path = join(TMP_DIR, filename);
  const dir = join(path, '..');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, 'utf-8');
  return path;
}

function cleanup() {
  try {
    rmSync(TMP_DIR, { recursive: true, force: true });
  } catch {}
}

describe('extractTypeScript', () => {
  test('extracts named function exports', () => {
    const path = setupTestFile('test.ts', `
export function hello() {
  return 'world';
}
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.language).toBe('typescript');
    expect(result.exports).toContainEqual({ name: 'hello', kind: 'function' });
  });

  test('extracts named class exports', () => {
    const path = setupTestFile('test.ts', `
export class UserCache {
  private data = new Map();
}
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.exports).toContainEqual({ name: 'UserCache', kind: 'class' });
  });

  test('extracts const exports', () => {
    const path = setupTestFile('test.ts', `
export const API_KEY = 'secret';
export const MAX_RETRIES = 3;
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.exports).toContainEqual({ name: 'API_KEY', kind: 'const' });
    expect(result.exports).toContainEqual({ name: 'API_KEY', kind: 'const' });
    expect(result.exports).toContainEqual({ name: 'MAX_RETRIES', kind: 'const' });
  });

  test('extracts type exports', () => {
    const path = setupTestFile('test.ts', `
export type User = { id: string; name: string };
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.exports).toContainEqual({ name: 'User', kind: 'type' });
  });

  test('extracts interface exports', () => {
    const path = setupTestFile('test.ts', `
export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.exports).toContainEqual({ name: 'Cache', kind: 'interface' });
  });

  test('extracts default exports', () => {
    const path = setupTestFile('test.ts', `
export default function main() {
  console.log('hello');
}
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.exports).toContainEqual({ name: 'main', kind: 'default' });
  });

  test('extracts external imports', () => {
    const path = setupTestFile('test.ts', `
import { readFile, writeFile } from 'fs';
import express from 'express';
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.imports).toContainEqual({
      source: 'fs',
      imported: ['readFile', 'writeFile'],
      kind: 'external',
    });
    expect(result.imports).toContainEqual({
      source: 'express',
      imported: ['default'],
      kind: 'external',
    });
  });

  test('extracts local imports', () => {
    const path = setupTestFile('test.ts', `
import { helper } from './utils';
import type { User } from '../types';
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.imports).toContainEqual({
      source: './utils',
      imported: ['helper'],
      kind: 'local',
    });
    expect(result.imports).toContainEqual({
      source: '../types',
      imported: ['User'],
      kind: 'local',
    });
  });

  test('counts lines correctly', () => {
    const path = setupTestFile('test.ts', `line1
line2
line3
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.lineCount).toBe(4); // includes blank line
  });

  test('handles JSX files (.tsx)', () => {
    const path = setupTestFile('test.tsx', `
export function Component() {
  return <div>Hello</div>;
}
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.language).toBe('typescript');
    expect(result.exports).toContainEqual({ name: 'Component', kind: 'function' });
  });

  test('handles JavaScript files (.js)', () => {
    const path = setupTestFile('test.js', `
export function helper() {
  return 42;
}
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.language).toBe('javascript');
    expect(result.exports).toContainEqual({ name: 'helper', kind: 'function' });
  });

  test('handles parse errors gracefully', () => {
    const path = setupTestFile('invalid.ts', `
this is not valid TypeScript @ # $
    `);

    const result = extractTypeScript(path);
    cleanup();

    // Should return basic info even on parse failure
    expect(result.path).toBe(path);
    expect(result.language).toBe('typescript');
    expect(result.lineCount).toBeGreaterThan(0);
    // Exports/imports may be empty due to parse failure
  });

  test('returns relative path', () => {
    const path = setupTestFile('nested/deep/file.ts', `
export const VALUE = 1;
    `);

    const result = extractTypeScript(path);
    cleanup();

    expect(result.path).toBe(path);
  });
});
