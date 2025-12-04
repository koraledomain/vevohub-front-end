import { tool } from "@langchain/core/tools";
import { traceable } from "langsmith/traceable";
import { buildToolSchemaFromOperation } from "./schema-converter";
import openapiSpec from "../../../docs/api/openapi.json";

type OpenAPISpec = typeof openapiSpec;
type Operation = any;

const API_BASE_URL = "http://localhost:8080";

/**
 * Replaces path parameters with actual values
 * Example: /users/{id} with {id: "123"} -> /users/123
 */
function buildUrl(path: string, pathParams: Record<string, any>): string {
  let url = path;
  for (const [key, value] of Object.entries(pathParams)) {
    url = url.replace(`{${key}}`, String(value));
  }
  return `${API_BASE_URL}${url}`;
}

/**
 * Creates a tool handler for a specific OpenAPI operation
 */
function createToolHandler(
  path: string,
  method: string,
  operation: Operation,
  authToken?: string
) {
  return traceable(
    async (input: unknown) => {
      console.log(`[DEBUG] 🔧 TOOL EXECUTED: ${operation.operationId}`);
      console.log(`[DEBUG] 🔧 Method: ${method.toUpperCase()}, Path: ${path}`);
      console.log(`[DEBUG] 🔧 Input parameters:`, JSON.stringify(input, null, 2));
      try {
        const params = input as Record<string, any>;
        const pathParams: Record<string, any> = {};
        const queryParams: Record<string, any> = {};
        const bodyParams: Record<string, any> = {};

        // Separate path params, query params, and body
        operation.parameters?.forEach((paramDef: any) => {
          const value = params[paramDef.name];
          if (paramDef.in === 'path') {
            pathParams[paramDef.name] = value;
          } else if (paramDef.in === 'query' && value !== undefined) {
            queryParams[paramDef.name] = value;
          }
        });

        // Handle request body (for POST, PUT, PATCH)
        if (operation.requestBody && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
          const bodySchema = operation.requestBody.content?.['application/json']?.schema;
          if (bodySchema) {
            // Use properties from body schema
            if (bodySchema.properties) {
              Object.keys(bodySchema.properties).forEach((key) => {
                if (params[key] !== undefined) {
                  bodyParams[key] = params[key];
                }
              });
            } else {
              // Fallback: use all params not in path/query
              const paramNames = new Set(operation.parameters?.map((p: any) => p.name) || []);
              Object.entries(params).forEach(([key, value]) => {
                if (!paramNames.has(key)) {
                  bodyParams[key] = value;
                }
              });
            }
          }
        }

        // Build URL
        const url = buildUrl(path, pathParams);

        // Build query string
        const queryString = new URLSearchParams(
          Object.entries(queryParams).reduce((acc, [k, v]) => {
            if (Array.isArray(v)) {
              v.forEach((item) => acc.append(k, String(item)));
            } else {
              acc.set(k, String(v));
            }
            return acc;
          }, new URLSearchParams())
        ).toString();

        const fullUrl = queryString ? `${url}?${queryString}` : url;

        console.log(`[DEBUG] Making ${method.toUpperCase()} request to: ${fullUrl}`);

        // Prepare headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
          console.log(`[DEBUG] Adding Authorization header to ${method.toUpperCase()} ${path}`);
        } else {
          console.log(`[WARN] No auth token provided for ${method.toUpperCase()} ${path} - request may fail if endpoint requires authentication`);
        }

        // Make the request
        const fetchOptions: RequestInit = {
          method: method.toUpperCase(),
          headers,
        };

        // Add body for POST, PUT, PATCH
        if (['post', 'put', 'patch'].includes(method.toLowerCase()) && Object.keys(bodyParams).length > 0) {
          fetchOptions.body = JSON.stringify(bodyParams);
        }

        const response = await fetch(fullUrl, fetchOptions);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return JSON.stringify({ success: true, message: "Operation completed successfully" });
        }

        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        if (error instanceof Error) {
          return `Error: ${error.message}`;
        }
        return `Unknown error occurred`;
      }
    },
    {
      run_type: "tool",
      name: `${operation.operationId}_handler`,
    }
  );
}

/**
 * Generates LangChain tools from OpenAPI specification
 */
export function generateToolsFromOpenAPI(authToken?: string) {
  const tools = [];
  const spec = openapiSpec as OpenAPISpec;
  const components = spec.components;

  // Iterate through all paths
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    // Iterate through HTTP methods
    for (const [method, operation] of Object.entries(pathItem)) {
      // Skip non-HTTP-method keys
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        continue;
      }

      const op = operation as Operation;

      // Skip if no operationId
      if (!op.operationId) {
        console.warn(`Skipping ${method.toUpperCase()} ${path} - no operationId`);
        continue;
      }

      // Build tool schema from operation
      const toolSchema = buildToolSchemaFromOperation(op, components);

      // Create tool description - make it more directive
      const baseDescription = op.description || op.summary || `Execute ${op.operationId}`;
      const methodUpper = method.toUpperCase();

      // Enhance description to be more actionable
      let description = baseDescription;

      // Add directive prefix based on method
      if (methodUpper === 'GET') {
        description = `USE THIS TOOL to fetch/retrieve data from the API. ${baseDescription}`;
      } else if (methodUpper === 'POST') {
        description = `USE THIS TOOL to create new resources in the API. ${baseDescription}`;
      } else if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
        description = `USE THIS TOOL to update existing resources in the API. ${baseDescription}`;
      } else if (methodUpper === 'DELETE') {
        description = `USE THIS TOOL to delete resources from the API. ${baseDescription}`;
      }

      // Add path context for better tool selection
      description += ` Endpoint: ${methodUpper} ${path}`;

      // Create the tool
      const langchainTool = tool(
        createToolHandler(path, method, op, authToken),
        {
          name: op.operationId,
          description: description,
          schema: toolSchema,
        }
      );

      tools.push(langchainTool);
    }
  }

  return tools;
}

