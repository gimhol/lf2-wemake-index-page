/**
 * 定时渲染接口
 *
 * 在web环境下，应当通过requestAnimationFrame实现之
 * 
 * @export
 * @interface IRender
 */
export interface IRender {
  /**
   * 创建一个定时渲染函数
   *
   * @param {(time: number) => void} handler 回调
   * @return {number} 定时渲染函数ID
   * @memberof IRender
   */
  add(handler: (time: number) => void): number;

  /**
   * 移除一个定时渲染函数
   *
   * @param {number} render_id 定时渲染函数ID
   * @memberof IRender
   */
  del(render_id: number): void;
}

const handle_req_id_map = new Map<number, number>();
export const __Render: IRender = {
  add(handler: (time: number) => void): number {
    let req_id: number;
    const func = (time: number) => {
      handler(time);
      req_id = window.requestAnimationFrame(func);
      handle_req_id_map.set(req_id, req_id);
    };
    req_id = req_id = window.requestAnimationFrame(func);
    handle_req_id_map.set(req_id, req_id);
    return req_id;
  },
  del(handle: number): void {
    const req_id = handle_req_id_map.get(handle);
    if (req_id) window.cancelAnimationFrame(req_id);
    handle_req_id_map.delete(handle);
  },
};
