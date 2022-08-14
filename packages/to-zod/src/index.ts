import { AnyNode } from '@onetyped/core'

export const toZodString = (schema: AnyNode) => {
  switch (schema.typeName) {
    case 'array': {
      schema.type
      break
    }
    case 'object': {
      schema
    }
  }
}
