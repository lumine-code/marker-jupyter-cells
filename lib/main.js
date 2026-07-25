const { CompositeDisposable, Disposable } = require("atom");

module.exports = {
  activate() {
    this.disposables = new CompositeDisposable(
      atom.config.observe("scrollmap-jove-repl.threshold", (value) => {
        this.threshold = value;
      }),
    );
    this.joveService = null;
    // Layers handed over by the scrollmap hub, keyed by editor.
    this.layers = new Map();
  },

  deactivate() {
    this.joveService = null;
    this.layers.clear();
    this.disposables.dispose();
  },

  breakpoints(editor) {
    if (!this.joveService) {
      return [];
    }
    return this.joveService.initBreakpoints?.(editor) || [];
  },

  consumeJoveService(joveService) {
    this.joveService = joveService;
    // Update existing editors
    for (const [editor, layer] of this.layers) {
      layer.cache.set("data", this.breakpoints(editor));
      layer.update();
    }
    let subscription = joveService.onDidUpdate?.(({ editor, breakpoints }) => {
      const layer = editor ? this.layers.get(editor) : null;
      if (!layer) return;
      layer.cache.set("data", breakpoints);
      layer.update();
    });
    return new Disposable(() => {
      this.joveService = null;
      subscription?.dispose();
    });
  },

  provideScrollmap() {
    return {
      name: "jove-repl",
      description: "Jove REPL cell markers",
      initialize: (layer) => {
        this.layers.set(layer.editor, layer);
        layer.cache.set("data", this.breakpoints(layer.editor));
        layer.disposables.add(
          new Disposable(() => this.layers.delete(layer.editor)),
          atom.config.onDidChange("scrollmap-jove-repl.threshold", layer.update),
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
