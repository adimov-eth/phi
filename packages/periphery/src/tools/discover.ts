import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { DiscoveryToolInteraction } from "../framework/DiscoveryToolInteraction.js";
import type { Context } from "hono";
import * as z from "zod";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, basename, dirname, isAbsolute } from "path";
import { glob } from "glob";
import { execSync } from "child_process";

/**
 * Filesystem discovery tool – dynamic manifest of composable primitives.
 * Ψ observes, ~ acts. Start with observation.
 */
export class DiscoverTool extends DiscoveryToolInteraction<{}> {
  static readonly name = "discover";

  private readonly rootPath = process.env.FS_ROOT || process.cwd();
  private readonly functionDocs: string[] = [];

  readonly description = "";

  constructor(context: Context) {
    super(context);
  }

  private buildDescription(): string {
    const banner = `Filesystem discovery via S-expressions (root: ${this.rootPath})`;
    const docs =
      this.functionDocs.length > 0
        ? this.functionDocs.map(entry => `  ${entry}`).join("\n")
        : "  (register-functions still warming up)";

    const recipes = `
Common patterns:

  ; Find files and transform
  (fmap basename (find-files "*.ts" "src"))

  ; Filter by content
  (filter (lambda (f) (string-contains? (read-file f) "export"))
          (find-files "*.ts"))

  ; Multi-file text replacement (returns action tuples for ~)
  (chain (lambda (f)
           (list "write" f (string-replace (read-file f) "old" "new")))
         (find-files "*.ts"))

  ; Conditional file operations
  (chain (lambda (f)
           (let ((content (read-file f)))
             (if (string-contains? content "pattern")
                 (list "write" f (string-replace content "old" "new"))
                 nil)))
         (find-files "**/*.ts"))`;

    return `${banner}

Available primitives:
${docs}

${recipes}

Compose freely (fmap, chain, filter, compose, pipe). Ψ keeps sensing; hand off to ~ when ready.`;
  }

  override async getToolDescription(): Promise<Tool> {
    const ToolClass = this.constructor as typeof DiscoverTool & { toolName?: string };
    return {
      name: ToolClass.toolName || ToolClass.name,
      description: this.buildDescription(),
      inputSchema: await this.getToolSchema(),
    };
  }

  private recordFunction(signature: string, detail: string) {
    const entry = `${signature} – ${detail}`;
    if (!this.functionDocs.includes(entry)) {
      this.functionDocs.push(entry);
    }
  }

  async registerFunctions(_context: {}): Promise<() => Promise<void>> {
    // Filesystem discovery
    this.registerFunction(
      "ls",
      "List directory contents with type info",
      [z.string()],
      (path: string) => {
        const fullPath = isAbsolute(path) ? path : join(this.rootPath, path);
        try {
          const entries = readdirSync(fullPath);
          return entries.map(name => {
            const entryPath = join(fullPath, name);
            const stat = statSync(entryPath);
            return {
              name,
              type: stat.isDirectory() ? "dir" : "file",
              size: stat.size,
            };
          });
        } catch (error: any) {
          throw new Error(`ls: ${error.message}`);
        }
      }
    );
    this.recordFunction("(ls path)", "List directory with type/size");

    this.registerFunction(
      "read-file",
      "Read file contents as string",
      [z.string()],
      (path: string) => {
        const fullPath = isAbsolute(path) ? path : join(this.rootPath, path);
        try {
          return readFileSync(fullPath, "utf-8");
        } catch (error: any) {
          throw new Error(`read-file: ${error.message}`);
        }
      }
    );
    this.recordFunction("(read-file path)", "Read file contents as UTF-8");

    this.registerFunction(
      "find-files",
      "Find files matching glob pattern",
      [z.string(), z.string().optional()],
      async (pattern: string, basePath?: string) => {
        const searchPath = basePath
          ? (isAbsolute(basePath) ? basePath : join(this.rootPath, basePath))
          : this.rootPath;
        try {
          const files = await glob(pattern, { cwd: searchPath });
          return files;
        } catch (error: any) {
          throw new Error(`find-files: ${error.message}`);
        }
      }
    );
    this.recordFunction("(find-files pattern [base])", "Glob search relative to root/base");

    this.registerFunction(
      "grep",
      "Search for pattern in file",
      [z.string(), z.string()],
      (pattern: string, file: string) => {
        const fullPath = isAbsolute(file) ? file : join(this.rootPath, file);
        try {
          const result = execSync(`grep -n "${pattern}" "${fullPath}"`, { encoding: "utf-8" });
          return result.trim().length === 0 ? [] : result.trim().split("\n");
        } catch (error: any) {
          // grep returns exit code 1 when no matches found
          if (error.status === 1) return [];
          throw new Error(`grep: ${error.message}`);
        }
      }
    );
    this.recordFunction("(grep pattern file)", "Regex search within file (line numbers)");

    // String operations
    this.registerFunction(
      "string-contains?",
      "Check if string contains substring",
      [z.string(), z.string()],
      (str: string, substr: string) => str.includes(substr)
    );
    this.recordFunction("(string-contains? str substr)", "Substring predicate");

    this.registerFunction(
      "string-length",
      "Get string length",
      [z.string()],
      (str: string) => str.length
    );
    this.recordFunction("(string-length str)", "String length");

    this.registerFunction(
      "string-split",
      "Split string by delimiter",
      [z.string(), z.string()],
      (str: string, delimiter: string) => str.split(delimiter)
    );
    this.recordFunction("(string-split str delimiter)", "Split string");

    this.registerFunction(
      "string-append",
      "Concatenate strings (variadic)",
      [],
      (...strings: string[]) => strings.join("")
    );
    this.recordFunction("(string-append str...)", "Concatenate strings");

    this.registerFunction(
      "string-upcase",
      "Convert string to uppercase",
      [z.string()],
      (str: string) => str.toUpperCase()
    );
    this.recordFunction("(string-upcase str)", "Uppercase string");

    this.registerFunction(
      "string-downcase",
      "Convert string to lowercase",
      [z.string()],
      (str: string) => str.toLowerCase()
    );
    this.recordFunction("(string-downcase str)", "Lowercase string");

    this.registerFunction(
      "string-trim",
      "Trim whitespace from both ends",
      [z.string()],
      (str: string) => str.trim()
    );
    this.recordFunction("(string-trim str)", "Trim whitespace");

    this.registerFunction(
      "string-match",
      "Match regex pattern (returns first match or nil)",
      [z.string(), z.string()],
      (str: string, pattern: string) => {
        try {
          const match = str.match(new RegExp(pattern));
          return match ? match[0] : null;
        } catch (error: any) {
          throw new Error(`string-match: invalid regex pattern: ${pattern}`);
        }
      }
    );
    this.recordFunction("(string-match str pattern)", "Regex match (first hit or nil)");

    this.registerFunction(
      "string-replace",
      "Replace all occurrences of pattern with replacement",
      [z.string(), z.string(), z.string()],
      (str: string, pattern: string, replacement: string) => {
        try {
          return str.replace(new RegExp(pattern, 'g'), replacement);
        } catch (error: any) {
          throw new Error(`string-replace: invalid regex pattern: ${pattern}`);
        }
      }
    );
    this.recordFunction("(string-replace str pattern replacement)", "Global regex replace");

    // Path operations
    this.registerFunction(
      "path-join",
      "Join path segments (cross-platform)",
      [],
      (...segments: string[]) => join(...segments)
    );
    this.recordFunction("(path-join seg1 ...)", "Join path segments");

    this.registerFunction(
      "basename",
      "Get filename from path",
      [z.string(), z.string().optional()],
      (path: string, ext?: string) => basename(path, ext)
    );
    this.recordFunction("(basename path [ext])", "Extract filename");

    this.registerFunction(
      "dirname",
      "Get directory from path",
      [z.string()],
      (path: string) => dirname(path)
    );
    this.recordFunction("(dirname path)", "Parent directory");

    return async () => {};
  }
}
