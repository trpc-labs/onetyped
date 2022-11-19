# @onetyped/typebox

onetyped integration for the TypeScript AST/TypeChecker

## Usage

```ts
import { number, object, string } from '@onetyped/core'
import { toTypeNode } from '@onetyped/typescript'

const schema = object({
	name: string(),
	age: number(),
})

// print TypeScript AST type representation of schema
console.log(toTypeNode(schema))
```

Output:

<!-- dprint-ignore -->
```ts
{
	name: string
	age: number
}
```
