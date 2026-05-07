import { getSTSToken } from "@/api/getSTSToken";
import GlobalStore from "@/GlobalStore";
import { ApiHttp } from "@/network/ApiHttp";
import OSS from "ali-oss";
import { useContext, useEffect, useMemo, type PropsWithChildren } from "react";
import { OSSContext } from "./OSSContext";

export function OSSProvider(props: PropsWithChildren) {
  const { value: { session_id, sts }, set_value, dispatch } = useContext(GlobalStore.context);

  useEffect(() => {
    if (!session_id) return;
    const ab = new AbortController();
    getSTSToken()
      .then(sts => {
        if (ab.signal.aborted) return;
        dispatch({ type: 'merge', value: { sts } })
      }).catch(e => {
        if (ab.signal.aborted) return
        ApiHttp.ignore401(e);
      });
    return () => ab.abort('[OSSProvider] useEffect leave');
  }, [dispatch, session_id]);

  const oss = useMemo(() => {
    if (!sts?.securityToken) return;
    const options: OSS.Options = {
      ...sts,
      stsToken: sts.securityToken,
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
    }
    const oss = new OSS(options);
    return Object.assign(oss, { debugging_options: options })
  }, [sts, set_value])

  const ctx_value = useMemo(() => ({ oss, sts }), [oss, sts])
  return (
    <OSSContext.Provider value={ctx_value} {...props} />
  )
}
