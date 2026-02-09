export const SizeEnum = {
  Small: 's',
  Middle: 'm',
  Large: 'l',
} as const
export type SizeEnum = typeof SizeEnum[keyof typeof SizeEnum];
export type SizeStr = 's' | 'm' | 'l';
export type SizeType = SizeEnum | SizeStr;