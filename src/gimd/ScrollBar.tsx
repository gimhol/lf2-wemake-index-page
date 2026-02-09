import { easeInOutCubic } from "./base/ValueAnimation";

export interface IScrollBarStyles {
  readonly scroll_bar: {
    readonly base: Partial<CSSStyleDeclaration>,
    readonly visible: Partial<CSSStyleDeclaration>,
    readonly invisible: Partial<CSSStyleDeclaration>,
    readonly vertical: Partial<CSSStyleDeclaration>,
    readonly horizontal: Partial<CSSStyleDeclaration>,
  },
  readonly handle: {
    readonly base: Partial<CSSStyleDeclaration>,
    readonly vertical: Partial<CSSStyleDeclaration>,
    readonly horizontal: Partial<CSSStyleDeclaration>,
  }
}
export interface IScrollBarOpts {
  target: Element,
  direction?: 'horizontal' | 'vertical',
  container?: Element
  inner?: Element,
  styles?: Partial<{
    scroll_bar?: Partial<IScrollBarStyles['scroll_bar']>,
    handle?: Partial<IScrollBarStyles['handle']>,
  }>;
  __debug?: (...args: unknown[]) => void;
}

export class ScrollBar {
  readonly scroll_bar: HTMLDivElement;
  readonly handle: HTMLDivElement;
  readonly styles: IScrollBarStyles = {
    scroll_bar: {
      base: {
        position: 'absolute',
        transition: 'opacity 0.5s'
      } as Partial<CSSStyleDeclaration>,
      visible: {
        opacity: '' + 0.3
      } as Partial<CSSStyleDeclaration>,
      invisible: {
        opacity: '' + 0
      } as Partial<CSSStyleDeclaration>,
      vertical: {
        width: '12px',
        right: '0px',
        top: '0px',
      } as Partial<CSSStyleDeclaration>,
      horizontal: {
        height: '12px',
        bottom: '0px',
        left: '0px',
      } as Partial<CSSStyleDeclaration>,
    },
    handle: {
      base: {
        position: 'absolute',
        background: 'black',
        borderRadius: '7.5px'
      } as Partial<CSSStyleDeclaration>,
      vertical: {
        minHeight: '50px',
        width: '4px',
        left: '4px',
      } as Partial<CSSStyleDeclaration>,
      horizontal: {
        minWidth: '50px',
        height: '4px',
        bottom: '4px',
      } as Partial<CSSStyleDeclaration>,
    }
  };
  protected _pointer_on_me = false;
  protected _fade_out_timer_id: number = 0;
  protected _pointer_id: number | null = null;
  protected _scroll_anim_timer_id: number = 0;
  protected _scroll_anim_duration: number = 250;
  protected _resize_ob: ResizeObserver;
  protected _mutation_ob: MutationObserver;
  protected _prev_value: number = 0;
  protected _view_size: number = 0;
  protected _is_root: boolean = false;
  readonly opts: IScrollBarOpts;
  get max_value() {
    return this.full_size - this._view_size
  }
  get full_size() {
    switch (this.opts.direction) {
      case 'horizontal':
        return this.opts.target.scrollWidth;
      case 'vertical': default:
        return this.opts.target.scrollHeight;
    }
  }
  get view_size() {
    return this._view_size;
  }
  get value() {
    switch (this.opts.direction) {
      case 'horizontal':
        return this.opts.target.scrollLeft;
      case 'vertical':
      default:
        return this.opts.target.scrollTop;
    }
  }
  set value(v: number) {
    switch (this.opts.direction) {
      case 'horizontal':
        this.opts.target.scrollLeft = v;
        break;
      case 'vertical': default:
        this.opts.target.scrollTop = v;
        break;
    }
  }
  on_pointerenter = (e: PointerEvent) => {
    if (this.full_size <= this.view_size) return;
    e.preventDefault()
    this._pointer_on_me = true;
    this.show();
  };
  on_pointerleave = (e: PointerEvent) => {
    if (this.full_size <= this.view_size) return;
    e.preventDefault()
    this._pointer_on_me = false;
    this.fade_out();
  };
  on_pointerdown = (e: PointerEvent) => {
    if (this.full_size <= this.view_size) return;
    e.preventDefault()
    this._pointer_id = e.pointerId;
    switch (this.opts.direction) {
      case "horizontal": {
        const { x, width } = this.handle.getBoundingClientRect();
        if (e.clientX < x) {
          this.scroll_to({ value: this.value - this.view_size });
        } else if (e.offsetX > x + width) {
          this.scroll_to({ value: this.value + this.view_size });
        } else {
          this.update_value(e, true)
          document.addEventListener('pointermove', this.on_pointermove);
          document.addEventListener('pointerup', this.on_pointerup);
        }
        break;
      }
      case "vertical":
      default: {
        const { y, height } = this.handle.getBoundingClientRect();
        if (e.clientY < y) {
          this.scroll_to({ value: this.value - this.view_size });
        } else if (e.offsetY > y + height) {
          this.scroll_to({ value: this.value + this.view_size });
        } else {
          this.update_value(e, true)
          document.addEventListener('pointermove', this.on_pointermove);
          document.addEventListener('pointerup', this.on_pointerup);
        }
        break;
      }
    }
  };


  on_pointermove = (e: PointerEvent) => {
    if (this.full_size <= this.view_size) return;
    if (e.pointerId !== this._pointer_id) return;
    e.preventDefault()
    this.update_value(e, false)
  };
  on_pointerup = (e: PointerEvent) => {
    if (e.pointerId !== this._pointer_id) return;
    document.removeEventListener('pointermove', this.on_pointermove);
    document.removeEventListener('pointerup', this.on_pointerup);
    this._pointer_id = null;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  on_scroll = (_e: Event) => {
    if (this._prev_value === this.value) return;
    this.show();
    this.update_handle();
    this.fade_out();
    this._prev_value = this.value;
  };

  on_resize = () => {
    this.update_view_size()
    if (this.full_size <= this.view_size) {
      this.scroll_bar.style.pointerEvents = 'none'
      this.fade_out();
      return;
    }
    this.scroll_bar.style.pointerEvents = 'auto'
    this.show();
    this.follow();
    this.fade_out();
  }
  constructor(opts: IScrollBarOpts) {
    const { direction = 'vertical', styles, __debug } = opts
    this.opts = {
      ...opts,
      direction: opts.direction || 'vertical',
      container: opts.container || document.body,
      __debug: __debug ? (...args: unknown[]) => __debug('[ScrollBar]', ...args) : void 0
    };
    this.opts.direction = direction === 'horizontal' ? 'horizontal' : 'vertical';
    this._is_root = this.opts.target.tagName === 'HTML'
    if (this._is_root) this.styles.scroll_bar.base.position = 'fixed'
    if (styles) {
      if (styles.scroll_bar) {
        if (styles.scroll_bar.base) Object.assign(this.styles.scroll_bar.base, styles.scroll_bar.base)
        if (styles.scroll_bar.visible) Object.assign(this.styles.scroll_bar.visible, styles.scroll_bar.visible)
        if (styles.scroll_bar.invisible) Object.assign(this.styles.scroll_bar.invisible, styles.scroll_bar.invisible)
        if (styles.scroll_bar.vertical) Object.assign(this.styles.scroll_bar.vertical, styles.scroll_bar.vertical)
        if (styles.scroll_bar.horizontal) Object.assign(this.styles.scroll_bar.horizontal, styles.scroll_bar.horizontal)
      }
      if (styles.handle) {
        if (styles.handle.base) Object.assign(this.styles.handle.base, styles.handle.base)
        if (styles.handle.vertical) Object.assign(this.styles.handle.vertical, styles.handle.vertical)
        if (styles.handle.horizontal) Object.assign(this.styles.handle.horizontal, styles.handle.horizontal)
      }
    }
    this.update_view_size();

    this.scroll_bar = document.createElement('div');
    this.scroll_bar.classList.add('gim_scroll_bar')
    Object.assign(this.scroll_bar.style, this.styles.scroll_bar.base);
    Object.assign(this.scroll_bar.style, this.styles.scroll_bar[direction]);
    this.handle = document.createElement('div');
    Object.assign(this.handle.style, this.styles.handle.base);
    Object.assign(this.handle.style, this.styles.handle[direction]);
    this.scroll_bar.appendChild(this.handle);
    this.opts.container?.appendChild(this.scroll_bar);
    this.hide();
    this.follow();

    this.scroll_bar.addEventListener('pointerenter', this.on_pointerenter);
    this.scroll_bar.addEventListener('pointerleave', this.on_pointerleave);
    this.scroll_bar.addEventListener('pointerdown', this.on_pointerdown);
    (this._is_root ? document : this.opts.target).addEventListener('scroll', this.on_scroll);

    this._resize_ob = new ResizeObserver(this.on_resize)
    if (this.opts.target) this._resize_ob.observe(this.opts.target)
    if (this.opts.inner) this._resize_ob.observe(this.opts.inner)


    this._mutation_ob = new MutationObserver(this.on_resize)
    this._mutation_ob.observe(this.opts.target, { childList: true })
    this._prev_value = this.value;
    this.on_resize()
  }
  protected update_view_size() {
    switch (this.opts.direction) {
      case 'horizontal':
        this._view_size = this._is_root ? window.innerWidth : this.opts.target.clientWidth;
        break;
      case 'vertical': default:
        this._view_size = this._is_root ? window.innerHeight : this.opts.target.clientHeight;
        break;
    }
  }
  protected _offset_value = 0;
  update_value(e: PointerEvent, init: boolean) {
    const scrollbar_rect = this.scroll_bar.getBoundingClientRect();
    const handle_rect = this.handle.getBoundingClientRect();
    switch (this.opts.direction) {
      case "horizontal": {
        const mx = e.clientX - scrollbar_rect.x;
        if (init) this._offset_value = handle_rect.x - e.clientX;
        this.value = this.max_value * ((mx + this._offset_value) / (scrollbar_rect.width - handle_rect.width))
        break;
      }
      case "vertical":
      default: {
        const my = e.clientY - scrollbar_rect.y;
        if (init) this._offset_value = handle_rect.y - e.clientY;
        this.value = this.max_value * ((my + this._offset_value) / (scrollbar_rect.height - handle_rect.height))
        break;
      }
    }
  }
  release() {
    this.stop_scroll_anim();
    this.scroll_bar.removeEventListener('pointerenter', this.on_pointerenter);
    this.scroll_bar.removeEventListener('pointerleave', this.on_pointerleave);
    this.scroll_bar.removeEventListener('pointerdown', this.on_pointerdown);
    (this._is_root ? document : this.opts.target).removeEventListener('scroll', this.on_scroll);
    document.removeEventListener('pointermove', this.on_pointermove);
    document.removeEventListener('pointerup', this.on_pointerup);
    this._resize_ob.disconnect();
    this._mutation_ob.disconnect();
    this.scroll_bar.remove()
  }

  follow() {
    switch (this.opts.direction) {
      case 'horizontal':
        this.scroll_bar.style.width = '' + this._view_size + 'px';
        break;
      case 'vertical':
        this.scroll_bar.style.height = '' + this._view_size + 'px';
        break;
    }
    this.update_handle();
  }
  update_handle() {
    switch (this.opts.direction) {
      case 'horizontal': {
        const { scrollWidth: scroll_length } = this.opts.target;
        const handle_length = this._view_size / scroll_length;
        const handle_value = this.value / scroll_length;
        const padding = parseInt(this.handle.style.top) || 0;
        this.handle.style.width = `calc(${handle_length * 100}% - ${padding * 2}px)`;
        this.handle.style.left = `calc(${(handle_value * 100)}% + ${padding}px)`;
        break;
      }
      case 'vertical': {
        const { scrollHeight: scroll_length } = this.opts.target;
        const handle_length = this._view_size / scroll_length;
        const handle_value = this.value / scroll_length;
        const padding = parseInt(this.handle.style.left) || 0;
        this.handle.style.height = `calc(${handle_length * 100}% - ${padding * 2}px)`;
        this.handle.style.top = `calc(${(handle_value * 100)}% + ${padding}px)`;
        break;
      }
    }
  }
  hide() {
    Object.assign(this.scroll_bar.style, this.styles.scroll_bar.invisible);
  }
  show() {
    this.follow()
    this.stop_fade_out();
    Object.assign(this.scroll_bar.style, this.styles.scroll_bar.visible);
  }
  protected stop_fade_out = () => {
    window.clearTimeout(this._fade_out_timer_id);
    this._fade_out_timer_id = 0;
  };
  protected fade_out = () => {
    if (this._fade_out_timer_id) return;
    this.stop_fade_out();
    if (this._pointer_on_me) return;
    this._fade_out_timer_id = window.setTimeout(() => this.hide(), 500);
  };
  stop_scroll_anim = () => {
    window.clearInterval(this._scroll_anim_timer_id);
    this._scroll_anim_timer_id = 0;
    this.opts.__debug?.('stop_scroll_anim')
  };
  scroll_to = ({ value }: { value: number; }) => {
    value = Math.min(Math.max(0, value), this.max_value);
    this.stop_scroll_anim();
    let prev_value = this.value;
    let progress = this._scroll_anim_duration
    const dt = 1000 / 60;
    const diff_value = value - prev_value;
    const begin_value = prev_value;
    this._scroll_anim_timer_id = window.setInterval(() => {
      progress -= dt
      const factor = easeInOutCubic((this._scroll_anim_duration - progress) / this._scroll_anim_duration)
      const next_value = Math.round(begin_value + factor * diff_value);
      if (prev_value !== this.value) {
        this.opts.__debug?.('scroll anim aborted', prev_value, this.value)
        return this.stop_scroll_anim();
      }
      if (prev_value === value) {
        this.opts.__debug?.('scroll anim done', prev_value, value)
        return this.stop_scroll_anim();
      }
      this.opts.__debug?.({ factor, diff_value })
      this.value = prev_value = next_value;
    }, 1000 / 60);
  };
}