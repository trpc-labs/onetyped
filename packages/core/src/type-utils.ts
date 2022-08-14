/**
 * Simplifies a type definition to its most basic representation.
 * @see https://github.com/ianstormtaylor/superstruct/blob/41d7fdd09a0c0f0291b03357e487420d4ece6b56/src/utils.ts#L323-L325
 */
export type Simplify<T> = T extends any[] | Date ? T
  : { [K in keyof T]: T[K] } & Record<string, never>

export type Primitive = string | number | bigint | boolean | null | undefined
