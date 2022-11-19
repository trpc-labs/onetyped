import { AnyBaseNode, object, string } from '@onetyped/core'
import ts from 'typescript'
import { expect, test } from 'vitest'
import { fromType, printNode, toTypeNode } from '../src'

const testFromType = (type: string) => {
	const filename = 'test.ts'
	const code = `type T = ${type}
const t = undefined as unknown as T`

	const sourceFile = ts.createSourceFile(
		filename,
		code,
		ts.ScriptTarget.Latest,
	)

	const defaultCompilerHost = ts.createCompilerHost({})

	const customCompilerHost: ts.CompilerHost = {
		getSourceFile: (name, languageVersion) => {
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

	let onetypedNode: AnyBaseNode | undefined

	const recursivelyPrintVariableDeclarations = (
		tsNode: ts.Node,
		sourceFile: ts.SourceFile,
	) => {
		if (onetypedNode) return
		if (tsNode.kind === ts.SyntaxKind.VariableDeclaration) {
			const type = typeChecker.getTypeAtLocation(tsNode)

			onetypedNode = fromType(type, sourceFile, typeChecker)

			return
		}

		tsNode.forEachChild(child => recursivelyPrintVariableDeclarations(child, sourceFile))
	}

	recursivelyPrintVariableDeclarations(sourceFile, sourceFile)

	if (!onetypedNode) throw new Error('No variable declaration found')
	return onetypedNode
}

test('fromType', () => {
	const onetypedNode = testFromType(`{
    name: string & { length: number }
    age?: number
    func: (a: number, b: string) => string
    role: 'admin' | 'user'
    t: [string, number, boolean?]
    d: (a: number, b: string) => string
  }`)

	expect(onetypedNode).toMatchInlineSnapshot(`
		{
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
		}
	`)
})

test('toTypeNode', () => {
	const personSchema = object({
		name: string(),
	})

	const typeNode = toTypeNode(personSchema)

	expect(printNode(typeNode)).toMatchInlineSnapshot(`
		"{
		    name: string;
		}"
	`)
})
