import cns from "classnames";
import type { Dayjs } from "dayjs";
import type { HTMLAttributes } from "react";
import csses from "./csses.module.scss";

export interface ICalendarCellProps extends HTMLAttributes<HTMLDivElement> {
  key?: React.Key;
  day: Dayjs;
  anchor?: Dayjs;
  now?: Dayjs;
  selected?: boolean
}
export function Cell(props: ICalendarCellProps) {
  const { day, now, anchor, className, selected, children, ..._p } = props;
  const outmonth = anchor && day.month() != anchor?.month()

  const cn = cns(csses.calendar_cell, {
    [csses.today]: 0 == now?.diff(day, 'days'),
    [csses.tomonth]: !outmonth,
    [csses.outmonth]: outmonth,
    [csses.selected]: selected
  }, className);

  return (
    <div className={cn} {..._p}>
      <div className={csses.calendar_cell_inner}>
        {children ?? day.date()}
      </div>
    </div>
  )
}