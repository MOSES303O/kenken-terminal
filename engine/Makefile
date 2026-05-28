CXX       := g++
EMCC      := emcc
CXXFLAGS  := -std=c++17 -Wall -Wextra -I include
WASM_FLAGS := -std=c++17 -O2 -I include \
              --bind \
              -s WASM=1 \
              -s MODULARIZE=1 \
              -s EXPORT_NAME=KenKenModule \
              -s ALLOW_MEMORY_GROWTH=1 \
              -s ENVIRONMENT=web \
              -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'

SRC       := src/kenken.cpp
OUT_DIR   := build

.PHONY: all native test wasm clean

all: native test

# ── Native harness ───────────────────────────────────────────────
native:
	@mkdir -p $(OUT_DIR)
	$(CXX) $(CXXFLAGS) $(SRC) src/main_native.cpp -o $(OUT_DIR)/kenken_harness

# ── Unit tests ───────────────────────────────────────────────────
test:
	@mkdir -p $(OUT_DIR)
	$(CXX) $(CXXFLAGS) $(SRC) tests/test_engine.cpp -o $(OUT_DIR)/kenken_tests
	./$(OUT_DIR)/kenken_tests

# ── WebAssembly (requires Emscripten SDK) ────────────────────────
wasm:
	@mkdir -p $(OUT_DIR)
	$(EMCC) $(WASM_FLAGS) $(SRC) src/bindings.cpp \
	  -o $(OUT_DIR)/kenken.js
	@echo ""
	@echo "✓ WASM build complete:"
	@echo "  $(OUT_DIR)/kenken.js"
	@echo "  $(OUT_DIR)/kenken.wasm"
	@echo ""
	@echo "Copy both files to ../public/ then import KenKenModule from '/kenken.js'"

clean:
	rm -rf $(OUT_DIR)
