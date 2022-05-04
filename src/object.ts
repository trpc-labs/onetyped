import { AnyNode, defineNode } from './types'

export const object = <TShape extends Record<string, AnyNode>>(shape: TShape) => {
  return defineNode({
    typeName: 'object',
    shape,
  })
}
