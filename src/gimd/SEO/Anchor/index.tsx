import Show from "../../../gimd/Show";
import styles from "./style.module.scss";
import React from "react";
import { createPortal } from "react-dom";
export interface IAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  container?: Element | DocumentFragment
}
export default function Anchor(props: IAnchorProps) {
  const { title, href, children, container = document.body, ..._p } = props;
  const _children = children ?? title ?? href;
  return createPortal(
    <Show yes={!!href}>
      <a href={href} className={styles._seo_link} {..._p} title={title}>{_children}</a>
    </Show>,
    container
  )
}