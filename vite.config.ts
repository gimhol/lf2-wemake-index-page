import react from '@vitejs/plugin-react';
import dayjs from "dayjs";
import { resolve } from 'path';
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from 'vite';
import svgr from "vite-plugin-svgr";

const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
const development = {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE: 'http://localhost/api/',
  STORAGE_URL_BASE: 'https://lfwm.gim.ink/',
  BUILD_TIME: now,
}
const production = {
  ...development,
  API_BASE: 'https://gim.ink/api/',
  STORAGE_URL_BASE: 'https://lfwm.gim.ink/',
}
const defines = process_string_definition(
  process.argv.some(v => v == '--api=local') ? development : production
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function process_string_definition(v: any) {
  if (typeof v === 'string')
    return JSON.stringify(v);
  if (typeof v !== 'object')
    return v
  for (const i in v)
    v[i] = process_string_definition(v[i]);
  return v;
}
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.svg']
  },
  esbuild: {
    pure: ['console.debug',],
    drop: ['debugger'],
  },
  build: {
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    svgr({ include: "**/*.svg?react" }),
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler'],
          ['@babel/plugin-proposal-decorators', { version: "2023-05" }]
        ],
      },
    }),
    visualizer({
      open: true,
    }),
  ],
  define: { ...defines },
})
