# KenKen C++ Engine

Pure C++17 rule engine compiled to WebAssembly via Emscripten.

## Directory layout

## Build — native (verify logic, no Emscripten needed)

```bash
cd engine
make native        # builds build/kenken_harness
./build/kenken_harness

make test          # builds & runs unit tests
```

Requires only `g++` with C++17 support.

## Build — WebAssembly

```bash
# 1. Install Emscripten SDK (one-time)
git clone https://github.com/emscripten-core/emsdk.git ~/emsdk
cd ~/emsdk && ./emsdk install latest && ./emsdk activate latest
source ~/emsdk/emsdk_env.sh

# 2. Build
cd engine
make wasm

# 3. Copy output to React public folder
cp build/kenken.js build/kenken.wasm ../public/
```

## API (exposed to JS via Embind)

| Method | Returns | Description |
|---|---|---|
| `set(row, col, val)` | `MoveResult` | Place digit; validates row/col/cage |
| `unset(row, col)` | `MoveResult` | Clear a cell |
| `undo()` | `bool` | Revert last move |
| `hint()` | `HintResult` | Suggest best empty cell |
| `check()` | `CheckResult` | Count conflicts & empty cells |
| `reset()` | `void` | Clear entire board |
| `getCell(row, col)` | `int` | Read a cell value (0 = empty) |
| `isSolved()` | `bool` | True when board is complete & valid |
| `serializeGrid()` | `string` | CSV of all 16 cell values |
| `serializeErrors()` | `string` | CSV booleans — 1 = error |
| `serializeCages()` | `string` | JSON cage definitions |

## MoveResult codes

| Code | Meaning |
|---|---|
| `OK` | Move accepted |
| `ERR_BOUNDS` | row/col/val out of range |
| `ERR_ROW` | Row already contains this digit |
| `ERR_COL` | Column already contains this digit |
| `ERR_CAGE` | Cage arithmetic constraint violated |
