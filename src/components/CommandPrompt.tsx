import { useState, useRef, useEffect } from 'react';

interface Props {
  onSubmit: (cmd: string) => void;
  history: { command: string }[];
}

export function CommandPrompt({ onSubmit, history }: Props) {
  const [value, setValue] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const cmds = history.map(h => h.command);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSubmit(value);
      setValue('');
      setHistIdx(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmds.length - 1);
      setHistIdx(next);
      setValue(cmds[cmds.length - 1 - next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setValue(next === -1 ? '' : cmds[cmds.length - 1 - next] ?? '');
    }
  }

  return (
    <div data-testid="command-prompt" style={{
      borderTop:'1px solid #222', padding:'10px 14px',
      display:'flex', alignItems:'center', gap:6,
      background:'#0a0a0a',
    }}>
      <span style={{ color:'#4ade80', fontFamily:'monospace', fontSize:13 }}>$</span>
      <input
        ref={inputRef}
        data-testid="prompt-input"
        value={value}
        onChange={e => setValue(e.target.value.toUpperCase())}
        onKeyDown={handleKey}
        style={{
          flex:1, background:'transparent', border:'none', outline:'none',
          color:'#e0e0e0', fontFamily:'monospace', fontSize:13,
          caretColor:'#4ade80',
        }}
        placeholder="type a command..."
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
