import { AnyNode, DefinitionMap, Infer, mapMultipleInnerNode, mapObjectNode } from '@onetyped/core'
import { z } from 'zod'

type ToZodSchema<TNode extends AnyNode> = z.ZodType<Infer<TNode>>
type SchemaBag = { schema: z.ZodType }

export const toZodSchema = <TNode extends AnyNode>(
	node: TNode,
	definitions: DefinitionMap = new Map(),
) => {
	const zodSchemaDefinitions = new Map<string, SchemaBag>()
	const schema = toZodSchemaInternal(node, definitions, zodSchemaDefinitions)

	return schema
}

export const toZodSchemaInternal = <TNode extends AnyNode>(
	node: TNode,
	nodeDefinitions: DefinitionMap,
	zodSchemaDefinitions: Map<string, SchemaBag>,
): ToZodSchema<TNode> => {
	switch (node.typeName) {
		case 'definitionReference': {
			const schemaBag = zodSchemaDefinitions.get(node.identifier)
			if (schemaBag) {
				return z.lazy(() => {
					return schemaBag.schema
				})
			}

			const nodeDefinition = nodeDefinitions.get(node.identifier) as AnyNode

			const resolvedSchemaBag: SchemaBag = { schema: z.unknown() }
			zodSchemaDefinitions.set(
				node.identifier,
				resolvedSchemaBag,
			)

			resolvedSchemaBag.schema = toZodSchemaInternal(nodeDefinition, nodeDefinitions, zodSchemaDefinitions)

			return z.lazy(() => resolvedSchemaBag.schema)
		}
		case 'string': {
			return z.string()
		}
		case 'number': {
			return z.number()
		}
		case 'boolean': {
			return z.boolean()
		}
		case 'null': {
			return z.null()
		}
		case 'undefined': {
			return z.undefined()
		}
		case 'literal': {
			return z.literal(node.type)
		}
		case 'unknown': {
			return z.unknown()
		}
		case 'void': {
			return z.void()
		}
		case 'any': {
			return z.any()
		}
		case 'never': {
			return z.never()
		}
		case 'regexp': {
			return z.instanceof(RegExp)
		}
		case 'bigint': {
			return z.bigint()
		}
		case 'date': {
			return z.date()
		}
		case 'object': {
			const propertySchemas = Object.fromEntries(
				mapObjectNode(node, (node) => toZodSchemaInternal(node, nodeDefinitions, zodSchemaDefinitions)),
			)

			return z.object(propertySchemas)
		}
		case 'array': {
			return z.array(toZodSchemaInternal(node.type, nodeDefinitions, zodSchemaDefinitions))
		}
		case 'set': {
			return z.set(toZodSchemaInternal(node.type, nodeDefinitions, zodSchemaDefinitions))
		}
		case 'record': {
			return z.record(
				toZodSchemaInternal(node.key, nodeDefinitions, zodSchemaDefinitions),
				toZodSchemaInternal(node.value, nodeDefinitions, zodSchemaDefinitions),
			)
		}
		case 'map': {
			return z.map(
				toZodSchemaInternal(node.key, nodeDefinitions, zodSchemaDefinitions),
				toZodSchemaInternal(node.value, nodeDefinitions, zodSchemaDefinitions),
			)
		}
		case 'function': {
			const argumentSchemas = z.tuple(
				node.arguments.map((argument) => toZodSchemaInternal(argument, nodeDefinitions, zodSchemaDefinitions)) as [] | [
					z.ZodTypeAny,
					...z.ZodTypeAny[],
				],
			)

			if (node.return) {
				return z.function(argumentSchemas, toZodSchemaInternal(node.return, nodeDefinitions, zodSchemaDefinitions))
			}

			return z.function(argumentSchemas)
		}
		case 'union': {
			if (node.types.length === 1) return toZodSchemaInternal(node.types[0], nodeDefinitions, zodSchemaDefinitions)

			const schemas = mapMultipleInnerNode(
				node,
				(node) => toZodSchemaInternal(node, nodeDefinitions, zodSchemaDefinitions),
			) as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
			return z.union(schemas)
		}
		case 'tuple': {
			const schemas = mapMultipleInnerNode(
				node,
				(node) => toZodSchemaInternal(node, nodeDefinitions, zodSchemaDefinitions),
			) as [z.ZodTypeAny, ...z.ZodTypeAny[]]
			return z.tuple(schemas)
		}
		case 'intersection': {
			const types = [...node.types]
			let schema = toZodSchemaInternal(types.pop(), nodeDefinitions, zodSchemaDefinitions)

			for (const type of types) {
				schema = schema.and(toZodSchemaInternal(type, nodeDefinitions, zodSchemaDefinitions))
			}

			return schema
		}
	}
}
