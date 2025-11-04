import type { CallToolRequest, CallToolResult, ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
import type { Context } from "hono";
import invariant from "tiny-invariant";
import type { Constructor } from "type-fest";

import type { ToolInteraction, UserlandCallToolResult } from "./ToolInteraction.js";

function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export class MCPServer {
  public readonly tools: Constructor<ToolInteraction<any>>[];

  constructor(...tools: Constructor<ToolInteraction<any>>[]) {
    this.tools = tools;
  }

  async callTool(context: Context, request: CallToolRequest["params"]): Promise<CallToolResult> {
    const ToolInteraction = this.tools.find(({ name }) => name === request.name);
    invariant(ToolInteraction !== undefined, `Unknown tool: ${request.name}`);

    const toolInteraction = new ToolInteraction(context);
    console.log("🔧", request.name);
    const callToolResult = await toolInteraction.executeTool(request.arguments);

    return {
      content: await Promise.all(
        asArray(callToolResult).map(async (result): Promise<CallToolResult["content"][number]> => {
          switch (true) {
            case typeof result === "string":
              return {
                type: "text",
                text: result,
              };
            case result instanceof Blob && result.type.startsWith("image/"):
            case result instanceof Blob && result.type.startsWith("audio/"): {
              let binary = "";
              const bytes = new Uint8Array(await result.arrayBuffer());
              const length_ = bytes.byteLength;
              for (let index = 0; index < length_; index++) {
                binary += String.fromCodePoint(bytes[index]!);
              }
              return {
                type: result.type.split("/")[0] as "image" | "audio",
                data: btoa(binary),
                mimeType: result.type,
              };
            }
            default:
              return {
                type: "text",
                text: JSON.stringify(result, null, 2),
              };
          }
        }),
      ),
    };
  }

  async getToolDefinitions(context: Context): Promise<ListToolsResult["tools"]> {
    const definitions: ListToolsResult["tools"] = [];

    for (const ToolClass of this.tools) {
      try {
        const tool = new ToolClass(context);
        const definition = await tool.getToolDescription();
        definitions.push(definition);
      } catch (error) {
        console.warn(`Failed to get definition for ${ToolClass.name}:`, error);
      }
    }

    return definitions;
  }
}
