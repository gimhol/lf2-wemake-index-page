import type { SizeStr } from '@/gimd/SizeEnum';
import type { TextTag } from '.';
import { css_blocks, type ICSSBlocks } from '../helper/css_block';
import type { ITheme } from '../Theme';
import styles from './styles.module.scss';
export default function create_style(t: ITheme) {
  const tags: TextTag[] = ['span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  const blocks: ICSSBlocks = {
    [`.${styles.text}.${styles.text_default}`]: {
      color: t.text_color_default
    },
    [`.${styles.text}.${styles.text_secondary}`]: {
      color: t.text_color_secondary
    }
  }

  const sizes: SizeStr[] = ['s', 'm', 'l']
  
  for (const tag of tags) {
    for (const size of sizes) {
      const tag_name = `${tag}_text_size_${size}` as const
      const full_name = `${tag}.${styles.text}.${styles[tag_name]}`
      const value = t[tag_name];
      if (value !== "") {
        blocks[full_name] = { fontSize: typeof value === 'string' ? value : (value + 'px') }
      }
      if (tag === 'span') {
        const tag_name = `${tag}_text_line_height_${size}` as const
        const full_name = `${tag}.${styles.text}.${styles[tag_name]}`
        const value = t[tag_name];
        if (value !== "") {
          blocks[full_name] = { lineHeight: typeof value === 'string' ? value : (value + 'px') }
        }
      }
    }
  }

  return css_blocks(blocks)
}