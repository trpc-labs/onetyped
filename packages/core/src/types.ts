const defaults = {
  isRequired: true,
} as const
type Defaults = typeof defaults

export interface BaseNode<TypeName extends string> {
  readonly _type: any
  typeName: TypeName
  isRequired: true
}
export type AnyNode = BaseNode<any>

type AnyBasicNode =
  & Omit<AnyNode, keyof Defaults | '_type'>
  & { [Key in keyof Defaults]?: AnyNode[Key] }

export const defineNode = <
  T extends AnyBasicNode,
>(node: T): T & Defaults & { _type: any } => ({
  ...defaults,
  ...node,
  _type: undefined as unknown,
})

export type Infer<TNode extends AnyNode> = TNode['isRequired'] extends true ? TNode['_type']
  : (TNode['_type'] | undefined)
