import csses from './SplitView.module.scss';
export class SplitView {
  private view_container: HTMLElement | null;
  private sash_container: HTMLElement | null;
  private direction: 'h' | 'v' = 'h';
  private resize_ob = new ResizeObserver(() => {
    this.on_resize();
    this.update();
  });
  private mutation_ob = new MutationObserver((records) => {

    for (const record of records) {
      console.log('removedNodes', record.removedNodes)
      console.log('addedNodes', record.addedNodes)
    }


    this.on_children();
    this.on_resize()
    this.update();
  });
  private sizes: number[] = [];
  private children: HTMLElement[] = [];
  private sashs: HTMLElement[] = [];

  constructor(view_container: HTMLElement | null, sash_container: HTMLElement | null, direction: 'h' | 'v') {
    this.direction = direction;
    this.view_container = this.set_view_container(view_container);
    this.sash_container = this.set_sash_container(sash_container);
    this.on_children();
    this.on_resize();
    this.update();
  }
  set_sash_container(node: HTMLElement | null): HTMLElement | null {
    if (this.sash_container == node) return node;
    this.sash_container = node
    return node;
  }
  set_view_container(node: HTMLElement | null): HTMLElement | null {
    if (this.view_container == node) return node;
    if (this.view_container) this.resize_ob.disconnect()
    if (this.view_container) this.mutation_ob.disconnect()
    this.view_container = node;
    if (node) this.resize_ob.observe(node)
    if (node) this.mutation_ob.observe(node, { childList: true })
    return node;
  }
  release() {
    this.sashs.forEach(s => s.remove())
  }
  on_resize() {
    const { view_container: node } = this;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const { width, height } = rect;
    const full_size = this.direction == 'h' ? width : height

    let remain = full_size;
    const len = this.children.length;
    if (len > 0) {
      let factors: number[] = []
      if (this.sizes.length >= len) {
        this.sizes.length = len;
        const total = this.sizes.reduce((r, o) => r + o, 0);
        factors = this.sizes.map(v => v / total);
      }
      for (let i = 0; i < len; i++) {
        const factor = factors[i] ?? (1 / len);
        const size = i == len - 1 ? remain : Math.round(factor * full_size)
        this.sizes[i] = size;
        remain -= size;
      }
    }
    this.sizes.length = len
  }
  on_children() {
    const { view_container: node } = this;
    if (!node) return;
    this.children.length = 0;
    for (const c of node.children) {
      if (!c.tagName) continue;
      if (c.classList.contains(csses.sash)) continue;
      this.children.push(c as HTMLElement)
    }
  }
  create_sash() {
    const ret = document.createElement('div');
    ret.classList.add(csses.sash);
    ret.classList.add(csses[this.direction]);
    this.sash_container?.appendChild(ret);


    const pointermove = (e: PointerEvent) => {
      const { sash_container } = this;
      if (!sash_container) return console.debug('broken!');

      const idx = this.sashs.indexOf(ret);
      if (idx < 0 || idx > this.sizes.length - 2) return console.debug('broken!');
      this.view_container?.getBoundingClientRect();

      const { x } = sash_container.getBoundingClientRect();



      console.log(
        'size l:', this.sizes[idx],
        'size r:', this.sizes[idx + 1],
        'x:', e.x
      )
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
    let offset = 0;

    for (let i = 0; i < this.children.length; i++) {
      const c = this.children[i];
      c.style.position = 'absolute';
      c.style.height = `${rect.height}px`;
      c.style.top = `0px`;
      c.style.left = `${offset}px`;
      c.style.width = `${this.sizes[i]}px`;

      offset += c.getBoundingClientRect().width;
      if (i == this.children.length - 1) break;
      const sash = this.sashs[i] ?? this.create_sash();
      this.sashs[i] = sash
      sash.style.left = `${offset - 3}px`
    }

    // if (this.sashs.length >= this.children.length)
    //   this.sashs.splice(this.children.length, this.sashs.length - this.children.length).forEach(v => v.remove())
    // console.log(
    //   'children:', this.children.length,
    //   'sashs:', this.sashs.length
    // )
  }
}