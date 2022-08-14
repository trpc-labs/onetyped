import { defineConfig } from 'tsup'
import { tsupDefaultConfig } from '../../scripts/tsup-config'

export default defineConfig({
  ...tsupDefaultConfig,
  entry: ['src/index.ts'],
})
