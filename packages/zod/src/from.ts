import {
	any,
	array,
	bigint,
	boolean,
	CustomTypeNode,
	date,
	func,
	intersection,
	literal,
	map,
	number,
	object,
	record,
	set,
	string,
	tuple,
	union,
	unknown,
} from '@onetyped/core'
import { z, ZodFirstPartyTypeKind, ZodTypeAny } from 'zod'

export const fromZodSchema = <TZodType extends z.ZodTypeAny>(schema: TZodType): CustomTypeNode<z.infer<TZodType>> => {
	const typeName: ZodFirstPartyTypeKind = schema._def.typeName
	switch (schema._def) {
		case ZodFirstPartyTypeKind.ZodString: {
			return string()
		}
		case ZodFirstPartyTypeKind.ZodNumber: {
			return number()
		}

		case ZodFirstPartyTypeKind.ZodBoolean: {
			return boolean()
		}

		case ZodFirstPartyTypeKind.ZodUnknown: {
			return unknown()
		}

		case ZodFirstPartyTypeKind.ZodLiteral: {
			return literal(schema._def.value)
		}

		case ZodFirstPartyTypeKind.ZodAny: {
			return any()
		}

		case ZodFirstPartyTypeKind.ZodBigInt: {
			return bigint()
		}

		case ZodFirstPartyTypeKind.ZodDate: {
			return date()
		}

		case ZodFirstPartyTypeKind.ZodObject: {
			const propertySchemas = Object.fromEntries(
				Object.entries(schema._def.shape).map(([key, value]) => [key, fromZodSchema(value as ZodTypeAny)]),
			)
			return object(propertySchemas)
		}

		case ZodFirstPartyTypeKind.ZodArray: {
			return array(fromZodSchema(schema._def.type))
		}

		case ZodFirstPartyTypeKind.ZodSet: {
			return set(fromZodSchema(schema._def.type))
		}

		case ZodFirstPartyTypeKind.ZodRecord: {
			return record(fromZodSchema(schema._def.valueType))
		}

		case ZodFirstPartyTypeKind.ZodMap: {
			return map(fromZodSchema(schema._def.keyType), fromZodSchema(schema._def.valueType))
		}

		case ZodFirstPartyTypeKind.ZodFunction: {
			const argumentSchemas = schema._def.args.map((argument: ZodTypeAny) => fromZodSchema(argument))
			const returnSchema = typeof schema._def.returns !== 'undefined' ? fromZodSchema(schema._def.returns) : undefined

			return func({ arguments: argumentSchemas, return: returnSchema })
		}

		case ZodFirstPartyTypeKind.ZodUnion: {
			const schemas = schema._def.options.map((option: ZodTypeAny) => fromZodSchema(option))
			return union(schemas)
		}

		case ZodFirstPartyTypeKind.ZodTuple: {
			const schemas = schema._def.items.map((item: ZodTypeAny) => fromZodSchema(item))
			return tuple(schemas)
		}

		case ZodFirstPartyTypeKind.ZodIntersection: {
			const schemas = schema._def.options.map((option: ZodTypeAny) => fromZodSchema(option))
			return intersection(schemas)
		}

		default: {
			throw new Error(`Unsupported type: ${typeName}`)
		}
	}
}
