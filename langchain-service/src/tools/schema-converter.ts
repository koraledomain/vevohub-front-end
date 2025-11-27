/**
 * Simple OpenAPI to JSON Schema converter for LangChain tools
 */

function convertSchema(schema: any, components: any): any {
  if (!schema) return { type: 'string' };

  // Resolve $ref
  if (schema.$ref) {
    const name = schema.$ref.replace('#/components/schemas/', '');
    schema = components?.schemas?.[name] || { type: 'object' };
  }

  // Arrays
  if (schema.type === 'array') {
    return { type: 'array', items: convertSchema(schema.items, components) };
  }

  // Objects
  if (schema.type === 'object' && schema.properties) {
    const properties: Record<string, any> = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      properties[key] = convertSchema(value, components);
    }
    return { type: 'object', properties, required: schema.required || [] };
  }

  // Primitives
  return { type: schema.type || 'string' };
}

/**
 * Builds tool schema from OpenAPI operation
 */
export function buildToolSchemaFromOperation(operation: any, components?: any): any {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  // Add parameters
  operation.parameters?.forEach((param: any) => {
    properties[param.name] = convertSchema(param.schema, components);
    if (param.in === 'path' || param.required) {
      required.push(param.name);
    }
  });

  // Add request body
  const bodySchema = operation.requestBody?.content?.['application/json']?.schema;
  if (bodySchema) {
    const converted = convertSchema(bodySchema, components);
    if (converted.properties) {
      Object.assign(properties, converted.properties);
      required.push(...(converted.required || []));
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 && { required }),
  };
}

