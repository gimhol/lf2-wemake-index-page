

export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
export class ValueAnimation {
  is_end: boolean = false;
  values: [number, number];
  duration: number;
  start_time: number;
  method: (x: number) => number;
  get from() { return this.values[0] }
  set from(v) { this.values[0] = v }
  get to() { return this.values[1] }
  set to(v) { this.values[1] = v }
  constructor() {
    this.values = [1, 1];
    this.duration = 200;
    this.start_time = 0;
    this.method = easeInOutCubic;
  }
  update_is_end(time: number) {
    const diff_time = time - this.start_time;
    return this.is_end = diff_time > this.duration;
  }
  factor(time: number) {
    this.is_end = false;
    const diff_time = time - this.start_time;
    if (diff_time > this.duration) {
      this.is_end = true;
      return 1
    };
    this.is_end = false;
    if (diff_time < 0) return 0;
    return diff_time / this.duration;
  }
  value(time: number) {
    const factor = this.factor(time);
    const [a, b] = this.values;
    return a + this.method(factor) * (b - a);
  }
  start(
    time: number,
    from: number = this.values[0],
    to: number = this.values[1]
  ) {
    this.values = [from, to];
    this.start_time = time;
  }
  update(time: number) {
    const ret = this.value(time)
    if (this.is_end) this.values[0] = this.values[1];
    return ret;
  }
}