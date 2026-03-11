import { usePropState } from "@/utils/usePropState";
import cns from "classnames";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import { useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { Cell, type ICalendarCellProps } from "./Cell";
import csses from "./csses.module.scss";

export interface IRenderCell {
  (props: ICalendarCellProps): ReactNode;
}

export interface ICalendarProps extends HTMLAttributes<HTMLDivElement> {
  weekdays?: ReactNode[];
  anchor?: Dayjs;
  whenAnchorChange?(day?: Dayjs): void;

  renderCell?: IRenderCell;
  renderHeadCell?: IRenderCell;
  onClickDay?(day: Dayjs): void;
  onPointerEnterDay?(day: Dayjs): void;
  onPointerLeaveDay?(day: Dayjs): void;

  /** 可选 */
  selectable?: boolean;
  /** 已选 */
  selecteds?: Dayjs[];
  /** 已选被改 */
  whenSelecteds?(days?: Dayjs[]): void
  /** 是否多选 */
  multiply?: boolean;
  /** 最多可选 */
  maxSelected?: number;
  /** 允许清空选择 */
  clearable?: boolean;

  rangePicker?: boolean;

  ranges?: [Dayjs, Dayjs][];
  whenRanges?(ranges?: [Dayjs, Dayjs][]): void

}

export function Calendar(props: ICalendarProps) {
  const {
    className, weekdays = Calendar.Weekdays, multiply, clearable,
    anchor: _anchor, whenAnchorChange, selecteds: _selecteds, whenSelecteds,
    selectable = !!whenSelecteds,
    maxSelected = Number.MAX_SAFE_INTEGER,
    renderCell = Calendar.defaultRenderCell,
    renderHeadCell = Calendar.defaultRenderHeadCell,
    onClickDay, onPointerEnterDay, onPointerLeaveDay,

    ranges: _ranges, whenRanges, rangePicker = !!whenRanges,
    ..._p } = props;

  const [selecteds, setSelecteds] = usePropState(_selecteds, whenSelecteds)
  const [picking, setPicking] = useState<[Dayjs, Dayjs]>();
  const [sortedPicking, setSortedPicking] = useState<[Dayjs, Dayjs]>();
  const [ranges, setRanges] = usePropState(_ranges, whenRanges)
  const now = useMemo(() => dayjs().startOf('D'), [])
  const offset = useMemo(() => dayjs().startOf('w').day(), [])
  const cn = cns(csses.calendar, { [csses.selectable]: selectable }, className);
  const [__anchor, set_anchor] = usePropState(_anchor, whenAnchorChange)
  const anchor = useMemo(() => (__anchor ?? dayjs()).startOf('M'), [__anchor])
  const days = useMemo(() => {
    const a = anchor.startOf('M')
    let day = a.startOf('w')
    const days = [day];
    for (let i = 1; i < 42; ++i)
      days.push(day = day.add(1, 'd'))
    return days
  }, [anchor])

  const weekdayItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < 7; ++i) {
      items.push(renderHeadCell({ key: i, day: days[i], children: weekdays[(i + offset) % 7] }))
    }
    return <div key={-1} className={csses.calendar_row}>{items}</div>;
  }, [days, weekdays, offset, renderHeadCell])

  const dayItems = useMemo(() => {
    const rows = [];
    const range_infos = new Map<unknown, [number, number, boolean, boolean]>();
    for (let i = 0; i < days.length; i += 7) {
      range_infos.clear();
      const cells = [];
      for (let j = 0; j < 7; ++j) {
        const day = days[i + j];
        const onClick = () => {
          onClickDay?.(day);
          if (selectable) {
            const next = selecteds?.filter(v => !day.isSame(v))
            if (!next) {
              setSelecteds([day])
            } else if (!multiply && clearable && day.isSame(selecteds?.[0])) {
              setSelecteds(void 0)
            } else if (!multiply) {
              setSelecteds([day])
            } else if (multiply && next.length !== selecteds?.length) {
              setSelecteds(next.length ? next : void 0)
            } else if (multiply && maxSelected > next.length) {
              setSelecteds([...next, day])
            }
          }
          if (rangePicker) {
            if (!picking) {
              setRanges(void 0)
              setPicking([day, day])
              setSortedPicking([day, day])
              return;
            }
            const [a, b] = [picking[0], day].sort((a, b) => a.isBefore(b) ? -1 : 1);
            setRanges([[a, b]])
            setPicking(void 0)
            setSortedPicking(void 0)
          }
        }
        const onPointerEnter = () => {
          onPointerEnterDay?.(day)
          if (!picking || !rangePicker) return;
          setPicking([picking[0], day])
          const [a, b] = [picking[0], day].sort((a, b) => a.isBefore(b) ? -1 : 1)
          setSortedPicking([a, b]);
        };
        const onPointerLeave = () => onPointerLeaveDay?.(day);
        const selected = selecteds?.some(v => v.startOf('d').diff(day, 'd') == 0)
        const item = renderCell({
          key: i + j, day, now, selected, anchor, onClick, onPointerEnter, onPointerLeave
        });
        cells.push(item);

        if (ranges) for (const rr of ranges) {
          const [a, b] = rr
          const l_close = day.isSame(a.startOf('day'))
          if (l_close) {
            range_infos.set(rr, [j, j, false, false])
            continue;
          }
          const r_close = day.isSame(b.startOf('day'))
          if (r_close) {
            let range = range_infos.get(rr)
            if (!range) range_infos.set(rr, range = [j, j, true, false])
            range[1] = j;
            range[3] = false;
            continue;
          }
          if (!day.isAfter(a) || !day.isBefore(b)) continue;
          let range = range_infos.get(rr)
          if (!range) range_infos.set(rr, range = [j, j, true, true])
          range[1] = j;
          range[3] = true;
        }

        if (sortedPicking) {
          const [a, b] = sortedPicking
          const l_close = day.isSame(a.startOf('day'))
          const r_close = day.isSame(b.startOf('day'))
          if (l_close) {
            range_infos.set('range_picking', [j, j, !l_close, !r_close])
            continue;
          }
          if (r_close) {
            let range = range_infos.get('range_picking')
            if (!range) range_infos.set('range_picking', range = [j, j, !l_close, !r_close])
            range[1] = j;
            range[3] = false;
            continue;
          }
          if (!day.isAfter(a) || !day.isBefore(b)) continue;
          let range = range_infos.get('range_picking')
          if (!range) range_infos.set('range_picking', range = [j, j, true, true])
          range[1] = j;
          range[3] = true;
        }
      }

      const range_cells: ReactNode[] = [];
      for (const [k, [a, b, c, d]] of range_infos) {
        const l = 100 * a / 7;
        const w = 100 * (1 + b - a) / 7;
        const style = {
          left: `${l}%`,
          width: `${w}%`
        }
        const cn = cns(csses.calendar_range, {
          [csses.l_open]: c,
          [csses.r_open]: d,
          [csses.picker]: k === 'range_picking',
        })
        const key = k === 'range_picking' ? k : [a, b, c, d].join()
        range_cells.push(<div key={key} className={cn} style={style} />)
      }
      rows.push(
        <div key={i} className={csses.calendar_row}>
          {range_cells}
          {cells}
        </div>
      )
    }
    return <>{rows}</>
  }, [days, selecteds, renderCell, now, anchor, ranges, sortedPicking, selectable, rangePicker, onClickDay, multiply, clearable, maxSelected, setSelecteds, picking, setRanges, onPointerEnterDay, onPointerLeaveDay])

  return (
    <div className={cn} {..._p}>
      <div className={csses.calendar_row}>
        <button style={{ flex: 1 }} onClick={() => set_anchor(anchor.add(-1, 'M'))}>{'<'}</button>
        <button style={{ flex: 5 }} onClick={() => set_anchor(dayjs().startOf('month'))}>
          {anchor.format('YYYY-MM')}
        </button>
        <button style={{ flex: 1 }} onClick={() => set_anchor(anchor.add(1, 'M'))}>{'>'}</button>
      </div>
      {weekdayItems}
      {dayItems}
    </div>
  )
}
Calendar.Weekdays = ['日', '一', '二', '三', '四', '五', '六'] as ReactNode[]
Calendar.Cell = Cell;
Calendar.defaultRenderCell = function defaultRenderCell(props: ICalendarCellProps): ReactNode {
  const { key, ..._p } = props
  return <Cell key={key} {..._p} />
}
Calendar.defaultRenderHeadCell = function defaultRenderHeadCell(props: ICalendarCellProps): ReactNode {
  const { key, ..._p } = props;
  return <Cell key={key} className={csses.weekday} {..._p} />
}