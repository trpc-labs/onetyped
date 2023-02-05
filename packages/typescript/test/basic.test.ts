import { number, object, record, string, union } from '@onetyped/core'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { expect, test } from 'vitest'
import { fromType, printNode, toTypeNode } from '../src'

export const testFromType = (type: string) => {
	const filename = 'test.ts'

	const sourceFile = ts.createSourceFile(
		filename,
		`type User = { name: string }; type T = ${type};`,
		ts.ScriptTarget.Latest,
	)

	const defaultCompilerHost = ts.createCompilerHost({})

	const customCompilerHost: ts.CompilerHost = {
		getSourceFile: (name, languageVersion) => {
			if (name === 'test.ts') {
				return sourceFile
			}

			if (name === 'lib.d.ts') {
				const tsLibraryPath = path.join('node_modules', 'typescript', 'lib', 'lib.d.ts')
				const code = fs.readFileSync(tsLibraryPath, 'utf8')
				return ts.createSourceFile(name, code, languageVersion)
			}

			if (name === 'node_modules/@typescript/lib-es5.ts') {
				const tsLibraryPath = path.join('node_modules', 'typescript', 'lib', 'lib.es5.d.ts')
				const code = fs.readFileSync(tsLibraryPath, 'utf8')
				return ts.createSourceFile(name, code, languageVersion)
			}

			return name === filename ? sourceFile : defaultCompilerHost.getSourceFile(
				name,
				languageVersion,
			)
		},
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		writeFile: () => {},
		getDefaultLibFileName: () => 'lib.d.ts',
		useCaseSensitiveFileNames: () => false,
		getCanonicalFileName: filename => filename,
		getCurrentDirectory: () => '',
		getNewLine: () => '\n',
		getDirectories: () => [],
		fileExists: () => true,
		readFile: () => '',
	}

	const program = ts.createProgram([filename], {}, customCompilerHost)
	const typeChecker = program.getTypeChecker()

	const typeAlias = sourceFile.statements.find((statement): statement is ts.TypeAliasDeclaration =>
		ts.isTypeAliasDeclaration(statement) && statement.name.text === 'T'
	)

	if (!typeAlias) throw new Error('Type alias not found')

	const testType = typeChecker.getTypeAtLocation(typeAlias)

	return fromType(testType, sourceFile, typeChecker)
}

test('fromType', async () => {
	const node = testFromType(`{
    name: string & { length: number }
    age?: number
    func: (a: number, b: string) => string
    role: 'admin' | 'user'
    t: [string, number, boolean?]
    d: (a: number, b: string) => string
		literal_string: "literal_string" as const,
		literal_true: true as const,
		literal_false: false as const,
  }`)

	expect(node).toMatchInlineSnapshot(`
		{
		  "definitions": Map {
		    "type_1060505820" => {
		      "shape": {
		        "age": {
		          "typeName": "union",
		          "types": [
		            {
		              "typeName": "number",
		            },
		            {
		              "typeName": "undefined",
		            },
		          ],
		        },
		        "d": {
		          "arguments": [
		            {
		              "typeName": "number",
		            },
		            {
		              "typeName": "string",
		            },
		          ],
		          "return": {
		            "typeName": "string",
		          },
		          "typeName": "function",
		        },
		        "func": {
		          "arguments": [
		            {
		              "typeName": "number",
		            },
		            {
		              "typeName": "string",
		            },
		          ],
		          "return": {
		            "typeName": "string",
		          },
		          "typeName": "function",
		        },
		        "literal_string": {
		          "type": "literal_string",
		          "typeName": "literal",
		        },
		        "name": {
		          "typeName": "intersection",
		          "types": [
		            {
		              "typeName": "string",
		            },
		            {
		              "shape": {
		                "length": {
		                  "typeName": "number",
		                },
		              },
		              "typeName": "object",
		            },
		          ],
		        },
		        "role": {
		          "typeName": "union",
		          "types": [
		            {
		              "type": "admin",
		              "typeName": "literal",
		            },
		            {
		              "type": "user",
		              "typeName": "literal",
		            },
		          ],
		        },
		        "t": {
		          "typeName": "tuple",
		          "types": [
		            {
		              "typeName": "string",
		            },
		            {
		              "typeName": "number",
		            },
		            {
		              "typeName": "union",
		              "types": [
		                {
		                  "typeName": "boolean",
		                },
		                {
		                  "typeName": "undefined",
		                },
		              ],
		            },
		          ],
		        },
		      },
		      "typeName": "object",
		    },
		  },
		  "node": {
		    "identifier": "type_1060505820",
		    "text": "T",
		    "typeName": "definitionReference",
		  },
		}
	`)
})

test('fromType record', async () => {
	const node = testFromType(`{ name: string } & Record<string, string>`)

	expect(node).toMatchInlineSnapshot(`
		{
		  "definitions": Map {
		    "type_3207251008" => {
		      "typeName": "intersection",
		      "types": [
		        {
		          "shape": {
		            "name": {
		              "typeName": "string",
		            },
		          },
		          "typeName": "object",
		        },
		        {
		          "key": {
		            "typeName": "string",
		          },
		          "typeName": "record",
		          "value": {
		            "typeName": "string",
		          },
		        },
		      ],
		    },
		  },
		  "node": {
		    "identifier": "type_3207251008",
		    "text": "T",
		    "typeName": "definitionReference",
		  },
		}
	`)
})

test('toTypeNode', () => {
	const personSchema = object({
		name: string(),
		items: record(union([string(), number()]), number()),
	})

	const typeNode = toTypeNode(personSchema)

	expect(printNode(typeNode)).toMatchInlineSnapshot(`
		"{
		    name: string;
		    items: Record<string | number, number>;
		}"
	`)
})

test('fromType literal', async () => {
	const node = testFromType(`{
		literal_true: true,
		literal_false: false,
		literal_void: void,
  }`)

	expect(node).toMatchInlineSnapshot(`
		{
		  "definitions": Map {
		    "type_1060505820" => {
		      "shape": {
		        "literal_false": {
		          "type": false,
		          "typeName": "literal",
		        },
		        "literal_true": {
		          "type": true,
		          "typeName": "literal",
		        },
		        "literal_void": {
		          "typeName": "void",
		        },
		      },
		      "typeName": "object",
		    },
		  },
		  "node": {
		    "identifier": "type_1060505820",
		    "text": "T",
		    "typeName": "definitionReference",
		  },
		}
	`)
})

test('recursive', async () => {
	const node = testFromType(`{
		user: User
  }`)

	expect(node).toMatchInlineSnapshot(`
		{
		  "definitions": Map {
		    "type_1060505820" => {
		      "shape": {
		        "user": {
		          "identifier": "type_63433467",
		          "text": "User",
		          "typeName": "definitionReference",
		        },
		      },
		      "typeName": "object",
		    },
		    "type_63433467" => {
		      "shape": {
		        "name": {
		          "typeName": "string",
		        },
		      },
		      "typeName": "object",
		    },
		  },
		  "node": {
		    "identifier": "type_1060505820",
		    "text": "T",
		    "typeName": "definitionReference",
		  },
		}
	`)
})

test('recursive', async () => {
	const node = testFromType(`{
		name: string,
    age: T,
  }`)

	expect(node).toMatchInlineSnapshot(`
		{
		  "definitions": Map {
		    "type_1060505820" => {
		      "shape": {
		        "age": {
		          "identifier": "type_1060505820",
		          "text": "T",
		          "typeName": "definitionReference",
		        },
		        "name": {
		          "typeName": "string",
		        },
		      },
		      "typeName": "object",
		    },
		  },
		  "node": {
		    "identifier": "type_1060505820",
		    "text": "T",
		    "typeName": "definitionReference",
		  },
		}
	`)
})

test('never type', () => {
	const node = testFromType(`{
		name: never
	}`)

	expect(node).toMatchInlineSnapshot(`
		{
		  "definitions": Map {
		    "type_1060505820" => {
		      "shape": {
		        "name": {
		          "typeName": "never",
		        },
		      },
		      "typeName": "object",
		    },
		  },
		  "node": {
		    "identifier": "type_1060505820",
		    "text": "T",
		    "typeName": "definitionReference",
		  },
		}
	`)
})
