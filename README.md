# marker-jupyter-cells

> [!WARNING]
> **This package is deprecated.** Its marker layer now ships with [jupyter-cells](https://github.com/lumine-code/jupyter-cells) itself — the marker-* adapter packages were folded into their host packages, and this layer's settings moved to `jupyter-cells.marker.*`. This repository is archived and no longer maintained.

Show cell markers on the scrollbar and minimap.

A marker layer for [scrollmap](https://github.com/lumine-code/scrollmap) and [minimap](https://github.com/lumine-code/minimap) that renders the code-cell boundaries tracked by [jupyter-cells](https://github.com/lumine-code/jupyter-cells).

## Features

- **Cell markers**: shows `# %%` cell boundaries on every overview map.
- **Live updates**: follows cell-marker changes as the buffer is edited.
- **Threshold**: optionally hide all markers when the cell count gets too large.

## Installation

To install `marker-jupyter-cells` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/marker-jupyter-cells`.

## Customization

The style can be adjusted in the `styles.css` file, e.g. recolor the cell markers:

```css
.marker.marker-jupyter-cells {
  background-color: var(--text-color-info);
}
```

## Services

- `jupyter.cells`: consumed to read the cell boundary positions of an editor and follow their updates.
- `marker.layer`: provided to register the `jupyter-cells` marker layer drawn by the overview maps.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
