import { defaults } from './defaults'
import { AnyNode, defineNode } from './types'

export const record = <Node extends AnyNode>(node: Node) => {
  return defineNode({
    typeName: 'record',
    type: node,
    ...defaults,
  })
}
