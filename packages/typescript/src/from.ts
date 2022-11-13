import {
	any,
	AnyBaseNode,
	AnyNode,
	array,
	bigint,
	boolean,
	date,
	func,
	intersection,
	literal,
	map,
	number,
	object,
	optional,
	record,
	set,
	string,
	tuple,
	union,
	unknown,
} from '@onetyped/core'
import ts, { ObjectType, TypeChecker } from 'typescript'

const hasFlag = (type: ts.Type, flag: ts.TypeFlags): boolean => {
	return (type.flags & flag) === flag
}

const hasSymbolFlag = (symbol: ts.Symbol, flag: ts.SymbolFlags): boolean => {
	return (symbol.flags & flag) === flag
}

const hasObjectFlag = (type: ts.ObjectType, flag: ts.ObjectFlags): boolean => {
	return (type.objectFlags & flag) === flag
}

const getNodeFromCallSignatures = (
	callSignatures: readonly ts.Signature[],
	locationNode: ts.Node,
	checker: TypeChecker,
) => {
	if (callSignatures.length > 0) {
		const nodeCallSignatures = callSignatures.map((signature) => {
			const parameters = signature.getParameters().map((parameter) => {
				const parameterType = checker.getTypeOfSymbolAtLocation(parameter, locationNode)
				return fromType(parameterType, locationNode, checker)
			})
			const returnType = checker.getReturnTypeOfSignature(signature)

			return func({
				arguments: parameters,
				return: fromType(returnType, locationNode, checker),
			})
		}) as [AnyNode, ...AnyNode[]]

		if (nodeCallSignatures.length === 1) {
			return nodeCallSignatures[0]
		}

		return union(nodeCallSignatures)
	}
}

export const fromType = (type: ts.Type, locationNode: ts.Node, checker: ts.TypeChecker): AnyBaseNode => {
	if (hasFlag(type, ts.TypeFlags.String)) {
		return string()
	}

	if (hasFlag(type, ts.TypeFlags.Number)) {
		return number()
	}

	if (hasFlag(type, ts.TypeFlags.Boolean)) {
		return boolean()
	}

	if (hasFlag(type, ts.TypeFlags.Unknown)) {
		return unknown()
	}

	if (type.isLiteral()) {
		if (typeof type.value === 'object') {
			const bigIntLiteral = BigInt(`${type.value.negative ? '-' : ''}${type.value.base10Value}`)
			return literal(bigIntLiteral)
		}

		return literal(type.value)
	}

	if (hasFlag(type, ts.TypeFlags.Any)) {
		return any()
	}

	if (hasFlag(type, ts.TypeFlags.BigInt)) {
		return bigint()
	}

	type A = [string, number?]
	type B = {
		[key in keyof A]: A[key]
	}
	if (hasFlag(type, ts.TypeFlags.Object)) {
		const objectType = type as ObjectType
		console.log(checker.typeToString(type))
		if (hasObjectFlag(objectType, ts.ObjectFlags.Reference)) {
			const { target } = (type as ts.TypeReference)

			if (hasObjectFlag(target, ts.ObjectFlags.Tuple)) {
				const tupleTypes = type.getProperties().map((property) => {
					if (property.name === 'length') return

					const propertyType = checker.getTypeOfSymbolAtLocation(property, locationNode)
					let node = fromType(propertyType, locationNode, checker)
					if (hasSymbolFlag(property, ts.SymbolFlags.Optional)) {
						node = optional(node)
					}

					return node
				}).filter(Boolean) as [AnyNode, ...AnyNode[]]
				return tuple(tupleTypes)
			}
		}

		const callSignatures = type.getCallSignatures()

		const functionNode = getNodeFromCallSignatures(callSignatures, locationNode, checker)

		const propertySchemas = Object.fromEntries(
			type.getProperties().map((
				property,
			) => {
				const propertyType = checker.getTypeOfSymbolAtLocation(property, locationNode)
				let node = fromType(propertyType, locationNode, checker)
				if (hasSymbolFlag(property, ts.SymbolFlags.Optional)) {
					node = optional(node)
				}
				return [property.name, node]
			}),
		)
		const objectNode = object(propertySchemas)

		if (functionNode) {
			return intersection([functionNode, objectNode])
		}

		return objectNode
	}

	const symbol = type.getSymbol()
	if (symbol) {
		// console.log(symbol.getName())
		switch (symbol.name) {
			case 'Array':
			case 'ReadonlyArray': {
				const typeArguments = checker.getTypeArguments(type as ts.TypeReference)
				return array(fromType(typeArguments[0], locationNode, checker))
			}

			case 'Date': {
				return date()
			}

			case 'Set': {
				const typeArguments = checker.getTypeArguments(type as ts.TypeReference)
				return set(fromType(typeArguments[0], locationNode, checker))
			}

			case 'Record': {
				const typeArguments = checker.getTypeArguments(type as ts.TypeReference)
				return record(
					fromType(typeArguments[1], locationNode, checker),
				)
			}

			case 'Map': {
				const typeArguments = checker.getTypeArguments(type as ts.TypeReference)
				return map(
					fromType(typeArguments[0], locationNode, checker),
					fromType(typeArguments[1], locationNode, checker),
				)
			}
		}

		throw new Error(`Unknown symbol name: ${symbol.name}`)
	}

	if (type.isUnion()) {
		const unionTypes = type.types.map((unionType) => fromType(unionType, locationNode, checker)) as [
			AnyNode,
			...AnyNode[],
		]
		return union(unionTypes)
	}

	if (type.isIntersection()) {
		const intersectionTypes = type.types.map((type) => fromType(type, locationNode, checker)) as [
			AnyNode,
			...AnyNode[],
		]
		return intersection(intersectionTypes)
	}

	throw new Error(`Unknown type: ${checker.typeToString(type)}`)
}

const filename = 'test.ts'
const code = `
interface User {
	name: string & { length: number }
	age?: number
	func: (a: number, b: string) => string
	role: 'admin' | 'user'
	t: [string, number, boolean?]
	
	(a: number, b: string) => string
}
const user = undefined as unknown as User`

const sourceFile = ts.createSourceFile(
	filename,
	code,
	ts.ScriptTarget.Latest,
)

const defaultCompilerHost = ts.createCompilerHost({})

const customCompilerHost: ts.CompilerHost = {
	getSourceFile: (name, languageVersion) => {
		console.log(`getSourceFile ${name}`)

		return name === filename ? sourceFile : defaultCompilerHost.getSourceFile(
			name,
			languageVersion,
		)
	},
	writeFile: (filename, data) => {},
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

function recursivelyPrintVariableDeclarations(
	node: ts.Node,
	sourceFile: ts.SourceFile,
) {
	if (node.kind === ts.SyntaxKind.VariableDeclaration) {
		const type = typeChecker.getTypeAtLocation(node)

		const ourNode = fromType(type, sourceFile, typeChecker)

		console.log(JSON.stringify(ourNode, null, 2))
	}

	node.forEachChild(child => recursivelyPrintVariableDeclarations(child, sourceFile))
}

recursivelyPrintVariableDeclarations(sourceFile, sourceFile)
