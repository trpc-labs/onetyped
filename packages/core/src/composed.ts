import { union } from './complex'
import { nullType, undefinedType } from './primitive'
import { AnyBaseNode } from './types'

export const nullable = <TNode extends AnyBaseNode>(type: TNode) => {
	return union([type, nullType()])
}

export const optional = <TNode extends AnyBaseNode>(type: TNode) => {
	return union([type, undefinedType()])
}
