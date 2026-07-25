# scrollmap-jove-repl

Show cell markers on the scrollbar.

A layer package for [scrollmap](https://github.com/lumine-code/scrollmap) that renders the code-cell boundaries tracked by [jove-repl](https://github.com/lumine-code/jove-repl).

## Features

- **Cell markers**: shows jove-repl cell boundaries as scrollbar markers.
- **Live updates**: follows cell-marker changes as the buffer is edited.
- **Threshold**: optionally hide all markers when the cell count gets too large.

## Installation

To install `scrollmap-jove-repl` search for _scrollmap-jove-repl_ in the Install pane of the Lumine settings or run `lumine --install lumine-code/scrollmap-jove-repl`.

## Customization

The style can be adjusted in the `styles.less` file, e.g. recolor the cell markers:

```less
.scrollmap .marker.marker-jove-repl {
  background-color: var(--text-color-info);
}
```

## Services

- **jove.breakpoints** (`^1.0.0`): consumed to read the cell boundary positions of an editor and follow their updates.
- **scrollmap** (`1.0.0`): provided to register the `jove-repl` marker layer rendered on the editor scrollbar.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
