import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      // 开启 CSS Modules，支持 .module.less 文件
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      less: {
        // 全局 Less 变量/mixin 注入
        additionalData: `@import "@/styles/variables.less";`,
        javascriptEnabled: true,
      },
    },
  },
})
