import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from '../engine/types';
import { initGame, processCommand } from '../engine/engine';
import { loadWasm } from '../engine/wasmBridge';
import type { KenKenWasm } from '../engine/wasmBridge';

function reducer(state: GameState, cmd: string): GameState {
  return processCommand(state, cmd);
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initGame);
  const wasmRef = useRef<KenKenWasm | null>(null);
  const [wasmReady, setWasmReady] = useState(false);

  // Attempt to load WASM on mount; fall back to TS engine silently
  useEffect(() => {
    loadWasm().then(instance => {
      if (instance) {
        wasmRef.current = instance;
        setWasmReady(true);
        console.log('[useGame] WASM engine active');
      } else {
        console.log('[useGame] Using TypeScript engine');
      }
    });
  }, []);

   const submit = useCallback((cmd: string) => {
    if (!cmd.trim()) return;

    if (wasmReady && wasmRef.current) {
      const parts = cmd.trim().toUpperCase().split(/\s+/);

      try {
        if (parts[0] === 'SET' && parts.length === 4) {
          const [, r, c, v] = parts.map(Number);

          const wasmResult = wasmRef.current.set(r - 1, c - 1, v);

          console.log('[WASM]', cmd, '->', wasmResult.code);

        } else if (parts[0] === 'UNDO') {
          wasmRef.current.undo();

        } else if (parts[0] === 'RESET') {
          wasmRef.current.reset();

        } else if (parts[0] === 'CHECK') {
          const chk = wasmRef.current.check();

          console.log('[WASM] CHECK ->', chk.message);

        } else if (parts[0] === 'HINT') {
          const h = wasmRef.current.hint();

          console.log('[WASM] HINT ->', h.message);
        }

      } catch (err) {
        console.warn('[WASM] error:', err);
      }
    }

    dispatch(cmd);

  }, [wasmReady]);

  return { state, submit, wasmReady };
}
