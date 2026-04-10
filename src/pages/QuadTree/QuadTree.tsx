/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class QuadTree<Item = any> {
  children:
    | [QuadTree<Item>, QuadTree<Item>, QuadTree<Item>, QuadTree<Item>]
    | null = null;
  parents: QuadTree<Item>[] = [];
  index: number = 0;
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
  depth: number = 0;
  items: Item[] = [];

  protected _root: QuadTree<Item> = this;
  protected _warn: (...args: any[]) => void = () => {}; // only of root
  protected _dirties: QuadTree[] = []; // only of root
  protected _wild_items: Item[] = []; // only of root
  protected _capacity: number = 1; // only of root
  protected _max_depth: number = 5; // only of root
  protected _item_count: number = 0; //only of root
  get root() {
    return this._root!;
  }
  set warn(v) {
    this.root._warn = v;
  }
  get warn() {
    return this.root._warn;
  }
  get item_count() {
    return this._item_count;
  }
  get capacity() {
    return this.root._capacity;
  }
  set capacity(num: number) {
    num = Math.floor(num);
    if (num <= 0 || !num) num = 1;
    this._root._capacity = num;
    this._root._dirties = [this.root];
  }
  get max_depth() {
    return this.root._capacity;
  }
  set max_depth(num: number) {
    num = Math.floor(num);
    if (num <= 0 || !num) num = 1;
    this._root._max_depth = num;
    this._root._dirties = [this.root];
  }
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    capacity: number,
    max_depth: number,
  ) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.w = Math.max(Math.ceil(w), 2);
    this.h = Math.max(Math.ceil(h), 2);
    this.capacity = Math.max(Math.floor(capacity), 1);
    this.max_depth = Math.max(Math.floor(max_depth), 1);
  }
  is_child_of(node: QuadTree<Item>) {
    return this.parents.indexOf(node) >= 0;
  }
  is_parent_of(node: QuadTree<Item>) {
    return node.parents.indexOf(this) >= 0;
  }
  contains: (
    x: number,
    y: number,
    w: number,
    h: number,
    item: Item,
  ) => boolean = () => false;
  node_changed: (item: Item, node: QuadTree<Item>) => void = () => {};
  new_child = (
    x: number,
    y: number,
    w: number,
    h: number,
    c: number,
    d: number,
  ) => new QuadTree(x, y, w, h, c, d);
  reallocate() {
    const items = this.all_items;
    this.children = null;
    this.items = [];
    this.root._item_count -= items.length;
    for (const item of items) {
      const node = this.root.insert(item);
      if (!node) {
        this.warn("can not insert ??", item, this);
        debugger;
      }
    }
  }
  get empty(): boolean {
    if (this.children)
      return (
        this.children[0].empty &&
        this.children[1].empty &&
        this.children[2].empty &&
        this.children[3].empty
      );
    return this.items.length === 0;
  }
  not_empty_parant(): QuadTree<Item> | null {
    for (const parent of this.parents) {
      if (!parent.empty) return parent;
    }
    return null;
  }
  remove(item: Item) {
    const idx = this.items.indexOf(item);
    if (idx < 0) return false;
    this.items.splice(idx, 1);
    const node = this.not_empty_parant() || this.root;
    if (
      !this.root._dirties.find(
        (other) => other.is_parent_of(node) || other === node,
      )
    ) {
      this.root._dirties = this.root._dirties.filter(
        (other) => !other.is_child_of(node),
      );
      this.root._dirties.unshift(node);
    }
    --this.root._item_count;
    return true;
  }
  get count(): number {
    if (this.children) return this.children.reduce((n, c) => n + c.count, 0);
    return this.items.length;
  }
  insert(item: Item): QuadTree<Item> | null {
    const { x, y, w, h } = this;
    if (!this.contains(x, y, w, h, item)) {
      return null;
    }
    if (
      !this.children &&
      (this.items.length < this.capacity ||
        this.depth >= this._max_depth ||
        this.w < 2 ||
        this.h < 2)
    ) {
      this.items.push(item);
      this.node_changed(item, this);
      this.root._item_count++;
      return this;
    }
    const children = this.children || this.divide();

    this.root._item_count -= this.items.length;
    for (const item of this.items) {
      const node =
        children[0].insert(item) ||
        children[1].insert(item) ||
        children[2].insert(item) ||
        children[3].insert(item) ||
        this.root.insert(item);
      if (!node) {
        this.warn("can not insert ??", item, this);
        debugger;
      }
    }
    this.items.length = 0;
    const node =
      children[0].insert(item) ||
      children[1].insert(item) ||
      children[2].insert(item) ||
      children[3].insert(item) ||
      this.root.insert(item);
    if (!node) {
      this.warn("can not insert ??", item, this);
      debugger;
    }
    return node;
  }

  protected divide() {
    const { x, y, w, h, capacity: n } = this;
    const x1 = x;
    const y1 = y;
    const w1 = Math.floor(w / 2);
    const h1 = Math.floor(h / 2);
    const w2 = w - w1;
    const h2 = h - h1;
    const x2 = x + w1;
    const y2 = y + h1;
    this.children = [
      this.new_child(x1, y1, w1, h1, n, this._max_depth),
      this.new_child(x2, y1, w2, h1, n, this._max_depth),
      this.new_child(x2, y2, w2, h2, n, this._max_depth),
      this.new_child(x1, y2, w1, h2, n, this._max_depth),
    ];
    this.children.forEach((c, i) => {
      c.parents = [this, ...this.parents];
      c.index = i;
      c.depth = this.depth + 1;
      c.contains = this.contains;
      c.node_changed = this.node_changed;
      c._root = this.root;
    });
    return this.children;
  }
  get all_items(): Item[] {
    if (!this.children) return this.items;
    return [
      ...this.children[0].all_items,
      ...this.children[1].all_items,
      ...this.children[2].all_items,
      ...this.children[3].all_items,
    ];
  }
  query(x: number, y: number, w: number, h: number, out: Item[]): Item[] {
    if (!this.intersects(x, y, w, h)) {
      return out;
    }
    for (const item of this.items) {
      if (this.contains(x, y, w, h, item)) {
        out.push(item);
      }
    }
    if (!this.children) return out;
    this.children[0].query(x, y, w, h, out);
    this.children[1].query(x, y, w, h, out);
    this.children[2].query(x, y, w, h, out);
    this.children[3].query(x, y, w, h, out);
    return out;
  }

  intersects(x: number, y: number, w: number, h: number): boolean {
    return !(
      x - w > this.x + this.w ||
      x + w < this.x - this.w ||
      y - h > this.y + this.h ||
      y + h < this.y - this.h
    );
  }

  update() {
    if (this.children) {
      this.children[0].update();
      this.children[1].update();
      this.children[2].update();
      this.children[3].update();
    } else {
      for (const item of this.items) {
        if (!this.contains(this.x, this.y, this.w, this.h, item)) {
          this.remove(item);
          this.root._wild_items.push(item);
        }
      }
    }

    if (this.root === this) {
      for (const n of this._dirties) {
        n.reallocate();
      }
      this._dirties.length = 0;
      for (const item of this._wild_items) {
        const node = this.insert(item);
        if (!node) {
          this.warn("can not insert ??", item, this);
          debugger;
        }
      }
      this._wild_items.length = 0;
    }
  }
}
