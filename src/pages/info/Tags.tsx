import type { Info } from "@/base/Info";
import { useTranslation } from "react-i18next";
import csses from "./Tags.module.scss";

export interface ITagsProps {
  info?: Info | null | undefined
}
export function Tags(props: ITagsProps) {
  const { info } = props;
  const { t } = useTranslation()
  const { unavailable, url_type } = info || {};

  const tags = [t(unavailable || url_type || '')].filter(Boolean);
  return <>
    {tags?.map(v => <span className={csses.tag} key={v}> {v} </span>)}
  </>
}