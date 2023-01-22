import {
	any,
	AnyFunctionNode,
	AnyNode,
	AnyRecordKeyNode,
	array,
	bigint,
	boolean,
	date,
	DefinitionMap,
	definitionReference,
	func,
	intersection,
	literal,
	map,
	never,
	nullType,
	number,
	object,
	optional,
	record,
	regexp,
	set,
	string,
	tuple,
	undefinedType,
	union,
	unionIfMultiple,
	unknown,
	voidType,
} from '@onetyped/core'
import ts from 'typescript'

type TypeWithMustResolve = ts.Type & { _mustResolve: boolean }

const hasFlag = (type: ts.Type, flag: ts.TypeFlags): boolean => {
	return (type.flags & flag) === flag
}

const hasSymbolFlag = (symbol: ts.Symbol, flag: ts.SymbolFlags): boolean => {
	return (symbol.flags & flag) === flag
}

const hasObjectFlag = (type: ts.ObjectType, flag: ts.ObjectFlags): boolean => {
	return (type.objectFlags & flag) === flag
}

const getStringHash = (string_: string) => {
	let hash = 0
	for (let index = 0, length = string_.length; index < length; index++) {
		// eslint-disable-next-line unicorn/prefer-code-point
		const chr = string_.charCodeAt(index)
		hash = (hash << 5) - hash + chr
		hash = Math.trunc(hash)
	}
	return hash >>> 0
}

const getNodeFromCallSignatures = (
	callSignatures: readonly ts.Signature[],
	locationNode: ts.Node,
	checker: ts.TypeChecker,
	definitions: DefinitionMap,
) => {
	if (callSignatures.length > 0) {
		const nodeCallSignatures = callSignatures.map((signature) => {
			const parameters = signature.getParameters().map((parameter) => {
				const parameterType = checker.getTypeOfSymbolAtLocation(
					parameter,
					locationNode,
				)
				return fromTypeInternal(parameterType, locationNode, checker, definitions)
			})
			const returnType = checker.getReturnTypeOfSignature(signature)

			const functionNode: AnyFunctionNode = func({
				arguments: parameters as [AnyNode, ...AnyNode[]],
				return: fromTypeInternal(returnType, locationNode, checker, definitions),
			})

			return functionNode
		}) as [AnyNode, ...AnyNode[]]

		return unionIfMultiple(nodeCallSignatures)
	}
}

export const fromType = (
	type: ts.Type,
	locationNode: ts.Node,
	checker: ts.TypeChecker,
) => {
	const definitions: DefinitionMap = new Map()
	return { node: fromTypeInternal(type, locationNode, checker, definitions), definitions }
}

export const createOrReferenceSymbolDefinition = (
	type: ts.Type,
	typeArguments: readonly ts.Type[],
	checker: ts.TypeChecker,
	locationNode: ts.Node,
	definitions: DefinitionMap,
) => {
	const idObjectHash = JSON.stringify({
		id: (type as ts.Type & { id: number }).id,
		typeArgIds: typeArguments.map((typeArgument) => (typeArgument as ts.Type & { id: number }).id),
	})
	const hash = `type_${getStringHash(idObjectHash)}`

	console.log(hash, definitions)

	const typeString = checker.typeToString(type)

	const symbolNode = definitions.get(hash)

	if (symbolNode) {
		return definitionReference(hash, typeString)
	}

	definitions.set(hash, unknown())

	// clone type
	const newType: TypeWithMustResolve = Object.assign(Object.create(Object.getPrototypeOf(type)), type)

	newType._mustResolve = true

	definitions.set(
		hash,
		fromTypeInternal(newType, locationNode, checker, definitions),
	)

	return definitionReference(hash, typeString)
}

export const fromTypeInternal = (
	type: ts.Type,
	locationNode: ts.Node,
	checker: ts.TypeChecker,
	definitions: DefinitionMap,
): AnyNode => {
	if (hasFlag(type, ts.TypeFlags.String)) {
		return string()
	}

	if (hasFlag(type, ts.TypeFlags.Number)) {
		return number()
	}

	if (hasFlag(type, ts.TypeFlags.Boolean)) {
		return boolean()
	}

	if (hasFlag(type, ts.TypeFlags.Null)) {
		return nullType()
	}

	if (hasFlag(type, ts.TypeFlags.Undefined)) {
		return undefinedType()
	}

	if (hasFlag(type, ts.TypeFlags.Unknown)) {
		return unknown()
	}

	if (type.isLiteral()) {
		if (typeof type.value === 'object') {
			const bigIntLiteral = BigInt(
				`${type.value.negative ? '-' : ''}${type.value.base10Value}`,
			)
			return literal(bigIntLiteral)
		}

		return literal(type.value)
	}
	if (hasFlag(type, ts.TypeFlags.BooleanLiteral)) {
		// FIXME: there must be a way to avoid `typeToString` here
		const literalType = checker.typeToString(type)
		return literal(literalType === 'true')
	}

	if (hasFlag(type, ts.TypeFlags.Void)) {
		return voidType()
	}

	if (hasFlag(type, ts.TypeFlags.Any)) {
		return any()
	}

	if (hasFlag(type, ts.TypeFlags.Never)) {
		return never()
	}

	if (hasFlag(type, ts.TypeFlags.BigInt)) {
		return bigint()
	}

	const symbol = type.getSymbol()
	if (symbol) {
		switch (symbol.name) {
			case 'Array':
			case 'ReadonlyArray': {
				const typeArguments = checker.getTypeArguments(
					type as ts.TypeReference,
				)

				return array(fromTypeInternal(typeArguments[0], locationNode, checker, definitions))
			}

			case 'Date': {
				return date()
			}

			case 'RegExp': {
				return regexp()
			}

			case 'Set': {
				const typeArguments = checker.getTypeArguments(
					type as ts.TypeReference,
				)
				return set(fromTypeInternal(typeArguments[0], locationNode, checker, definitions))
			}

			case 'Map': {
				const typeArguments = checker.getTypeArguments(
					type as ts.TypeReference,
				)
				return map(
					fromTypeInternal(typeArguments[0], locationNode, checker, definitions),
					fromTypeInternal(typeArguments[1], locationNode, checker, definitions),
				)
			}
		}

		const aliasSymbol = type.aliasSymbol
		const aliasTypeArguments = type.aliasTypeArguments
		if (aliasSymbol?.escapedName === 'Record' && aliasTypeArguments?.length === 2) {
			return record(
				fromTypeInternal(aliasTypeArguments[0], locationNode, checker, definitions) as AnyRecordKeyNode,
				fromTypeInternal(aliasTypeArguments[1], locationNode, checker, definitions),
			)
		}

		if (aliasSymbol && !(type as TypeWithMustResolve)._mustResolve) {
			return createOrReferenceSymbolDefinition(
				type,
				aliasTypeArguments ?? [],
				checker,
				locationNode,
				definitions,
			)
		}

		if (symbol.name !== '__type' && symbol.name !== '__object' && !(type as TypeWithMustResolve)._mustResolve) {
			return createOrReferenceSymbolDefinition(
				type,
				checker.getTypeArguments(type as ts.TypeReference),
				checker,
				locationNode,
				definitions,
			)
		}
	}

	if (hasFlag(type, ts.TypeFlags.Object)) {
		const objectType = type as ts.ObjectType

		if (hasObjectFlag(objectType, ts.ObjectFlags.Reference)) {
			const { target } = type as ts.TypeReference

			if (hasObjectFlag(target, ts.ObjectFlags.Tuple)) {
				const tupleType = type as ts.TupleType
				const target = tupleType.target as ts.TupleType

				const tupleTypes = tupleType.typeArguments?.map((typeArgument, index) => {
					const elementFlags = target.elementFlags[index]

					const node: AnyNode = fromTypeInternal(typeArgument, locationNode, checker, definitions)
					if (elementFlags & ts.ElementFlags.Optional) {
						return optional(node)
					}

					return node
				}) ?? []

				return tuple(tupleTypes as [AnyNode, ...AnyNode[]])
			}
		}

		const nodes: AnyNode[] = []

		const keyTypes: AnyRecordKeyNode[] = []
		let valueType: AnyNode | undefined
		const stringIndexType = objectType.getStringIndexType()
		if (stringIndexType) {
			keyTypes.push(string())
			valueType = fromTypeInternal(stringIndexType, locationNode, checker, definitions)
		}

		const numberIndexType = objectType.getNumberIndexType()
		if (numberIndexType) {
			keyTypes.push(number())
			if (!valueType) {
				valueType = fromTypeInternal(numberIndexType, locationNode, checker, definitions)
			}
		}

		if (keyTypes.length > 0 && valueType) {
			nodes.push(
				record(
					unionIfMultiple(
						keyTypes as [AnyRecordKeyNode, ...AnyRecordKeyNode[]],
					),
					valueType,
				),
			)
		}

		const propertyEntries = type.getProperties().map((property) => {
			const propertyType = checker.getTypeOfSymbolAtLocation(
				property,
				locationNode,
			)

			let node = fromTypeInternal(propertyType, locationNode, checker, definitions)

			if (hasSymbolFlag(property, ts.SymbolFlags.Optional)) {
				node = optional(node)
			}
			return [property.name, node]
		})

		const callSignatures = type.getCallSignatures()

		const functionNode = getNodeFromCallSignatures(
			callSignatures,
			locationNode,
			checker,
			definitions,
		)

		if (functionNode) {
			nodes.push(functionNode)
		}

		if (propertyEntries.length > 0) {
			const propertySchemas = Object.fromEntries(propertyEntries)
			nodes.push(object(propertySchemas))
		}

		if (nodes.length === 1) {
			return nodes[0]
		}

		return intersection(nodes as [AnyNode, ...AnyNode[]])
	}

	if (type.isUnion()) {
		const unionTypes = type.types.map((unionType) =>
			fromTypeInternal(unionType, locationNode, checker, definitions)
		) as [
			AnyNode,
			...AnyNode[],
		]
		return union(unionTypes)
	}

	if (type.isIntersection()) {
		const intersectionTypes = type.types.map((type) => fromTypeInternal(type, locationNode, checker, definitions)) as [
			AnyNode,
			...AnyNode[],
		]
		return intersection(intersectionTypes)
	}

	throw new Error(`Unknown type: ${checker.typeToString(type)}`)
}
