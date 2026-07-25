const { CompositeDisposable, Disposable } = require("atom");

module.exports = {
  activate() {
    this.disposables = new CompositeDisposable(
      atom.config.observe("scrollmap-jupyter-repl.threshold", (value) => {
        this.threshold = value;
      }),
    );
    this.jupyterService = null;
    // Layers handed over by the scrollmap hub, keyed by editor.
    this.layers = new Map();
  },

  deactivate() {
    this.jupyterService = null;
    this.layers.clear();
    this.disposables.dispose();
  },

  breakpoints(editor) {
    if (!this.jupyterService) {
      return [];
    }
    return this.jupyterService.initBreakpoints?.(editor) || [];
  },

  consumeJupyterService(jupyterService) {
    this.jupyterService = jupyterService;
    // Update existing editors
    for (const [editor, layer] of this.layers) {
      layer.cache.set("data", this.breakpoints(editor));
      layer.update();
    }
    let subscription = jupyterService.onDidUpdate?.(({ editor, breakpoints }) => {
      const layer = editor ? this.layers.get(editor) : null;
      if (!layer) return;
      layer.cache.set("data", breakpoints);
      layer.update();
    });
    return new Disposable(() => {
      this.jupyterService = null;
      subscription?.dispose();
    });
  },

  provideScrollmap() {
    return {
      name: "jupyter-repl",
      description: "Jupyter REPL cell markers",
      initialize: (layer) => {
        this.layers.set(layer.editor, layer);
        layer.cache.set("data", this.breakpoints(layer.editor));
        layer.disposables.add(
          new Disposable(() => this.layers.delete(layer.editor)),
          atom.config.onDidChange("scrollmap-jupyter-repl.threshold", layer.update),
        );
      },
      getItems: ({ editor, cache }) => {
        const data = cache.get("data") || [];
        if (this.threshold && data.length > this.threshold) {
          return [];
        }
        return data.map((breakpoint) => ({
          row: editor.screenPositionForBufferPosition(breakpoint).row,
        }));
      },
    };
  },
};
