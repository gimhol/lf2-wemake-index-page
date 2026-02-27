import type { IRecord } from "@/api/listModRecords";
import { Tooltip } from "@/gimd/Tooltip";
import { interrupt_event } from "@/utils/interrupt_event";
import dayjs from "dayjs";
import { useState } from "react";

export function InfoDate(props: { record?: IRecord | null; }) {
  const { record } = props;
  const [a, set_a] = useState(true)
  return (
    <Tooltip title={
      <div style={{ fontFamily: '', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ whiteSpace: 'nowrap' }}>Modified: {dayjs(record?.modify_time).format(`YYYY-MM-DD HH:mm:ss`)}</span>
        <span style={{ whiteSpace: 'nowrap' }}>Created: {dayjs(record?.create_time).format(`YYYY-MM-DD HH:mm:ss`)}</span>
      </div>
    }>
      <span
        style={{ cursor: 'pointer'}}
        onClick={(e) => { interrupt_event(e); set_a(!a) }}
        onDoubleClick={(e) => { interrupt_event(e); }}>
        {
          a ?
            `C:${record?.create_time?.substring(0, 10)}` :
            `M:${record?.modify_time?.substring(0, 10)}`
        }
      </span>
    </Tooltip >
  );
}
