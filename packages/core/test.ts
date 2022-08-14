import { array, number, object, string, union } from './dist'
const a = object({
  are: object({
    a: union([array(string()), number()]),
  }),
})

a.shape.are._type
