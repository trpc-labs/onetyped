import { AnyIchorNode, defineNode } from './types'

export const object = <TShape extends Record<string, AnyIchorNode>>(shape: TShape) => {
  return defineNode({
    typeName: 'object',
    shape,
  })
}
