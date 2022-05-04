import { AnyNode, defineNode } from './types'

export const set = <TNode extends AnyNode>(type: TNode) => {
  return defineNode({
    typeName: 'set',
    type,
  })
}
