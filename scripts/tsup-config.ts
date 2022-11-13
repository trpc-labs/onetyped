import { defineConfig } from 'tsup'

export const tsupDefaultConfig = defineConfig({
	format: ['cjs', 'esm'],
	dts: {
		resolve: true,
	},
	target: 'es2020',
	clean: true,
})
