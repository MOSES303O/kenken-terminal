#pragma once
#include <vector>
#include <string>
#include <array>
#include <unordered_map>

namespace KenKen {

// ── Enums ────────────────────────────────────────────────────────
enum class Op { ADD, SUB, MUL, DIV, NONE };

// ── Data Structures ──────────────────────────────────────────────
struct Cell {
  int row, col;
};

struct Cage {
  std::string id;
  std::vector<Cell> cells;
  int target;
  Op op;
};

struct MoveResult {
  bool valid;
  std::string message;     // human-readable
  std::string code;        // OK | ERR_BOUNDS | ERR_ROW | ERR_COL | ERR_CAGE | ERR_FILLED
};

struct HintResult {
  bool found;
  int row, col, value;
  std::string message;
};

struct CheckResult {
  int conflicts;
  int empty;
  bool solved;
  std::string message;
};

// ── Main Engine Class ────────────────────────────────────────────
class Engine {
public:
  Engine(int size, const std::vector<Cage>& cages);

  // Core actions
  MoveResult   set(int row, int col, int val);
  MoveResult   unset(int row, int col);
  HintResult   hint() const;
  CheckResult  check() const;
  void         reset();

  // Undo / redo
  bool         undo();

  // Getters
  int          getSize() const { return size_; }
  int          getCell(int row, int col) const;
  bool         isSolved() const;
  std::string  serializeGrid() const;      // CSV of all cell values (0 = empty)
  std::string  serializeErrors() const;    // CSV booleans per cell
  std::string  serializeCages() const;     // JSON-like cage descriptions

private:
  int size_;
  std::vector<Cage> cages_;
  std::vector<std::vector<int>> grid_;     // 0 = empty
  std::vector<std::vector<bool>> errors_;

  // Undo stack: each entry is a (row, col, old_val) snapshot
  struct UndoEntry { int row, col, prev; };
  std::vector<UndoEntry> undoStack_;

  // Internal validation
  void         revalidate();
  bool         rowConflict(int row, int val, int excludeCol = -1) const;
  bool         colConflict(int col, int val, int excludeRow = -1) const;
  bool         cageConflict(int row, int col) const;
  const Cage*  cageOf(int row, int col) const;
  bool         cageSatisfied(const Cage& cage) const;
  int          solveCell(int row, int col) const;   // returns 0 if ambiguous
};

// ── Op helpers ───────────────────────────────────────────────────
Op   opFromChar(char c);
char opToChar(Op op);

} // namespace KenKen
