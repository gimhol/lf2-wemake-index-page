/* eslint-disable @typescript-eslint/no-explicit-any */
import { IconButton } from "@/components/button/IconButton";
import { Calendar } from "@/gimd/Calendar/Calendar";
import { Tooltip } from "@/gimd/Tooltip";
import { ApiHttp } from "@/network/ApiHttp";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import csses from "./index.module.scss";
import { useSmallScreen } from "@/useSmallScreen";

export default function DashBoard() {
  const [data, set_data] = useState<any>([])
  const [fingerprint, set_fingerprint] = useState('')
  const [size,] = useState(50);
  const [last, set_last] = useState<string>()

  const [ranges, setRanges] = useState<[Dayjs, Dayjs][] | undefined>(() => [[
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]]);

  useEffect(() => {
    if (!ranges?.length) return;
    const [from, to] = ranges[0]
    ApiHttp.get(`${API_BASE}events/ips`, {
      from: from.format('YYYY-MM-DD 00:00:00'),
      to: to.format('YYYY-MM-DD 23:59:59'),
      size,
      last
    }).then(r => {
      for (const v of r.data) {
        const a = new Set([v.country, v.prov, v.city, v.area])
        v.long_place = Array.from(a).filter(Boolean).join('/')
      }
      set_data(r.data)
    })
  }, [ranges, size, last])
  const [open, set_open] = useState<boolean | undefined>()
  const daterange = !ranges?.length ? '未选择日期范围' :
    ranges[0][0].diff(ranges[0][1], 'day') == 0 ?
      `${ranges[0][0].format('YYYY-MM-DD')}` :
      `${ranges[0][0].format('YYYY-MM-DD')} ~ ${ranges[0][1].format('YYYY-MM-DD')}`
  const small = useSmallScreen()
  return (
    <div className={csses.dashboard} >
      <div className={csses.head}>
        <Tooltip
          style={{ padding: 0, borderWidth: 0, overflow: 'hidden', background: 'none' }}
          open={open}
          onOpen={v => {
            set_open(v);
            if (v) return;
            const r: [Dayjs, Dayjs][] = ranges ? ranges : [[
              dayjs().startOf('month'),
              dayjs().endOf('month')
            ]]
            setRanges(r)
          }}
          title={
            <Calendar
              style={{ padding: `5px` }}
              ranges={ranges}
              whenRanges={setRanges}
            />
          }>
          <IconButton>
            {daterange}
          </IconButton>
        </Tooltip>
        <IconButton onClick={() => set_last(void 0)}>first</IconButton>
        <IconButton onClick={() => set_last(data[data.length - 1]._id)}>next</IconButton>
      </div>
      <div className={csses.record_list}>
        <table>
          <tbody>
            {data.map((v: any) => {
              return small ?
                <tr key={v.id + v.time}>
                  <td onClick={() => set_fingerprint(v.fingerprint)}>
                    <div>
                      <Tooltip title={v.ua}>
                        <span className={v.fingerprint == fingerprint ? csses.picked : ''}>{v.fingerprint}</span>
                      </Tooltip>
                      <div> {v.ip} </div>
                      <div> {v.long_place} </div>
                      <div> {v.uri} </div>
                      <div> {v.time.substring(0, 20)} </div>
                    </div>
                  </td>
                </tr> :
                <tr key={v.id + v.time}>
                  <td onClick={() => set_fingerprint(v.fingerprint)}>
                    <Tooltip title={v.ua}>
                      <span className={v.fingerprint == fingerprint ? csses.picked : ''}>{v.fingerprint}</span>
                    </Tooltip>
                  </td>
                  <td> {v.ip} </td>
                  <td> {v.long_place} </td>
                  <td> {v.uri} </td>
                  <td> {v.time.substring(0, 20)} </td>
                </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}