/**
 * Simplifies a type definition to its most basic representation.
 * @see https://github.com/ianstormtaylor/superstruct/blob/41d7fdd09a0c0f0291b03357e487420d4ece6b56/src/utils.ts#L323-L325
 */
export type Simplify<T> = T extends any[] | Date ? T
  // eslint-disable-next-line @typescript-eslint/ban-types
  : { [K in keyof T]: T[K] } & {}

export type Primitive = string | number | bigint | boolean | null | undefined

/**
 * @see https://github.com/millsp/ts-toolbelt/blob/319e55123b9571d49f34eca3e5926e41ca73e0f3/sources/Function/Narrow.ts
 */
export type Narrow<T> =
  | (T extends [] ? [] : never)
  | (T extends string | number | boolean | bigint ? T : never)
  // eslint-disable-next-line @typescript-eslint/ban-types
  | { [K in keyof T]: T[K] extends Function ? T[K] : Narrow<T[K]> }
