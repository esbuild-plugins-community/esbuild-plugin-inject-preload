## @espcom/esbuild-plugin-inject-preload

[![npm](https://img.shields.io/npm/v/@espcom/esbuild-plugin-inject-preload)](https://www.npmjs.com/package/@espcom/esbuild-plugin-inject-preload)
![coverage](https://github.com/esbuild-plugins-community/esbuild-plugin-inject-preload/blob/main/assets/coverage.svg)
![size-esm](https://github.com/esbuild-plugins-community/esbuild-plugin-inject-preload/blob/main/assets/esm.svg)
![size-cjs](https://github.com/esbuild-plugins-community/esbuild-plugin-inject-preload/blob/main/assets/cjs.svg)

This is an esbuild plugin designed to inject links into HTML templates. It processes
output files from esbuild, and allows to insert these links into specific placeholders within 
an HTML file based on a given template and options.

## Features

- Supports both ESM and CJS environments
- Works across all platforms (Linux, Windows, etc.)
- Works in watch mode and with any configuration of `entryNames`, `assetNames` and `publicPath`

## Installation

To install the plugin, run the following command:

```bash
npm install @espcom/esbuild-plugin-inject-preload --save-dev
```

## Usage

To use the plugin, add it to the `plugins` array in your esbuild configuration.

### Example

```js
import { pluginInjectPreload } from '@espcom/esbuild-plugin-inject-preload';

esbuild.build({
  entryPoints: ['src/entry.ts'],
  bundle: true,
  outdir: 'dist', // Required by the plugin
  metafile: true, // Required by the plugin
  plugins: [
    pluginInjectPreload([
      {
        templatePath: path.resolve('dist/template.html'),
        replace: '<!-- FONT_PRELOAD --><!-- /FONT_PRELOAD -->',
        as(filePath) {
          if (filePath.endsWith('.woff2') || filePath.endsWith('.woff')) {
            return `<link as="font" crossorigin="anonymous" href="${filePath}" rel="preload">`;
          }
        },
      },
      {
        templatePath: path.resolve('dist/template.html'),
        replace: '<!-- ENTRY_SCRIPT --><!-- /ENTRY_SCRIPT -->',
        as(filePath) {
          if (/entry([^.]+)?\.js/.test(filePath)) {
            return `<script src="${filePath}" defer=""></script>`;
          }
        },
      },
    ])
  ]
});
```

So, the resulting HTML file will contain smth. like

```html
<!-- FONT_PRELOAD -->
<link as="font" crossorigin="anonymous" href="dist/Roboto-Regular.woff" rel="preload">
<link as="font" crossorigin="anonymous" href="dist/Roboto-Medium.woff2" rel="preload">
<!-- /FONT_PRELOAD -->
<!-- ENTRY_SCRIPT -->
<script src="dist/entry.js" defer=""></script>
<!-- /ENTRY_SCRIPT -->
```

### Options

The plugin accepts an array of options. Each option object must contain the following properties:

- `templatePath` (string): Path to the HTML template file where the links should be injected.
- `replace` (string): The placeholder in the template to be replaced by the links. 
It must be a closed HTML comment, e.g., `<!-- preload-links --><!-- /preload-links -->`.
- `as` (function): A function that takes a file path as an argument and returns 
the corresponding HTML element as a string.

### Important Notes

- The `metafile` and `outdir` options in the esbuild configuration must be set 
for the plugin to function correctly.
- The template file should be present, this plugin does not copy it. So use smth. like
`esbuild-copy-plugin` before this plugin

## Alternatives

Currently, there are no alternatives for injecting preloading links. 
However, there is a plugin 
called [esbuild-plugin-html](https://github.com/craftamap/esbuild-plugin-html) that allows 
for injecting entry point scripts. In most cases, using `@espcom/esbuild-plugin-inject-preload` 
is sufficient. Nevertheless, the `esbuild-plugin-html` plugin offers powerful options 
such as `findRelatedCssFiles`, `findRelatedOutputFiles`, and `inline`, making it a better 
choice for complex projects. Notably, `@espcom/esbuild-plugin-inject-preload` is fully 
compatible with `esbuild-plugin-html` if placed after it in the plugins list.
