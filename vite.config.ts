import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 단일 HTML 파일 빌드: Finder에서 더블클릭하면 바로 열림 (서버 불필요)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    // 모든 에셋을 HTML에 인라인
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    outDir: 'dist-standalone',
  },
})
