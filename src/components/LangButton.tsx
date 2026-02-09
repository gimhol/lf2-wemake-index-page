import { IconButton } from "@/components/button/IconButton";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import csses from "./LangButton.module.scss";

export function LangButton(props: { whenClick?(next: 'zh' | 'en'): void }) {
  const { whenClick } = props;
  const { t, i18n } = useTranslation()
  const is_en = !i18n.language.toLowerCase().startsWith('zh')
  return (
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        const is_en = !i18n.language.toLowerCase().startsWith('zh');
        const next = is_en ? 'zh' : 'en'
        i18n.changeLanguage(next)
        whenClick?.(next);
      }}
      title={t('switch_lang')}>
      <div className={csses.lang_btn_inner}>
        <span className={classnames(csses.lang_span_l, is_en ? csses.lang_span_f : csses.lang_span_b)}>
          中
        </span>
        <span className={classnames(csses.lang_span_r, is_en ? csses.lang_span_b : csses.lang_span_f)}>
          En
        </span>
      </div>
    </IconButton>
  )
}