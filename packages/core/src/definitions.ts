import { AnyNode } from './types'

export type DefinitionMap = Map<string, AnyNode>

const outputWithDefinitions = (
	id: string,
	node: AnyNode,
	definitions: DefinitionMap,
	nodeToString: (node: AnyNode) => string,
) => {
	const outputMap = new Map<string, string>()

	for (const [id, node] of definitions) {
		outputMap.set(id, `const ${id} = ${nodeToString(node)}`)
	}
}
