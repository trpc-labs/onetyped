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
import { Node, ObjectFlags, ObjectType, SymbolFlags, Type, TypeChecker, TypeFlags, TypeReference } from 'typescript'

const hasFlag = (type: Type, flag: TypeFlags): boolean => {
	return (type.flags & flag) !== 0
}

const hasSymbolFlag = (type: Type, flag: SymbolFlags): boolean => {
	return (type.flags & flag) !== 0
}

const hasObjectFlag = (type: ObjectType, flag: ObjectFlags): boolean => {
	return (type.objectFlags & flag) !== 0
}

export const fromType = (type: Type, locationNode: Node, checker: TypeChecker): AnyNode => {
	if (hasFlag(type, TypeFlags.String)) {
		return string()
	}

	if (hasFlag(type, TypeFlags.Number)) {
		return number()
	}

	if (hasFlag(type, TypeFlags.Boolean)) {
		return boolean()
	}

	if (hasFlag(type, TypeFlags.Unknown)) {
		return unknown()
	}

	if (type.isLiteral()) {
		if (typeof type.value === 'object') {
			const bigIntLiteral = BigInt(`${type.value.negative ? '-' : ''}${type.value.base10Value}`)
			return literal(bigIntLiteral)
		}

		return literal(type.value)
	}

	if (hasFlag(type, TypeFlags.Any)) {
		return any()
	}

	if (hasFlag(type, TypeFlags.BigInt)) {
		return bigint()
	}

	if (hasFlag(type, TypeFlags.Object)) {
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

	const symbolName = type.symbol.name
	if (symbolName) {
		switch (symbolName) {
			case 'Array':
			case 'ReadonlyArray': {
				const typeArguments = checker.getTypeArguments(type as TypeReference)
				return array(fromType(typeArguments[0], locationNode, checker))
			}

			case 'Date': {
				return date()
			}

			case 'Set': {
				const typeArguments = checker.getTypeArguments(type as TypeReference)
				return set(fromType(typeArguments[0], locationNode, checker))
			}

			case 'Record': {
				const typeArguments = checker.getTypeArguments(type as TypeReference)
				return record(
					fromType(typeArguments[1], locationNode, checker),
				)
			}

			case 'Map': {
				const typeArguments = checker.getTypeArguments(type as TypeReference)
				return map(
					fromType(typeArguments[0], locationNode, checker),
					fromType(typeArguments[1], locationNode, checker),
				)
			}
		}

		throw new Error(`Unknown symbol name: ${symbolName}`)
	}

	if (type.isUnion()) {
		const unionTypes = type.types.map((unionType) => fromType(unionType, locationNode, checker)) as [
			AnyNode,
			...AnyNode[],
		]
		return union(unionTypes)
	}

	if (hasObjectFlag(type as ObjectType, ObjectFlags.Tuple)) {
		const tupleTypes = checker.getTypeArguments(type as TypeReference).map((tupleType) =>
			fromType(tupleType, locationNode, checker)
		) as [AnyNode, ...AnyNode[]]
		return tuple(tupleTypes)
	}

	if (type.isIntersection()) {
		const intersectionTypes = type.types.map((type) => fromType(type, locationNode, checker)) as [
			AnyNode,
			...AnyNode[],
		]
		return intersection(intersectionTypes)
	}

	if (hasSymbolFlag(type, SymbolFlags.Optional)) {
		return optional(number())
	}

	if (hasSymbolFlag(type, SymbolFlags.Function)) {
		const callSignatures = type.getCallSignatures().map((signature) => {
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

		return union(callSignatures)
	}

	throw new Error(`Unknown type: ${checker.typeToString(type)}`)
}
