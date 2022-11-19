import { expect, expectTypeOf, test } from 'vitest'
import { Infer, object, string } from '../src'

test('node shape', () => {
	const personSchema = object({
		name: string(),
	})

	type Person = Infer<typeof personSchema>

	expectTypeOf<Person>().toEqualTypeOf<{ name: string }>()

	expect(personSchema).toMatchInlineSnapshot(`
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
