/* eslint-disable @typescript-eslint/no-explicit-any */
import cns from "classnames";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/loading";
import Button from "@/gimd/Button";
import { ApiHttp } from "@/network/ApiHttp";
import css from "./styles.module.scss";

export interface IGithubCommit {
  sha: string;
  html_url: string;
  commit: {
    author?: { name?: string; email?: string; date?: string };
    message?: string;
  };
  author?: { login?: string; avatar_url?: string } | null;
}

export interface CommitsProps extends ComponentProps<'div'> {
  _keep?: never
}

const PAGE_SIZE = 30;

export function Commits(props: CommitsProps) {
  const { className, ..._p } = props;
  const { t } = useTranslation();
  const [page, set_page] = useState(1);
  const [commits, set_commits] = useState<IGithubCommit[]>();
  const [loading, set_loading] = useState(true);
  const [has_more, set_has_more] = useState(true);

  const fetch_page = useCallback(async (page: number, signal?: AbortSignal) => {
    const r = await ApiHttp.get<any, IGithubCommit[]>(`${API_BASE}lfwm/github_commits`, {
      page,
      per_page: PAGE_SIZE,
    }, signal ? { signal } : void 0);
    return r.data ?? [];
  }, []);

  useEffect(() => {
    const ab = new AbortController();
    fetch_page(page, ab.signal)
      .then(list => {
        if (ab.signal.aborted) return;
        set_commits(list);
        set_has_more(list.length >= PAGE_SIZE);
      })
      .catch(() => {
        if (ab.signal.aborted) return;
        set_commits(void 0);
      })
      .finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false);
      })
    return () => ab.abort('[Commits] useEffect leave')
  }, [page, fetch_page])

  const go_prev = useCallback(() => {
    set_loading(true);
    set_page(p => Math.max(1, p - 1));
  }, [])
  const go_next = useCallback(() => {
    set_loading(true);
    set_page(p => p + 1);
  }, [])

  const items = useMemo(() => {
    if (loading) return <Loading loading absolute center />;
    if (!commits?.length) return <div className={css.empty}>{t('no_content')}</div>;
    return commits.map(c => {
      const msg = (c.commit?.message || '').split('\n')[0]
      const author_name = c.author?.login || c.commit?.author?.name || ''
      const avatar = c.author?.avatar_url
      const date = c.commit?.author?.date ? dayjs(c.commit.author.date).format('YYYY-MM-DD HH:mm') : ''
      return (
        <div key={c.sha} className={css.item}>
          {avatar && <img className={css.avatar} data-preview="false" src={avatar} alt={author_name} />}
          <div className={css.body}>
            <div className={css.msg}>
              <span className={css.msg_text} title={c.commit?.message}>{msg}</span>
              <a
                className={css.view}
                href={c.html_url}
                target="_blank"
                rel="noreferrer">{t('view')}</a>
            </div>
            <div className={css.meta}>
              <span className={css.commit_id}>{c.sha.slice(0, 8)}</span>
              <span className={css.name}>{author_name}</span>
              <span className={css.date}>{date}</span>
            </div>
          </div>
        </div>
      )
    })
  }, [loading, commits, t])

  return (
    <div className={cns(className, css.commits)}{..._p}>
      <div className={css.title}>{t('recent_commits')}</div>
      <div className={css.list}>{items}</div>
      <div className={css.pager}>
        <Button size="s" disabled={loading || page <= 1} onClick={go_prev}>
          {t('prev_page')}
        </Button>
        <span className={css.page_no}>{page}</span>
        <Button size="s" disabled={loading || !has_more} onClick={go_next}>
          {t('next_page')}
        </Button>
      </div>
    </div>
  )
}