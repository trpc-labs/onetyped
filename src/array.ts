import { AnyIchorNode, defineNode } from './types'

export const array = <TNode extends AnyIchorNode>(type: TNode) => {
  return defineNode({
    typeName: 'array',
    type,
  })
}
