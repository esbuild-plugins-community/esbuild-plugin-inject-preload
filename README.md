## @espcom/esbuild-plugin-inject-preload

[![npm](https://img.shields.io/npm/v/@espcom/esbuild-plugin-inject-preload)](https://www.npmjs.com/package/@espcom/esbuild-plugin-inject-preload)
![coverage](https://github.com/esbuild-plugins-community/esbuild-plugin-inject-preload/blob/main/assets/coverage.svg)
![size-esm](https://github.com/esbuild-plugins-community/esbuild-plugin-inject-preload/blob/main/assets/esm.svg)
![size-cjs](https://github.com/esbuild-plugins-community/esbuild-plugin-inject-preload/blob/main/assets/cjs.svg)

Injects preload links to html template.

### Usage

```typescript
import { BuildOptions } from 'esbuild';
import { pluginInjectPreload } from '@espcom/esbuild-plugin-inject-preload';

const esbuildConfig: BuildOptions = {
  assetNames: '[ext]/[name]' | '[name]', // optional, this plugin supports nested folders
  outdir: path.resolve('build'), // required
  metafile: true, // required
  plugins: [
    pluginInjectPreload({ 
      ext: '.woff',
      linkType: 'font',
      templatePath: path.resolve('build/template.html'),
      replaceString: '<!-- FONT_PRELOAD -->',
    }),
  ],
};
```

You should place some string into you html like `<!-- FONT_PRELOAD -->` in the example. So, the output
html file will contain links to all files with a certain extension, like:

```html
<link as="font" crossorigin="anonymous" href="/woff/Roboto-Regular.woff" rel="preload">
<link as="font" crossorigin="anonymous" href="/woff/Roboto-Medium.woff" rel="preload">
```
