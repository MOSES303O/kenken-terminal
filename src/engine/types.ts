export type Operation = '+' | '-' | '*' | '/';

export interface Cage {
  id: string;
  cells: [number, number][];
  target: number;
  op: Operation;
}

export interface Cell {
  value: number | null;
  isError: boolean;
  isHint: boolean;
  isSelected: boolean;
}

export interface HistoryEntry {
  timestamp: string;
  command: string;
  result: string;
  type: 'ok' | 'error' | 'hint' | 'info';
}

export interface GameState {
  size: number;
  grid: Cell[][];
  cages: Cage[];
  selected: [number, number] | null;
  history: HistoryEntry[];
  statusMessage: string;
  statusType: 'ok' | 'error' | 'hint' | 'info';
  solved: boolean;
  moveCount: number;
  startTime: number;
}
