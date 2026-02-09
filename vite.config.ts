import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.svg']
  },
  plugins: [
    svgr({ include: "**/*.svg?react" }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    visualizer({
      open: true,
    }),
  ],
  define: {
    API_BASE: JSON.stringify('https://gim.ink/api/'),
  }
})
