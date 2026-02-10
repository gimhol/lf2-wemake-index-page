import { context } from "@/GlobalStore/context";
import { ApiHttp } from "@/network/ApiHttp";
import OSS from "ali-oss";
import { useContext, useEffect, useMemo } from "react";

export function useOSS() {
  const { global_value: { session_id, sts }, set_global_value } = useContext(context);

  useEffect(() => {
    if (!session_id) return;
    const c = new AbortController();

    ApiHttp.post(`${API_BASE}lf2wmods/oss_sts`, void 0, void 0, { ...c })
      .then(r => set_global_value(prev => ({ ...prev, sts: r.data })))
      .catch(ApiHttp.ignoreAbort)
      .catch(ApiHttp.ignore401)
      .catch(e => console.error(e, e?.cause));
    return () => c.abort();
  }, [set_global_value, session_id]);

  const oss = useMemo(() => {
    if (!sts.securityToken) return;
    return new OSS({
      region: "oss-cn-guangzhou",
      accessKeyId: sts.accessKeyId,
      accessKeySecret: sts.accessKeySecret,
      stsToken: sts.securityToken,
      bucket: sts.bucket,
      refreshSTSToken: async () => {
        const sts = await ApiHttp.post(`${API_BASE}lf2wmods/oss_sts`)
          .then(r => r.data);
        set_global_value(prev => ({ ...prev, sts }))
        return {
          accessKeyId: sts.accessKeyId,
          accessKeySecret: sts.accessKeySecret,
          stsToken: sts.securityToken,
        };
      },
      refreshSTSTokenInterval: 300000
    })
  }, [sts, set_global_value])

  return [oss, sts] as const;
}
