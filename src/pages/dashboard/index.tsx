/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollapseButton } from "@/components/button/CollapseButton";
import { IconButton } from "@/components/button/IconButton";
import { Calendar } from "@/gimd/Calendar/Calendar";
import { Tooltip } from "@/gimd/Tooltip";
import { ApiHttp } from "@/network/ApiHttp";
import { useSmallScreen } from "@/useSmallScreen";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import csses from "./index.module.scss";
interface IItem {
  _id: string;
  key: string;
  seq: number;
  short_fingerprint: string;
  fingerprint: string;
  ua: string;
  ip: string;
  type: string;
  long_place: string;
  time: string;
  uri: string;
  begin: boolean;
  parent: string;
}
export default function DashBoard() {
  const [data, set_data] = useState<IItem[]>([])
  const [picked, set_picked] = useState('')
  const [size,] = useState(500);
  const [last, set_last] = useState<string>()
  const [openeds, set_openeds] = useState<{ [x in string]?: boolean }>({})
  const [calandar_opened, set_calandar_opened] = useState<boolean | undefined>()
  const [ranges, setRanges] = useState<[Dayjs, Dayjs][] | undefined>(() => [[
    dayjs().add(-1, 'month').startOf('month'),
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
      let p = ''
      for (let i = 0; i < r.data.length; i++) {
        const v = r.data[i];
        v.begin = (i == 0 || r.data[i - 1].seq == 0);
        v.long_place = [v.country, v.prov, v.city, v.area].filter(Boolean).join('/')
        v.short_fingerprint = v.fingerprint.substring(v.fingerprint.length - 8)
        v.key = v._id + v.time;
        if (v.begin) p = v.key;
        else v.parent = p
      }
      set_data(r.data)
    })
  }, [ranges, size, last])
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
          open={calandar_opened}
          onOpen={v => {
            set_calandar_opened(v);
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
            {data.map((data, index, arr) => {
              if (!data.begin && !openeds[data.parent]) return void 0;
              const foldable = data.begin && !arr[index + 1]?.begin;
              return small ?
                <SmallTableRow
                  key={data.key}
                  picked={picked}
                  index={index}
                  data={data}
                  open={openeds[data.key]}
                  foldable={foldable}
                  onPick={set_picked}
                  onOpen={() => set_openeds({ ...openeds, [data.key]: !openeds[data.key] })} /> :
                <TableRow
                  key={data.key}
                  picked={picked}
                  index={index}
                  data={data}
                  open={openeds[data.key]}
                  foldable={foldable}
                  onPick={set_picked}
                  onOpen={() => set_openeds({ ...openeds, [data.key]: !openeds[data.key] })} />
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


interface ITableRowProps {
  open?: boolean;
  foldable?: boolean;
  data: IItem;
  index?: number;
  picked?: string;
  onPick?(v: string): void;
  onOpen?(): void;
}
function TableRow(props: ITableRowProps) {
  const { open = false, foldable = false, onPick, onOpen, picked, data, index } = props;
  return (
    <tr key={data.key}>
      <td>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <CollapseButton
            style={{ opacity: foldable ? 1 : 0, pointerEvents: foldable ? 'all' : 'none' }}
            open={open}
            onClick={() => onOpen?.()} />
          <Tooltip title={data.ua}>
            <span
              onClick={() => onPick?.(data.fingerprint)}
              className={data.fingerprint == picked ? csses.picked : void 0}>
              {index}. {data.fingerprint}
            </span>
          </Tooltip>
        </span>
      </td>
      <td> {data.seq} </td>
      <td> {data.type} </td>
      <td onClick={() => onPick?.(data.ip)}>
        <span className={data.ip == picked ? csses.picked : void 0}>{data.ip}</span>
      </td>
      <td onClick={() => onPick?.(data.long_place)}>
        <span className={data.long_place == picked ? csses.picked : void 0}>{data.long_place}</span>
      </td>
      <td >
        <Tooltip title={data.uri}>
          <div>{data.uri.substring(19, 40)}</div>
        </Tooltip>
      </td>
      <td> {data.time.substring(0, 20)} </td>
    </tr>
  )
}
function SmallTableRow(props: ITableRowProps) {
  const { open = false, foldable = false, onPick, onOpen, picked, data, index } = props;
  return (
    <tr key={data.key}>
      <td onClick={() => onPick?.(data.fingerprint)}>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <CollapseButton
              style={{ opacity: foldable ? 1 : 0, pointerEvents: foldable ? 'all' : 'none' }}
              open={open}
              onClick={onOpen} />
            <Tooltip title={data.ua}>
              <span className={data.fingerprint == picked ? csses.picked : ''}>
                {index}. {data.fingerprint}
              </span>
            </Tooltip>
          </span>
          <div style={{ paddingLeft: 30 }}> {data.seq}: {data.ip} </div>
          <div style={{ paddingLeft: 30 }}> {data.long_place} </div>
          <div style={{ paddingLeft: 30 }}>
            <Tooltip title={data.uri}>
              <div>{data.uri.substring(19, 40)}</div>
            </Tooltip>
          </div>
          <div style={{ paddingLeft: 30 }}> {data.time.substring(0, 20)} </div>
        </div>
      </td>
    </tr>
  )
}