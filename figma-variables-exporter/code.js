"use strict";
(() => {
  // src/variableReader.ts
  async function getCollections() {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    return collections.map((c) => ({
      id: c.id,
      name: c.name,
      modeCount: c.modes.length
    }));
  }
  async function getCollection(id) {
    return await figma.variables.getVariableCollectionByIdAsync(id);
  }
  async function getCollectionVariables(collection) {
    const variables = [];
    for (const varId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(varId);
      if (variable)
        variables.push(variable);
    }
    return variables;
  }
  function categorizeVariable(name) {
    const lower = name.toLowerCase();
    if (lower.includes("color") || lower.includes("bg") || lower.includes("fg"))
      return "colors";
    if (lower.includes("font") || lower.includes("text"))
      return "typography";
    if (lower.includes("spacing") || lower.includes("gap"))
      return "spacing";
    return "other";
  }
  function shouldExportVariable(name, options) {
    const cat = categorizeVariable(name);
    if (cat === "colors" && !options.colors)
      return false;
    if (cat === "typography" && !options.typography)
      return false;
    if (cat === "spacing" && !options.spacing)
      return false;
    return true;
  }

  // src/exporter.ts
  async function exportVariables(collectionIds, options) {
    const files = [];
    for (const colId of collectionIds) {
      const collection = await getCollection(colId);
      if (!collection)
        continue;
      const variables = await getCollectionVariables(collection);
      for (const mode of collection.modes) {
        const tokens = buildTokens(variables, mode.modeId, options);
        if (Object.keys(tokens).length === 0)
          continue;
        files.push({
          name: `${collection.name}_${mode.name}_tokens.json`.replace(/\s+/g, "_"),
          content: JSON.stringify(tokens, null, 2)
        });
      }
    }
    return files;
  }
  function buildTokens(variables, modeId, options) {
    const tokens = {};
    for (const v of variables) {
      if (!shouldExportVariable(v.name, options))
        continue;
      const value = v.valuesByMode[modeId];
      if (value === void 0)
        continue;
      const formatted = formatValue(value, v.resolvedType);
      const path = v.name.split("/").map((p) => p.trim());
      setNested(tokens, path, formatted);
    }
    return tokens;
  }
  function formatValue(value, type) {
    if (type === "COLOR" && typeof value === "object" && "r" in value) {
      const { r, g, b, a = 1 } = value;
      const hex = "#" + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
      return { $type: "color", $value: { hex, alpha: a } };
    }
    if (type === "FLOAT") {
      return { $type: "number", $value: value };
    }
    if (type === "STRING") {
      return { $type: "string", $value: value };
    }
    return { $type: "unknown", $value: String(value) };
  }
  function setNested(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  // src/code.ts
  figma.showUI(__html__, { width: 340, height: 480 });
  loadCollections();
  async function loadCollections() {
    const collections = await getCollections();
    figma.ui.postMessage({ type: "collections", collections });
  }
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "cancel") {
      figma.closePlugin();
      return;
    }
    if (msg.type === "export") {
      try {
        const files = await exportVariables(
          msg.collections || [],
          msg.options || { colors: true, typography: true, spacing: true }
        );
        figma.ui.postMessage({
          type: "export-complete",
          files,
          fileCount: files.length
        });
      } catch (e) {
        figma.ui.postMessage({
          type: "error",
          message: String(e)
        });
      }
    }
    if (msg.type === "sync") {
      try {
        figma.ui.postMessage({ type: "loading", message: "Syncing..." });
        const files = await exportVariables(
          msg.collections || [],
          msg.options || { colors: true, typography: true, spacing: true }
        );
        const response = await fetch(msg.apiUrl || "http://localhost:3001/api/tokens", {
          method: "POST",
          headers: msg.apiKey ? {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${msg.apiKey}`
          } : {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tokens: files,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "figma-plugin"
          })
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        const result = await response.json();
        figma.ui.postMessage({
          type: "sync-complete",
          result
        });
        figma.notify("Synced to dashboard");
      } catch (e) {
        figma.ui.postMessage({
          type: "error",
          message: `Sync failed: ${e}`
        });
        figma.notify("Sync failed", { error: true });
      }
    }
  };
})();
