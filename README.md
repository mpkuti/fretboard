# fretboard

This is a guitar fretboard. It has been drawn using [D3.js](https://d3js.org/).

[https://mpkuti.github.io/fretboard/](https://mpkuti.github.io/fretboard/)

## Code Style / Naming

- UPPER_SNAKE_CASE: Immutable exported constants, limits, maps (e.g. `MIN_FRETS`, `HIGHLIGHT_MODE_INTERVAL_MAP`, `NOTES`).
- camelCase: Functions, runtime or derived mutable values (`zoomLevel`, `fretScale`).
- DEFAULTS object centralizes persisted default values.
- STORAGE_KEYS holds the localStorage key names; all persisted settings are JSON serialized.
- Musical data arrays renamed to `NOTES`, `INTERVALS`, `STRING_TUNING`; previous lowercase names deprecated.

## Run / Serve

This project is a static site. Because it uses JavaScript modules, it should be served over HTTP rather than opened directly with `file://`.

### Simple local serving options

If you have Python installed:

```bash
python3 -m http.server 8000
```

Then open:

- [http://localhost:8000/](http://localhost:8000/)

If you have Node.js installed, you can also use a small static server such as `serve`:

```bash
npx serve .
```

### Deployment notes

- No build step is required.
- Any basic static host should work (for example GitHub Pages, Netlify, or a simple web server).
- The app currently loads D3 from a remote CDN, so internet access is required for that dependency.
