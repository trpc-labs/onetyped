import { defaults } from './defaults'
import { defineNode } from './types'

export const regexp = () => {
  return defineNode({
    typeName: 'regexp',
    type: 'regexp',
    ...defaults,
  })
}
