# fretboard

This is a guitar fretboard. It has been drawn using [D3.js](https://d3js.org/).

[https://mpkuti.github.io/fretboard/](https://mpkuti.github.io/fretboard/)

## Code Style / Naming

- UPPER_SNAKE_CASE: Immutable exported constants, limits, maps (e.g. `MIN_FRETS`, `HIGHLIGHT_MODE_INTERVAL_MAP`, `NOTES`).
- camelCase: Functions, runtime or derived mutable values (`zoomLevel`, `fretScale`).
- DEFAULTS object centralizes persisted default values.
- STORAGE_KEYS holds the localStorage key names; all persisted settings are JSON serialized.
- Musical data arrays renamed to `NOTES`, `INTERVALS`, `STRING_TUNING`; previous lowercase names deprecated.
