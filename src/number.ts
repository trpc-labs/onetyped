import { defineNode } from './types'

export const number = () => {
  return defineNode({
    typeName: 'number',
    type: 'number',
  })
}
