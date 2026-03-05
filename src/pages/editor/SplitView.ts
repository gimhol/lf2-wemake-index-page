import csses from './SplitView.module.scss';
export class SplitView {
  readonly view_container: HTMLElement;
  readonly sash_container: HTMLElement;
  readonly node: HTMLElement;
  private _id: string;
  private _parent: SplitView | null;
  private _root: SplitView;
  private direction: 'h' | 'v' = 'h';

  private _children: SplitView[] = [];
  private sashs: HTMLElement[] = [];
  private _min_size = { w: 220, h: 72 }

  data: unknown;
  mode: 'fixed' | 'keep' | '' = '';
  size: number = 0;

  get id() { return this._id }
  get parent() { return this._parent }
  get root() { return this._root }
  get is_root() { return this._root === this }
  get children(): ReadonlyArray<SplitView> { return this._children }
  get min_w(): number {
    if (!this.children.length)
      return this._min_size.w;
    if (this.direction === 'h')
      return this.children.reduce((r, c) => r + c.min_w, 0)
    return Math.max(...this.children.map(v => v.min_w))
  }
  get min_h(): number {
    if (!this.children.length)
      return this._min_size.h;
    if (this.direction === 'v')
      return this.children.reduce((r, c) => r + c.min_h, 0)
    return Math.max(...this.children.map(v => v.min_h))
  }
  get min_size() {
    return {
      w: this.min_w,
      h: this.min_h,
    }
  }
  constructor(direction: 'h' | 'v', parent: SplitView | null = null) {
    this._parent = parent;
    this._root = parent?._root ?? this;
    this._id = crypto.randomUUID();
    this.direction = direction;
    this.node = document.createElement('div')
    this.node.id = this._id;
    this.node.classList.add(csses.split_view, csses[direction])
    this.sash_container = document.createElement('div');
    this.sash_container.classList.add(csses.sash_container)
    this.view_container = document.createElement('div');
    this.view_container.classList.add(csses.view_container)
    this.node.append(this.sash_container, this.view_container)
  }
  insert(index: number = this._children.length): SplitView {
    const child = new SplitView(this.direction == 'h' ? 'v' : 'h', this);
    this._children.splice(index, 0, child);
    this.view_container.appendChild(child.node);
    return child;
  }
  remove(c: SplitView) {
    this._children = this._children.filter(v => v !== c);
  }
  release() {
    this._parent?.remove(this)
    this.node.remove();
  }
  create_sash() {
    const ret = document.createElement('div');
    ret.classList.add(csses.sash, csses[this.direction]);
    this.sash_container?.appendChild(ret);
    const pointermove = () => {
      const { sash_container } = this;
      if (!sash_container) return console.debug('broken!');
      const idx = this.sashs.indexOf(ret);
      if (idx < 0 || idx > this.children.length - 2) return console.debug('broken!');
      this.view_container?.getBoundingClientRect();
    }
    const pointerup = () => {
      ret.classList.remove(csses.hover)
      document.removeEventListener('pointermove', pointermove)
    }
    const pointerdown = () => {
      ret.classList.add(csses.hover)
      document.addEventListener('pointermove', pointermove)
      document.addEventListener('pointerup', pointerup, { once: true })
      document.addEventListener('pointercancel', pointerup, { once: true })
    }

    ret.addEventListener('pointerdown', pointerdown)
    return ret;
  }
  update() {
    const { view_container } = this;
    if (!view_container) return;

    const rect = view_container.getBoundingClientRect();
    const { width, height } = rect;
    const full_size = this.direction == 'h' ? width : height

    let start = full_size;
    const len = this._children.length;

    const total = this._children.reduce((r, c) => r + c.size, 0);
    const factors = this._children.map(c => c.size / total);

    for (let i = 0; i < len; i++) {
      const child = this._children[i];
      if (child.mode === 'fixed') {
        start -= child.size;
        continue;
      } else if (child.mode === 'keep') {
        start -= child.size;
        continue;
      }

      const factor = factors[i] ?? (1 / len);
      const size = i == len - 1 ? start : Math.round(factor * full_size)
      child.size = size;
      start -= size;
    }


    let offset = 0;
    for (let i = 0; i < this._children.length; i++) {
      const c = this._children[i];
      const n = c.node;
      if (this.direction === 'h') {
        n.style.height = `${rect.height}px`;
        n.style.top = `0px`;
        n.style.left = `${offset}px`;
        n.style.width = `${c.size}px`;
        offset += n.getBoundingClientRect().width;
      } else {
        n.style.width = `${rect.width}px`;
        n.style.left = `0px`;
        n.style.top = `${offset}px`;
        n.style.height = `${c.size}px`;
        offset += n.getBoundingClientRect().height;
      }
      if (i == this._children.length - 1) break;
      const sash = this.sashs[i] ?? this.create_sash();
      this.sashs[i] = sash
      if (this.direction === 'h') {
        sash.style.left = `${offset - 3}px`
      } else {
        sash.style.top = `${offset - 3}px`
      }
      c.update()
    }

    this.handle_leaves(this.leaves())
  }

  leaves(ret: SplitView[] = []): SplitView[] {
    for (const node of this._children) {
      if (!node._children.length) ret.push(node);
      else node.leaves(ret)
    }
    return ret;
  }

  handle_leaves = (leaves: SplitView[]) => {
    console.log(leaves)
  }
}