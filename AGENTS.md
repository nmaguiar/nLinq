# Repository Guidelines

## Project Structure & Module Organization

nLinq provides chainable JavaScript queries over arrays and objects for browsers and OpenAF.

- `src/nlinq.js`: shared query implementation.
- `src/openafsigil.js`: helpers bundled into the browser build.
- `src/openafnlinq.js`: OpenAF-only extensions injected during builds.
- `grammar/nlinq.pegjs`: PEG query grammar.
- `dist/`: generated browser, minified, OpenAF, and parser artifacts.
- `test/`: oJob tests, JSON fixtures, and browser experiments.
- `README.md` and `REFERENCE.md`: usage examples and API documentation.

## Build, Test, and Development Commands

Run commands from the repository root with OpenAF installed. The build declares the `PEG` oPack; the test suite declares `oJob-common`.

- `ojob build.yaml`: recreates `dist/`, builds both runtime variants and the parser, runs OpenAF tests, and minifies the browser bundle. **This deletes existing `dist/` contents**, so preserve unrelated local changes first. Minification invokes the remote `ojob.io/oaf/compile` job.
- `ojob test/nlinq-test.yaml nlinq=dist/openafnlinq.js test=test`: runs the main suite against an existing OpenAF build.
- `oaf -f test/gpu-test.js`: runs focused OpenAF GPU adapter checks against `dist/openafnlinq.js`.

CI uses `ojob build.yaml` for pushes and pull requests targeting `main`. There is no npm-based build configuration.

## Coding Style & Naming Conventions

Match surrounding JavaScript: four-space indentation, camelCase methods, and the existing mixture of `var`, functions, and arrow functions. YAML uses two-space nesting. Preserve public names such as `nLinq` and `$from`, chainability, and browser/OpenAF compatibility. Keep runtime-specific functionality in the OpenAF extension. No formatter or linter configuration is checked in; avoid unrelated formatting changes.

## Testing Guidelines

The main suite uses `oJobTest.yaml` and `ow.test.assert`. Add jobs named `Category::Behavior`, register them in `todo`, and follow neighboring dependency declarations. Cover changed behavior and edge cases; no numeric coverage threshold is configured. Inspect generated `nlinq-test.json` and `nlinq-test.md` for failures. GPU adapter checks use a stub and do not prove hardware execution. Rebuild before testing source changes against generated artifacts.

## Commit & Pull Request Guidelines

History includes `feat:`, `docs:`, and `chore:` prefixes alongside short imperative messages. Use a concise, descriptive subject. Pull requests should explain behavior changes, link relevant issues, and report validation commands and results. Update API documentation for public changes. Generate distribution files through the build, and review generated diffs before including them. Preserve unrelated local work and exclude incidental test-report changes.
