
export class LoadingImg {
  private tid = 0;
  private img: HTMLImageElement | null = null;
  private _visible: boolean = true;
  private _idx = 0
  readonly w: number;
  readonly h: number;
  set visible(v: boolean) {
    this._visible = v;
    if (this.img) this.img.style.opacity = v ? "1" : "0"
  }
  get visible() { return this._visible }
  constructor(w = 132, h = 84) {
    this.w = w;
    this.h = h;
  }
  set_element(img: HTMLImageElement | null) {
    if (this.img === img) return;
    this.img = img;
    if (!img) return;
    img.style.objectPosition = "0px 0px";
    img.draggable = false;
    img.style.opacity = this._visible ? "1" : "0"
    this.update_img();
  }
  protected update_img() {
    const { img } = this;
    if (!img) return;
    const x = -this.w * (this._idx % 15);
    const y = -this.h * Math.floor(this._idx / 15);
    img.style.objectPosition = `${x}px ${y}px`;
  }
  protected start() {
    const update = () => {
      window.clearTimeout(this.tid);
      this._idx = (this._idx + 1) % 44;
      this.update_img();
      const t = this._idx === 21 ? 1000 : 30
      if (this.visible || this._idx !== 43) this.tid = window.setTimeout(update, t);
    };
    update();
  }

  hide() {
    this.visible = false;
  }

  show() {
    this.visible = true;
    this.start()
  }
}

