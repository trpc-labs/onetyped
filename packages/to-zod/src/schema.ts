import { AnyNode, Infer } from '@onetyped/core'
import { z } from 'zod'

type ToZodSchema<TNode extends AnyNode> = z.ZodType<Infer<TNode>>

export const toZodSchema = <TNode extends AnyNode>(schema: TNode): ToZodSchema<TNode> => {
  switch (schema.typeName) {
    case 'number': {
      return z.number()
    }
    case 'string': {
      return z.string()
    }
    case 'boolean': {
      return z.boolean()
    }
    case 'unknown': {
      return z.unknown()
    }
    case 'regexp': {
      return z.custom<RegExp>((data) => data instanceof RegExp)
    }
    case 'literal': {
      return z.literal(schema.type)
    }
    case 'array': {
      return z.array(toZodSchema(schema.type))
    }
    case 'set': {
      return z.set(toZodSchema(schema.type))
    }
    case 'record': {
      return z.record(toZodSchema(schema.type))
    }
    case 'object': {
      const propertySchemas: z.ZodRawShape = {}

      for (const [key, value] of Object.entries(schema.shape)) {
        propertySchemas[key] = toZodSchema(value)
      }
      return z.object(propertySchemas)
    }
    case 'union': {
      const types: AnyNode[] = schema.types
      const schemas = types.map((type) => toZodSchema(type)) as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
      return z.union(schemas)
    }
    case 'tuple': {
      const types: AnyNode[] = schema.types
      const zodTuple = types.map((type) => toZodSchema(type)) as [] | [z.ZodTypeAny, ...z.ZodTypeAny[]]
      return z.tuple(zodTuple)
    }
  }
}
