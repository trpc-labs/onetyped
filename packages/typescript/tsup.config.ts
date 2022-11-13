import { defineConfig } from 'tsup'
import { tsupDefaultConfig } from '../../scripts/tsup-config'

export default defineConfig({
	...tsupDefaultConfig,
	entry: ['src/string.ts', 'src/schema.ts'],
})
