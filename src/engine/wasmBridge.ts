// Wrapper that loads the WASM module and exposes a clean async API.
// Falls back to the pure-TS engine when WASM is not available.

export interface WasmMoveResult   { valid: boolean; message: string; code: string; }
export interface WasmHintResult   { found: boolean; row: number; col: number; value: number; message: string; }
export interface WasmCheckResult  { conflicts: number; empty: number; solved: boolean; message: string; }

export interface KenKenWasm {
  set(row: number, col: number, val: number): WasmMoveResult;
  unset(row: number, col: number): WasmMoveResult;
  undo(): boolean;
  hint(): WasmHintResult;
  check(): WasmCheckResult;
  reset(): void;
  getCell(row: number, col: number): number;
  isSolved(): boolean;
  getSize(): number;
  serializeGrid(): string;
  serializeErrors(): string;
  serializeCages(): string;
}

let _instance: KenKenWasm | null = null;

export async function loadWasm(): Promise<KenKenWasm | null> {
  try {
    // Dynamic import — only resolves if /public/kenken.js exists
    const Module = await (window as any).KenKenModule();
    const cages = buildCageVector(Module);
    _instance = Module.createEngine(4, cages);
    console.log('[KenKen] WASM engine loaded');
    return _instance;
  } catch (e) {
    console.warn('[KenKen] WASM not available, using TypeScript engine:', e);
    return null;
  }
}

// Build Emscripten vector of cages from the JS puzzle definition
function buildCageVector(Module: any) {
  const PUZZLE = [
    { id:'A', cells:[[0,0],[0,1]], target:6, op:'+' },
    { id:'B', cells:[[0,2],[0,3]], target:3, op:'+' },
    { id:'C', cells:[[1,0],[2,0]], target:2, op:'-' },
    { id:'D', cells:[[1,1],[1,2]], target:3, op:'+' },
    { id:'E', cells:[[1,3],[2,3],[3,3]], target:3, op:'*' },
    { id:'F', cells:[[2,1],[2,2]], target:2, op:'/' },
    { id:'G', cells:[[3,0],[3,1]], target:3, op:'+' },
    { id:'H', cells:[[3,2]], target:4, op:'+' },
  ];
  const vec = new Module.VectorJsCage();
  for (const cage of PUZZLE) {
    const jc = new Module.JsCage();
    jc.id = cage.id;
    jc.target = cage.target;
    jc.op = cage.op;
    const cellVec = new Module.VectorVectorInt();
    for (const [r,c] of cage.cells) {
      const pair = new Module.VectorInt();
      pair.push_back(r); pair.push_back(c);
      cellVec.push_back(pair);
    }
    jc.cells = cellVec;
    vec.push_back(jc);
  }
  return vec;
}

export function getInstance(): KenKenWasm | null { return _instance; }
