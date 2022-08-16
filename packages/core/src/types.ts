import {
  AnyArrayNode,
  AnyFunctionNode,
  AnyIntersectionNode,
  AnyMapNode,
  AnyObjectNode,
  AnyRecordNode,
  AnySetNode,
  AnyTupleNode,
  AnyUnionNode,
} from './complex'
import {
  AnyLiteralNode,
  AnyTypeNode,
  BigIntNode,
  BooleanNode,
  DateNode,
  NumberNode,
  RegexpNode,
  StringNode,
  UnknownNode,
} from './primitive'

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
  | StringNode
  | NumberNode
  | BooleanNode
  | AnyLiteralNode
  | UnknownNode
  | AnyTypeNode
  | RegexpNode
  | BigIntNode
  | DateNode
  | AnyObjectNode
  | AnyArrayNode
  | AnySetNode
  | AnyRecordNode
  | AnyMapNode
  | AnyFunctionNode
  | AnyUnionNode
  | AnyTupleNode
  | AnyIntersectionNode

export type InferNodeArray<TNodes extends AnyBaseNode[], InferredTypes extends unknown[] = []> = TNodes extends
  [infer Head extends AnyBaseNode, ...infer Rest extends AnyBaseNode[]]
  ? InferNodeArray<Rest, [...InferredTypes, Infer<Head>]>
  : InferredTypes
