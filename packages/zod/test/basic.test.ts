import { object, string } from '@onetyped/core'
import { expect, test } from 'vitest'
import { z } from 'zod'
import { fromZodSchema, toZodSchema, toZodString } from '../src'

test('fromZodSchema', () => {
	const personSchema = z.object({
		name: z.string(),
	})

	expect(fromZodSchema(personSchema)).toMatchInlineSnapshot(`
		{
		  "shape": {
		    "name": {
		      "type": "string",
		      "typeName": "string",
		    },
		  },
		  "typeName": "object",
		}
	`)
})

test('toZodString', () => {
	const personSchema = object({
		name: string(),
	})

	expect(toZodString(personSchema)).toMatchInlineSnapshot('"z.object({ name: z.string() })"')
})

test('toZodSchema', () => {
	const personSchema = object({
		name: string(),
	})

	const zodSchema = toZodSchema(personSchema)

	expect(() => zodSchema.parse({ name: 'John' })).not.toThrow()
	expect(() => zodSchema.parse({ author: 'John' })).toThrow()
})
