import { object, string } from '@onetyped/core'
import { expect, test } from 'vitest'
import { toTypeBoxString } from '../src'

test('basic', () => {
	const personSchema = object({
		name: string(),
	})

	expect(toTypeBoxString(personSchema)).toMatchInlineSnapshot('"Type.Object({ name: Type.String() })"')
})
