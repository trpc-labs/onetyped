import { AnyNode, mapMultipleInnerNode, mapObjectNode, serializePrimitive } from '@onetyped/core'

const createZodMethod = (method: string, argument_?: string) => `z.${method}(${argument_ ?? ''})`

export const toZodString = (node: AnyNode): string => {
	switch (node.typeName) {
		case 'string': {
			return createZodMethod('string')
		}
		case 'number': {
			return createZodMethod('number')
		}
		case 'boolean': {
			return createZodMethod('boolean')
		}
		case 'null': {
			return createZodMethod('null')
		}
		case 'undefined': {
			return createZodMethod('undefined')
		}
		case 'literal': {
			return createZodMethod('literal', serializePrimitive(node.type))
		}
		case 'unknown': {
			return createZodMethod('unknown')
		}
		case 'void': {
			return createZodMethod('void')
		}
		case 'any': {
			return createZodMethod('any')
		}
		case 'regexp': {
			return createZodMethod('instanceof', 'RegExp')
		}
		case 'bigint': {
			return createZodMethod('bigint')
		}
		case 'date': {
			return createZodMethod('date')
		}
		case 'object': {
			const propertySchemas = mapObjectNode(node, toZodString)
				.map(([key, zodType]) => `${key}: ${zodType}`).join(', ')

			return createZodMethod('object', `{ ${propertySchemas} }`)
		}
		case 'array': {
			return createZodMethod('array', toZodString(node.type))
		}
		case 'set': {
			return createZodMethod('set', toZodString(node.type))
		}
		case 'record': {
			return createZodMethod('record', `${toZodString(node.key)}, ${toZodString(node.value)}`)
		}
		case 'map': {
			return createZodMethod('map', `${toZodString(node.key)}, ${toZodString(node.value)}`)
		}
		case 'function': {
			if (node.arguments.length === 0 && typeof node.return === 'undefined') return createZodMethod('function')

			const argumentSchemas = node.arguments.map((argument) => toZodString(argument))
			const tupleArguments = createZodMethod('tuple', `[${argumentSchemas.join(', ')}]`)

			if (typeof node.return === 'undefined') return createZodMethod('function', tupleArguments)

			const returnSchema = toZodString(node.return)

			return createZodMethod('function', `${tupleArguments}, ${returnSchema}`)
		}
		case 'union': {
			if (node.types.length === 1) return toZodString(node.types[0])

			const schemas = mapMultipleInnerNode(node, toZodString).join(', ')
			return createZodMethod('union', `[${schemas}]`)
		}
		case 'tuple': {
			const schemas = mapMultipleInnerNode(node, toZodString).join(', ')
			return createZodMethod('tuple', `[${schemas}]`)
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
