/**
 * @see https://github.com/ianstormtaylor/superstruct/blob/d677b8e972d9e81d4a62f1594b55578cad55cf35/src/utils.ts#L323-L325
 */
// use an arbitrary condition
export type Simplify<T> = T extends number ? T
  : { [K in keyof T]: T[K] }

export type Primitive = string | number | bigint | boolean | null | undefined
