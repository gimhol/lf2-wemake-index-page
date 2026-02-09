/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";

export function useEventListener<K extends keyof DocumentEventMap>(
  target: Document | undefined | null,
  type: K | undefined | null,
  callback: (this: Document, ev: DocumentEventMap[K]) => any | null,
  options?: boolean | AddEventListenerOptions | undefined,
  enabled?: boolean
): void;

export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | undefined | null,
  type: K | undefined | null,
  callback: (this: Window, ev: WindowEventMap[K]) => any | null,
  options?: boolean | AddEventListenerOptions | undefined,
  enabled?: boolean
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLInputElement | undefined | null,
  type: K | undefined | null,
  callback: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any | null,
  options?: boolean | AddEventListenerOptions | undefined,
  enabled?: boolean
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | undefined | null,
  type: K | undefined | null,
  callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any | null,
  options?: boolean | AddEventListenerOptions | undefined,
  enabled?: boolean
): void;


export function useEventListener(
  target: EventTarget | undefined | null,
  type: string | undefined | null,
  callback: EventListenerOrEventListenerObject | null,
  options?: boolean | AddEventListenerOptions | undefined,
  enabled?: boolean
): void;

export function useEventListener(
  target: EventTarget | undefined | null,
  type: string | undefined | null,
  callback: EventListenerOrEventListenerObject | null,
  options?: boolean | AddEventListenerOptions | undefined,
  enabled?: boolean
): void {
  useEffect(() => {
    if (!target || !type || !callback || false === enabled) { return; }
    target.addEventListener(type, callback, options);
    return () => target.removeEventListener(type, callback, options);
  }, [target, type, callback, options, enabled]);
}