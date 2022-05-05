import { defaults } from './defaults'
import { defineNode } from './types'

export const nullType = () => {
  return defineNode({
    typeName: 'null',
    type: 'null',
    ...defaults,
  })
}
