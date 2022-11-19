import { UnsupportedError } from '@onetyped/core'
import { AnyNode, mapMultipleInnerNode, mapObjectNode, serializePrimitive } from '@onetyped/core'

const createTypeBoxMethod = (method: string, argument_?: string) => `Type.${method}(${argument_ ?? ''})`

export const toTypeBoxString = (node: AnyNode): string => {
	switch (node.typeName) {
		case 'string': {
			return createTypeBoxMethod('String')
		}
		case 'number': {
			return createTypeBoxMethod('Number')
		}
		case 'boolean': {
			return createTypeBoxMethod('Boolean')
		}
		case 'null': {
			return createTypeBoxMethod('Null')
		}
		case 'undefined': {
			return createTypeBoxMethod('Undefined')
		}
		case 'literal': {
			return createTypeBoxMethod('Literal', serializePrimitive(node.type))
		}
		case 'unknown': {
			return createTypeBoxMethod('Unknown')
		}
		case 'any': {
			return createTypeBoxMethod('Any')
		}
		case 'regexp': {
			return createTypeBoxMethod('RegEx')
		}
		case 'bigint': {
			throw new UnsupportedError('TypeBox', 'bigint')
		}
		case 'date': {
			return createTypeBoxMethod('Date')
		}
		case 'object': {
			const propertySchemas = mapObjectNode(node, toTypeBoxString)
				.map(([key, zodType]) => `${key}: ${zodType}`).join(', ')

			return createTypeBoxMethod('Object', `{ ${propertySchemas} }`)
		}
		case 'array': {
			return createTypeBoxMethod('Array', toTypeBoxString(node.type))
		}
		case 'set': {
			throw new UnsupportedError('TypeBox', 'set')
		}
		case 'record': {
			return createTypeBoxMethod('Record', `${toTypeBoxString(node.key)}, ${toTypeBoxString(node.value)}`)
		}
		case 'map': {
			return createTypeBoxMethod('map', `${toTypeBoxString(node.key)}, ${toTypeBoxString(node.value)}`)
		}
		case 'function': {
			if (node.arguments.length === 0 && typeof node.return === 'undefined') return createTypeBoxMethod('Function')

			const argumentSchemas = node.arguments.map((argument) => toTypeBoxString(argument))
			const tupleArguments = createTypeBoxMethod('Tuple', `[${argumentSchemas.join(', ')}]`)

			if (typeof node.return === 'undefined') return createTypeBoxMethod('Function', tupleArguments)

			const returnSchema = toTypeBoxString(node.return)

			return createTypeBoxMethod('Function', `${tupleArguments}, ${returnSchema}`)
		}
		case 'union': {
			const schemas = mapMultipleInnerNode(node, toTypeBoxString).join(', ')
			return createTypeBoxMethod('Union', `[${schemas}]`)
		}
		case 'tuple': {
			const schemas = mapMultipleInnerNode(node, toTypeBoxString).join(', ')
			return createTypeBoxMethod('Tuple', `[${schemas}]`)
		}
		case 'intersection': {
			const schemas = mapMultipleInnerNode(node, toTypeBoxString).join(', ')
			return createTypeBoxMethod('Intersect', `[${schemas}]`)
		}
	}
}
