const { Disposable } = require("atom");

module.exports = {
  activate() {
    this.jupyterService = null;
    // One layer per editor, guaranteed by the marker hub; the breakpoint list
    // lives in the layer cache.
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
    const layer = this.editors.get(editor);
    if (!layer) return;
    layer.cache.set("data", data);
    layer.update();
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
        this.editors.set(layer.editor, layer);
        layer.cache.set("data", this.breakpoints(layer.editor));
        layer.disposables.add(
          new Disposable(() => {
            this.editors.delete(layer.editor);
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
