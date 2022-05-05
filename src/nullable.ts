import { nullType } from './null'
import { AnyNode } from './types'
import { union } from './union'

export const nullable = <TNode extends AnyNode>(type: TNode) => {
  return union([type, nullType()])
}
