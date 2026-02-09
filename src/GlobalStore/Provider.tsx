import { useEffect, useState, type PropsWithChildren } from "react";
import { context } from "./context";
import { init_value } from "./init_value";

export interface IProviderProps extends PropsWithChildren {
  __keep?: never;
}
export function Provider(props: IProviderProps) {
  const [global_value, set_global_value] = useState(init_value);

  useEffect(() => {
    localStorage.setItem('global_value', JSON.stringify(global_value));
  }, [global_value]);

  return (
    <context.Provider value={{ global_value, set_global_value }}>
      {props.children}
    </context.Provider>
  );
}
