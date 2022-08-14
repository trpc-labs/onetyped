import { union } from './complex'
import { nullType } from './primitive'
import { AnyNode } from './types'

export const nullable = <TNode extends AnyNode>(type: TNode) => {
  return union([type, nullType()])
}

export const optional = <TNode extends AnyNode>(type: TNode): Omit<TNode, 'isRequired'> & { isRequired: false } => {
  return {
    ...type,
    isRequired: false,
  }
}
