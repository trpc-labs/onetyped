import { AnyNode, defineNode } from './types'

export const array = <TNode extends AnyNode>(type: TNode) => {
  return defineNode({
    typeName: 'array',
    type,
  })
}
