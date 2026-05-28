const typeColor: Record<string, string> = {
  ok: '#4ade80', error: '#ef4444', hint: '#facc15', info: '#888',
};

export function StatusBox({ message, type }: { message: string; type: string }) {
  return (
    <div data-testid="status-box" style={{
      background:'#0a0a0a', border:'1px solid #222', borderRadius:5,
      padding:8, fontSize:11, minHeight:40, fontFamily:'monospace',
      color: typeColor[type] ?? '#888',
    }}>
      {type === 'error' && '✗ '}{type === 'ok' && '✓ '}{type === 'hint' && '→ '}
      {message}
    </div>
  );
}
