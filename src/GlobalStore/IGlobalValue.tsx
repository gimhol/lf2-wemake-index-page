export interface IGlobalValue {
  session_id: string;
  admin: number,
  user_id: number,
  username: string,
  nickname: string,
  sts: {
    accessKeyId: string,
    accessKeySecret: string,
    expiration: string,
    securityToken: string
    bucket: string
    dir: string
  }
}
export const create_global_value = (): IGlobalValue => {
  const ret: IGlobalValue = {
    session_id: "",
    admin: 0,
    user_id: 0,
    username: "",
    nickname: "",
    sts: {
      accessKeyId: "",
      accessKeySecret: "",
      expiration: "",
      securityToken: "",
      bucket: "",
      dir: ""
    }
  };
  return ret;
}