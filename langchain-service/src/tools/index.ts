import { generateToolsFromOpenAPI } from "./openapi-generator";
import { createCallJavaAPITool } from "./legacy-tool";

/**
 * Generates all tools from OpenAPI spec
 * Use this instead of the single generic tool
 */
export function createToolsFromOpenAPI(authToken?: string) {
  return generateToolsFromOpenAPI(authToken);
}

/**
 * Legacy tool - kept for backward compatibility
 * You can remove this once you've fully migrated
 */
export { createCallJavaAPITool };

