import { defineNode } from './types'

export const string = () => {
  return defineNode({
    typeName: 'string',
    type: 'string',
  })
}
