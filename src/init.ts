import 'current-device';
import { GlobalStore } from "./GlobalStore";
import './i18n';
import { ApiHttp } from "./network/ApiHttp";
import * as Compat from "./network/Compat";
import * as KnownError from './network/KnownError';
import './style.scss';
import './utils/events';
import './utils/fingerprint';
ApiHttp.addRequestInterceptor((url, opts) => {
  if (!API_BASE) return [url, opts];
  if (!url.startsWith('http')) {
    const apiBase = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/';
    const apiTail = url.startsWith('/') ? url.substring(1) : url
    url = apiBase + apiTail
  } else {
    const { protocol, host } = window.location
    const lc = `${protocol}//${host}/`
    if (url.startsWith(lc)) {
      const apiBase = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/';
      url = url.replace(lc, apiBase);
    }
  }

  if (url.startsWith(API_BASE)) {
    const headers = opts.headers || {}
    if (!Compat.Header.has(headers, "Authorization"))
      Compat.Header.set(headers, "Authorization", GlobalStore.store.value.session_id)
    if (!Compat.Header.has(headers, "Content-Type"))
      Compat.Header.set(headers, "Content-Type", "application/json;charset=UTF-8")
    opts.headers = headers;
  }
  return [url, opts]
})

ApiHttp.addErrorInterceptor((e: Error) => {
  if (KnownError.is(e) && e.http_status === 401) {
    GlobalStore.reset()
  }
  return e
})

const on_resize = () => {
  if (window.innerWidth <= 480)
    document.firstElementChild?.classList.add('small-screen')
  else
    document.firstElementChild?.classList.remove('small-screen')
}
window.addEventListener('resize', on_resize)
on_resize()
