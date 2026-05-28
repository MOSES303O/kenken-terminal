import { useEffect,useState } from 'react';
import { useGame } from './hooks/useGame';
import { TitleBar } from './components/TitleBar';
import { KenKenGrid } from './components/KenKenGrid';
import { MoveHistory } from './components/MoveHistory';
import { StatusBox } from './components/StatusBox';
import { CommandPrompt } from './components/CommandPrompt';
import { WinOverlay } from './components/WinOverlay';
import { StatsBar } from './components/StatsBar';

const COMMANDS = [
  ['SET <r> <c> <v>', 'Place a digit'],
  ['UNDO', 'Revert last move'],
  ['HINT', 'Suggest a cell'],
  ['CHECK', 'Validate board'],
  ['RESET', 'Clear all moves'],
];

export default function App() {
  const { state, submit } = useGame();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - state.startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [state.startTime]);

  const filled = state.grid.flat().filter(c => c.value !== null).length;
  const errors = state.grid.flat().filter(c => c.isError).length;

  return (
    <div style={{
      minHeight:'100vh', background:'#111', display:'flex',
      alignItems:'center', justifyContent:'center', padding:24,
    }}>
      <div style={{ position:'relative', background:'#0d0d0d', borderRadius:10, border:'1px solid #333', overflow:'hidden', width:660 }}>
        <TitleBar size={state.size} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', minHeight:520 }}>
          <div style={{ borderRight:'1px solid #222', padding:14, display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div style={{ fontSize:10, color:'#555', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Puzzle grid</div>
              <KenKenGrid grid={state.grid} cages={state.cages} selected={state.selected} />
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {[['#5b8fff','cage border'],['#4ade80','selected'],['#facc15','hint'],['#ef4444','conflict']].map(([c,l]) => (
                <span key={l} style={{
                  padding:'2px 8px', borderRadius:4, fontSize:10,
                  background: c+'22', color: c, border:`1px solid ${c}44`,
                }}>■ {l}</span>
              ))}
            </div>
            <StatsBar size={state.size} cages={state.cages.length} filled={filled} errors={errors} elapsed={elapsed} />
          </div>
          <div style={{ padding:14, display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div style={{ display:'flex', borderBottom:'1px solid #222', marginBottom:0 }}>
                {['History','Commands'].map((t,i) => (
                  <div key={t} style={{ fontSize:10, padding:'5px 12px', color: i===0?'#5b8fff':'#555', borderBottom: i===0?'2px solid #5b8fff':'2px solid transparent' }}>{t}</div>
                ))}
              </div>
              <MoveHistory entries={state.history} />
            </div>
            <div>
              <div style={{ fontSize:10, color:'#555', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Status</div>
              <StatusBox message={state.statusMessage} type={state.statusType} />
            </div>
            <div>
              <div style={{ fontSize:10, color:'#555', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Quick ref</div>
              <div style={{ fontSize:10, color:'#555', lineHeight:1.9, fontFamily:'monospace' }}>
                {COMMANDS.map(([c,d]) => (
                  <div key={c}><span style={{ color:'#5b8fff' }}>{c}</span> — {d}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <CommandPrompt onSubmit={submit} history={state.history} />
        {state.solved && (
          <WinOverlay moves={state.moveCount} seconds={elapsed} onReset={() => submit('RESET')} />
        )}
      </div>
    </div>
  );
}
