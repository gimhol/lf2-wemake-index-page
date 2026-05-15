const style: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'black',
  flex: 1,

}
const date = Date.now();
export default function Demo() {
  return (
    <iframe
      style={style}
      src={'https://lf.gim.ink/demo?time=' + date}
    />
  )
}