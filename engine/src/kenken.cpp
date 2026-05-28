#include "kenken.h"
#include <algorithm>
#include <numeric>
#include <sstream>
#include <stdexcept>
#include <cmath>

namespace KenKen {

// ── Op helpers ───────────────────────────────────────────────────
Op opFromChar(char c) {
  switch(c) {
    case '+': return Op::ADD;
    case '-': return Op::SUB;
    case '*': return Op::MUL;
    case '/': return Op::DIV;
    default:  return Op::NONE;
  }
}
char opToChar(Op op) {
  switch(op) {
    case Op::ADD:  return '+';
    case Op::SUB:  return '-';
    case Op::MUL:  return '*';
    case Op::DIV:  return '/';
    default:       return '?';
  }
}

// ── Constructor ──────────────────────────────────────────────────
Engine::Engine(int size, const std::vector<Cage>& cages)
  : size_(size), cages_(cages),
    grid_(size, std::vector<int>(size, 0)),
    errors_(size, std::vector<bool>(size, false)) {
  if (size < 2 || size > 9)
    throw std::invalid_argument("Board size must be between 2 and 9");
}

// ── set ──────────────────────────────────────────────────────────
MoveResult Engine::set(int row, int col, int val) {
  if (row < 0 || row >= size_ || col < 0 || col >= size_ || val < 1 || val > size_)
    return { false, "Out of bounds: row/col/val must be 1-" + std::to_string(size_), "ERR_BOUNDS" };

  undoStack_.push_back({ row, col, grid_[row][col] });
  grid_[row][col] = val;
  revalidate();

  if (errors_[row][col]) {
    // Determine specific error type for richer feedback
    if (rowConflict(row, val, col))
      return { false, "Row " + std::to_string(row+1) + " already contains " + std::to_string(val), "ERR_ROW" };
    if (colConflict(col, val, row))
      return { false, "Col " + std::to_string(col+1) + " already contains " + std::to_string(val), "ERR_COL" };
    return { false, "Cage constraint fails at (" + std::to_string(row+1) + "," + std::to_string(col+1) + ")", "ERR_CAGE" };
  }
  return { true, "Placed " + std::to_string(val) + " at (" + std::to_string(row+1) + "," + std::to_string(col+1) + ")", "OK" };
}

// ── unset ────────────────────────────────────────────────────────
MoveResult Engine::unset(int row, int col) {
  if (row < 0 || row >= size_ || col < 0 || col >= size_)
    return { false, "Out of bounds", "ERR_BOUNDS" };
  undoStack_.push_back({ row, col, grid_[row][col] });
  grid_[row][col] = 0;
  revalidate();
  return { true, "Cleared (" + std::to_string(row+1) + "," + std::to_string(col+1) + ")", "OK" };
}

// ── undo ─────────────────────────────────────────────────────────
bool Engine::undo() {
  if (undoStack_.empty()) return false;
  auto [r, c, prev] = undoStack_.back();
  undoStack_.pop_back();
  grid_[r][c] = prev;
  revalidate();
  return true;
}

// ── reset ────────────────────────────────────────────────────────
void Engine::reset() {
  for (auto& row : grid_)  std::fill(row.begin(), row.end(), 0);
  for (auto& row : errors_) std::fill(row.begin(), row.end(), false);
  undoStack_.clear();
}

// ── check ────────────────────────────────────────────────────────
CheckResult Engine::check() const {
  int conflicts = 0, empty = 0;
  for (int r = 0; r < size_; ++r)
    for (int c = 0; c < size_; ++c) {
      if (grid_[r][c] == 0) ++empty;
      else if (errors_[r][c]) ++conflicts;
    }
  bool solved = (conflicts == 0 && empty == 0);
  std::string msg;
  if (solved) msg = "Puzzle solved!";
  else if (conflicts > 0) msg = std::to_string(conflicts) + " conflict(s), " + std::to_string(empty) + " empty";
  else msg = "No conflicts, " + std::to_string(empty) + " cell(s) remaining";
  return { conflicts, empty, solved, msg };
}

// ── hint ─────────────────────────────────────────────────────────
HintResult Engine::hint() const {
  // Strategy: find first empty cell with a unique valid value
  for (int r = 0; r < size_; ++r) {
    for (int c = 0; c < size_; ++c) {
      if (grid_[r][c] != 0) continue;
      int v = solveCell(r, c);
      if (v != 0)
        return { true, r, c, v,
          "Try " + std::to_string(v) + " at (" + std::to_string(r+1) + "," + std::to_string(c+1) + ")" };
    }
  }
  // Fallback: return first empty cell without a value suggestion
  for (int r = 0; r < size_; ++r)
    for (int c = 0; c < size_; ++c)
      if (grid_[r][c] == 0)
        return { true, r, c, 0, "Focus on (" + std::to_string(r+1) + "," + std::to_string(c+1) + ")" };

  return { false, -1, -1, 0, "No empty cells" };
}

// ── getCell ──────────────────────────────────────────────────────
int Engine::getCell(int row, int col) const {
  if (row < 0 || row >= size_ || col < 0 || col >= size_) return -1;
  return grid_[row][col];
}

// ── isSolved ─────────────────────────────────────────────────────
bool Engine::isSolved() const {
  return check().solved;
}

// ── serializeGrid ────────────────────────────────────────────────
std::string Engine::serializeGrid() const {
  std::ostringstream oss;
  for (int r = 0; r < size_; ++r)
    for (int c = 0; c < size_; ++c)
      oss << grid_[r][c] << (r == size_-1 && c == size_-1 ? "" : ",");
  return oss.str();
}

// ── serializeErrors ──────────────────────────────────────────────
std::string Engine::serializeErrors() const {
  std::ostringstream oss;
  for (int r = 0; r < size_; ++r)
    for (int c = 0; c < size_; ++c)
      oss << (errors_[r][c] ? 1 : 0) << (r == size_-1 && c == size_-1 ? "" : ",");
  return oss.str();
}

// ── serializeCages ───────────────────────────────────────────────
std::string Engine::serializeCages() const {
  std::ostringstream oss;
  oss << "[";
  for (size_t i = 0; i < cages_.size(); ++i) {
    const auto& cage = cages_[i];
    oss << "{\"id\":\"" << cage.id << "\","
        << "\"target\":" << cage.target << ","
        << "\"op\":\"" << opToChar(cage.op) << "\","
        << "\"cells\":[";
    for (size_t j = 0; j < cage.cells.size(); ++j)
      oss << "[" << cage.cells[j].row << "," << cage.cells[j].col << "]"
          << (j + 1 < cage.cells.size() ? "," : "");
    oss << "]}";
    if (i + 1 < cages_.size()) oss << ",";
  }
  oss << "]";
  return oss.str();
}

// ════════════════════════════════════════════════════════════════════
// Private helpers
// ════════════════════════════════════════════════════════════════════

void Engine::revalidate() {
  // Reset all errors
  for (auto& row : errors_) std::fill(row.begin(), row.end(), false);

  // Row conflicts
  for (int r = 0; r < size_; ++r) {
    std::unordered_map<int,int> seen;
    for (int c = 0; c < size_; ++c) {
      int v = grid_[r][c];
      if (v == 0) continue;
      if (seen.count(v)) { errors_[r][c] = true; errors_[r][seen[v]] = true; }
      else seen[v] = c;
    }
  }
  // Col conflicts
  for (int c = 0; c < size_; ++c) {
    std::unordered_map<int,int> seen;
    for (int r = 0; r < size_; ++r) {
      int v = grid_[r][c];
      if (v == 0) continue;
      if (seen.count(v)) { errors_[r][c] = true; errors_[seen[v]][c] = true; }
      else seen[v] = r;
    }
  }
  // Cage arithmetic conflicts (only when all cells filled)
  for (const auto& cage : cages_) {
    bool allFilled = true;
    for (const auto& cell : cage.cells)
      if (grid_[cell.row][cell.col] == 0) { allFilled = false; break; }
    if (allFilled && !cageSatisfied(cage))
      for (const auto& cell : cage.cells)
        errors_[cell.row][cell.col] = true;
  }
}

bool Engine::rowConflict(int row, int val, int excludeCol) const {
  for (int c = 0; c < size_; ++c)
    if (c != excludeCol && grid_[row][c] == val) return true;
  return false;
}

bool Engine::colConflict(int col, int val, int excludeRow) const {
  for (int r = 0; r < size_; ++r)
    if (r != excludeRow && grid_[r][col] == val) return true;
  return false;
}

bool Engine::cageConflict(int row, int col) const {
  const Cage* cage = cageOf(row, col);
  if (!cage) return false;
  for (const auto& cell : cage->cells)
    if (grid_[cell.row][cell.col] == 0) return false;
  return !cageSatisfied(*cage);
}

const Cage* Engine::cageOf(int row, int col) const {
  for (const auto& cage : cages_)
    for (const auto& cell : cage.cells)
      if (cell.row == row && cell.col == col) return &cage;
  return nullptr;
}

bool Engine::cageSatisfied(const Cage& cage) const {
  std::vector<int> vals;
  vals.reserve(cage.cells.size());
  for (const auto& cell : cage.cells)
    vals.push_back(grid_[cell.row][cell.col]);

  switch (cage.op) {
    case Op::ADD:
      return std::accumulate(vals.begin(), vals.end(), 0) == cage.target;
    case Op::MUL: {
      int prod = 1;
      for (int v : vals) prod *= v;
      return prod == cage.target;
    }
    case Op::SUB:
      if (vals.size() != 2) return false;
      return std::abs(vals[0] - vals[1]) == cage.target;
    case Op::DIV:
      if (vals.size() != 2) return false;
      if (vals[1] == 0) return false;
      return (vals[0] > vals[1])
        ? (vals[0] % vals[1] == 0 && vals[0] / vals[1] == cage.target)
        : (vals[1] % vals[0] == 0 && vals[1] / vals[0] == cage.target);
    case Op::NONE:
      return vals.size() == 1 && vals[0] == cage.target;
  }
  return false;
}

// Naive constraint-propagation: find a value that is the only legal
// option for this cell given current row/col and cage constraints.
int Engine::solveCell(int row, int col) const {
  std::vector<int> candidates;
  for (int v = 1; v <= size_; ++v) {
    if (rowConflict(row, v, col)) continue;
    if (colConflict(col, v, row)) continue;
    candidates.push_back(v);
  }
  if (candidates.size() == 1) return candidates[0];
  return 0;  // ambiguous — no single hint
}

} // namespace KenKen
