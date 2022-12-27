import { Simplify } from './type-utils'
import { AnyBaseNode, BaseNode, defineNode, Infer, InferNodeArray } from './types'

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
export type AnyObjectNode = ObjectNode<{ [key: string]: any }>
export const object = <TShape extends AnyObjectShape>(shape: TShape): ObjectNode<TShape> => {
	return defineNode({
		typeName: 'object',
		shape,
	})
}

export interface ArrayNode<Type extends AnyBaseNode> extends BaseNode<'array'> {
	readonly _type: Infer<Type>[]
	type: Type
}
export type AnyArrayNode = ArrayNode<any>
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
export type AnySetNode = SetNode<any>
export const set = <TNode extends AnyBaseNode>(type: TNode): SetNode<TNode> => {
	return defineNode({
		typeName: 'set',
		type,
	})
}

export interface AnyRecordKeyNode extends AnyBaseNode {
	readonly _type: string | number
}

export interface RecordNode<KeyNode extends AnyBaseNode, ValueNode extends AnyBaseNode> extends BaseNode<'record'> {
	readonly _type: Record<Infer<KeyNode>, Infer<ValueNode>>
	key: KeyNode
	value: ValueNode
}
export type AnyRecordNode = RecordNode<any, any>
export const record = <KeyNode extends AnyRecordKeyNode, ValueNode extends AnyBaseNode>(
	key: KeyNode,
	value: ValueNode,
): RecordNode<KeyNode, ValueNode> => {
	return defineNode({
		typeName: 'record',
		key,
		value,
	})
}

export interface MapNode<KeyNode extends AnyBaseNode, ValueNode extends AnyBaseNode> extends BaseNode<'map'> {
	readonly _type: Map<Infer<KeyNode>, Infer<ValueNode>>
	key: KeyNode
	value: ValueNode
}
export type AnyMapNode = MapNode<any, any>

export const map = <KeyNode extends AnyBaseNode, ValueNode extends AnyBaseNode>(
	key: KeyNode,
	value: ValueNode,
): MapNode<KeyNode, ValueNode> => {
	return defineNode({
		typeName: 'map',
		key,
		value,
	})
}

export interface FunctionNode<TArguments extends AnyBaseNode[], TReturn extends AnyBaseNode | undefined>
	extends BaseNode<'function'>
{
	readonly _type: (
		...arguments_: TArguments extends AnyBaseNode[] ? InferNodeArray<TArguments> : []
	) => TReturn extends AnyBaseNode ? Infer<TReturn> : void
	arguments: TArguments
	return: TReturn
}

export type AnyFunctionNode = FunctionNode<any[], any>
// eslint-disable-next-line unicorn/prevent-abbreviations
export const func = <
	TReturn extends AnyBaseNode,
	TArgument extends AnyBaseNode,
	TArguments extends AnyBaseNode[] = [],
>(
	options: { arguments?: [TArgument, ...TArguments]; return?: TReturn } = {},
): FunctionNode<[TArgument, ...TArguments], TReturn> => {
	const arguments_ = options.arguments ?? []

	return defineNode({
		typeName: 'function',
		arguments: arguments_ as [TArgument, ...TArguments],
		return: options.return as TReturn,
	})
}

export interface UnionNode<Types extends AnyBaseNode[]> extends BaseNode<'union'> {
	readonly _type: ({ [K in keyof Types]: Infer<Types[K]> })[number]
	types: Types
}
export type AnyUnionNode = UnionNode<any>
export const union = <TNode extends AnyBaseNode, TNodes extends AnyBaseNode[]>(
	nodes: [TNode, ...TNodes],
): UnionNode<[TNode, ...TNodes]> => {
	return defineNode({
		typeName: 'union',
		types: nodes,
	})
}

export interface TupleNode<Types extends AnyBaseNode[]> extends BaseNode<'tuple'> {
	readonly _type: InferNodeArray<Types>
	types: Types
}
export type AnyTupleNode = TupleNode<any>
export const tuple = <TNode extends AnyBaseNode, TNodes extends AnyBaseNode[]>(
	nodes: [TNode, ...TNodes],
): TupleNode<[TNode, ...TNodes]> => {
	return defineNode({
		typeName: 'tuple',
		types: nodes,
	})
}

type InferIntersection<TNodes extends AnyBaseNode[], InferredType = never> = TNodes extends
	[infer Head extends AnyBaseNode, ...infer Rest extends AnyBaseNode[]]
	? InferIntersection<Rest, InferredType & Infer<Head>>
	: InferredType

export interface IntersectionNode<Types extends AnyBaseNode[]> extends BaseNode<'intersection'> {
	readonly _type: InferIntersection<Types>
	types: Types
}
export type AnyIntersectionNode = IntersectionNode<any>
export const intersection = <TNode extends AnyBaseNode, TNodes extends AnyBaseNode[]>(
	nodes: [TNode, ...TNodes],
): IntersectionNode<[TNode, ...TNodes]> => {
	return defineNode({
		typeName: 'intersection',
		types: nodes,
	})
}

export interface DefinitionReferenceNode extends BaseNode<'definitionReference'> {
	readonly _type: unknown
	identifier: string
}
export const definitionReference = (identifier: string): DefinitionReferenceNode => {
	return defineNode({
		typeName: 'definitionReference',
		identifier,
	})
}
