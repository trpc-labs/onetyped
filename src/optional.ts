import { AnyNode, defineNode } from './types'

export const optional = <TNode extends AnyNode>(type: TNode) => {
  return defineNode({
    typeName: 'optional',
    type,
  })
}
