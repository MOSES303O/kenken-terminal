interface Props {
  size: number; cages: number; filled: number;
  errors: number; elapsed: number;
}
export function StatsBar({ size, cages, filled, errors, elapsed }: Props) {
  const m = String(Math.floor(elapsed/60)).padStart(2,'0');
  const s = String(elapsed%60).padStart(2,'0');
  const stats = [
    { val: `${size}×${size}`, lbl: 'Grid' },
    { val: cages, lbl: 'Cages' },
    { val: filled, lbl: 'Filled' },
    { val: errors, lbl: 'Errors', danger: errors > 0 },
    { val: `${m}:${s}`, lbl: 'Time' },
  ];
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
      {stats.map((st,i) => (
        <div key={i} style={{ textAlign:'center' }}>
          <div style={{
            color: st.danger ? '#ef4444' : '#e0e0e0',
            fontSize:14, fontFamily:'monospace',
          }}>{st.val}</div>
          <div style={{ color:'#555', fontSize:9, textTransform:'uppercase', letterSpacing:'0.08em' }}>
            {st.lbl}
          </div>
        </div>
      ))}
    </div>
  );
}
