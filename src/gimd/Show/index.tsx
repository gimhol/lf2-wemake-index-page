import { type PropsWithChildren } from "react";

export interface IShowProps extends PropsWithChildren {
  yes?: unknown;
  not_null?: boolean;
}
export default function Show(props: IShowProps) {
  const { yes = true, not_null = true, children } = props
  if (yes) return <>{children}</>
  else if (not_null) return <></>
  return null
}
Show.is = function (v: React.ReactElement<unknown>): v is React.ReactElement<IShowProps> {
  return v.type == Show
}

export interface IShowDivProps extends React.HTMLAttributes<HTMLDivElement> {
  yes?: unknown;
  keep?: boolean;
  not_null?: boolean;
}
const hidden_div_style: React.CSSProperties = {
  position: 'fixed', overflow: 'hidden', width: 0, height: 0, maxWidth: 0, maxHeight: 0
}
Show.Div = function (props: IShowDivProps) {
  const { yes = false, keep, not_null, ..._p } = props
  if (yes) return <div {..._p} />;
  if (keep) return <div {..._p} style={hidden_div_style} />
  if (not_null) return <></>
  return null
}

export interface IShowSpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  yes?: unknown;
}
Show.Span = function (props: IShowSpanProps) {
  const { yes = false, ...ramins_props } = props
  return yes ? <span {...ramins_props} /> : null
}

export interface IShowSwitchProps extends Omit<IShowProps, 'children'> {
  children: [React.ReactNode, React.ReactNode]
}
Show.Switch = function (props: IShowSwitchProps) {
  const { yes, children: [a, b] } = props;
  return <>
    <Show yes={!!yes}>{a}</Show>
    <Show yes={!yes}>{b}</Show>
  </>
}

export interface IShowWhichProps {
  children: React.ReactNode[];
  idx?: number;
  render_all?: boolean;
  not_null?: boolean;
}
Show.Which = function (props: IShowWhichProps) {
  const { idx = 0, children, not_null = true, render_all = true } = props;

  if (!render_all)
    return <>{children[idx]}</>

  return <> {children.map((v, i) => <Show key={idx} yes={idx === i} not_null={not_null}>{v}</Show>)} </>
}