import fs from 'node:fs'
import path from 'node:path'
import superjson from 'superjson'
import ts from 'typescript'
import { fromType } from '../src'

const testFromType = (type: string) => {
	const filename = 'test.ts'

	const sourceFile = ts.createSourceFile(
		filename,
		`
type User = { id: string, friends: User[] };
type T = ${type};
`,
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

const node = testFromType(`{
  name: string,
  age: number,
	users: User[],
	obj: Record<string, number>,
}`)

// console.log(node)
const entries = node.definitions.entries()
// entries.next()
console.log(JSON.stringify(superjson.serialize(node), null, 2))
console.log(superjson.parse(superjson.stringify(node)))
export {}
