# @onetyped/core

This package contains functions to define your onetyped schema. Each function creates a node that makes up your schema. Some utilities for manipulating the schema are also provided.

## Usage

```ts
import { number, object, string } from '@onetyped/core'

const schema = object({
	name: string(),
	age: number(),
})

// Print JSON representation of schema
console.log(schema)
```
