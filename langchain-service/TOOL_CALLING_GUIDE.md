# Tool Calling Guide: Working with NVIDIA Models

## Current Situation

### The Problem

The NVIDIA model `meta/llama-4-maverick-17b-128e-instruct` **does not support function calling** in the traditional sense. When you send tools to the API:

- ✅ Tools are correctly formatted and sent
- ✅ Model receives the tools
- ❌ Model **does NOT make actual tool calls** (`tool_calls: null`)
- ❌ Model only **describes** using tools in text instead of calling them

### Example of the Problem

**What happens:**
```
User: "Get current tenant info"
Model response: "I will use the getCurrentTenant tool..."
tool_calls: null  ← No actual tool call!
```

**What we want:**
```
User: "Get current tenant info"
Model response: tool_calls: [{name: "getCurrentTenant", args: {}}]
→ Tool actually executes
→ Real API data returned
```

## Our Solution: Fallback Mechanism

We implemented a **fallback mechanism** that:

1. **Detects** when the model mentions a tool name in text
2. **Finds** the corresponding tool from available tools
3. **Calls** the tool manually
4. **Returns** the real API result

### How It Works

```typescript
// In agent.ts, after model response:
if (!hasActualToolCalls) {
  // 1. Extract tool name from text using regex patterns
  // 2. Find tool in available tools list
  // 3. Call tool.invoke({})
  // 4. Return real API result
}
```

## How to Add New Tools

### 1. Tools Are Auto-Generated from OpenAPI

Tools are automatically generated from your OpenAPI spec (`docs/api/openapi.json`). You don't need to manually add tools!

**To add a new tool:**
1. Add the endpoint to your Java backend
2. Update `docs/api/openapi.json` (or use `yarn openapi:pull`)
3. Restart the langchain service
4. The tool will be automatically available

### 2. Tool Naming Convention

Tools are named using the `operationId` from OpenAPI:

```json
{
  "/api/v1/tenants/current": {
    "get": {
      "operationId": "getCurrentTenant",  ← This becomes the tool name
      ...
    }
  }
}
```

**Important:** Make sure your OpenAPI spec has descriptive `operationId` values!

### 3. Tool Descriptions

Tool descriptions are generated from:
1. `description` field in OpenAPI
2. `summary` field (if no description)
3. Auto-generated: "Execute {operationId}"

We enhance descriptions with:
- `USE THIS TOOL to fetch/retrieve data from the API` (for GET)
- `USE THIS TOOL to create new resources in the API` (for POST)
- `Endpoint: GET /api/v1/tenants/current`

## Handling Different Tool Types

### Tools with No Parameters (GET endpoints)

**Example:** `getCurrentTenant`

```typescript
// OpenAPI spec
{
  "get": {
    "operationId": "getCurrentTenant",
    "parameters": []  // No parameters
  }
}

// Fallback automatically calls:
tool.invoke({})  // Empty object
```

**Works automatically!** ✅

### Tools with Path Parameters

**Example:** `findCandidateById`

```typescript
// OpenAPI spec
{
  "get": {
    "operationId": "findCandidateById",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "schema": {"type": "string", "format": "uuid"}
      }
    ]
  }
}
```

**Current Limitation:** ❌ The fallback mechanism currently only handles tools with **no parameters**. 

**To fix this, you need to:**

1. **Extract parameters from user query** using NLP
2. **Parse the query** to find parameter values
3. **Call tool with extracted parameters**

**Example implementation needed:**

```typescript
// In agent.ts fallback section
if (detectedToolName === "findCandidateById") {
  // Extract ID from user query or model response
  const idMatch = userText.match(/id[:\s]+([a-f0-9-]+)/i) || 
                  content.match(/id[:\s]+([a-f0-9-]+)/i);
  const id = idMatch?.[1];
  
  if (id) {
    const toolResult = await tool.invoke({ id });
  }
}
```

### Tools with Query Parameters

**Example:** `getCandidates`

```typescript
// OpenAPI spec
{
  "get": {
    "operationId": "getCandidates",
    "parameters": [
      {
        "name": "profiles",
        "in": "query",
        "required": false,
        "schema": {"type": "array", "items": {"type": "string"}}
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "schema": {"type": "integer", "default": 0}
      }
    ]
  }
}
```

**Current Limitation:** ❌ Same as path parameters - need to extract from query.

**Solution:** Implement parameter extraction logic for each tool type.

### Tools with Request Body (POST/PUT/PATCH)

**Example:** `createUser`

```typescript
// OpenAPI spec
{
  "post": {
    "operationId": "createUser",
    "requestBody": {
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/UserCreateRequest"
          }
        }
      }
    }
  }
}
```

**Current Limitation:** ❌ Most complex - need to extract entire object from user query.

**Solution:** Use the model's response to extract structured data, or implement form-based extraction.

## Best Practices

### 1. Use Clear, Descriptive Tool Names

✅ **Good:**
- `getCurrentTenant`
- `findCandidateById`
- `createUser`

❌ **Bad:**
- `get1`
- `endpoint2`
- `doStuff`

### 2. Write Good Descriptions in OpenAPI

```json
{
  "operationId": "getCurrentTenant",
  "description": "Retrieves information about the currently authenticated tenant",
  "summary": "Get current tenant"
}
```

### 3. Make Tool Names Match User Language

If users say "get my tenant", make sure the tool name or description includes "tenant":

```json
{
  "operationId": "getCurrentTenant",
  "description": "USE THIS TOOL to fetch/retrieve data from the API. Get current tenant information. Endpoint: GET /api/v1/tenants/current"
}
```

### 4. Test Tool Detection

After adding a tool, test if the fallback can detect it:

```bash
# Test query
curl -X POST http://localhost:3001/agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Get current tenant"}'

# Check logs for:
# [DEBUG] 🔍 FALLBACK: Found tool via pattern match: "getCurrentTenant"
# [DEBUG] ✅ FALLBACK: Tool "getCurrentTenant" executed successfully
```

## Troubleshooting

### Problem: Tool Not Detected

**Symptoms:**
- Model mentions tool but fallback doesn't detect it
- Logs show: `[DEBUG] ⚠️ FALLBACK: Tool "toolName" not found`

**Solutions:**

1. **Check tool name matches exactly:**
   ```typescript
   // In agent.ts, add logging:
   console.log(`[DEBUG] Available tools:`, tools.map(t => t.name));
   ```

2. **Improve detection patterns:**
   ```typescript
   // Add more regex patterns in agent.ts fallback section
   const additionalPattern = /(\w+)\s+tool/i;
   ```

3. **Check OpenAPI operationId:**
   ```bash
   # Verify in openapi.json
   grep -A 5 "operationId" docs/api/openapi.json
   ```

### Problem: Tool Called But Returns Error

**Symptoms:**
- `[DEBUG] ✅ FALLBACK: Tool executed`
- But returns error message

**Solutions:**

1. **Check authentication:**
   ```typescript
   // Verify token is passed to tools
   console.log(`[DEBUG] Auth token:`, authToken ? "present" : "missing");
   ```

2. **Check API base URL:**
   ```typescript
   // In openapi-generator.ts
   const API_BASE_URL = "http://localhost:8080";  // Verify port
   ```

3. **Check tool parameters:**
   ```typescript
   // Log what parameters are being sent
   console.log(`[DEBUG] Tool input:`, JSON.stringify(input));
   ```

### Problem: Tool Needs Parameters But Gets Empty Object

**Symptoms:**
- Tool executes but returns 400/404 error
- Logs show: `tool.invoke({})` but tool needs parameters

**Solutions:**

1. **Implement parameter extraction** (see "Handling Different Tool Types" above)

2. **Use model's response to extract parameters:**
   ```typescript
   // Parse model's text response for parameter values
   const idMatch = content.match(/id[:\s]+([a-f0-9-]+)/i);
   const id = idMatch?.[1];
   ```

3. **Ask user for missing parameters:**
   ```typescript
   if (!id) {
     return "I need a candidate ID to find the candidate. Please provide the ID.";
   }
   ```

## Future Improvements

### 1. Switch to a Model That Supports Function Calling

**Recommended models:**
- `meta/llama-3.1-70b-instruct` (if available on NVIDIA)
- OpenAI models (if switching providers)
- Anthropic Claude (if switching providers)

**To switch:**
```typescript
// In agent.ts
const model = new ChatNvidia({
  model: "meta/llama-3.1-70b-instruct",  // Change here
  // ...
});
```

### 2. Implement Parameter Extraction

Create a helper function to extract parameters from user queries:

```typescript
function extractToolParameters(
  toolName: string,
  userQuery: string,
  modelResponse: string,
  toolSchema: any
): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Extract based on tool schema
  if (toolSchema.properties) {
    for (const [paramName, paramSchema] of Object.entries(toolSchema.properties)) {
      // Implement extraction logic for each parameter type
      // UUID, string, number, etc.
    }
  }
  
  return params;
}
```

### 3. Use Structured Outputs

Instead of function calling, use structured outputs:

```typescript
// Ask model to return JSON with tool name and parameters
const systemPrompt = `Return a JSON object with:
{
  "tool": "toolName",
  "parameters": {...}
}`;
```

### 4. Implement Multi-Step Tool Calling

For queries like "Get current tenant, then get all users for that tenant":

```typescript
// 1. Call getCurrentTenant
// 2. Extract tenantId from result
// 3. Call getUsers with tenantId
// 4. Return combined result
```

## Summary

### What Works Now ✅

- Tools auto-generated from OpenAPI
- Fallback mechanism for tools with no parameters
- Real API calls for simple GET endpoints
- Authentication token passing
- Comprehensive logging

### What Needs Work ⚠️

- Parameter extraction from user queries
- Tools with path/query parameters
- Tools with request bodies
- Multi-step tool calling
- Better error handling

### Quick Reference

**To add a new endpoint:**
1. Add to Java backend
2. Update OpenAPI spec
3. Restart service
4. Test with fallback mechanism

**To debug tool issues:**
1. Check logs for `[DEBUG] 🔍 FALLBACK`
2. Verify tool name matches
3. Check authentication
4. Verify API base URL

**To improve detection:**
1. Add regex patterns in `agent.ts`
2. Improve tool descriptions in OpenAPI
3. Use clear, consistent naming

---

**Remember:** The fallback mechanism is a workaround. The ideal solution is using a model that properly supports function calling, or implementing comprehensive parameter extraction logic.

