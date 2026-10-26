# Colors for All

![Colors for All](./assets/img/colors-for-all.png?raw=true 'Colors for All')

## What It Does

### WCAG

WCAG mode reports AA and AAA results using W3C contrast ratios. See the [WCAG 2.2 contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

### APCA

APCA reports signed Lc values to one decimal place. Positive values mean dark text on a light background; negative values mean light text on a dark background. Recommendations account for the selected size (12–120 CSS pixels) and weight (100–900).

A check indicates unrounded absolute Lc of at least 15, regardless of typography. It is not approval of text readability. A “No text” usage label means the selected typography has no qualifying text usage; Lc below 30 cannot qualify as text. Body, fluent, and large-text labels follow Bronze size/weight guidance. Spot-text minimums use the APCA font lookup table. Tooltips show a minimum size and numeric weight when a text recommendation is available. Very large bold text above Lc 90 receives an advisory warning, not an automatic failure.

APCA recommendations are not WCAG 2 AA/AAA conformance. The Help panel's APCA section explains typography assumptions, non-text limitations, and reference resources.

### APCA Library and License

Calculations use the unmodified [apca-w3](https://github.com/Myndex/apca-w3) 0.1.9 library (algorithm 0.0.98G-4g), by Andrew Somers / Myndex. Its [license](https://github.com/Myndex/apca-w3/blob/master/LICENSE.md) has requirements beyond this project's MIT license, including web-content-only use and keeping the implementation current. The full notice is included at `assets/apca-w3/LICENSE.md` and linked from Help. Before release, verify the latest compatible library version and integration requirements.
Help slides in from the right and closes with its header cross, Escape, or the backdrop,
using 500ms horizontal animations without changing the current page or matrix. It uses
the full viewport width on small screens and respects reduced-motion preferences.

APCA recommendations are not WCAG 2 conformance. Calculations use the unmodified
[apca-w3](https://github.com/Myndex/apca-w3) 0.1.9 library, algorithm 0.0.98G-4g,
by Andrew Somers / Myndex. Its [license](https://github.com/Myndex/apca-w3/blob/master/LICENSE.md)
has restrictions beyond this project's MIT license, including web-content-only use
and requirements to keep the implementation current. The full notice is distributed
at `assets/apca-w3/LICENSE.md` in the built application and linked from Help.
Before a release, verify the latest compatible library version and its integration requirements.

## Palette Editor

### Editing Colors

The create/edit dialog has synchronized **Color picker** and **JSON** tabs. Valid JSON updates the visual list; picker edits, reordering, duplication, deletion, and additions update JSON. Invalid drafts do not replace the last valid colors and disable saving. Cancel discards unsaved changes. A palette must contain at least one color.

Click a rectangular preview to open the integrated `vanilla-colorful` picker. It opens in HEX; RGB and HSL are available inside the picker window. Manual color input is normalized through `colorjs.io`. Palettes store opaque six-digit sRGB hex values; alpha colors are rejected rather than silently flattened.

### Color Names

Names are optional in both tabs. Legacy arrays such as `["#FFFFFF","#000000"]` remain valid. Named objects can be mixed with strings, for example `[{"hex":"#0C66E1","name":"Primary-60"},"#FFFFFF"]`.

Names follow colors through edits, reordering, duplication, saving, and reloading. Matrix headers show each name above its hex code. Storage retains `data: string[]` with an optional aligned `names: string[]`, so duplicate hex values can have distinct names.

### Downloading and Importing Palettes

**More options > Download** exports the current palette as formatted JSON compatible with the editor. It preserves color order and optional names. The filename is `<palette title>_<YY-MM-DD>.json`, using the browser's local date; invalid filename characters are replaced with underscores. Downloading does not modify the saved palette.

Use **Upload file** in the homepage header to import JSON. Selecting a file opens the creation dialog; a valid import replaces the colors and optional names in both List and JSON views. The title is inferred from the filename without its extension or export date suffix and receives focus. Invalid or empty files leave the draft unchanged. Imported changes are saved only after selecting **Save**.

### Built-in Palettes

The Default palette names come from [Design Factory, T1: Themes / Main](https://design-factory.amadeus.net/foundations/design-tokens/all-tokens) (checked 2026-10-16). Primary and Tip are chosen over their Info and Accent aliases. Primary-30 and Chromatic2-20 use `#9FC7FF` and `#FCC5F9`. Only unmodified historical Default palettes are upgraded automatically; their identifiers are preserved, and custom palettes or user-assigned names are not overwritten.

The built-in **Material** palette replaces **Google** and contains all 254 shades from [Material UI Colors](https://materialui.co/colors) (checked 2026-10-16). Names follow the reference families and shades, such as `Red-700`, `Indigo-600`, and `Green-A400`. Brown, Grey, and Blue Grey have no accent shades. Unchanged saved Google palettes are upgraded in place; customized or renamed palettes and existing user names are preserved.

## Export Accessible Colors

Choose **More options > Export accessible colors** to export only accessible combinations that match the selected contrast model and active filters. The export applies the same WCAG level or APCA usage filters as the matrix. In APCA Text mode, “No text” combinations are excluded; Non-text mode follows its selected usage filters.

Exports are available as JSON, XLS, CSV, TXT, or PDF. XLS, PDF, and TXT each include one pipe-delimited header row with the palette, model, relevant APCA mode and typography, selected filters, and result count. PDF rows include background and text color previews. Filenames follow `<palette>_accessible_combination_<YYYYMMDD_HHMMSS>.<extension>`.

## Help Panel

The Help panel contains the APCA typography rules, WCAG reference table, non-text limitations, and resource links. It opens from the right without changing the current page or matrix. Close it with the header button, Escape, or the backdrop. On small screens it uses the full viewport width and respects reduced-motion preferences.

## Development

### Install and Run

```sh
npm install
npm start
```

The development server is available at `http://localhost:4200/` and reloads when source files change.

### Build and Test

```sh
npm run build
npm run test:contrast
```

The contrast test configuration runs the focused WCAG/APCA and palette-editor regression tests in headless Chrome using Angular 17's test bootstrap. The legacy `npm test` suite uses a separate configuration. Run `npm run e2e` for end-to-end tests.

For Angular CLI help, run `ng help` or consult the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Contact

Jean-Pierre Boutherin (jean-pierre.boutherin@amadeus.com)
