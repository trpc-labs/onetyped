import { AnyObjectNode } from './complex'
import { Primitive } from './type-utils'
import { AnyBaseNode, AnyNode } from './types'

export const mapMultipleInnerNode = <TMapperResult>(
	node: AnyBaseNode & { types: AnyNode[] },
	mapper: (node: AnyNode) => TMapperResult,
): TMapperResult[] => node.types.map((type) => mapper(type))

export const mapObjectNode = <TMapperResult>(node: AnyObjectNode, mapper: (node: AnyNode) => TMapperResult) =>
	Object.entries(node.shape).map(([key, value]) => [key, mapper(value)] as const)

export const serializePrimitive = (value: Primitive) => {
	switch (typeof value) {
		case 'string': {
			return JSON.stringify(value)
		}
		case 'number': {
			return value.toString()
		}
		case 'boolean': {
			return value === true ? 'true' : 'false'
		}
		case 'bigint': {
			return `${value.toString()}n`
		}
	}
}

export const isNodeOptional = (node: AnyNode) => {
	if (node.typeName === 'undefined') {
		return true
	}

	if (node.typeName === 'union') {
		return node.types.some((type: AnyNode) => isNodeOptional(type))
	}

	return false
}

export class UnsupportedError extends Error {
	readonly integration: string
	readonly feature: string

	constructor(integration: string, feature: string) {
		super(`${integration} does not support ${feature}`)
		this.name = 'UnsupportedError'
		this.integration = integration
		this.feature = feature

		Object.setPrototypeOf(this, UnsupportedError.prototype)
	}
}
