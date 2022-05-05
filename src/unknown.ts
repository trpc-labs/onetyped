import { defaults } from './defaults'
import { defineNode } from './types'

export const unknown = () => {
  return defineNode({
    typeName: 'unknown',
    type: 'unknown',
    ...defaults,
  })
}
