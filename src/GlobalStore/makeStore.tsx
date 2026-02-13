import {
  type ActionDispatch, createContext, type Dispatch,
  type PropsWithChildren, type ReactNode, type SetStateAction,
  useCallback, useEffect, useMemo, useReducer,
  useState
} from "react";
export type Action<T> =
  { type: "reset" } |
  { type: "set", value: T } |
  { type: "merge", value: Partial<T> }

export interface IProviderProps extends PropsWithChildren {
  immediate?: boolean;
  fallback?: ReactNode;
}

interface ContextValue<V, A extends Action<V>> {
  value: V;
  ready: boolean;
  set_value: Dispatch<SetStateAction<V>>;
  dispatch: ActionDispatch<[action: A]>;
}

function is_set_state_fun<V>(arg: unknown): arg is (prevState: V) => V {
  return typeof arg === 'function';
}
export function makeStore<V, A extends Action<V>>(opts: {
  init(): V,
  reducer?(state: V, action: A | Action<V>): V,
  loader?(): Promise<V>
  saver?(state: V): void
}) {
  const { init, reducer, saver, loader } = opts;
  const init_value = init();
  const store: ContextValue<V, A> = {
    value: init_value,
    ready: !loader,
    set_value: () => void 0,
    dispatch: () => void 0,
  }
  const context = createContext(store);
  const inner_reducer = (state: V, action: A | Action<V>): V => {
    let ret = reducer ? reducer(state, action) : state
    if (state !== ret) {
      saver?.(ret)
      return ret;
    }
    switch (action.type) {
      case 'reset': ret = init(); saver?.(ret); break;
      case 'set': ret = action.value; saver?.(ret); break;
      case 'merge': ret = { ...state, ...action.value }; break
      default: return ret;
    }
    saver?.(ret);
    return ret
  };

  function Provider(props: IProviderProps) {
    const { immediate = false, fallback, children } = props;
    const [ready, set_ready] = useState(!loader)
    const [value, dispatch] = useReducer(inner_reducer, init_value);

    useEffect(() => {
      if (!loader) return;
      let cancelled = false
      loader().then(value => {
        if (cancelled) return;
        store.value = value
        dispatch({ type: 'set', value })
        set_ready(true);
      }).catch(e => {
        if (cancelled) return;
        console.warn(e);
        set_ready(true);
      }).finally(() => {
        if (cancelled) return;
      })
      return () => { cancelled = true }
    }, [ready])

    const set_value: Dispatch<SetStateAction<V>> = useCallback((value) => {
      if (is_set_state_fun<V>(value))
        return dispatch({ type: 'set', value: value(store.value) })
      dispatch({ type: 'set', value })
    }, [])

    useEffect(() => {
      store.value = value;
      store.set_value = set_value;
    }, [set_value, value])

    const context_value = useMemo(() => {
      return { value, ready, set_value, dispatch }
    }, [value, ready, set_value, dispatch])

    return (
      <context.Provider value={context_value}>
        {immediate || ready ? children : null}
        {!immediate && !ready ? fallback : null}
      </context.Provider>
    );
  }
  const reset = () => store.set_value(init())
  return { store, context, init, reset, Provider }
}