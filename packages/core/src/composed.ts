import { union } from './complex'
import { nullType } from './primitive'
import { AnyBaseNode } from './types'

export const nullable = <TNode extends AnyBaseNode>(type: TNode) => {
  return union([type, nullType()])
}

export const optional = <TNode extends AnyBaseNode>(type: TNode): Omit<TNode, 'isRequired'> & { isRequired: false } => {
  return {
    ...type,
    isRequired: false,
  }
}
