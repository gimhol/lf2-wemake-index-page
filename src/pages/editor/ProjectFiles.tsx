import type { IProjectInfo } from "./WEditorsContext";


import img_angle_right from "@/assets/svg/angle-right.svg";
import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import { useContext } from "react";
import csses from "./ProjectFiles.module.scss";
import { TreeItem } from "./TreeItem";
import { context, EditorsContext, init_editor_state } from "./base";
export function ProjectFiles(props: { info: IProjectInfo; }) {
  const { info } = props;
  const { state, set_state } = useContext(EditorsContext)
  const open = state.project === info.id;
  console.log(state)
  return (
    <div className={csses.second_view_item}>
      <div
        className={cns(csses.tree_item, open)}
        tabIndex={-1}
        onClick={(e) => {
          interrupt_event(e);
          context.open_project(info.id).then(state => {
            set_state(state ?? { ...init_editor_state })
          })
        }}>
        <div className={csses.left} >
          <div className={csses.icon_wrapper}>
            <img className={csses.icon} src={img_angle_right} alt="" />
          </div>
        </div>
        {info.name}
      </div>
      {open ?
        <div className={cns(csses.files, csses.content_zone, csses.open)}>
          {state.trees?.map((v) => <TreeItem key={v.id} info={v} />)}
        </div> : null
      }
    </div>
  );
}

