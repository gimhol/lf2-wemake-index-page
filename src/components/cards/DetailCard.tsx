import type { IRecord } from "@/api/listModRecords";
import { Info } from "@/base/Info";
import Show from "@/gimd/Show";
import { InfoActions } from "@/pages/info/InfoActions";
import { Tags } from "@/pages/info/Tags";
import { Paths } from "@/Paths";
import classnames from "classnames";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../button/IconButton";
import { Link } from "../link";
import { Viewer } from "../markdown/Viewer";
import { CardBase, type ICardBaseProps } from "./CardBase";
import csses from "./DetailCard.module.scss";

export interface IDetailCardProps extends ICardBaseProps {
  info?: Info | null;
  record?: IRecord | null;
  onClose?(): void;
}
const private_classnames = { card: csses.detail_card }
export function DetailCard(props: IDetailCardProps) {
  const { info, onClose, classNames, record, ..._p } = props;
  const { t } = useTranslation()
  const { url, full_cover_url, desc, full_desc_url } = info || {};
  const ref_el = useRef<HTMLDivElement>(null)
  return <>
    <CardBase
      floating
      key={info?.id}
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
              {info?.title}
            </Link>
            <Tags info={info} />
          </div>
          <div className={csses.mid}>
            <InfoActions info={info} record={record} />
            <IconButton
              icon='✖︎'
              onClick={onClose}
              stopPropagation />
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
            <Viewer className={csses.content_zone} emptyAsGone content={info?.brief} />
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
              href={info?.author_url}
              title={t('visit_author_link')}>
              {info?.author}
            </Link>
          </div>
          <div className={csses.mid}>
          </div>
          <Show yes={!!info?.id}>
            <div className={csses.right}>
              <span className={csses.prefix}>
                {t('id')}
              </span>
              <a href={`${location.protocol}//${location.host}/#${Paths.All.Info.replace(':game_id', '' + info?.id)}`}
                target='_blank'>
                {info?.id}
              </a>
            </div>
          </Show>
          <div className={csses.right}>
            <span className={csses.prefix}>
              {t('date')}
            </span>
            {info?.date}
          </div>
        </div>
      </div>
    </CardBase>
  </>
}

