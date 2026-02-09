import { useEffect, useMemo } from "react";

export type TShortcutCombines<T extends string = string> =
  T |
  ['ctrl' | 'shift' | 'alt', T] |
  ['ctrl', 'shift' | 'alt', T] |
  ['ctrl' | 'shift', 'alt', T] |
  ['ctrl', 'shift', 'alt', T];
export type TShortcutCallback = (e: KeyboardEvent) => void

export interface IShortcutRequires {
  alt: boolean,
  ctrl: boolean,
  shift: boolean,
}
export default function useShortcut<T extends string = string>(
  combines: TShortcutCombines<T>,
  callback: TShortcutCallback,
  disabled: boolean = false
): readonly [string, boolean] {

  const [requires, key] = useMemo<readonly [IShortcutRequires, T]>(() => {
    const parts: string[] = typeof combines === 'string' ? [combines] : combines;
    return [{
      alt: parts.includes('alt'),
      ctrl: parts.includes('ctrl'),
      shift: parts.includes('shift'),
    },
    parts[parts.length - 1] as T
    ] as const
  }, [combines])

  useEffect(() => {
    if (disabled) return;
    const listener = (e: KeyboardEvent) => {
      if (
        requires.ctrl === !!e.ctrlKey &&
        requires.alt === !!e.altKey &&
        requires.shift === !!e.shiftKey &&
        e.key?.toUpperCase() === key.toUpperCase()
      ) {
        e.stopPropagation();
        e.preventDefault();
        callback(e);
      }
    }
    window.addEventListener("keydown", listener, false)
    return () => window.removeEventListener("keydown", listener)
  }, [key, requires, disabled, callback])
  const desc = useMemo(() => {
    if (!combines) return ''
    const parts = typeof combines === 'string' ? [combines] : combines
    return parts.map(v => v[0].toUpperCase() + v.substring(1)).join('+')
  }, [combines])
  return [desc, disabled]
}
