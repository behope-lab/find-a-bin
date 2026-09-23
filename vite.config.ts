import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vercel 배포용 표준 빌드 설정
// 로컬 단일 파일 빌드가 필요하다면:
//   import { viteSingleFile } from 'vite-plugin-singlefile'
//   plugins: [react(), viteSingleFile()],
//   build: { assetsInlineLimit: 100_000_000, cssCodeSplit: false, outDir: 'dist-standalone' }
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
