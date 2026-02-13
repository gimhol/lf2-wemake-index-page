import { getSTSToken } from "@/api/getSTSToken";
import GlobalStore from "@/GlobalStore";
import { ApiHttp } from "@/network/ApiHttp";
import OSS from "ali-oss";
import { useContext, useEffect, useMemo } from "react";

export function useOSS() {
  const { value: { session_id, sts }, set_value, dispatch } = useContext(GlobalStore.context);
  const is_sts_exists = !!sts
  useEffect(() => {
    if (!session_id || is_sts_exists) return;
    const c = new AbortController();
    getSTSToken({ signal: c.signal })
      .then(sts => dispatch({ type: 'merge', value: { sts } }))
      .catch(ApiHttp.ignoreAbort)
      .catch(ApiHttp.ignore401)
      .catch(e => console.error(e, e?.cause));
    return () => c.abort();
  }, [dispatch, session_id, is_sts_exists]);

  const oss = useMemo(() => {
    if (!sts?.securityToken) return;
    return new OSS({
      endpoint: 'oss-cn-guangzhou.aliyuncs.com',
      region: "oss-cn-guangzhou",
      accessKeyId: sts.accessKeyId,
      accessKeySecret: sts.accessKeySecret,
      stsToken: sts.securityToken,
      bucket: sts.bucket,
      refreshSTSToken: async () => {
        const sts = await getSTSToken()
        set_value(prev => ({ ...prev, sts }))
        return {
          accessKeyId: sts.accessKeyId,
          accessKeySecret: sts.accessKeySecret,
          stsToken: sts.securityToken,
        };
      },
      refreshSTSTokenInterval: 300000,
    })
  }, [sts, set_value])

  return [oss, sts] as const;
}
