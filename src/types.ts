export type PrimitiveType = 'number' | 'string' | 'boolean' | 'unknown'

type PrimitiveTypeName = 'number' | 'string' | 'boolean' | 'unknown'
type ComplexTypeName = 'array' | 'set' | 'optional'

export type TypeName = ComplexTypeName | PrimitiveTypeName

interface PrimitiveIchorNode<TType extends PrimitiveType> {
  typeName: PrimitiveTypeName
  type: TType
}

interface ComplexIchorNode<TTypeName extends ComplexTypeName, TNode extends AnyIchorNode> {
  typeName: TTypeName
  type: TNode
}

type AnyObjectShape = { [key: string]: AnyIchorNode }

interface ObjectIchorNode<TShape extends AnyObjectShape> {
  typeName: 'object'
  shape: TShape
}

type AnyPrimitiveIchorNode = PrimitiveIchorNode<PrimitiveType>
type AnyComplexIchorNode = ComplexIchorNode<ComplexTypeName, AnyIchorNode>
type AnyObjectIchorNode = ObjectIchorNode<AnyObjectShape>
export type AnyIchorNode = AnyComplexIchorNode | AnyPrimitiveIchorNode | AnyObjectIchorNode

export const defineNode = <T extends AnyIchorNode>(node: T) => node

interface PrimitiveTypeMap {
  'number': number
  'string': string
  'boolean': boolean
  'unknown': unknown
}

interface ComplexTypeMap<TNode extends AnyComplexIchorNode> {
  'array': Infer<TNode['type']>[]
  'set': Set<Infer<TNode['type']>>
  'optional': Infer<TNode['type']> | undefined
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

type InferObject<TNode extends AnyObjectIchorNode> = Simplify<
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

export type Infer<TNode extends AnyIchorNode> = TNode extends AnyPrimitiveIchorNode ? PrimitiveTypeMap[TNode['type']]
  : TNode extends AnyComplexIchorNode ? ComplexTypeMap<TNode>[TNode['typeName']]
  : TNode extends AnyObjectIchorNode ? InferObject<TNode>
  : never
