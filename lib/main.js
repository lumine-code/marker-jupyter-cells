const { CompositeDisposable, Disposable } = require("atom");

module.exports = {
  activate() {
    this.disposables = new CompositeDisposable(
      atom.config.observe("scrollmap-jove-repl.threshold", (value) => {
        this.threshold = value;
      }),
    );
    this.joveService = null;
  },

  deactivate() {
    this.joveService = null;
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
    for (const editor of atom.workspace.getTextEditors()) {
      const layer = editor?.scrollmap?.layers.get("jove-repl");
      if (!layer) continue;
      layer.cache.set("data", this.breakpoints(editor));
      layer.update();
    }
    let subscription = joveService.onDidUpdate?.(({ editor, breakpoints }) => {
      const layer = editor?.scrollmap?.layers.get("jove-repl");
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
      initialize: ({ cache, editor, disposables, update }) => {
        cache.set("data", this.breakpoints(editor));
        disposables.add(atom.config.onDidChange("scrollmap-jove-repl.threshold", update));
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
