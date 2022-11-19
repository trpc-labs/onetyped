# @onetyped/zod

onetyped integration for [Zod](https://github.com/colinhacks/zod)

## Usage

```ts
import { number, object, string } from '@onetyped/core'
import { toZodString } from '@onetyped/zod'

const schema = object({
	name: string(),
	age: number(),
})

// print Zod representation of schema
console.log(toZodString(schema))
```

Output:

```ts
z.object({
	name: z.string(),
	age: z.number(),
})
```
