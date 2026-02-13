export function delay(ms: number): Promise<void> {
  return new Promise<void>((a) => setTimeout(() => a(), ms))
}