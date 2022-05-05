import { defaults } from './defaults'
import { defineNode } from './types'

export const any = () => {
  return defineNode({
    typeName: 'unknown',
    type: 'unknown',
    ...defaults,
  })
}
