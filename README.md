# onetyped

one schema to rule them all

## What is it?

onetyped is a universal way to describe data. I built this to painlessly convert to and from different formats primarily for use in dev tools.

## Why not Zod or (insert validation framework here)?

Zod is great, but it's not universal. It's primary use case is for validation and that shows. onetyped is not a validation framework, it's a data description framework. It optimizes for traversing your schema's shape and converting it to different formats.

## Integrations

- [Zod](https://github.com/sachinraja/onetyped/tree/main/packages/zod#readme)
- [TypeScript](https://github.com/sachinraja/onetyped/tree/main/packages/typescript#readme)
- [TypeBox](https://github.com/sachinraja/onetyped/tree/main/packages/typebox#readme)

## Usage

Use [`@onetyped/core`](https://github.com/sachinraja/onetyped/tree/main/packages/core#readme) to define your onetyped schema. You can also use an integration to derive a schema from a different format. With this schema, you can use an integration to convert to a different format. You can also traverse the nodes of your onetyped schema and do as you wish with the definition (essentially: you can create your own integrations).
