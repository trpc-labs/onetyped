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
	NullNode,
	NumberNode,
	RegexpNode,
	StringNode,
	UndefinedNode,
	UnknownNode,
	VoidNode,
} from './primitive'

const defaults = {} as const
type Defaults = typeof defaults

export interface BaseNode<TypeName extends string> {
	readonly _type: any
	typeName: TypeName
}

export type AnyBaseNode = BaseNode<any>

type AnyBasicNode =
	& Omit<AnyBaseNode, keyof Defaults | '_type'>
	& {
		[Key in keyof Defaults]?: AnyBaseNode[Key]
	}

export const defineNode = <T extends AnyBasicNode>(node: T) => ({
	...defaults,
	...node,
} as T & Defaults & { _type: any })

export type Infer<TNode extends AnyBaseNode> = TNode['_type']

export type AnyNode =
	| StringNode
	| NumberNode
	| BooleanNode
	| NullNode
	| UndefinedNode
	| AnyLiteralNode
	| UnknownNode
	| VoidNode
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

export type InferNodeArray<
	TNodes extends AnyBaseNode[],
	InferredTypes extends unknown[] = [],
> = TNodes extends [
	infer Head extends AnyBaseNode,
	...infer Rest extends AnyBaseNode[],
] ? InferNodeArray<Rest, [...InferredTypes, Infer<Head>]>
	: InferredTypes

export interface CustomTypeNode<TType> extends BaseNode<any> {
	_type: TType
}
