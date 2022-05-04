import { AnyIchorNode, defineNode } from './types'

export const optional = <TNode extends AnyIchorNode>(type: TNode) => {
  return defineNode({
    typeName: 'optional',
    type,
  })
}
