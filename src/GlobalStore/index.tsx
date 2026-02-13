import { makeStore } from "./makeStore";
export interface IGlobalValue {
  session_id: string;
  admin: number,
  user_id: number,
  username: string,
  nickname: string,
  sts?: IOSSStsInfo,
}
const init = (): IGlobalValue => {
  const ret: IGlobalValue = {
    session_id: "",
    admin: 0,
    user_id: 0,
    username: "",
    nickname: "",
    sts: void 0,
  };
  return ret;
}
const saver = (v: IGlobalValue) => {
  localStorage.setItem('global_value', JSON.stringify(v))
}
const loader = async (): Promise<IGlobalValue> => {
  const raw_txt = localStorage.getItem('global_value');
  if (!raw_txt) return init();
  return JSON.parse(raw_txt) as IGlobalValue
}

export const GlobalStore = makeStore({
  init,
  saver,
  loader,
})
export default GlobalStore