import type { IProjectInfo } from "./WEditorsContext";


import img_angle_right from "@/assets/svg/angle-right.svg";
import { useContext, useState } from "react";
import csses from "./ProjectFiles.module.scss";
import { EditorsContext } from "./base";
import cns from "classnames";
import { TreeItem } from "./TreeItem";
export function ProjectFiles(props: { info: IProjectInfo; }) {
  const { info } = props;
  const { state } = useContext(EditorsContext)
  const [open, set_open] = useState(false);
  return (
    <div className={csses.second_view_item}>
      <div
        className={csses.tree_item}
        tabIndex={-1}
        onClick={() => set_open(!open)}>
        <div className={csses.left} >
          <div className={csses.icon_wrapper}>
            <img className={csses.icon} src={img_angle_right} alt="" />
          </div>
        </div>
        {info.name}
      </div>
      <div className={cns(csses.content_zone, csses.files, open ? csses.open : void 0)}>
        {state.trees?.map((v) => <TreeItem key={v.id} info={v} />)}
      </div>
    </div>
  );
}

