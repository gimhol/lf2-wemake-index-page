/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiHttp } from "@/network/ApiHttp"
import { useEffect, useState } from "react"
import csses from "./index.module.scss";
import dayjs, { Dayjs } from "dayjs";
import { Input } from "@/gimd/Input";

export default function DashBoard() {
  const [data, set_data] = useState<any>([])
  const [fingerprint, set_fingerprint] = useState('')

  const [[from, to], set_daterange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ])
  useEffect(() => {
    ApiHttp.get(`${API_BASE}events/ips`, {
      from: from.format('YYYY-MM-DD HH:mm:ss'),
      to: to.format('YYYY-MM-DD HH:mm:ss')
    }).then(r => {
      for (const v of r.data) {
        const a = new Set([v.country, v.prov, v.city, v.area])
        v.long_place = Array.from(a).filter(Boolean).join('/')
      }
      set_data(r.data)
    })
  }, [from, to])

  const [a, set_a] = useState(() => from.format('YYYY-MM-DD HH:mm:ss'))
  const [b, set_b] = useState(() => to.format('YYYY-MM-DD HH:mm:ss'))
  return (
    <div className={csses.dashboard}>
      <div className={csses.head}>
        <Input className={csses.input} value={a} onChange={e => set_a(e.target.value)} onBlur={() => {
          const d = dayjs(a.trim());
          if (d.isValid()) {
            set_a(d.format('YYYY-MM-DD HH:mm:ss'))
            set_daterange(v => [d, v[1]])
          } else {
            set_a(to.format('YYYY-MM-DD HH:mm:ss'))
          }
        }} />~
        <Input className={csses.input} value={b} onChange={e => set_b(e.target.value)} onBlur={() => {
          const d = dayjs(b.trim());
          if (d.isValid()) {
            set_b(d.format('YYYY-MM-DD HH:mm:ss'))
            set_daterange(v => [v[0], d])
          } else {
            set_b(to.format('YYYY-MM-DD HH:mm:ss'))
          }
        }} />
      </div>
      <div className={csses.record_list}>
        <table>
          <tbody>
            {data.map((v: any) => {
              return (
                <tr key={v.id}>
                  <td onClick={() => set_fingerprint(v.fingerprint)}>
                    <span className={v.fingerprint == fingerprint ? csses.picked : ''}>{v.fingerprint}</span>
                  </td>
                  <td> {v.ip} </td>
                  <td> {v.long_place} </td>
                  <td> {v.time.substring(0, 20)} </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}