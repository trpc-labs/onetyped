import { ArrayNode, ObjectNode, RecordNode, SetNode, TupleNode, UnionNode } from './complex'
import { BooleanNode, LiteralNode, NumberNode, RegexpNode, StringNode, UnknownNode } from './primitive'
import { Primitive } from './type-utils'

const defaults = {
  isRequired: true,
} as const
type Defaults = typeof defaults

export interface BaseNode<TypeName extends string> {
  readonly _type: any
  typeName: TypeName
  isRequired: true
}
export type AnyBaseNode = BaseNode<any>

type AnyBasicNode =
  & Omit<AnyBaseNode, keyof Defaults | '_type'>
  & { [Key in keyof Defaults]?: AnyBaseNode[Key] }

export const defineNode = <
  T extends AnyBasicNode,
>(node: T): T & Defaults & { _type: any } => ({
  ...defaults,
  ...node,
  _type: undefined as unknown,
})

type HandleIsRequired<TNode extends AnyBaseNode> = TNode['isRequired'] extends true ? TNode['_type']
  : TNode['_type'] | undefined
export type Infer<TNode extends AnyBaseNode> = HandleIsRequired<TNode>

export type AnyNode =
  | NumberNode
  | StringNode
  | BooleanNode
  | UnknownNode
  | RegexpNode
  | LiteralNode<Primitive>
  | ArrayNode<any>
  | SetNode<any>
  | RecordNode<any>
  | ObjectNode<{ [key: string]: any }>
  | UnionNode<any>
  | TupleNode<any>
