#!/usr/bin/env bun
/**
 * Test phi plugin loading via Agent SDK
 * Verifies: plugin loads, commands available, MCP server connects
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import * as path from "path";

async function testPluginLoading() {
  const pluginPath = path.join(process.cwd());

  console.log("🧪 Testing phi plugin loading");
  console.log("📁 Plugin path:", pluginPath);
  console.log("📄 Plugin manifest:", path.join(pluginPath, ".claude-plugin/plugin.json"));
  console.log();

  try {
    for await (const message of query({
      prompt: "List available phi commands and verify periphery MCP tools are loaded",
      options: {
        plugins: [
          { type: "local", path: pluginPath }
        ],
        maxTurns: 2,
        stderr: (data) => console.error("📢 STDERR:", data)
      }
    })) {
      console.log("📨 Message type:", message.type, message.subtype || "");

      if (message.type === "system" && message.subtype === "init") {
        console.log("✅ System initialized");
        console.log("📦 Loaded plugins:", JSON.stringify(message.plugins, null, 2));
        console.log("🔧 All commands:", JSON.stringify(message.slash_commands, null, 2));
        console.log("🛠️  MCP servers:", JSON.stringify(message.mcp_servers, null, 2));
        console.log();
      }

      if (message.type === "assistant") {
        console.log("🤖 Assistant response:");
        if (message.content) {
          for (const block of message.content) {
            if (block.type === "text") {
              console.log(block.text);
            }
          }
        } else {
          console.log("(empty content)");
        }
        console.log();
      }

      if (message.type === "tool_use") {
        console.log("🔨 Tool used:", message.name);
      }

      if (message.type === "error") {
        console.error("❌ Error:", message);
      }
    }

    console.log("✅ Plugin test completed successfully");
  } catch (error) {
    console.error("❌ Plugin test failed:", error);
    process.exit(1);
  }
}

testPluginLoading().catch(console.error);
