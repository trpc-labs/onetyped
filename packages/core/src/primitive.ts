import { Primitive } from './type-utils'
import { BaseNode, defineNode } from './types'

export interface StringNode extends BaseNode<'string'> {
	readonly _type: string
}
export const string = (): StringNode => {
	return defineNode({
		typeName: 'string',
	})
}

export interface NumberNode extends BaseNode<'number'> {
	readonly _type: number
}
export const number = (): NumberNode => {
	return defineNode({
		typeName: 'number',
	})
}

export interface BooleanNode extends BaseNode<'boolean'> {
	readonly _type: boolean
}
export const boolean = (): BooleanNode => {
	return defineNode({
		typeName: 'boolean',
	})
}

export interface NullNode extends BaseNode<'null'> {
	readonly _type: null
}
export const nullType = (): NullNode => {
	return defineNode({
		typeName: 'null',
	})
}

export interface UndefinedNode extends BaseNode<'undefined'> {
	readonly _type: undefined
}
export const undefinedType = (): UndefinedNode => {
	return defineNode({
		typeName: 'undefined',
	})
}

export interface VoidNode extends BaseNode<'void'> {
	readonly _type: void
}
export const voidType = (): VoidNode => {
	return defineNode({
		typeName: 'void',
	})
}

export interface LiteralNode<Type extends Primitive> extends BaseNode<'literal'> {
	readonly _type: Type
	type: Type
}
export type AnyLiteralNode = LiteralNode<Primitive>
export const literal = <Literal extends Primitive>(
	literal: Literal,
): LiteralNode<Literal> => {
	return defineNode({
		typeName: 'literal',
		type: literal,
	})
}

export interface UnknownNode extends BaseNode<'unknown'> {
	readonly _type: unknown
}
export const unknown = (): UnknownNode => {
	return defineNode({
		typeName: 'unknown',
	})
}

export interface AnyTypeNode extends BaseNode<'any'> {
	readonly _type: any
}
export const any = (): AnyTypeNode => {
	return defineNode({
		typeName: 'any',
	})
}

export interface NeverNode extends BaseNode<'never'> {
	readonly _type: never
}
export const never = (): NeverNode => {
	return defineNode({
		typeName: 'never',
	}) as NeverNode
}

export interface RegexpNode extends BaseNode<'regexp'> {
	readonly _type: RegExp
}
export const regexp = (): RegexpNode => {
	return defineNode({
		typeName: 'regexp',
	})
}

export interface BigIntNode extends BaseNode<'bigint'> {
	readonly _type: bigint
}
export const bigint = (): BigIntNode => {
	return defineNode({
		typeName: 'bigint',
	})
}

export interface DateNode extends BaseNode<'date'> {
	readonly _type: Date
}
export const date = (): DateNode => {
	return defineNode({
		typeName: 'date',
	})
}
