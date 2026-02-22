import type { IRecord } from "@/api/listModRecords";
import { useCallback, useMemo, type PropsWithChildren } from "react";
import { useImmer } from "use-immer";
import { ModPreviewModal } from "../yours/ModPreviewModal";
import { ModContext, type IModContextValue } from "./ModContext";
import { ModFormModal } from "./ModFormModal";

export function ModProvider(props: PropsWithChildren) {
  const { children } = props;
  const [state, set_state] = useImmer<Omit<IModContextValue, 'edit' | 'preview'>>({});

  const edit = useCallback((data: Partial<IRecord>) => {
    if (data)
      set_state(d => { d.editing = { data, open: true } })
    else
      set_state(d => { d.editing = { ...d.editing, open: false } })
  }, [set_state])

  const preview = useCallback((mod_id?: number) => {
    if (mod_id)
      set_state(d => { d.previewing = { mod_id, open: true } })
    else
      set_state(d => { d.previewing = { ...d.editing, open: false } })
  }, [set_state])

  const ctx_value = useMemo<IModContextValue>(() => {
    return { ...state, edit, preview }
  }, [state, edit, preview])

  return (
    <ModContext.Provider value={ctx_value}>
      {children}
      <ModFormModal
        mod_id={state.editing?.data?.id}
        open={state.editing?.open}
        whenChange={() => set_state(d => { d.editing = { ...d, open: false } })}
        afterClose={() => set_state(d => { d.editing = {} })} />
      <ModPreviewModal
        open={state.previewing?.open}
        mod_id={state.previewing?.mod_id}
        whenChange={() => set_state(d => { d.previewing = { ...d, open: false } })}
        afterClose={() => set_state(d => { d.previewing = {} })} />
    </ModContext.Provider>
  );

}
