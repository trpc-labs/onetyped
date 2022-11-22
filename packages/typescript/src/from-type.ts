import {
	any,
	AnyFunctionNode,
	AnyNode,
	AnyRecordKeyNode,
	array,
	bigint,
	boolean,
	date,
	func,
	intersection,
	literal,
	map,
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
} from '@onetyped/core'
import ts from 'typescript'

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
	checker: ts.TypeChecker,
) => {
	if (callSignatures.length > 0) {
		const nodeCallSignatures = callSignatures.map((signature) => {
			const parameters = signature.getParameters().map((parameter) => {
				const parameterType = checker.getTypeOfSymbolAtLocation(parameter, locationNode)
				return fromType(parameterType, locationNode, checker)
			})
			const returnType = checker.getReturnTypeOfSignature(signature)

			const functionNode: AnyFunctionNode = func({
				arguments: parameters as [AnyNode, ...AnyNode[]],
				return: fromType(returnType, locationNode, checker),
			})

			return functionNode
		}) as [AnyNode, ...AnyNode[]]

		return unionIfMultiple(nodeCallSignatures)
	}
}

export const fromType = (type: ts.Type, locationNode: ts.Node, checker: ts.TypeChecker): AnyNode => {
	console.log(checker.typeToString(type))
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

	const symbol = type.getSymbol()
	if (symbol) {
		switch (symbol.name) {
			case 'Array':
			case 'ReadonlyArray': {
				const typeArguments = checker.getTypeArguments(type as ts.TypeReference)
				return array(fromType(typeArguments[0], locationNode, checker))
			}

			case 'Date': {
				return date()
			}

			case 'RegExp': {
				return regexp()
			}

			case 'Set': {
				const typeArguments = checker.getTypeArguments(type as ts.TypeReference)
				return set(fromType(typeArguments[0], locationNode, checker))
			}

			case 'Map': {
				const typeArguments = checker.getTypeArguments(type as ts.TypeReference)
				return map(
					fromType(typeArguments[0], locationNode, checker),
					fromType(typeArguments[1], locationNode, checker),
				)
			}
		}
	}

	if (hasFlag(type, ts.TypeFlags.Object)) {
		const objectType = type as ts.ObjectType

		if (hasObjectFlag(objectType, ts.ObjectFlags.Reference)) {
			const { target } = (type as ts.TypeReference)

			if (hasObjectFlag(target, ts.ObjectFlags.Tuple)) {
				const tupleType = type as ts.TupleType
				const target = tupleType.target as ts.TupleType

				const tupleTypes = tupleType.typeArguments?.map((typeArgument, index) => {
					const elementFlags = target.elementFlags[index]

					const node: AnyNode = fromType(typeArgument, locationNode, checker)
					if (elementFlags & ts.ElementFlags.Optional) {
						return optional(node)
					}

					return node
				})
					?? []

				return tuple(tupleTypes as [AnyNode, ...AnyNode[]])
			}
		}

		const nodes: AnyNode[] = []

		const keyTypes: AnyRecordKeyNode[] = []
		let valueType: AnyNode | undefined
		const stringIndexType = objectType.getStringIndexType()
		if (stringIndexType) {
			keyTypes.push(string())
			valueType = fromType(stringIndexType, locationNode, checker)
		}

		const numberIndexType = objectType.getNumberIndexType()
		if (numberIndexType) {
			keyTypes.push(number())
			if (!valueType) valueType = fromType(numberIndexType, locationNode, checker)
		}

		if (keyTypes.length > 0 && valueType) {
			nodes.push(record(unionIfMultiple(keyTypes as [AnyRecordKeyNode, ...AnyRecordKeyNode[]]), valueType))
		}

		const propertyEntries = type.getProperties().map((
			property,
		) => {
			const propertyType = checker.getTypeOfSymbolAtLocation(property, locationNode)
			let node = fromType(propertyType, locationNode, checker)
			if (hasSymbolFlag(property, ts.SymbolFlags.Optional)) {
				node = optional(node)
			}
			return [property.name, node]
		})

		const callSignatures = type.getCallSignatures()

		const functionNode = getNodeFromCallSignatures(callSignatures, locationNode, checker)

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
