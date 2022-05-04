import { array } from './array'

export type PrimitiveType = 'number' | 'string' | 'boolean' | 'unknown'

type PrimitiveTypeName = 'number' | 'string' | 'boolean' | 'unknown'
type ComplexTypeName = 'array' | 'set' | 'optional'

export type TypeName = ComplexTypeName | PrimitiveTypeName

interface BaseNode<TypeName extends string> {
  typeName: TypeName
}

interface PrimitiveNode<Type extends string> extends BaseNode<Type> {
  type: Type
}

interface ComplexNode<TypeName extends string, Type extends AnyNode> extends BaseNode<TypeName> {
  type: Type
}

type NumberNode = PrimitiveNode<'number'>
type StringNode = PrimitiveNode<'string'>
type BooleanNode = PrimitiveNode<'boolean'>
type UnknownNode = PrimitiveNode<'unknown'>

type ArrayNode<Type extends AnyNode> = ComplexNode<'array', Type>
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AnyArrayNode extends ArrayNode<AnyNode> {}

type AnyObjectShape = { [key: string]: AnyNode }
interface ObjectIchorNode<Shape extends AnyObjectShape> extends BaseNode<'object'> {
  shape: Shape
}
type AnyObjectNode = ObjectIchorNode<AnyObjectShape>

type AnyPrimitiveNode = NumberNode | StringNode | BooleanNode | UnknownNode

export type AnyNode = AnyPrimitiveNode | AnyObjectNode | AnyArrayNode

export const defineNode = <T extends AnyNode>(node: T) => node

interface PrimitiveTypeMap {
  'number': number
  'string': string
  'boolean': boolean
  'unknown': unknown
}

export type PickBy<T, V> = Pick<
  T,
  { [K in keyof T]: V extends Extract<T[K], V> ? K : never }[keyof T]
>

/**
 * @see https://github.com/ianstormtaylor/superstruct/blob/d677b8e972d9e81d4a62f1594b55578cad55cf35/src/utils.ts#L323-L325
 */
// use an arbitrary condition
type Simplify<T> = T extends number ? T
  : { [K in keyof T]: T[K] }

type InferObject<TNode extends AnyObjectNode> = Simplify<
  & {
    [Property in keyof TNode['shape'] as undefined extends Infer<TNode['shape'][Property]> ? never : Property]: Infer<
      TNode['shape'][Property]
    >
  }
  & {
    [Property in keyof TNode['shape'] as undefined extends Infer<TNode['shape'][Property]> ? Property : never]?: Infer<
      TNode['shape'][Property]
    >
  }
>

export type Infer<TNode extends AnyNode> = TNode extends AnyPrimitiveNode ? PrimitiveTypeMap[TNode['typeName']]
  : TNode extends AnyObjectNode ? InferObject<TNode>
  : TNode extends AnyArrayNode ? Infer<TNode['type']>[]
  : never
