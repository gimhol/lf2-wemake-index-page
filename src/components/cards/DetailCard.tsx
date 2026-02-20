import windows_x64 from "@/assets/svg/windows_x64.svg";
import { Info } from "@/base/Info";
import classnames from "classnames";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../button/IconButton";
import { Link } from "../link";
import { Viewer } from "../markdown/Viewer";
import { CardBase, type ICardBaseProps } from "./CardBase";
import csses from "./DetailCard.module.scss";
import { MarkdownButton } from "@/pages/main/MarkdownModal";
import { Paths } from "@/Paths";
import Show from "@/gimd/Show";

export interface IDetailCardProps extends ICardBaseProps {
  info: Info;
  onClose?(): void;
}
const private_classnames = { card: csses.detail_card }
export function DetailCard(props: IDetailCardProps) {
  const { info, onClose, classNames, ..._p } = props;
  const { t } = useTranslation()
  const dl_win_x64 = t('dl_win_x64')
  const { url, full_cover_url, desc, full_desc_url, unavailable, url_type } = info;
  const win_x64_url = info.get_url_by_name('win_x64');
  const ref_el = useRef<HTMLDivElement>(null)
  const title_suffix = t(unavailable || url_type || '');
  return <>
    <CardBase
      floating
      key={info.id}
      classNames={{
        ...classNames,
        card: classnames(private_classnames.card, classNames?.card)
      }}
      __ref={ref_el}
      {..._p}>
      <div className={csses.detail_card_inner}>
        <div className={csses.detail_card_head}>
          <div className={csses.left}>
            <Link href={url} style={{ padding: `0px 5px` }}>
              {info.title}
              {url_type === Info.OPEN_IN_BROWSER && url ? ' ▸' : null}
            </Link>
            <span className={csses.prefix}>
              {title_suffix}
            </span>
          </div>
          <div className={csses.mid}></div>
          <div className={csses.right}>
            <MarkdownButton info={info} />
            <IconButton title={dl_win_x64} icon={windows_x64} href={win_x64_url} gone={!win_x64_url} />
            <IconButton icon='✖︎' onClick={onClose} stopPropagation />
          </div>
        </div>
        <div className={csses.detail_card_main}>
          {
            !full_cover_url ? null :
              <img
                className={classnames(csses.pic_zone)}
                draggable={false}
                src={full_cover_url} />
          }
          <div className={classnames(csses.info_zone, csses.scrollview)}>
            <Viewer className={csses.content_zone} emptyAsGone content={info.brief} />
            <Viewer content={desc} url={full_desc_url} emptyAsGone />
          </div>
          {
            (full_cover_url || desc || full_desc_url) ? null :
              <div className={classnames(csses.no_content)}>
                {t('no_content')}
              </div>
          }
        </div>
        <div className={csses.detail_card_foot}>
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
          <Show yes={!!info.id}>
            <div className={csses.right}>
              <span className={csses.prefix}>
                {t('id')}
              </span>
              <a href={`${location.protocol}//${location.host}/#${Paths.All.Info.replace(':game_id', '' + info.id)}`}
                target='_blank'>
                {info.id}
              </a>
            </div>
          </Show>
          <div className={csses.right}>
            <span className={csses.prefix}>
              {t('date')}
            </span>
            {info.date}
          </div>
        </div>
      </div>
    </CardBase>
  </>
}