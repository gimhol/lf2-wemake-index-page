import type { IProjectInfo } from "./WEditorsContext";


import img_angle_right from "@/assets/svg/angle-right.svg";
import Toast from "@/gimd/Toast";
import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import { useContext } from "react";
import csses from "./ProjectFiles.module.scss";
import { TreeItem } from "./TreeItem";
import { context, EditorsContext } from "./base";
export function ProjectFiles(props: { info: IProjectInfo; }) {
  const { info } = props;
  const { state, set_state, pending, set_pending } = useContext(EditorsContext)
  const open = state.project === info.id;
  return (
    <div className={csses.second_view_item}>
      <div
        className={cns(csses.tree_item, open ? csses.open : void 0)}
        tabIndex={-1}
        onClick={(e) => {
          interrupt_event(e);
          if (pending) return;
          set_pending(true)
          context.open_project(info.id)
            .then(set_state)
            .catch(Toast.error)
            .finally(() => set_pending(false))
        }}>
        <div className={csses.left} >
          <div className={csses.icon_wrapper}>
            <img className={cns(csses.icon, open ? csses.open : void 0)} src={img_angle_right} alt="" />
          </div>
        </div>
        {
          info.name ?
            <div
              className={csses.name}
              children={info.name} /> :
            <input
              className={csses.name_input}
              defaultValue={info.name}
              onClick={e => e.stopPropagation()} />
        }
      </div>
      {open ?
        <div className={cns(csses.files, csses.content_zone, csses.open)}>
          {state.trees?.map((v) => <TreeItem key={v.id} info={v} />)}
        </div> : null
      }
    </div>
  );
}

