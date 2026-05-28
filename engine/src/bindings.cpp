// Compiled only when targeting WebAssembly via Emscripten.
// Build command: see engine/Makefile
#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include "kenken.h"
#include <stdexcept>
#include <vector>

using namespace KenKen;
using namespace emscripten;

// ── Thin JS-friendly wrappers ────────────────────────────────────
struct JsCage {
  std::string id;
  std::vector<std::vector<int>> cells;  // [[r,c], ...]
  int target;
  std::string op;
};

// Factory: build Engine from JS-supplied cage array
Engine* createEngine(int size, const std::vector<JsCage>& jsCages) {
  std::vector<Cage> cages;
  cages.reserve(jsCages.size());
  for (const auto& jc : jsCages) {
    Cage c;
    c.id     = jc.id;
    c.target = jc.target;
    c.op     = opFromChar(jc.op.empty() ? '+' : jc.op[0]);
    for (const auto& rc : jc.cells) {
      if (rc.size() < 2) throw std::invalid_argument("Each cell must be [row, col]");
      c.cells.push_back({ rc[0], rc[1] });
    }
    cages.push_back(std::move(c));
  }
  return new Engine(size, cages);
}

// ── Emscripten bindings ──────────────────────────────────────────
EMSCRIPTEN_BINDINGS(kenken_module) {

  value_object<MoveResult>("MoveResult")
    .field("valid",   &MoveResult::valid)
    .field("message", &MoveResult::message)
    .field("code",    &MoveResult::code);

  value_object<HintResult>("HintResult")
    .field("found",   &HintResult::found)
    .field("row",     &HintResult::row)
    .field("col",     &HintResult::col)
    .field("value",   &HintResult::value)
    .field("message", &HintResult::message);

  value_object<CheckResult>("CheckResult")
    .field("conflicts", &CheckResult::conflicts)
    .field("empty",     &CheckResult::empty)
    .field("solved",    &CheckResult::solved)
    .field("message",   &CheckResult::message);

  value_object<JsCage>("JsCage")
    .field("id",     &JsCage::id)
    .field("cells",  &JsCage::cells)
    .field("target", &JsCage::target)
    .field("op",     &JsCage::op);

  register_vector<int>("VectorInt");
  register_vector<std::vector<int>>("VectorVectorInt");
  register_vector<JsCage>("VectorJsCage");

  class_<Engine>("Engine")
    .constructor<int, const std::vector<Cage>&>()
    .function("set",             &Engine::set)
    .function("unset",           &Engine::unset)
    .function("undo",            &Engine::undo)
    .function("hint",            &Engine::hint)
    .function("check",           &Engine::check)
    .function("reset",           &Engine::reset)
    .function("getCell",         &Engine::getCell)
    .function("isSolved",        &Engine::isSolved)
    .function("getSize",         &Engine::getSize)
    .function("serializeGrid",   &Engine::serializeGrid)
    .function("serializeErrors", &Engine::serializeErrors)
    .function("serializeCages",  &Engine::serializeCages);

  function("createEngine", &createEngine, allow_raw_pointers());
}
#endif // __EMSCRIPTEN__
