/* eslint-disable unicorn/consistent-destructuring */
import { AnyNode, isNodeOptional, mapMultipleInnerNode } from '@onetyped/core'
import ts from 'typescript'

const { factory: f } = ts

export const printNode = (node: ts.Node, printerOptions?: ts.PrinterOptions) => {
	const sourceFile = ts.createSourceFile('print.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
	const printer = ts.createPrinter(printerOptions)
	return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)
}

export const toTypeNode = <TNode extends AnyNode>(node: TNode): ts.TypeNode => {
	switch (node.typeName) {
		case 'definitionReference': {
			return f.createTypeReferenceNode(node.text)
		}
		case 'string': {
			return f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
		}
		case 'number': {
			return f.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
		}
		case 'boolean': {
			return f.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
		}
		case 'null': {
			return f.createLiteralTypeNode(f.createNull())
		}
		case 'undefined': {
			return f.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
		}
		case 'literal': {
			if (node.type === undefined) {
				return f.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
			}

			switch (typeof node.type) {
				case 'string': {
					return f.createLiteralTypeNode(f.createStringLiteral(node.type))
				}
				case 'number': {
					return f.createLiteralTypeNode(f.createNumericLiteral(node.type))
				}
				case 'boolean': {
					return f.createLiteralTypeNode(node.type === true ? f.createTrue() : f.createFalse())
				}
				case 'bigint': {
					return f.createLiteralTypeNode(f.createBigIntLiteral(node.type.toString()))
				}
			}
		}
		// eslint-disable-next-line no-fallthrough
		case 'unknown': {
			return f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
		}
		case 'void': {
			return f.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
		}
		case 'any': {
			return f.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
		}
		case 'never': {
			return f.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)
		}
		case 'regexp': {
			return f.createTypeReferenceNode('RegExp', [])
		}
		case 'bigint': {
			return f.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword)
		}
		case 'date': {
			return f.createTypeReferenceNode('Date', [])
		}
		case 'object': {
			return f.createTypeLiteralNode(
				Object.entries(node.shape).map(([key, value]) => {
					return f.createPropertySignature(
						undefined,
						key,
						isNodeOptional(value) ? f.createToken(ts.SyntaxKind.QuestionToken) : undefined,
						toTypeNode(value),
					)
				}),
			)
		}
		case 'array': {
			return f.createArrayTypeNode(toTypeNode(node.type))
		}
		case 'set': {
			return f.createTypeReferenceNode('Set', [toTypeNode(node.type)])
		}
		case 'record': {
			return f.createTypeReferenceNode('Record', [
				toTypeNode(node.key),
				toTypeNode(node.value),
			])
		}
		case 'map': {
			return f.createTypeReferenceNode('Map', [toTypeNode(node.key), toTypeNode(node.value)])
		}
		case 'function': {
			return f.createFunctionTypeNode(
				undefined,
				node.arguments.map((argument: AnyNode, index: number) =>
					f.createParameterDeclaration(
						undefined,
						undefined,
						`args_${index}`,
						undefined,
						toTypeNode(argument),
					)
				),
				node.return ? toTypeNode(node.return) : f.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
			)
		}

		case 'union': {
			return f.createUnionTypeNode(mapMultipleInnerNode(node, toTypeNode))
		}
		case 'tuple': {
			return f.createTupleTypeNode(mapMultipleInnerNode(node, toTypeNode))
		}
		case 'intersection': {
			return f.createIntersectionTypeNode(mapMultipleInnerNode(node, toTypeNode))
		}
	}
}
