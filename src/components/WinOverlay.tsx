interface Props { moves: number; seconds: number; onReset: () => void; }

export function WinOverlay({ moves, seconds, onReset }: Props) {
  const m = String(Math.floor(seconds/60)).padStart(2,'0');
  const s = String(seconds%60).padStart(2,'0');
  return (
    <div data-testid="win-overlay" style={{
      position:'absolute', inset:0,
      background:'rgba(0,0,0,0.88)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:12, borderRadius:10, zIndex:10,
    }}>
      <div style={{ color:'#4ade80', fontSize:22, fontFamily:'monospace', letterSpacing:'0.1em' }}>
        ■ PUZZLE SOLVED ■
      </div>
      <div style={{ color:'#888', fontSize:12, fontFamily:'monospace' }}>
        {moves} moves · {m}:{s}
      </div>
      <button
        data-testid="play-again-btn"
        onClick={onReset}
        style={{
          marginTop:8, background:'transparent', border:'1px solid #4ade80',
          color:'#4ade80', fontFamily:'monospace', fontSize:12,
          padding:'6px 20px', borderRadius:4, cursor:'pointer',
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
