import { AnyNode, defineNode } from './types'

export const optional = <TNode extends AnyNode>(type: TNode): Omit<TNode, 'isRequired'> & { isRequired: false } => {
  return defineNode({
    ...type,
    isRequired: false,
  })
}
