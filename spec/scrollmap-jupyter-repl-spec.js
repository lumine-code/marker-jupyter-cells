const { CompositeDisposable, Emitter, Point } = require("atom");

describe("scrollmap-jupyter-repl", () => {
  let workspaceElement, editor, mainModule;

  beforeEach(async () => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
    editor = await atom.workspace.open();
    editor.setText(Array(30).fill("lorem ipsum").join("\n"));
    const pack = await atom.packages.activatePackage("scrollmap-jupyter-repl");
    mainModule = pack.mainModule;
  });

  function createJupyterService(breakpointsByEditor) {
    const emitter = new Emitter();
    return {
      emitter,
      getBreakpoints: (serviceEditor) => breakpointsByEditor.get(serviceEditor) || [],
      initBreakpoints: (serviceEditor) => breakpointsByEditor.get(serviceEditor) || [],
      onDidUpdate: (callback) => emitter.on("did-update", callback),
    };
  }

  function createLayer(layerEditor) {
    const layer = {
      editor: layerEditor,
      cache: new Map(),
      disposables: new CompositeDisposable(),
      update: jasmine.createSpy("update"),
    };
    // Register through the provider contract, exactly like the scrollmap hub.
    mainModule.provideScrollmapLayer().initialize(layer);
    return layer;
  }

  describe("activation", () => {
    it("activates", () => {
      expect(atom.packages.isPackageActive("scrollmap-jupyter-repl")).toBe(true);
    });
  });

  describe("jupyter.breakpoints service consumer", () => {
    it("returns no breakpoints when no service is consumed", () => {
      expect(mainModule.breakpoints(editor)).toEqual([]);
    });

    it("reads initial breakpoints from the consumed service", () => {
      const points = [new Point(2, 0), new Point(10, 0)];
      const service = createJupyterService(new Map([[editor, points]]));
      const disposable = mainModule.consumeJupyterBreakpoints(service);

      expect(mainModule.breakpoints(editor)).toEqual(points);

      disposable.dispose();
    });

    it("seeds existing jupyter-repl layers on consumption", () => {
      const points = [new Point(4, 0)];
      const layer = createLayer(editor);

      const service = createJupyterService(new Map([[editor, points]]));
      const disposable = mainModule.consumeJupyterBreakpoints(service);

      expect(layer.cache.get("data")).toEqual(points);
      expect(layer.update).toHaveBeenCalled();

      layer.disposables.dispose();
      disposable.dispose();
    });

    it("pushes fresh breakpoints into the layer on service updates", () => {
      const layer = createLayer(editor);

      const service = createJupyterService(new Map());
      const disposable = mainModule.consumeJupyterBreakpoints(service);
      layer.update.calls.reset();

      const breakpoints = [new Point(7, 0), new Point(15, 0)];
      service.emitter.emit("did-update", { editor, breakpoints });

      expect(layer.cache.get("data")).toEqual(breakpoints);
      expect(layer.update).toHaveBeenCalled();

      layer.disposables.dispose();
      disposable.dispose();
    });

    it("detaches the service on disposal", () => {
      const service = createJupyterService(new Map([[editor, [new Point(1, 0)]]]));
      const disposable = mainModule.consumeJupyterBreakpoints(service);
      expect(mainModule.jupyterService).toBe(service);

      disposable.dispose();
      expect(mainModule.jupyterService).toBe(null);
      expect(mainModule.breakpoints(editor)).toEqual([]);
    });
  });

  describe("scrollmap service provider", () => {
    let provider;

    beforeEach(() => {
      provider = mainModule.provideScrollmapLayer();
    });

    it("describes the jupyter-repl layer", () => {
      expect(provider.name).toBe("jupyter-repl");
      expect(provider.threshold).toBe("scrollmap-jupyter-repl.threshold");
      expect(typeof provider.initialize).toBe("function");
      expect(typeof provider.getItems).toBe("function");
    });

    it("seeds the cache with current breakpoints on initialize", () => {
      const points = [new Point(3, 0)];
      const service = createJupyterService(new Map([[editor, points]]));
      const disposable = mainModule.consumeJupyterBreakpoints(service);

      const layer = createLayer(editor);
      provider.initialize(layer);
      expect(layer.cache.get("data")).toEqual(points);

      layer.disposables.dispose();
      disposable.dispose();
    });

    it("maps breakpoints to marker rows", () => {
      const layer = createLayer(editor);
      layer.cache.set("data", [new Point(2, 0), new Point(12, 0)]);

      expect(provider.getItems(layer)).toEqual([{ row: 2 }, { row: 12 }]);
    });

    it("returns no items without cached data", () => {
      const layer = createLayer(editor);
      expect(provider.getItems(layer)).toEqual([]);
    });
  });
});
