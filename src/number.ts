import { defaults } from './defaults'
import { defineNode } from './types'

export const number = () => {
  return defineNode({
    typeName: 'number',
    type: 'number',
    ...defaults,
  })
}
