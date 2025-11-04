/**
 * TypeScript/JavaScript extractor using AST parsing
 */

import { parse } from '@typescript-eslint/typescript-estree';
import { readFileSync } from 'fs';
import type { ModuleInfo, ModuleExport, ModuleImport } from '../types.js';

function countLines(content: string): number {
  return content.split('\n').length;
}

function isExternal(source: string): boolean {
  return !source.startsWith('.') && !source.startsWith('/');
}

export function extractTypeScript(filePath: string): ModuleInfo {
  const content = readFileSync(filePath, 'utf-8');
  const lineCount = countLines(content);

  const exports: ModuleExport[] = [];
  const imports: ModuleImport[] = [];

  try {
    const ast = parse(content, {
      loc: false,
      range: false,
      comment: false,
      tokens: false,
      errorOnUnknownASTType: false,
      jsx: filePath.endsWith('.tsx') || filePath.endsWith('.jsx'),
    });

    // Extract imports
    for (const stmt of ast.body) {
      if (stmt.type === 'ImportDeclaration') {
        const source = stmt.source.value as string;
        const imported: string[] = [];

        for (const spec of stmt.specifiers) {
          if (spec.type === 'ImportSpecifier') {
            const name = spec.imported.type === 'Identifier' ? spec.imported.name : String(spec.imported.value);
            imported.push(name);
          } else if (spec.type === 'ImportDefaultSpecifier') {
            imported.push('default');
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            imported.push('*');
          }
        }

        imports.push({
          source,
          imported,
          kind: isExternal(source) ? 'external' : 'local',
        });
      }
    }

    // Extract exports
    for (const stmt of ast.body) {
      if (stmt.type === 'ExportNamedDeclaration') {
        if (stmt.declaration) {
          const decl = stmt.declaration;
          if (decl.type === 'FunctionDeclaration' && decl.id) {
            exports.push({ name: decl.id.name, kind: 'function' });
          } else if (decl.type === 'ClassDeclaration' && decl.id) {
            exports.push({ name: decl.id.name, kind: 'class' });
          } else if (decl.type === 'VariableDeclaration') {
            for (const declarator of decl.declarations) {
              if (declarator.id.type === 'Identifier') {
                exports.push({ name: declarator.id.name, kind: 'const' });
              }
            }
          } else if (decl.type === 'TSTypeAliasDeclaration') {
            exports.push({ name: decl.id.name, kind: 'type' });
          } else if (decl.type === 'TSInterfaceDeclaration') {
            exports.push({ name: decl.id.name, kind: 'interface' });
          }
        } else if (stmt.specifiers) {
          for (const spec of stmt.specifiers) {
            if (spec.type === 'ExportSpecifier') {
              const name = spec.exported.type === 'Identifier' ? spec.exported.name : String(spec.exported.value);
              exports.push({
                name,
                kind: 'const',  // Can't determine kind from re-export
              });
            }
          }
        }
      } else if (stmt.type === 'ExportDefaultDeclaration') {
        let name = 'default';
        if (stmt.declaration.type === 'Identifier') {
          name = stmt.declaration.name;
        } else if (stmt.declaration.type === 'FunctionDeclaration' && stmt.declaration.id) {
          name = stmt.declaration.id.name;
        } else if (stmt.declaration.type === 'ClassDeclaration' && stmt.declaration.id) {
          name = stmt.declaration.id.name;
        }
        exports.push({ name, kind: 'default' });
      }
    }
  } catch (error) {
    // If parsing fails, return basic info
    console.warn(`Failed to parse ${filePath}:`, (error as Error).message);
  }

  const language = filePath.endsWith('.ts') || filePath.endsWith('.tsx')
    ? 'typescript'
    : 'javascript';

  return {
    path: filePath,
    language,
    exports,
    imports,
    lineCount,
  };
}
