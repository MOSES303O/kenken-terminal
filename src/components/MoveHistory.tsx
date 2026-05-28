import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../engine/types';

const typeColor: Record<string, string> = {
  ok: '#4ade80', error: '#ef4444', hint: '#facc15', info: '#888',
};

export function MoveHistory({ entries }: { entries: HistoryEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  return (
    <div ref={ref} data-testid="move-history" style={{
      background:'#0a0a0a', border:'1px solid #222', borderRadius:5,
      padding:8, overflowY:'auto', display:'flex', flexDirection:'column',
      gap:3, maxHeight:200, fontFamily:'monospace',
    }}>
      {entries.length === 0 && (
        <span style={{ fontSize:11, color:'#444' }}>No moves yet.</span>
      )}
      {entries.map((e,i) => (
        <div key={i} style={{ fontSize:11, display:'flex', gap:6 }}>
          <span style={{ color:'#444', minWidth:36 }}>{e.timestamp}</span>
          <span style={{ color:'#5b8fff' }}>{e.command}</span>
          <span style={{ color: typeColor[e.type] }}>→ {e.result}</span>
        </div>
      ))}
    </div>
  );
}
