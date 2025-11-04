/**
 * S-expression formatting for PROJECT-MAP output
 * Uses @agi/arrival for proper S-expression serialization
 */

import { formatSExpr } from '@agi/arrival';
import type { ProjectMap, ModuleInfo, ModuleExport, ModuleImport } from './types.js';

function buildExport(exp: ModuleExport): any[] {
  return ['export', exp.name, exp.kind];
}

function buildImport(imp: ModuleImport): any[] {
  return ['import', imp.source, imp.kind, imp.imported];
}

function buildModule(mod: ModuleInfo): any[] {
  return [
    'module',
    mod.path,
    ['language', mod.language],
    ['exports', ...mod.exports.map(buildExport)],
    ['imports', ...mod.imports.map(buildImport)],
    ['line-count', mod.lineCount]
  ];
}

export function formatProjectMap(map: ProjectMap): string {
  // Build S-expression structure as nested arrays
  const expr = [
    'project-map',
    ['auto-generated', true],
    ['generated', map.generated],
    ['root', map.root],
    ['files', map.files],
    ['modules', ...map.modules.map(buildModule)]
  ];

  // Format using arrival
  const formatted = formatSExpr(expr);

  // Add header comment
  const header = `;;; PROJECT-MAP.auto.scm
;;; Auto-generated: ${map.generated}
;;; Root: ${map.root}
;;; Files: ${map.files}

`;

  return header + formatted + '\n';
}
