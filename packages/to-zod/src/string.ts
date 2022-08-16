import { AnyNode, mapMultipleInnerNode, mapObjectNode, serializePrimitive } from '@onetyped/core'

const zodBuilder = (method: string, argument_?: string) => `z.${method}(${argument_ ?? ''})`

export const toZodString = (node: AnyNode): string => {
  switch (node.typeName) {
    case 'string': {
      return zodBuilder('string')
    }
    case 'number': {
      return zodBuilder('number')
    }
    case 'boolean': {
      return zodBuilder('boolean')
    }
    case 'literal': {
      return zodBuilder('literal', serializePrimitive(node.type))
    }
    case 'unknown': {
      return zodBuilder('unknown')
    }
    case 'any': {
      return zodBuilder('any')
    }
    case 'regexp': {
      return zodBuilder('custom', '(data) => data instanceof RegExp')
    }
    case 'bigint': {
      return zodBuilder('bigint')
    }
    case 'date': {
      return zodBuilder('date')
    }
    case 'object': {
      const propertySchemas = Object.entries(mapObjectNode(node, toZodString))
        .map(([key, zodType]) => `${key}: ${zodType}`).join(', ')

      return zodBuilder('object', `{ ${propertySchemas} }`)
    }
    case 'array': {
      return zodBuilder('array', toZodString(node.type))
    }
    case 'set': {
      return zodBuilder('set', toZodString(node.type))
    }
    case 'record': {
      return zodBuilder('record', toZodString(node.type))
    }
    case 'map': {
      return zodBuilder('map', `${toZodString(node.key)}, ${toZodString(node.value)}`)
    }
    case 'function': {
      if (node.arguments.length === 0 && typeof node.return === 'undefined') return zodBuilder('function')

      const argumentSchemas = node.arguments.map((argument) => toZodString(argument))
      const tupleArguments = zodBuilder('tuple', `[${argumentSchemas.join(', ')}]`)

      if (typeof node.return === 'undefined') return zodBuilder('function', tupleArguments)

      const returnSchema = toZodString(node.return)

      return zodBuilder('function', `${tupleArguments}, ${returnSchema}`)
    }
    case 'union': {
      if (node.types.length === 1) return toZodString(node.types[0])

      const schemas = mapMultipleInnerNode(node, toZodString).join(', ')
      return zodBuilder('union', `[${schemas}]`)
    }
    case 'tuple': {
      const schemas = mapMultipleInnerNode(node, toZodString).join(', ')
      return zodBuilder('tuple', `[${schemas}]`)
    }
    case 'intersection': {
      const types = [...node.types]
      let schema = toZodString(types.pop())

      for (const type of types) {
        schema = `${schema}.and(${toZodString(type)})`
      }

      return schema
    }
  }
}
