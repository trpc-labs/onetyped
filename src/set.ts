import { AnyIchorNode, defineNode } from './types'

export const set = <TNode extends AnyIchorNode>(type: TNode) => {
  return defineNode({
    typeName: 'set',
    type,
  })
}
