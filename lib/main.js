const { Disposable } = require("lumine");

module.exports = {
  activate() {
    this.cellsService = null;
    // One layer per editor, guaranteed by the marker hub; the boundary list
    // lives in the layer cache.
    this.editors = new Map();
  },

  deactivate() {
    this.cellsService = null;
    this.editors.clear();
  },

  breakpoints(editor) {
    if (!this.cellsService) {
      return [];
    }
    return this.cellsService.initBreakpoints?.(editor) || [];
  },

  setBreakpoints(editor, data) {
    const layer = this.editors.get(editor);
    if (!layer) return;
    layer.cache.set("data", data);
    layer.update();
  },

  consumeJupyterCells(cellsService) {
    this.cellsService = cellsService;
    // Update existing editors
    for (const editor of this.editors.keys()) {
      this.setBreakpoints(editor, this.breakpoints(editor));
    }
    let subscription = cellsService.onDidUpdate?.(({ editor, breakpoints }) => {
      if (!editor) return;
      this.setBreakpoints(editor, breakpoints);
    });
    return new Disposable(() => {
      this.cellsService = null;
      subscription?.dispose();
    });
  },

  provideMarkerLayer() {
    return {
      name: "jupyter-cells",
      description: "Jupyter cell markers",
      threshold: "marker-jupyter-cells.threshold",
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
