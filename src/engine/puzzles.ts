import type { Cage } from './types';

export const PUZZLE_4X4: Cage[] = [
  { id: 'A', cells: [[0,0],[0,1]], target: 6, op: '+' },
  { id: 'B', cells: [[0,2],[0,3]], target: 3, op: '+' },
  { id: 'C', cells: [[1,0],[2,0]], target: 2, op: '-' },
  { id: 'D', cells: [[1,1],[1,2]], target: 3, op: '+' },
  { id: 'E', cells: [[1,3],[2,3],[3,3]], target: 3, op: '*' },
  { id: 'F', cells: [[2,1],[2,2]], target: 2, op: '/' },
  { id: 'G', cells: [[3,0],[3,1]], target: 3, op: '+' },
  { id: 'H', cells: [[3,2]], target: 4, op: '+' },
];

export const SOLUTION_4X4: number[][] = [
  [3, 3, 1, 2],
  [4, 1, 2, 1],
  [2, 4, 1, 3],
  [1, 2, 4, 3],
];
