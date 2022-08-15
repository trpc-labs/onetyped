import { AnyNode } from '@onetyped/core'

const zodBuilder = (method: string, argument_?: string) => `z.${method}(${argument_ ?? ''})`

export const toZodString = (schema: AnyNode): string => {
  switch (schema.typeName) {
    case 'number': {
      return zodBuilder('number')
    }
    case 'string': {
      return zodBuilder('string')
    }
    case 'boolean': {
      return zodBuilder('boolean')
    }
    case 'unknown': {
      return zodBuilder('unknown')
    }
    case 'regexp': {
      return zodBuilder('custom', '(data) => data instanceof RegExp')
    }
    case 'literal': {
      return zodBuilder('literal', JSON.stringify(schema.type))
    }
    case 'array': {
      return zodBuilder('array', toZodString(schema.type))
    }
    case 'set': {
      return zodBuilder('set', toZodString(schema.type))
    }
    case 'record': {
      return zodBuilder('record', toZodString(schema.type))
    }
    case 'object': {
      const propertySchemas = Object.entries(schema.shape).map(([key, value]) => {
        const zodType = toZodString(value)
        return `${key}: ${zodType}`
      }).join(', ')

      return zodBuilder('object', `{ ${propertySchemas} }`)
    }
    case 'union': {
      const types: AnyNode[] = schema.types
      const zodUnion = types.map((type) => toZodString(type)).join(', ')
      return zodBuilder('union', `[${zodUnion}]`)
    }
    case 'tuple': {
      const types: AnyNode[] = schema.types
      const zodTuple = types.map((type) => toZodString(type)).join(', ')
      return zodBuilder('tuple', `[${zodTuple}]`)
    }
  }
}
