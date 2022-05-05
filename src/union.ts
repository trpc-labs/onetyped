import { defaults } from './defaults'
import { AnyNode, defineNode } from './types'

export const union = <T extends AnyNode[]>(nodes: T) => {
  return defineNode({
    typeName: 'union',
    types: nodes,
    ...defaults,
  })
}
