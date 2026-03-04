import type { IJsonSchemaCollection } from 'typia/src/schemas/json/IJsonSchemaCollection.js';
import type { FastifyInstance } from 'fastify';

const SCHEMA_REF_PREFIX: string = '#/components/schemas/';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapSchemaRef(ref: string, uniqueSchemaId: string): string {
  if (!ref.startsWith(SCHEMA_REF_PREFIX)) {
    return ref;
  }

  const item: string = ref.slice(SCHEMA_REF_PREFIX.length);
  return `${uniqueSchemaId}#/definitions/${item}`;
}

function rewriteSchemaRefs(value: unknown, uniqueSchemaId: string): unknown {
  if (Array.isArray(value)) {
    return value.map((arrayItem: unknown): unknown => rewriteSchemaRefs(arrayItem, uniqueSchemaId));
  }

  if (!isObjectRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map((entry: [string, unknown]): [string, unknown] => {
      const [key, itemValue]: [string, unknown] = entry;

      if (key === '$ref' && typeof itemValue === 'string') {
        return [key, mapSchemaRef(itemValue, uniqueSchemaId)];
      }

      return [key, rewriteSchemaRefs(itemValue, uniqueSchemaId)];
    }),
  );
}

function rewriteDefinitionsRefs(definitions: Record<string, unknown>, uniqueSchemaId: string): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(definitions).map((entry: [string, unknown]): [string, unknown] => {
      const [schemaName, schema]: [string, unknown] = entry;
      return [schemaName, rewriteSchemaRefs(schema, uniqueSchemaId)];
    }),
  );
}

export function addTypiaAsJsonSchema(
  server: FastifyInstance,
  uniqueSchemaId: string,
  typiaSchemaCollection: IJsonSchemaCollection,
): Record<string, string> {
  if (!typiaSchemaCollection.components.schemas) {
    throw new Error('No schemas found in typiaSchemaCollection');
  }

  const jsonSchema: {
    $id: string;
    definitions: Record<string, unknown>;
  } = {
    $id: uniqueSchemaId,
    definitions: rewriteDefinitionsRefs(typiaSchemaCollection.components.schemas, uniqueSchemaId),
  };

  server.addSchema(jsonSchema);

  return Object.keys(jsonSchema.definitions).reduce(
    (acc: Record<string, string>, item: string): Record<string, string> => {
      acc[item] = `${uniqueSchemaId}#/definitions/${item}`;
      return acc;
    },
    {},
  );
}
