import { AnyNode, Infer, mapMultipleInnerNode, mapObjectNode } from '@onetyped/core'
import { z } from 'zod'

type ToZodSchema<TNode extends AnyNode> = z.ZodType<Infer<TNode>>

export const toZodSchema = <TNode extends AnyNode>(node: TNode): ToZodSchema<TNode> => {
	switch (node.typeName) {
		case 'string': {
			return z.string()
		}
		case 'number': {
			return z.number()
		}
		case 'boolean': {
			return z.boolean()
		}
		case 'literal': {
			return z.literal(node.type)
		}
		case 'unknown': {
			return z.unknown()
		}
		case 'any': {
			return z.any()
		}
		case 'regexp': {
			return z.custom<RegExp>((data) => data instanceof RegExp)
		}
		case 'bigint': {
			return z.bigint()
		}
		case 'date': {
			return z.date()
		}
		case 'object': {
			const propertySchemas = Object.fromEntries(mapObjectNode(node, toZodSchema))

			return z.object(propertySchemas)
		}
		case 'array': {
			return z.array(toZodSchema(node.type))
		}
		case 'set': {
			return z.set(toZodSchema(node.type))
		}
		case 'record': {
			return z.record(toZodSchema(node.type))
		}
		case 'map': {
			return z.map(toZodSchema(node.key), toZodSchema(node.value))
		}
		case 'function': {
			const argumentSchemas = z.tuple(
				node.arguments.map((argument) => toZodSchema(argument)) as [] | [z.ZodTypeAny, ...z.ZodTypeAny[]],
			)

			if (node.return) {
				return z.function(argumentSchemas, toZodSchema(node.return))
			}

			return z.function(argumentSchemas)
		}
		case 'union': {
			if (node.types.length === 1) return toZodSchema(node.types[0])

			const schemas = mapMultipleInnerNode(node, toZodSchema) as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
			return z.union(schemas)
		}
		case 'tuple': {
			const schemas = mapMultipleInnerNode(node, toZodSchema) as [z.ZodTypeAny, ...z.ZodTypeAny[]]
			return z.tuple(schemas)
		}
		case 'intersection': {
			const types = [...node.types]
			let schema = toZodSchema(types.pop())

			for (const type of types) {
				schema = schema.and(toZodSchema(type))
			}

			return schema
		}
	}
}
