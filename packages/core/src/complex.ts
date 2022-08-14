import { Simplify } from './type-utils'
import { AnyBaseNode, BaseNode, defineNode, Infer } from './types'

export interface ArrayNode<Type extends AnyBaseNode> extends BaseNode<'array'> {
  readonly _type: Infer<Type>[]
  type: Type
}
export const array = <TNode extends AnyBaseNode>(type: TNode): ArrayNode<TNode> => {
  return defineNode({
    typeName: 'array',
    type,
  })
}

export interface SetNode<Type extends AnyBaseNode> extends BaseNode<'set'> {
  readonly _type: Set<Infer<Type>>
  type: Type
}
export const set = <TNode extends AnyBaseNode>(type: TNode): SetNode<TNode> => {
  return defineNode({
    typeName: 'set',
    type,
  })
}

export interface RecordNode<Type extends AnyBaseNode> extends BaseNode<'record'> {
  readonly _type: Record<string, Infer<Type>>
  type: Type
}
export const record = <TNode extends AnyBaseNode>(node: TNode): RecordNode<TNode> => {
  return defineNode({
    typeName: 'record',
    type: node,
  })
}

export type AnyObjectShape = { [key: string]: AnyBaseNode }
export interface ObjectNode<Shape extends AnyObjectShape> extends BaseNode<'object'> {
  readonly _type: Simplify<
    & {
      [Property in keyof Shape as undefined extends Infer<Shape[Property]> ? never : Property]: Infer<
        Shape[Property]
      >
    }
    & {
      [Property in keyof Shape as undefined extends Infer<Shape[Property]> ? Property : never]?: Infer<
        Shape[Property]
      >
    }
  >
  shape: Shape
}
export const object = <TShape extends AnyObjectShape>(shape: TShape): ObjectNode<TShape> => {
  return defineNode({
    typeName: 'object',
    shape,
  })
}

export interface UnionNode<Types extends AnyBaseNode[]> extends BaseNode<'union'> {
  readonly _type: ({ [K in keyof Types]: Infer<Types[K]> })[number]
  types: Types
}
export const union = <TNodes extends AnyBaseNode[]>(nodes: TNodes): UnionNode<TNodes> => {
  return defineNode({
    typeName: 'union',
    types: nodes,
  })
}

type InferTuple<TNodes extends AnyBaseNode[], InferredTypes extends unknown[] = []> = TNodes extends
  [infer Head extends AnyBaseNode, ...infer Rest extends AnyBaseNode[]]
  ? InferTuple<Rest, [...InferredTypes, Infer<Head>]>
  : InferredTypes

export interface TupleNode<Types extends AnyBaseNode[]> extends BaseNode<'tuple'> {
  readonly _type: InferTuple<Types>
  types: Types
}
// generics are a hack so nodes are narrowed to a tuple instead of expanded to an array of union types
export const tuple = <TNode extends AnyBaseNode, TNodes extends AnyBaseNode[]>(
  nodes: [TNode, ...TNodes],
): TupleNode<[TNode, ...TNodes]> => {
  return defineNode({
    typeName: 'tuple',
    types: nodes,
  })
}
