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
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }

  if (typeof value === 'number') {
    return value.toString()
  }

  if (typeof value === 'boolean') {
    return value === true ? 'true' : 'false'
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`
  }

  if (value === null) {
    return 'null'
  }

  return 'undefined'
}
