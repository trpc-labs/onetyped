import { Primitive, Simplify } from './type-utils'

interface BaseNode<TypeName extends string> {
  typeName: TypeName
  isRequired: boolean
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
type RegexpNode = PrimitiveNode<'regexp'>

type ArrayNode<Type extends AnyNode> = ComplexNode<'array', Type>
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AnyArrayNode extends ArrayNode<AnyNode> {}

type SetNode<Type extends AnyNode> = ComplexNode<'set', Type>
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AnySetNode extends SetNode<AnyNode> {}

type RecordNode<Type extends AnyNode> = ComplexNode<'record', Type>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AnyRecordNode extends RecordNode<AnyNode> {}

interface LiteralNode<Type extends Primitive> extends BaseNode<'literal'> {
  type: Type
}
type AnyLiteralNode = LiteralNode<Primitive>

type AnyObjectShape = { [key: string]: AnyNode }
interface ObjectNode<Shape extends AnyObjectShape> extends BaseNode<'object'> {
  shape: Shape
}
type AnyObjectNode = ObjectNode<AnyObjectShape>

type AnyPrimitiveNode = NumberNode | StringNode | BooleanNode | UnknownNode | RegexpNode

export type AnyNode = AnyPrimitiveNode | AnyObjectNode | AnyArrayNode | AnySetNode | AnyRecordNode | AnyLiteralNode

export const defineNode = <T extends AnyNode>(node: T) => node

interface PrimitiveTypeMap {
  'number': number
  'string': string
  'boolean': boolean
  'unknown': unknown
  'regexp': RegExp
}

type InferObject<Node extends AnyObjectNode> = Simplify<
  & {
    [Property in keyof Node['shape'] as undefined extends Infer<Node['shape'][Property]> ? never : Property]: Infer<
      Node['shape'][Property]
    >
  }
  & {
    [Property in keyof Node['shape'] as undefined extends Infer<Node['shape'][Property]> ? Property : never]?: Infer<
      Node['shape'][Property]
    >
  }
>

type HandleIsRequired<Type, isRequired extends boolean> = isRequired extends true ? Type : undefined | Type

export type Infer<TNode extends AnyNode> = HandleIsRequired<
  TNode extends AnyPrimitiveNode ? PrimitiveTypeMap[TNode['typeName']]
    : TNode extends AnyObjectNode ? InferObject<TNode>
    : TNode extends AnyArrayNode ? Infer<TNode['type']>[]
    : TNode extends AnySetNode ? Set<Infer<TNode['type']>>
    : TNode extends AnyRecordNode ? Record<string, Infer<TNode['type']>>
    : TNode extends AnyLiteralNode ? TNode['type']
    : never,
  TNode['isRequired']
>
