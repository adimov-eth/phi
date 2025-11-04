import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ActionToolInteraction } from "../framework/ActionToolInteraction.js";
import type { Context } from "hono";
import * as z from "zod";
import { writeFileSync, mkdirSync, rmSync, copyFileSync, renameSync, existsSync, statSync } from "fs";
import { join, isAbsolute, dirname } from "path";

export class ActionTool extends ActionToolInteraction<{}> {
  static readonly name = "act";

  private readonly rootPath = process.env.FS_ROOT || process.cwd();
  private readonly actionDocs: string[] = [];

  readonly contextSchema = {};
  readonly description = "";

  constructor(context: Context) {
    super(context);
    this.registerActions();
  }

  private buildDescription(): string {
    const banner = `Filesystem mutations via batch actions (root: ${this.rootPath})`;
    const safety = "All actions validate before execution; batches report partial success on failure.";
    const docs =
      this.actionDocs.length > 0
        ? this.actionDocs.map(entry => `  ${entry}`).join("\n")
        : "  (actions registered dynamically)";

    return `${banner}

Available actions:
${docs}

${safety}
Ψ reports → ~ decides → Ψ̃ stays in phase.`;
  }

  override async getToolDescription(): Promise<Tool> {
    const ToolClass = this.constructor as typeof ActionTool & { toolName?: string };
    return {
      name: ToolClass.toolName || ToolClass.name,
      description: this.buildDescription(),
      inputSchema: await this.getToolSchema(),
    };
  }

  private addDoc(signature: string, detail: string) {
    const entry = `${signature} – ${detail}`;
    if (!this.actionDocs.includes(entry)) {
      this.actionDocs.push(entry);
    }
  }

  private registerActions() {
    this.registerAction({
      name: "write",
      description: "Write content to file (creates parent directories)",
      props: {
        path: z.string().describe("File path relative to root"),
        content: z.string().describe("File content to write"),
      },
      handler: async (_context, { path, content }) => {
        const fullPath = isAbsolute(path) ? path : join(this.rootPath, path);

        const parentDir = dirname(fullPath);
        if (!existsSync(parentDir)) {
          mkdirSync(parentDir, { recursive: true });
        }

        writeFileSync(fullPath, content, "utf-8");
        return {
          action: "write",
          path: fullPath,
          size: content.length,
        };
      },
    });
    this.addDoc('["write", path, content]', "Write file (parents auto-created)");

    this.registerAction({
      name: "mkdir",
      description: "Create directory (recursive)",
      props: {
        path: z.string().describe("Directory path relative to root"),
      },
      handler: async (_context, { path }) => {
        const fullPath = isAbsolute(path) ? path : join(this.rootPath, path);
        mkdirSync(fullPath, { recursive: true });
        return {
          action: "mkdir",
          path: fullPath,
        };
      },
    });
    this.addDoc('["mkdir", path]', "Create directory recursively");

    this.registerAction({
      name: "delete",
      description: "Delete file or directory (recursive for directories)",
      props: {
        path: z.string().describe("Path to delete relative to root"),
      },
      handler: async (_context, { path }) => {
        const fullPath = isAbsolute(path) ? path : join(this.rootPath, path);

        if (!existsSync(fullPath)) {
          throw new Error(`Path does not exist: ${fullPath}`);
        }

        const stat = statSync(fullPath);
        rmSync(fullPath, { recursive: stat.isDirectory(), force: true });

        return {
          action: "delete",
          path: fullPath,
          type: stat.isDirectory() ? "directory" : "file",
        };
      },
    });
    this.addDoc('["delete", path]', "Remove file or directory");

    this.registerAction({
      name: "copy",
      description: "Copy file from source to destination",
      props: {
        from: z.string().describe("Source file path"),
        to: z.string().describe("Destination file path"),
      },
      handler: async (_context, { from, to }) => {
        const fromPath = isAbsolute(from) ? from : join(this.rootPath, from);
        const toPath = isAbsolute(to) ? to : join(this.rootPath, to);

        if (!existsSync(fromPath)) {
          throw new Error(`Source does not exist: ${fromPath}`);
        }

        const parentDir = dirname(toPath);
        if (!existsSync(parentDir)) {
          mkdirSync(parentDir, { recursive: true });
        }

        copyFileSync(fromPath, toPath);
        return {
          action: "copy",
          from: fromPath,
          to: toPath,
        };
      },
    });
    this.addDoc('["copy", from, to]', "Copy file (parents ensured)");

    this.registerAction({
      name: "move",
      description: "Move or rename file",
      props: {
        from: z.string().describe("Source file path"),
        to: z.string().describe("Destination file path"),
      },
      handler: async (_context, { from, to }) => {
        const fromPath = isAbsolute(from) ? from : join(this.rootPath, from);
        const toPath = isAbsolute(to) ? to : join(this.rootPath, to);

        if (!existsSync(fromPath)) {
          throw new Error(`Source does not exist: ${fromPath}`);
        }

        const parentDir = dirname(toPath);
        if (!existsSync(parentDir)) {
          mkdirSync(parentDir, { recursive: true });
        }

        renameSync(fromPath, toPath);
        return {
          action: "move",
          from: fromPath,
          to: toPath,
        };
      },
    });
    this.addDoc('["move", from, to]', "Move or rename file");
  }

  async executeTool(args: { actions: [string, ...any] }) {
    return this.executeActions(args);
  }
}
