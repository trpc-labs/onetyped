# @onetyped/typebox

onetyped integration for [TypeBox](https://github.com/sinclairzx81/typebox)

## Usage

```ts
import { number, object, string } from '@onetyped/core'
import { toTypeBoxString } from '@onetyped/typebox'

const schema = object({
	name: string(),
	age: number(),
})

// print TypeBox representation of schema
console.log(toTypeBoxString(schema))
```

Output:

```ts
Type.Object({
	name: Type.String(),
	age: Type.Number(),
})
```
