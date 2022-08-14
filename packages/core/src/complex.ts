import { Simplify } from './type-utils'
import { AnyNode, BaseNode, defineNode, Infer } from './types'

export interface ArrayNode<Type extends AnyNode> extends BaseNode<'array'> {
  readonly _type: Infer<Type>[]
  type: Type
}
export const array = <TNode extends AnyNode>(type: TNode): ArrayNode<TNode> => {
  return defineNode({
    typeName: 'array',
    type,
  })
}

export interface SetNode<Type extends AnyNode> extends BaseNode<'set'> {
  readonly _type: Set<Infer<Type>>
  type: Type
}
export const set = <TNode extends AnyNode>(type: TNode): SetNode<TNode> => {
  return defineNode({
    typeName: 'set',
    type,
  })
}

export interface RecordNode<Type extends AnyNode> extends BaseNode<'record'> {
  readonly _type: Record<string, Infer<Type>>
  type: Type
}
export const record = <TNode extends AnyNode>(node: TNode): RecordNode<TNode> => {
  return defineNode({
    typeName: 'record',
    type: node,
  })
}

export type AnyObjectShape = { [key: string]: AnyNode }
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

export interface UnionNode<Types extends AnyNode[]> extends BaseNode<'union'> {
  readonly _type: ({ [K in keyof Types]: Infer<Types[K]> })[number]
  types: Types
}
export const union = <TNodes extends AnyNode[]>(nodes: TNodes): UnionNode<TNodes> => {
  return defineNode({
    typeName: 'union',
    types: nodes,
  })
}
