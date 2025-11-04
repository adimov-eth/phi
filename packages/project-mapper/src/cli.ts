#!/usr/bin/env node
/**
 * CLI for generating PROJECT-MAP.auto.scm
 */

import { writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { generateProjectMap } from './generator.js';

async function main() {
  const args = process.argv.slice(2);
  const rootDir = args[0] ? resolve(args[0]) : process.cwd();

  console.log(`Generating PROJECT-MAP for: ${rootDir}`);

  const output = await generateProjectMap({ rootDir });
  const outputPath = join(rootDir, '.phi', 'PROJECT-MAP.auto.scm');

  // Ensure .phi directory exists
  const { mkdirSync } = await import('fs');
  mkdirSync(join(rootDir, '.phi'), { recursive: true });

  writeFileSync(outputPath, output, 'utf-8');

  console.log(`✓ Generated: ${outputPath}`);
  console.log(`  Files: ${output.split('\n  (module').length - 1}`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
