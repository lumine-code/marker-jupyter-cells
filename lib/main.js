const { Disposable } = require("atom");

module.exports = {
  activate() {
    this.jupyterService = null;
    // One entry per editor, `{ layers: Set, data: Point[] }`. Every renderer
    // builds its own layer for the same editor, so the layers are a set and the
    // boundary list is shared: reading it is a full-buffer scan, and it must not
    // run once per renderer.
    this.editors = new Map();
  },

  deactivate() {
    this.jupyterService = null;
    this.editors.clear();
  },

  breakpoints(editor) {
    if (!this.jupyterService) {
      return [];
    }
    return this.jupyterService.initBreakpoints?.(editor) || [];
  },

  setBreakpoints(editor, data) {
    const entry = this.editors.get(editor);
    if (!entry) return;
    entry.data = data;
    for (const layer of entry.layers) {
      layer.cache.set("data", data);
      layer.update();
    }
  },

  consumeJupyterBreakpoints(jupyterService) {
    this.jupyterService = jupyterService;
    // Update existing editors
    for (const editor of this.editors.keys()) {
      this.setBreakpoints(editor, this.breakpoints(editor));
    }
    let subscription = jupyterService.onDidUpdate?.(({ editor, breakpoints }) => {
      if (!editor) return;
      this.setBreakpoints(editor, breakpoints);
    });
    return new Disposable(() => {
      this.jupyterService = null;
      subscription?.dispose();
    });
  },

  provideMarkerLayer() {
    return {
      name: "jupyter-repl",
      description: "Jupyter REPL cell markers",
      threshold: "marker-jupyter-repl.threshold",
      initialize: (layer) => {
        let entry = this.editors.get(layer.editor);
        if (!entry) {
          entry = { layers: new Set(), data: this.breakpoints(layer.editor) };
          this.editors.set(layer.editor, entry);
        }
        entry.layers.add(layer);
        layer.cache.set("data", entry.data);
        layer.disposables.add(
          new Disposable(() => {
            entry.layers.delete(layer);
            if (entry.layers.size === 0) {
              this.editors.delete(layer.editor);
            }
          }),
        );
      },
      getItems: ({ editor, cache }) => {
        const data = cache.get("data") || [];
        return data.map((breakpoint) => ({
          row: editor.screenPositionForBufferPosition(breakpoint).row,
        }));
      },
    };
  },
};
