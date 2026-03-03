import localforage from "localforage";
import * as monaco from 'monaco-editor';

export const forage = localforage.createInstance({ name: 'lfwm-editors' })
monaco.languages.register({ id: 'lf2-dat' })
monaco.editor.defineTheme('lf2-dat', {
  base: 'vs-dark',
  inherit: true,
  colors: {},
  rules: [{
    token: 'next',
    foreground: 'DCDCAA',
    fontStyle: 'text-decoration: underline',
  }]
})
monaco.languages.setMonarchTokensProvider('lf2-dat', {
  tokenizer: {
    root: [
      [/#[\s\S]*/, { token: 'comment' }],
      [/sound:\s*\S+/, { token: 'next' }],

      [/next:\s*0/, { token: 'string', }],
      [/hit_[a-zA-Z]*:\s*0/, { token: 'string' }],
      [/next:\s*999/, { token: 'string', }],
      [/hit_[a-zA-Z]*:\s*999/, { token: 'string' }],
      [/next:\s*1000/, { token: 'string', }],
      [/hit_[a-zA-Z]*:\s*1000/, { token: 'string' }],

      [/next:\s*\d+/, { token: 'next', }],
      [/hit_[a-zA-Z]*:\s*\d+/, { token: 'next' }],
      [/layer:/, { token: 'type' }],
      [/layer_end/, { token: 'type' }],
      [/file\(\d+-\d+\):/, { token: 'keyword', }],
      [/walking_frame_rate/, { token: 'keyword' }],
      [/walking_speed/, { token: 'keyword' }],
      [/walking_speedz/, { token: 'keyword' }],
      [/running_frame_rate/, { token: 'keyword' }],
      [/running_speed/, { token: 'keyword' }],
      [/running_speedz/, { token: 'keyword' }],
      [/heavy_walking_speed/, { token: 'keyword' }],
      [/heavy_walking_speedz/, { token: 'keyword' }],
      [/heavy_running_speed/, { token: 'keyword' }],
      [/heavy_running_speedz/, { token: 'keyword' }],
      [/jump_height/, { token: 'keyword' }],
      [/jump_distance/, { token: 'keyword' }],
      [/jump_distancez/, { token: 'keyword' }],
      [/dash_height/, { token: 'keyword' }],
      [/dash_distance/, { token: 'keyword' }],
      [/dash_distancez/, { token: 'keyword' }],
      [/rowing_height/, { token: 'keyword' }],
      [/rowing_distance/, { token: 'keyword' }],
      [/<frame>/, { token: 'type' }],
      [/<.*?>/, { token: 'type' }],
      [/[a-zA-Z_]+:/, { token: "keyword" }],
    ],
  }
})
