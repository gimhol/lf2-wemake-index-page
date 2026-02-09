import React, { useEffect, useRef } from "react";
import { default_config, global_context } from "./global_context";
import type { IConfig } from "./IConfig";
import { useConfig } from "./useConfig";

export interface IConfigProviderProps extends React.PropsWithChildren {
  ctx?: React.Context<IConfig>;
  config?: IConfig;
}

export function ConfigProvider(props: IConfigProviderProps) {
  const {
    ctx: { Provider } = global_context,
    config = default_config,
  } = props;

  const { theme } = config;
  const ref_style_ele_id = useRef<string | undefined>(void 0);
  useEffect(() => {
    const ele_style = document.createElement('style')
    ele_style.type = "text/css"
    ele_style.id = ref_style_ele_id.current = 'gimd_auto_gen_style_' + Date.now();
    Promise.all([
      import('../Text/styling').then((mod) => {
        ele_style.innerHTML += mod.default(theme)
      })
    ]).finally(() => {
      if (ref_style_ele_id.current === ele_style.id)
        document.head.appendChild(ele_style);
    })
    return () => {
      const ele_id = ref_style_ele_id.current;
      if (!ele_id) return;
      document.getElementById(ele_id)?.remove()
    }
  }, [theme])

  return (
    <Provider value={config}>
      {props.children}
    </Provider>
  )
}

ConfigProvider.useConfig = useConfig;
ConfigProvider.context = global_context;