import {
	any,
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
import ts, { ObjectType } from 'typescript'

const hasFlag = (type: ts.Type, flag: ts.TypeFlags): boolean => {
	return (type.flags & flag) === flag
}

const hasSymbolFlag = (symbol: ts.Symbol, flag: ts.SymbolFlags): boolean => {
	return (symbol.flags & flag) === flag
}

const hasObjectFlag = (type: ts.ObjectType, flag: ts.ObjectFlags): boolean => {
	return (type.objectFlags & flag) === flag
}

export const fromType = (type: ts.Type, locationNode: ts.Node, checker: ts.TypeChecker): AnyNode => {
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

	if (hasFlag(type, ts.TypeFlags.Object)) {
		const objectType = type as ObjectType
		console.log(checker.typeToString(type))
		if (hasObjectFlag(objectType, ts.ObjectFlags.Reference)) {
			const { target } = (type as ts.TypeReference)

			if (hasObjectFlag(target, ts.ObjectFlags.Tuple)) {
				const tupleTypes = checker.getTypeArguments(type as ts.TypeReference).map((tupleType) =>
					fromType(tupleType, locationNode, checker)
				) as [AnyNode, ...AnyNode[]]
				return tuple(tupleTypes)
			}
		}

		const callSignatures = type.getCallSignatures()

		if (callSignatures.length > 0) {
			const nodeCallSignatures = callSignatures.map((signature) => {
				const parameters = signature.getParameters().map((parameter) => {
					const parameterType = checker.getTypeOfSymbolAtLocation(parameter, locationNode)
					return fromType(parameterType, locationNode, checker)
				})
				const returnType = checker.getReturnTypeOfSignature(signature)

				return func({
					arguments: parameters as any,
					return: fromType(returnType, locationNode, checker),
				})
			}) as [AnyNode, ...AnyNode[]]

			return union(nodeCallSignatures)
		}

		const propertySchemas = Object.fromEntries(
			type.getProperties().map((
				property,
			) => [
				property.getName(),
				fromType(checker.getTypeOfSymbolAtLocation(property, locationNode), locationNode, checker),
			]),
		)
		return object(propertySchemas)
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

	if (hasSymbolFlag(type, ts.SymbolFlags.Optional)) {
		return optional(number())
	}

	throw new Error(`Unknown type: ${checker.typeToString(type)}`)
}

const filename = 'test.ts'
const code = `
type User = {
	name: string & { length: number }
	age: number
	func: (a: number, b: string) => string
	role: 'admin' | 'user'
	t: [string, number]
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

		console.log(ourNode)
	}

	node.forEachChild(child => recursivelyPrintVariableDeclarations(child, sourceFile))
}

recursivelyPrintVariableDeclarations(sourceFile, sourceFile)
