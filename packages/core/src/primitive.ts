import { Primitive } from './type-utils'
import { BaseNode, defineNode } from './types'

export interface StringNode extends BaseNode<'string'> {
  readonly _type: string
  type: 'string'
}
export const string = (): StringNode => {
  return defineNode({
    typeName: 'string',
    type: 'string',
  })
}

export interface NumberNode extends BaseNode<'number'> {
  readonly _type: number
  type: 'number'
}
export const number = (): NumberNode => {
  return defineNode({
    typeName: 'number',
    type: 'number',
  })
}

export interface BooleanNode extends BaseNode<'boolean'> {
  readonly _type: boolean
  type: 'boolean'
}
export const boolean = (): BooleanNode => {
  return defineNode({
    typeName: 'boolean',
    type: 'boolean',
  })
}

export interface LiteralNode<Type extends Primitive> extends BaseNode<'literal'> {
  readonly _type: Type
  type: Type
}
export type AnyLiteralNode = LiteralNode<Primitive>
export const literal = <Literal extends Primitive>(literal: Literal): LiteralNode<Literal> => {
  return defineNode({
    typeName: 'literal',
    type: literal,
  })
}

export interface UnknownNode extends BaseNode<'unknown'> {
  readonly _type: unknown
  type: 'unknown'
}
export const unknown = (): UnknownNode => {
  return defineNode({
    typeName: 'unknown',
    type: 'unknown',
  })
}

export interface AnyTypeNode extends BaseNode<'any'> {
  readonly _type: any
  type: 'any'
}
export const any = (): AnyTypeNode => {
  return defineNode({
    typeName: 'any',
    type: 'any',
  })
}

export interface RegexpNode extends BaseNode<'regexp'> {
  readonly _type: RegExp
  type: 'regexp'
}
export const regexp = (): RegexpNode => {
  return defineNode({
    typeName: 'regexp',
    type: 'regexp',
  })
}

export interface BigIntNode extends BaseNode<'bigint'> {
  readonly _type: bigint
  type: 'bigint'
}
export const bigint = (): BigIntNode => {
  return defineNode({
    typeName: 'bigint',
    type: 'bigint',
  })
}

export interface DateNode extends BaseNode<'date'> {
  readonly _type: Date
  type: 'date'
}
export const date = (): DateNode => {
  return defineNode({
    typeName: 'date',
    type: 'date',
  })
}

export const nullType = (): LiteralNode<null> => {
  return literal(null)
}
