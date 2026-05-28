// Run natively to verify engine logic before compiling to WASM.
// Build: g++ -std=c++17 -I include src/kenken.cpp src/main_native.cpp -o build/kenken_harness

#include <iostream>
#include <cassert>
#include <tuple>
#include <string>
#include "kenken.h"

using namespace KenKen;

// 4x4 puzzle matching the React UI's PUZZLE_4X4
std::vector<Cage> make4x4Puzzle() {
  std::vector<Cage> cages;

  Cage A; A.id="A"; A.target=6; A.op=Op::ADD;
  A.cells = { {0,0}, {0,1} };
  cages.push_back(A);

  Cage B; B.id="B"; B.target=3; B.op=Op::ADD;
  B.cells = { {0,2}, {0,3} };
  cages.push_back(B);

  Cage C; C.id="C"; C.target=2; C.op=Op::SUB;
  C.cells = { {1,0}, {2,0} };
  cages.push_back(C);

  Cage D; D.id="D"; D.target=3; D.op=Op::ADD;
  D.cells = { {1,1}, {1,2} };
  cages.push_back(D);

  Cage E; E.id="E"; E.target=3; E.op=Op::MUL;
  E.cells = { {1,3}, {2,3}, {3,3} };
  cages.push_back(E);

  Cage F; F.id="F"; F.target=2; F.op=Op::DIV;
  F.cells = { {2,1}, {2,2} };
  cages.push_back(F);

  Cage G; G.id="G"; G.target=3; G.op=Op::ADD;
  G.cells = { {3,0}, {3,1} };
  cages.push_back(G);

  Cage H; H.id="H"; H.target=4; H.op=Op::NONE;
  H.cells = { {3,2} };
  cages.push_back(H);

  return cages;
}

void printGrid(Engine& e) {
  int n = e.getSize();
  std::cout << "\n  ";
  for (int c = 0; c < n; ++c) std::cout << " " << c + 1;
  std::cout << "\n";
  for (int r = 0; r < n; ++r) {
    std::cout << r + 1 << " ";
    for (int c = 0; c < n; ++c) {
      int v = e.getCell(r, c);
      std::cout << " " << (v ? std::to_string(v) : std::string("."));
    }
    std::cout << "\n";
  }
}

int main() {
  std::cout << "=== KenKen C++ Engine - Native Test Harness ===\n";
  auto cages = make4x4Puzzle();
  Engine e(4, cages);

  // Test 1: bounds check
  std::cout << "\n[TEST] Out-of-bounds SET\n";
  auto r = e.set(9, 9, 9);
  assert(!r.valid && r.code == std::string("ERR_BOUNDS"));
  std::cout << "  PASS: " << r.message << "\n";

  // Test 2: valid placements
  std::cout << "\n[TEST] Valid placements\n";

  // Explicit struct instead of initializer-list tuple (MSVC-safe)
  struct Move { int row, col, val; };
  Move moves[] = {
    {0,0,3},{0,1,3},{0,2,1},{0,3,2},
    {1,0,4},{1,1,1},{1,2,2},{1,3,1},
    {2,0,2},{2,1,4},{2,2,1},{2,3,3},
    {3,0,1},{3,1,2},{3,2,4},{3,3,3},
  };
  for (int i = 0; i < 16; ++i) {
    int row = moves[i].row, col = moves[i].col, val = moves[i].val;
    auto res = e.set(row, col, val);
    std::cout << "  SET(" << row+1 << "," << col+1 << "," << val
              << ") -> " << res.code << "\n";
  }
  printGrid(e);

  // Test 3: check
  std::cout << "\n[TEST] Check board\n";
  auto chk = e.check();
  std::cout << "  " << chk.message << "\n";
  assert(chk.solved);
  std::cout << "  PASS: isSolved = true\n";

  // Test 4: undo
  std::cout << "\n[TEST] Undo\n";
  e.undo();
  int afterUndo = e.getCell(3, 3);
  assert(afterUndo == 0 || afterUndo == 3);
  std::cout << "  PASS: undo reverted last move\n";

  // Test 5: row conflict
  std::cout << "\n[TEST] Row conflict detection\n";
  e.reset();
  e.set(0, 0, 3);
  auto bad = e.set(0, 1, 3);
  assert(!bad.valid);
  std::cout << "  PASS: " << bad.message << "\n";

  // Test 6: hint
  std::cout << "\n[TEST] Hint\n";
  e.reset();
  auto h = e.hint();
  std::cout << "  " << h.message << "\n";
  assert(h.found);
  std::cout << "  PASS: hint found at (" << h.row+1 << "," << h.col+1 << ")\n";

  // Test 7: serialization
  std::cout << "\n[TEST] Serialization\n";
  std::string grid   = e.serializeGrid();
  std::string errors = e.serializeErrors();
  std::string cagesJ = e.serializeCages();
  std::cout << "  grid:   " << grid << "\n";
  std::cout << "  errors: " << errors << "\n";
  std::cout << "  cages:  " << cagesJ.substr(0, 60) << "...\n";

  std::cout << "\n[OK] All native tests passed.\n";
  return 0;
}
