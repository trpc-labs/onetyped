import { defineNode } from './types'

export const boolean = () => {
  return defineNode({
    typeName: 'boolean',
    type: 'boolean',
  })
}
