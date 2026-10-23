# Colors for all

![Alt text](./assets/img/colors-for-all.png?raw=true 'Colors for all')

## What is Colors-for-all?

Colors-for-all enables you to easily check color contrasts and WCAG compliance (AA or AAA levels as defined by W3C) between specific colors in one shot ! This online application is available for UX/UI designers or any other people involved in digital accessibility.

Try it now!

[![Alt text](./assets/img/button.png?raw=true 'Colors for all')](https://AmadeusITGroup.github.io/Colors-for-All/)

## Features

You can perform the following actions for each palette :

- create
- Export accessible combinations
- edit
- duplicate
- delete
- save locally

There is no limit in the number of colors for each palette.

The application generates automatically a matrix (same colors horizontally and vertically) from this palette. Each cell of the matrix is the combination between 2 colors (foreground/background). The ratio and WCAG level is automatically computed and displayed for each combination. All accessible combinations (AA or AAA) are visually highlighted.

Thanks to this tool, you can wisely choose the best combinations of colors (foreground/background) to use in your own projects. This helps you design more “accessible” products.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.1.

## Contrast Models

The palette detail header offers WCAG and APCA modes. APCA is the default; the
selected mode is remembered locally without changing saved palette colors.
APCA cells show signed Lc values to one decimal place and a typography-aware recommendation
for the selected size (12–120 CSS px) and weight (100–900). Rows are backgrounds and
columns are text colors. A check indicates absolute Lc is at least 15, independently
of typography; a cross and faded sample indicate lower contrast. WCAG retains its AA/AAA results.
The accessible-combination count follows the selected mode; swapping foreground and background counts separately.
The Lc value uses the selected size and weight. A check is not text-readability approval:
the usage label is "No text" when the selected typography qualifies for no text category.
Tooltips show minimum sizes and the numeric weight when the selected typography has no text usage,
when a text recommendation exists.
Body, fluent, and large-text usage labels follow Bronze size/weight guidance, not Lc alone.
Spot-text fallback minimums come from the APCA font lookup table; Lc below 30 cannot pass as text.
Very large bold text above Lc 90 receives an advisory tooltip warning, not an automatic failure.
The Help side panel's APCA section provides the typography rules, non-text limitations, and resource links.
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

The edit/create dialog opens on **Color picker**, followed by **JSON**. Both views
share one palette: valid JSON immediately refreshes the color list; picker edits,
drag/drop, up/down moves, duplicates, deletions, and additions update JSON immediately.
Invalid drafts disable saving and do not overwrite the last valid colors. Cancel
discards unsaved edits. A palette must contain at least one color.

Color names are optional in both views. Legacy arrays such as `["#FFFFFF","#000000"]`
remain valid; mix named entries with strings, for example
`[{"hex":"#0C66E1","name":"Primary-60"},"#FFFFFF"]`.
Names follow colors through edits, reordering, duplication, saving, and reloading.
Matrix row and column headers show the name above the hex code using the same styling.
Palette storage retains the compatible `data: string[]` with optional aligned `names: string[]`,
so identical hex values may have different names.

The matrix's **More options > Download** action exports the current palette as
formatted JSON, compatible with the editor, preserving color order and optional names.
The filename is `<palette title>_<YY-MM-DD>.json`, using the browser's local date;
invalid filename characters are replaced with underscores. Downloading does not
modify the saved palette.

**More options > Export accessible colors** exports the combinations that
pass the active contrast mode and filters as JSON, XLS, CSV, TXT, or PDF. PDF
rows include small background and text color previews. Export filenames follow
`<palette>_accessible_combination_<YYYYMMDD_HHMMSS>.<extension>`.

Use **Upload file** in the homepage header, to the left of **Create**, to load an
exported JSON file:
selecting a file opens the creation dialog and uses the same import workflow.
A valid import replaces all colors and optional names in both List and JSON views.
The title inherits the filename without the JSON extension or export date suffix,
and receives focus for editing. If no title can be inferred, the current title is kept.
Invalid or empty files leave the current draft intact.
Imported changes are only persisted after **Save**.

The Default palette names come from [Design Factory, T1: Themes / Main](https://design-factory.amadeus.net/foundations/design-tokens/all-tokens)
(checked 2026-10-16). Primary and Tip are chosen over their Info and Accent aliases.
Primary-30 and Chromatic2-20 use the reference values `#9FC7FF` and `#FCC5F9`.
Only unmodified historical Default palettes are upgraded automatically, preserving their
identifiers; custom palettes and user-assigned names are not overwritten.

The built-in **Material** palette replaces **Google** and includes all 254 shades
from [Material UI Colors](https://materialui.co/colors) (checked 2026-10-16).
Names follow the reference families and shades, such as `Red-700`, `Indigo-600`,
and `Green-A400`. Brown, Grey, and Blue Grey have no accent shades.
Unchanged saved Google palettes are upgraded in place, retaining their IDs;
customized or renamed palettes and existing user names are left untouched.

Click a rectangular preview to open the integrated `vanilla-colorful` picker.
Every opening starts in HEX; RGB and HSL can be selected within the picker window.
The list has no separate mode or channel editor. Manual color input is normalized through `colorjs.io` and storage
remains opaque six-digit sRGB hex. Alpha colors are rejected rather than silently flattened.
Vertical matrix headers size themselves to their full labels rather than a fixed height,
so short names use less space and longer names are not truncated.

Run `npm run test:contrast` for the focused WCAG/APCA and palette-editor regression tests in headless Chrome.
This configuration uses Angular 17's test bootstrap independently of the legacy test suite.

## Installation

Clone project and got to project repository

Run `npm install`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Contact

Jean-Pierre Boutherin (jean-pierre.boutherin@amadeus.com)
