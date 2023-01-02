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
		`type T = ${type};`,
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
		    "type_84" => {
		      "shape": {
		        "age": {
		          "typeName": "union",
		          "types": [
		            {
		              "type": "number",
		              "typeName": "number",
		            },
		            {
		              "type": "undefined",
		              "typeName": "undefined",
		            },
		          ],
		        },
		        "d": {
		          "arguments": [
		            {
		              "type": "number",
		              "typeName": "number",
		            },
		            {
		              "type": "string",
		              "typeName": "string",
		            },
		          ],
		          "return": {
		            "type": "string",
		            "typeName": "string",
		          },
		          "typeName": "function",
		        },
		        "func": {
		          "arguments": [
		            {
		              "type": "number",
		              "typeName": "number",
		            },
		            {
		              "type": "string",
		              "typeName": "string",
		            },
		          ],
		          "return": {
		            "type": "string",
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
		              "type": "string",
		              "typeName": "string",
		            },
		            {
		              "shape": {
		                "length": {
		                  "type": "number",
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
		              "type": "string",
		              "typeName": "string",
		            },
		            {
		              "type": "number",
		              "typeName": "number",
		            },
		            {
		              "typeName": "union",
		              "types": [
		                {
		                  "type": "boolean",
		                  "typeName": "boolean",
		                },
		                {
		                  "type": "undefined",
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
		    "identifier": "type_84",
		    "typeName": "definitionReference",
		  },
		}
	`)
})

test('fromType record', async () => {
	const node = testFromType(`{ name: string } & Record<string, string>`)

	expect(node).toMatchInlineSnapshot(`
		{
		  "definitions": Map {},
		  "node": {
		    "typeName": "intersection",
		    "types": [
		      {
		        "shape": {
		          "name": {
		            "type": "string",
		            "typeName": "string",
		          },
		        },
		        "typeName": "object",
		      },
		      {
		        "key": {
		          "type": "string",
		          "typeName": "string",
		        },
		        "typeName": "record",
		        "value": {
		          "type": "string",
		          "typeName": "string",
		        },
		      },
		    ],
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
		    "type_84" => {
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
		          "type": "void",
		          "typeName": "void",
		        },
		      },
		      "typeName": "object",
		    },
		  },
		  "node": {
		    "identifier": "type_84",
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
		    "type_84" => {
		      "shape": {
		        "age": {
		          "identifier": "type_84",
		          "typeName": "definitionReference",
		        },
		        "name": {
		          "type": "string",
		          "typeName": "string",
		        },
		      },
		      "typeName": "object",
		    },
		  },
		  "node": {
		    "identifier": "type_84",
		    "typeName": "definitionReference",
		  },
		}
	`)
})
