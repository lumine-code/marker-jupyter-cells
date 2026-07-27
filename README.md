# marker-jupyter-repl

Show cell markers on the scrollbar and minimap.

A marker layer for [scrollmap](https://github.com/lumine-code/scrollmap) and [minimap](https://github.com/lumine-code/minimap) that renders the code-cell boundaries tracked by [jupyter-repl](https://github.com/lumine-code/jupyter-repl).

## Features

- **Cell markers**: shows jupyter-repl cell boundaries on every overview map.
- **Live updates**: follows cell-marker changes as the buffer is edited.
- **Threshold**: optionally hide all markers when the cell count gets too large.

## Installation

To install `marker-jupyter-repl` search for _marker-jupyter-repl_ in the Install pane of the Lumine settings or run `lumine --install lumine-code/marker-jupyter-repl`.

## Customization

The style can be adjusted in the `styles.less` file, e.g. recolor the cell markers:

```less
.marker.marker-jupyter-repl {
  background-color: var(--text-color-info);
}
```

## Services

- **[jupyter.breakpoints](https://lumine-code.github.io/docs.html#services/jupyter.breakpoints)** (`^1.0.0`): consumed to read the cell boundary positions of an editor and follow their updates.
- **[marker.layer](https://lumine-code.github.io/docs.html#services/marker.layer)** (`1.0.0`): provided to register the `jupyter-repl` marker layer drawn by the overview maps.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
