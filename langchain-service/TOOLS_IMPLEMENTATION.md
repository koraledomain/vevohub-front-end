# OpenAPI Tools Implementation Guide

## Overview

This document describes the implementation of automatic tool generation from OpenAPI specification for the LangChain service. Instead of using a single generic tool, the system now generates specific tools for each API endpoint defined in the OpenAPI spec.

> **⚠️ Important:** See [TOOL_CALLING_GUIDE.md](./TOOL_CALLING_GUIDE.md) for information about the current limitations with function calling and how to work with tools that require parameters.

## What Changed

### Before
- **Single generic tool**: `call_java_api` that accepted a natural language query
- The AI had to guess which endpoint to use
- No type safety for specific endpoints
- Limited understanding of available operations

### After
- **Multiple specific tools**: One tool per API endpoint (e.g., `getCandidates`, `createUser`, `findCandidateById`)
- Clear tool descriptions from OpenAPI spec
- Type-safe parameters from schemas
- Better tool selection by the AI
- Easier maintenance as API evolves

## Directory Structure

```
langchain-service/
├── src/
│   ├── tools/
│   │   ├── index.ts              # Exports all tools
│   │   ├── openapi-generator.ts  # Main generator logic
│   │   ├── schema-converter.ts   # OpenAPI → JSON Schema converter
│   │   └── legacy-tool.ts        # Old generic tool (for backward compatibility)
│   ├── agent.ts                  # Updated to use new tools
│   └── ...
├── docs/
│   └── api/
│       └── openapi.json          # OpenAPI specification
└── tsconfig.json                 # Updated to allow JSON imports
```

## Files Created/Modified

### 1. `src/tools/schema-converter.ts`
**Purpose**: Converts OpenAPI schemas to JSON Schema format for LangChain tools

**Key Functions**:
- `convertSchema()`: Converts OpenAPI schema types (objects, arrays, primitives) to JSON Schema
- `buildToolSchemaFromOperation()`: Builds complete tool schema from OpenAPI operation (parameters + request body)

**Features**:
- Handles `$ref` references to component schemas
- **Circular reference detection**: Prevents infinite recursion when schemas reference each other (e.g., `CandidatesEntity` ↔ `ContactsEntity`)
- Supports arrays, objects, and primitive types
- Extracts path parameters, query parameters, and request body

### 2. `src/tools/openapi-generator.ts`
**Purpose**: Generates LangChain tools from OpenAPI specification

**Key Functions**:
- `generateToolsFromOpenAPI()`: Main function that iterates through OpenAPI paths and creates tools
- `createToolHandler()`: Creates the actual HTTP request handler for each tool
- `buildUrl()`: Replaces path parameters in URLs

**Features**:
- Automatically generates tools for all endpoints in OpenAPI spec
- Handles GET, POST, PUT, PATCH, DELETE methods
- Supports path parameters, query parameters, and request bodies
- Includes authentication token support
- Proper error handling

### 3. `src/tools/legacy-tool.ts`
**Purpose**: Legacy generic tool kept for backward compatibility

**Note**: Can be removed once fully migrated to OpenAPI-generated tools.

### 4. `src/tools/index.ts`
**Purpose**: Central export point for all tools

**Exports**:
- `createToolsFromOpenAPI()`: Main function to generate all tools
- `createCallJavaAPITool()`: Legacy tool export

### 5. `src/agent.ts` (Modified)
**Changes**:
- Updated import to use `createToolsFromOpenAPI` instead of `createCallJavaAPITool`
- Now generates all tools from OpenAPI spec on each request
- Added debug logging to show number of tools generated

### 6. `tsconfig.json` (Modified)
**Changes**:
- Added `"resolveJsonModule": true` to allow importing JSON files (needed for `openapi.json`)

## How It Works

### 1. Tool Generation Flow

```
OpenAPI Spec (openapi.json)
    ↓
openapi-generator.ts reads spec
    ↓
For each path + method:
    ↓
schema-converter.ts converts to JSON Schema
    ↓
Tool handler created with HTTP request logic
    ↓
LangChain tool created
    ↓
All tools returned to agent
```

### 2. Tool Execution Flow

```
User Query → Agent → Model decides which tool to use
    ↓
Tool handler executes HTTP request to Java API
    ↓
Response returned to model
    ↓
Model processes response and generates answer
    ↓
Final response to user
```

### 3. Schema Conversion

The schema converter handles:
- **$ref resolution**: Resolves references to component schemas
- **Circular reference detection**: Tracks visited schemas to prevent infinite recursion
  - When a circular reference is detected (e.g., `CandidatesEntity` → `ContactsEntity` → `CandidatesEntity`), it returns a simple object type to break the cycle
  - Uses a `visited` Set to track schema names during conversion
- **Object types**: Converts properties and required fields
- **Array types**: Converts array items
- **Primitive types**: Converts string, number, boolean, etc.

## Configuration

### API Base URL

The API base URL is configured in `src/tools/openapi-generator.ts`:

```typescript
const API_BASE_URL = "http://localhost:8081";
```

To change it, update this constant or make it configurable via environment variable.

### Authentication

Tools automatically include the authentication token if provided:

```typescript
const tools = createToolsFromOpenAPI(authToken);
```

The token is passed to each tool handler and included in the `Authorization` header.

## Example Tools Generated

Based on your OpenAPI spec, the following tools are generated:

- `getCandidates` - GET /candidates
- `findCandidateById` - GET /candidates/{id}
- `createCandidate` - POST /create/candidate
- `getUsers` - GET /tenant/users/{tenantId}
- `createUser` - POST /users
- `findUserDetailsById` - GET /users/{id}
- `executeQuery` - POST /api/query
- And many more...

Each tool has:
- **Name**: From `operationId` in OpenAPI spec
- **Description**: From `description` or `summary` in OpenAPI spec
- **Schema**: Generated from parameters and request body

## Benefits

1. **Type Safety**: Each tool has a specific schema matching the API endpoint
2. **Better AI Decisions**: Clear tool descriptions help the AI choose the right tool
3. **Maintainability**: Regenerate tools when API changes
4. **Scalability**: Works with any number of endpoints
5. **Debugging**: Easier to see which tool was called

## Testing

### Prerequisites

1. **Start the Java API** (must be running on `http://localhost:8081`)
2. **Start the LangChain service**:
   ```bash
   cd langchain-service
   npm run dev
   # or
   yarn dev
   ```
   The service will run on `http://localhost:3001`

3. **Set up environment variables** (if needed):
   - `NVIDIA_API_KEY` - Required for the AI model

### Testing Methods

#### Method 1: Using cURL

**Basic request (no authentication)**:
```bash
curl -X POST http://localhost:3001/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Get all candidates"}'
```

**With authentication token**:
```bash
curl -X POST http://localhost:3001/agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Find candidate with ID abc-123-def"}'
```

#### Method 2: Using a REST Client (Postman, Insomnia, etc.)

- **URL**: `POST http://localhost:3001/agent`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JWT_TOKEN` (optional)
- **Body**:
  ```json
  {
    "message": "Your natural language query here"
  }
  ```

### Test Prompts by Category

#### 1. Candidate Operations

**Get all candidates**:
```
Get all candidates
```
or
```
Show me all candidates in the system
```

**Get candidates with filters**:
```
Get candidates with profile "Software Engineer"
```
or
```
Find candidates named "John Doe"
```

**Get candidate by ID**:
```
Find candidate with ID abc-123-def-456
```
or
```
Get details for candidate abc-123-def-456
```

**Get available profiles/positions**:
```
What candidate profiles are available?
```
or
```
List all candidate positions
```

**Create a candidate**:
```
Create a new candidate named John Doe with profile Software Engineer
```

**Delete a candidate**:
```
Delete candidate with ID abc-123-def-456
```

#### 2. User Operations

**Get user by ID**:
```
Get user details for ID abc-123-def-456
```

**Get user by email**:
```
Find user with email john@example.com
```

**Get users for a tenant**:
```
Get all users for tenant abc-123-def-456
```

**Create a user**:
```
Create a new user with email john@example.com and password SecurePass123!
```

**Update a user**:
```
Update user abc-123-def-456 with new information
```

**Delete a user**:
```
Delete user with ID abc-123-def-456
```

#### 3. Authentication Operations

**Login**:
```
Login with email john@example.com and password mypassword
```

**Register**:
```
Register a new user with email john@example.com and password SecurePass123!
```

#### 4. Tenant Operations

**Get current tenant**:
```
What is the current tenant?
```

**Create a tenant**:
```
Create a new tenant named Acme Corp with subdomain acme
```

**Delete a tenant**:
```
Delete tenant with ID abc-123-def-456
```

#### 5. Query Operations

**Execute a query**:
```
Execute query: Get all candidates with Java experience
```
or
```
Query: Find users in the Engineering department
```

#### 6. File Operations

**Upload a file**:
```
Upload a file of type resume
```

#### 7. AI Filter Operations

**Filter candidates**:
```
Filter candidates with prompt: Find candidates with 5+ years of experience
```

### Expected Behavior

1. **Tool Selection**: The AI should automatically select the appropriate tool based on your query
   - Example: "Get all candidates" → uses `getCandidates` tool
   - Example: "Find candidate with ID 123" → uses `findCandidateById` tool

2. **Debug Logs**: Check the console output for:
   ```
   [DEBUG] Starting handleUserInput with: <your message>
   [DEBUG] Generating tools from OpenAPI spec...
   [DEBUG] Generated X tools from OpenAPI spec
   [DEBUG] Invoking agent...
   [DEBUG] Agent response received
   ```

3. **Response Format**: The response will be a JSON object:
   ```json
   {
     "response": "The AI's response based on the API data"
   }
   ```

### Testing Checklist

- [ ] Service starts without errors
- [ ] Tools are generated (check console log for number of tools)
- [ ] GET operations work (e.g., getCandidates, getUsers)
- [ ] GET with path parameters works (e.g., findCandidateById)
- [ ] GET with query parameters works (e.g., getCandidates with filters)
- [ ] POST operations work (e.g., createUser, createCandidate)
- [ ] POST with request body works correctly
- [ ] Authentication token is passed correctly (if provided)
- [ ] Error handling works (test with invalid IDs, missing parameters)
- [ ] Circular reference handling works (no stack overflow errors)

### Common Test Scenarios

**Scenario 1: Simple GET request**
```
Prompt: "Get all candidates"
Expected: AI uses getCandidates tool, returns list of candidates
```

**Scenario 2: GET with path parameter**
```
Prompt: "Find candidate with ID 123e4567-e89b-12d3-a456-426614174000"
Expected: AI uses findCandidateById tool with id parameter
```

**Scenario 3: GET with query parameters**
```
Prompt: "Get candidates with profile Software Engineer"
Expected: AI uses getCandidates tool with profiles query parameter
```

**Scenario 4: POST with request body**
```
Prompt: "Create a user with email test@example.com and password Test123!"
Expected: AI uses createUser tool with email and password in body
```

**Scenario 5: Complex query**
```
Prompt: "Get all candidates, then find the one with ID 123"
Expected: AI uses multiple tools in sequence
```

### Troubleshooting Test Issues

**No response or timeout**:
- Check that Java API is running on port 8081
- Verify `API_BASE_URL` in `openapi-generator.ts` is correct
- Check network connectivity

**Authentication errors**:
- Verify JWT token is valid
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

**Wrong tool selected**:
- Check tool descriptions in OpenAPI spec
- Verify `operationId` is descriptive
- Try more specific prompts

**Schema conversion errors**:
- Check console for circular reference warnings
- Verify OpenAPI spec is valid JSON
- Check for missing `operationId` warnings

## Troubleshooting

### Tools not generating
- Check that `openapi.json` exists at `docs/api/openapi.json`
- Verify `resolveJsonModule: true` in `tsconfig.json`
- Check console logs for warnings about missing `operationId`

### Import errors
- Ensure all files are in `src/tools/` directory
- Check import paths are correct
- Verify TypeScript compilation

### API errors
- Verify `API_BASE_URL` is correct
- Check that Java API is running on the expected port
- Verify authentication token is being passed correctly

### Maximum call stack size exceeded
- **Cause**: Circular references in OpenAPI schemas (e.g., `CandidatesEntity` ↔ `ContactsEntity`)
- **Fix**: The schema converter now includes cycle detection
  - Tracks visited schema names in a `Set`
  - When a circular reference is detected, returns a simple object type instead of recursing infinitely
  - This fix is already implemented in `schema-converter.ts`
- **If still occurring**: Check for other circular references in your OpenAPI spec

## Known Issues & Fixes

### Circular Reference Handling

**Issue**: OpenAPI schemas with circular references (e.g., `CandidatesEntity` → `ContactsEntity` → `CandidatesEntity`) caused "Maximum call stack size exceeded" errors.

**Solution**: Implemented cycle detection in `convertSchema()`:
- Tracks visited schema names using a `Set<string>`
- When a `$ref` is encountered, checks if the schema name is already in the visited set
- If a circular reference is detected, returns `{ type: 'object', description: 'Reference to <SchemaName>' }` to break the cycle
- The visited set is passed through recursive calls to maintain tracking

**Example**:
```typescript
// Before fix: Infinite recursion
CandidatesEntity → ContactsEntity → CandidatesEntity → ...

// After fix: Cycle detected and broken
CandidatesEntity → ContactsEntity → [CandidatesEntity detected in visited set] → returns simple object
```

This allows the schema conversion to complete successfully while still providing useful type information to LangChain.

## Future Improvements

1. **Caching**: Cache generated tools instead of regenerating on each request
2. **Filtering**: Add options to exclude/include specific endpoints
3. **Validation**: Add Zod validation for tool inputs
4. **Error Handling**: Improve error messages and retry logic
5. **Streaming**: Support streaming responses for long-running operations
6. **Circular Reference Handling**: Improve handling of circular references (e.g., show nested structure up to a certain depth)
7. **Parameter Extraction**: Implement automatic parameter extraction from user queries (see [TOOL_CALLING_GUIDE.md](./TOOL_CALLING_GUIDE.md))
8. **Model Upgrade**: Switch to a model that properly supports function calling

## Related Documentation

- **[TOOL_CALLING_GUIDE.md](./TOOL_CALLING_GUIDE.md)**: Comprehensive guide on working with tools, current limitations, and how to handle different tool types

