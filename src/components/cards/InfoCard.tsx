import type { IRecord } from "@/api/listModRecords";
import windows_x64 from "@/assets/svg/windows_x64.svg";
import { Info } from "@/base/Info";
import { Tags } from "@/pages/info/Tags";
import { submit_click_event } from "@/utils/events";
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../button/IconButton";
import { ShareButton } from "../button/ShareButton";
import { Link } from "../link";
import { Viewer } from "../markdown/Viewer";
import { Mask } from "../mask";
import { CardBase, type ICardBaseProps } from "./CardBase";
import { DetailCard } from "./DetailCard";
import csses from "./InfoCard.module.scss";

export interface IInfoCardProps extends ICardBaseProps {
  info?: Info;
  record?: IRecord;
}
const classNames = { card: csses.info_card }
const empty_info = Info.empty()
export function InfoCard(props: IInfoCardProps) {
  const { t } = useTranslation()
  const dl_win_x64 = t('dl_win_x64')
  const { info = empty_info } = props;
  const { url, full_cover_url } = info;
  const win_x64_url = info.get_url_by_name('win_x64');
  const ref_el = useRef<HTMLDivElement>(null)
  const [detail_style, set_detail_style] = useState<React.CSSProperties>({})
  const [detail_open, set_detail_open] = useState(false)
  useEffect(() => {
    if (!detail_open) return void 0
    setTimeout(() => set_detail_style({}), 50)
  }, [detail_open])
  const close_detail = () => {
    set_detail_open(false)
    const { width, height, left, top } = ref_el.current!.firstElementChild!.getBoundingClientRect()
    set_detail_style({ width, height, left, top })
  }
  const open_detail = (e: React.MouseEvent) => {
    set_detail_open(true)
    const { width, height, left, top } = ref_el.current!.firstElementChild!.getBoundingClientRect()
    set_detail_style({ width, height, left, top })
    submit_click_event(e.target as HTMLElement, {
      title: info.title
    })
  }
  return <>
    <CardBase
      floating
      key={info.id}
      onClick={open_detail}
      classNames={classNames}
      __ref={ref_el}>
      <div className={csses.info_card_inner}>
        <div className={csses.info_card_head}>
          <Link className={csses.title} href={url}>
            {info.title}
            {info.url_type === Info.OPEN_IN_BROWSER && url ? ' ▸' : null}
          </Link>
          <Tags info={info} />
          <div className={csses.mid}>
            <ShareButton info={info} />
            <IconButton
              title={dl_win_x64}
              href={win_x64_url}
              gone={!win_x64_url}
              icon={windows_x64} />
          </div>
        </div>
        <div className={csses.info_card_main}>
          {
            !full_cover_url ? null : <img className={classnames(csses.pic_zone)} draggable={false} src={full_cover_url} />
          }
          <Viewer className={csses.content_zone} emptyAsGone content={info.brief} />
          {
            !(info.desc || info.full_desc_url) ? null :
              <div className={classnames(full_cover_url ? csses.info_zone_half : csses.info_zone, csses.scrollview)}>
                <Viewer emptyAsGone plain content={info.desc} url={info.full_desc_url} whenLoaded={v => info.set_desc(v)} />
              </div>
          }
          {
            (full_cover_url || info.desc || info.full_desc_url) ? null :
              <div className={classnames(csses.no_content)}>{t('no_content')}</div>
          }
        </div>
        <div className={csses.info_card_foot}>
          <div className={csses.left}>
            <span className={csses.prefix}>
              {t('author')}
            </span>
            <Link
              href={info.author_url}
              title={t('visit_author_link')}>
              {info.author}
            </Link>
          </div>
          <div className={csses.mid}>
          </div>
          <div className={csses.right}>
            <span className={csses.prefix}>
              {t('date')}
            </span>
            {info.date}
          </div>
        </div>
      </div>
    </CardBase>

    <Mask
      container={() => document.body}
      open={detail_open}
      closeOnMask
      whenChange={close_detail}>
      <DetailCard
        floating={false}
        info={info}
        classNames={{
          root: csses.detail_card_modal,
          card: csses.detail_card_inner,
        }}
        style={detail_style}
        onClick={e => e.stopPropagation()}
        onClose={close_detail}
      />
    </Mask>
  </>
}