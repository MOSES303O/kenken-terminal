import { useReducer, useCallback } from 'react';
import { initGame,processCommand } from '../engine/engine';
import type { GameState } from '../engine/types';
function reducer(state: GameState, cmd: string): GameState {
  return processCommand(state, cmd);
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initGame);
  const submit = useCallback((cmd: string) => {
    if (cmd.trim()) dispatch(cmd);
  }, []);
  return { state, submit };
}
