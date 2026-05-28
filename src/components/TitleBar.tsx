export function TitleBar({ size }: { size: number }) {
  return (
    <div style={{
      background: '#1a1a1a', borderBottom: '1px solid #333',
      padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {['#ff5f56','#ffbd2e','#27c93f'].map((c,i) => (
        <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />
      ))}
      <span style={{ marginLeft:10, color:'#666', fontSize:11, letterSpacing:'0.08em', fontFamily:'monospace' }}>
        kenken.wasm — terminal ui — {size}×{size} puzzle
      </span>
      <span style={{ marginLeft:'auto', color:'#444', fontSize:10, fontFamily:'monospace' }}>
        WASM: READY
      </span>
    </div>
  );
}
