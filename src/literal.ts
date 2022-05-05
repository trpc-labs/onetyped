import { defaults } from './defaults'
import { Primitive } from './type-utils'
import { defineNode } from './types'

export const literal = <Literal extends Primitive>(literal: Literal) => {
  return defineNode({
    typeName: 'literal',
    type: literal,
    ...defaults,
  })
}
