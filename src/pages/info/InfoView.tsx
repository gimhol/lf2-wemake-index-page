import img_to_bottom from "@/assets/svg/arrow-to-bottom.svg";
import img_to_top from "@/assets/svg/arrow-to-top.svg";
import img_browser_mark_white from "@/assets/svg/browser.svg";
import img_list_view from "@/assets/svg/database.svg";
import img_cards_view from "@/assets/svg/gallery-view.svg";
import windows_x64 from "@/assets/svg/windows_x64.svg";
import { Info } from "@/base/Info";
import { CollapseButton } from "@/components/button/CollapseButton";
import { IconButton } from "@/components/button/IconButton";
import { InfoCard } from "@/components/cards/InfoCard";
import { Collapse } from "@/components/collapse/Collapse";
import { Link } from "@/components/link";
import { Viewer } from "@/components/markdown/Viewer";
import Toast from "@/gimd/Toast";
import { usePropState } from "@/utils/usePropState";
import classnames from "classnames";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownButton } from "../main/MarkdownModal";
import csses from "./InfoView.module.scss";
import { useInfoChildren } from "./useInfoChildren";
type ListLike = 'cards' | 'list';
function curr_list_like(v: string | undefined | null): ListLike {
  return v === 'cards' ? 'cards' : 'list'
}
function next_list_like(v: string | undefined | null): ListLike {
  return v === 'cards' ? 'list' : 'cards'
}
export interface IInfoViewProps extends React.HTMLAttributes<HTMLDivElement> {
  info?: Info | null;
  open?: boolean;
  whenOpen?(open?: boolean): void;
  listLike?: ListLike;
  whenListLike?(v?: ListLike): void;
}

export function InfoView(props: IInfoViewProps) {
  const {
    info,
    className,
    open,
    whenOpen,
    listLike = curr_list_like(info?.type),
    whenListLike,
    ..._p
  } = props;
  const [__open, __set_open] = usePropState(open, whenOpen)
  const [__listLike, __set_listLike] = usePropState(listLike, whenListLike)

  useEffect(() => {
    if (whenListLike) return;
    const listlike = curr_list_like(info?.type)
    __set_listLike(listlike)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info])

  const { t } = useTranslation()
  const { children_title, date, unavailable, desc, brief, desc_url, title, changelog, changelog_url } = info ?? {};
  const win_x64_url = info?.get_download_url('win_x64')
  const open_in_browser = t('open_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const ref_el_children = useRef<HTMLDivElement>(null);
  const has_content = !!(desc || desc_url || changelog || changelog_url)
  const [children, , children_error] = useInfoChildren(info)
  Toast.useError(children_error)
  const __next_list_like = next_list_like(__listLike)
  const cls_root = classnames(csses.info_view_root, className)
  const url = info?.url ?? children?.find(v => v.url)?.url;
  const url_type = info?.url ? info.url_type : children?.find(v => v.url)?.url_type;
  const tags = [t(unavailable || url_type || '')].filter(Boolean);
  if (!info) return <></>;
  return (
    <div className={cls_root} {..._p}>
      <div className={csses.head}>
        <CollapseButton
          open={__open}
          whenChange={__set_open}
          className={!has_content ? csses.collapse_btn_hide : void 0} />
        <h3 className={csses.title}>
          <Link className={csses.title_link} href={url}>
            {title}
          </Link>
          {tags?.map(v => <span className={csses.tag} key={v}> {v} </span>)}
        </h3>
        <div className={csses.head_right_zone}>
          <IconButton title={open_in_browser} href={url} gone={!url} icon={img_browser_mark_white} />
          <IconButton title={dl_win_x64} href={win_x64_url} gone={!win_x64_url} icon={windows_x64} />
          <IconButton
            gone={!(children?.length)}
            onClick={() => __set_listLike(__next_list_like)}
            title="Cards or List"
            icon={__next_list_like === 'cards' ? img_cards_view : img_list_view} />
          {info ? <MarkdownButton info={info} /> : null}
          {date ? <div className={csses.el_date}> {date} </div> : null}
        </div>
      </div>

      <Viewer className={csses.content_zone} emptyAsGone content={brief} />

      <Collapse open={__open && has_content} >
        <Viewer
          emptyAsGone
          className={csses.content_zone}
          content={desc}
          url={desc_url}
          whenLoaded={t => info?.set_desc(t)} />
        <Viewer
          emptyAsGone
          className={csses.content_zone}
          content={changelog}
          url={changelog_url}
          whenLoaded={t => info?.set_changelog(t)} />
      </Collapse>
      {
        children.length ?
          <div className={csses.children_title_div} style={{ height: 0 }}>
            <span className={csses.children_title}>
              <IconButton icon={img_to_top} size={8} title={`scroll ${children_title} to top`}
                onClick={() => ref_el_children.current?.scrollTo({ top: 0, behavior: 'smooth' })} />
              <span>{children_title}</span>
              <IconButton icon={img_to_bottom} size={8} title={`scroll ${children_title} to bottom`}
                onClick={() => ref_el_children.current?.scrollTo({ top: ref_el_children.current.scrollHeight, behavior: 'smooth' })} />
            </span>
          </div> : null
      }
      {
        (__listLike !== 'cards' || !children?.length) ? null :
          <div className={classnames(csses.card_list, csses.scrollview)} ref={ref_el_children}>
            {children?.map(version => <InfoCard info={version} key={version.id} />)}
          </div>
      }
      {
        (__listLike !== 'list' || !children?.length) ? null :
          <div className={classnames(csses.version_list, csses.scrollview)} ref={ref_el_children}>
            {
              children.map((version, idx) => {
                return <InfoView info={version} key={version.id} open={idx === 0} />
              })
            }
          </div>
      }
    </div>
  )
}