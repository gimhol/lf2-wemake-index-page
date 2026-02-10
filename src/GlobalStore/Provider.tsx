import { useEffect, useState, type PropsWithChildren } from "react";
import { context, context_value } from "./context";
import { init_value } from "./init_value";

export interface IProviderProps extends PropsWithChildren {
  __keep?: never;
}
export function Provider(props: IProviderProps) {
  const [global_value, set_global_value] = useState(init_value);
  useEffect(() => {
    context_value.global_value = global_value;
    context_value.set_global_value = set_global_value;
  }, [set_global_value, global_value])

  useEffect(() => {
    localStorage.setItem('global_value', JSON.stringify(global_value));
  }, [global_value]);
  return (
    <context.Provider value={{ global_value, set_global_value }}>
      {props.children}
    </context.Provider>
  );
}
