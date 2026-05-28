import type { Cage } from '../engine/types';
import type { Cell } from '../engine/types';
import type { GameState } from '../engine/types';
import type { HistoryEntry } from '../engine/types';
//import type { Operation } from '../engine/types';
import { PUZZLE_4X4 } from './puzzles';

const SIZE = 4;

function makeGrid(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      value: null, isError: false, isHint: false, isSelected: false,
    }))
  );
}

function timestamp(): string {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}

export function initGame(): GameState {
  return {
    size: SIZE,
    grid: makeGrid(SIZE),
    cages: PUZZLE_4X4,
    selected: null,
    history: [],
    statusMessage: 'Puzzle loaded. Type SET <row> <col> <val> to begin.',
    statusType: 'info',
    solved: false,
    moveCount: 0,
    startTime: Date.now(),
  };
}

function getCageForCell(cages: Cage[], r: number, c: number): Cage | undefined {
  return cages.find(cage => cage.cells.some(([cr, cc]) => cr === r && cc === c));
}

function validateGrid(grid: Cell[][], cages: Cage[]): Cell[][] {
  const next = grid.map(row => row.map(cell => ({ ...cell, isError: false })));
  for (let r = 0; r < SIZE; r++) {
    const rowVals = next[r].map(c => c.value).filter(Boolean) as number[];
    if (new Set(rowVals).size !== rowVals.length) {
      next[r].forEach(cell => { if (cell.value) cell.isError = true; });
    }
  }
  for (let c = 0; c < SIZE; c++) {
    const colVals = next.map(row => row[c].value).filter(Boolean) as number[];
    if (new Set(colVals).size !== colVals.length) {
      next.forEach(row => { if (row[c].value) row[c].isError = true; });
    }
  }
  for (const cage of cages) {
    const vals = cage.cells.map(([r,c]) => next[r][c].value);
    if (vals.some(v => v === null)) continue;
    const nums = vals as number[];
    let ok = false;
    if (cage.op === '+') ok = nums.reduce((a,b)=>a+b,0) === cage.target;
    if (cage.op === '*') ok = nums.reduce((a,b)=>a*b,1) === cage.target;
    if (cage.op === '-') ok = Math.abs(nums[0]-nums[1]) === cage.target;
    if (cage.op === '/') {
      const [a,b] = [Math.max(...nums), Math.min(...nums)];
      ok = b !== 0 && a/b === cage.target;
    }
    if (!ok) cage.cells.forEach(([r,c]) => { next[r][c].isError = true; });
  }
  return next;
}

function isSolved(grid: Cell[][]): boolean {
  return grid.every(row => row.every(cell => cell.value !== null && !cell.isError));
}

function addHistory(state: GameState, cmd: string, result: string, type: HistoryEntry['type']): HistoryEntry[] {
  return [...state.history, { timestamp: timestamp(), command: cmd, result, type }].slice(-50);
}

export function processCommand(state: GameState, raw: string): GameState {
  const parts = raw.trim().toUpperCase().split(/\s+/);
  const cmd = parts[0];

  if (cmd === 'SET') {
    const [,rStr,cStr,vStr] = parts;
    const r = parseInt(rStr) - 1, c = parseInt(cStr) - 1, v = parseInt(vStr);
    if (isNaN(r)||isNaN(c)||isNaN(v)||r<0||r>=SIZE||c<0||c>=SIZE||v<1||v>SIZE) {
      return { ...state,
        history: addHistory(state, raw, 'ERR: invalid args', 'error'),
        statusMessage: `Invalid args. Usage: SET <1-${SIZE}> <1-${SIZE}> <1-${SIZE}>`,
        statusType: 'error',
      };
    }
    const newGrid = state.grid.map(row => row.map(cell => ({ ...cell, isHint: false })));
    newGrid[r][c] = { ...newGrid[r][c], value: v, isHint: false };
    const validated = validateGrid(newGrid, state.cages);
    const hasError = validated[r][c].isError;
    const msg = hasError ? `ERR: conflict at (${r+1},${c+1})` : 'OK';
    const solved = !hasError && isSolved(validated);
    return { ...state,
      grid: validated,
      selected: [r, c],
      history: addHistory(state, raw, msg, hasError ? 'error' : 'ok'),
      statusMessage: hasError ? `Conflict at (${r+1},${c+1}) — check row/column/cage` : `Placed ${v} at (${r+1},${c+1})`,
      statusType: hasError ? 'error' : 'ok',
      solved,
      moveCount: state.moveCount + 1,
    };
  }

  if (cmd === 'UNDO') {
    const newGrid = state.grid.map(row => row.map(cell => ({ ...cell })));
    const last = [...state.history].reverse().find(h => h.command.startsWith('SET') && h.type !== 'error');
    if (!last) {
      return { ...state,
        history: addHistory(state, raw, 'nothing to undo', 'info'),
        statusMessage: 'Nothing to undo.',
        statusType: 'info',
      };
    }
    const [,rStr,cStr] = last.command.split(' ');
    const r = parseInt(rStr)-1, c = parseInt(cStr)-1;
    newGrid[r][c] = { ...newGrid[r][c], value: null, isError: false };
    return { ...state,
      grid: validateGrid(newGrid, state.cages),
      history: addHistory(state, raw, 'reverted', 'ok'),
      statusMessage: `Undid move at (${r+1},${c+1})`,
      statusType: 'ok',
    };
  }

  if (cmd === 'HINT') {
  const newGrid = state.grid.map(row => row.map(cell => ({ ...cell, isHint: false })));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!newGrid[r][c].value) {
        getCageForCell(state.cages, r, c);

        newGrid[r][c] = { ...newGrid[r][c], isHint: true };

        return {
          ...state,
          grid: newGrid,
          history: addHistory(state, raw, `→ check (${r+1},${c+1})`, 'hint'),
          statusMessage: `Hint: try filling cell (${r+1},${c+1})`,
          statusType: 'hint',
        };
      }
    }
  }

  return {
    ...state,
    history: addHistory(state, raw, 'board complete', 'info'),
    statusMessage: 'No empty cells to hint.',
    statusType: 'info',
  };
}

  if (cmd === 'CHECK') {
    const errors = state.grid.flat().filter(c => c.isError).length;
    const empty = state.grid.flat().filter(c => c.value === null).length;
    const msg = errors ? `${errors} conflict(s) found` : empty ? `No conflicts, ${empty} cells remaining` : 'Board looks correct!';
    return { ...state,
      history: addHistory(state, raw, msg, errors ? 'error' : 'ok'),
      statusMessage: msg,
      statusType: errors ? 'error' : 'ok',
    };
  }

  if (cmd === 'RESET') {
    return {
      ...initGame(),
      history: addHistory(state, raw, 'board cleared', 'info'),
      statusMessage: 'Board reset. Start fresh!',
      statusType: 'info',
    };
  }

  return { ...state,
    history: addHistory(state, raw, 'ERR: unknown command', 'error'),
    statusMessage: `Unknown command: ${cmd}. Try SET, UNDO, HINT, CHECK, RESET`,
    statusType: 'error',
  };
}
