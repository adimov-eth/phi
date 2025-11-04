/**
 * Types for PROJECT-MAP generation
 */

export type Language = 'typescript' | 'javascript' | 'solidity' | 'python' | 'racket' | 'scheme';

export interface ModuleExport {
  name: string;
  kind: 'function' | 'class' | 'const' | 'type' | 'interface' | 'default';
}

export interface ModuleImport {
  source: string;
  imported: string[];
  kind: 'external' | 'local';
}

export interface ModuleInfo {
  path: string;
  language: Language;
  exports: ModuleExport[];
  imports: ModuleImport[];
  lineCount: number;
}

export interface ProjectMap {
  generated: string;  // ISO timestamp
  root: string;
  files: number;
  modules: ModuleInfo[];
}
