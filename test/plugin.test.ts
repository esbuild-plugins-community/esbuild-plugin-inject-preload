import * as fs from 'node:fs';
import * as path from 'node:path';
import * as assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { build, BuildOptions, context } from 'esbuild';

import { pluginInjectPreload } from '../src/index.js';

const getLink = (filePath: string) => {
  return `<link as="font" crossorigin="anonymous" href="${filePath}" rel="preload">`;
};

const getScriptLink = (filePath: string) => {
  return `<script src="${filePath}" defer=""></script>`;
};

void describe('Plugin test', async () => {
  const templatePathRes = path.resolve('test/res/template.html');
  const templatePathTemp = path.resolve('test/tmp/template.html');
  const oldContent = fs.readFileSync(templatePathRes, 'utf8');

  const getResult = (scripts: Array<string>, woff: Array<string>, ttf: Array<string>) => {
    return oldContent
      .replace(
        '<!-- ENTRY_SCRIPT --><!-- /ENTRY_SCRIPT -->',
        `<!-- ENTRY_SCRIPT -->${scripts.map(getScriptLink).join('')}<!-- /ENTRY_SCRIPT -->`
      )
      .replace(
        '<!-- FONT_PRELOAD --><!-- /FONT_PRELOAD -->',
        `<!-- FONT_PRELOAD -->${woff.map(getLink).join('')}<!-- /FONT_PRELOAD -->`
      )
      .replace(
        '<!-- FONT_PRELOAD2 --><!-- /FONT_PRELOAD2 -->',
        `<!-- FONT_PRELOAD2 -->${ttf.map(getLink).join('')}<!-- /FONT_PRELOAD2 -->`
      );
  };

  const getConfig = (): BuildOptions => ({
    entryPoints: [path.resolve('test/res/entry.ts')],
    bundle: true,
    format: 'iife',
    logLevel: 'silent',
    write: false,
    metafile: true,
    outdir: path.resolve('test/tmp'),
    target: 'node18',
    platform: 'node',
    packages: 'external',
    resolveExtensions: ['.ts'],
    loader: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.woff': 'file',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.woff2': 'file',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.ttf': 'file',
    },
    plugins: [
      pluginInjectPreload([
        {
          templatePath: templatePathTemp,
          replace: '<!-- ENTRY_SCRIPT --><!-- /ENTRY_SCRIPT -->',
          // eslint-disable-next-line consistent-return
          as(filePath) {
            if (/entry([^.]+)?\.js/.test(filePath)) {
              return getScriptLink(filePath);
            }
          },
        },
        {
          templatePath: templatePathTemp,
          replace: '<!-- FONT_PRELOAD --><!-- /FONT_PRELOAD -->',
          // eslint-disable-next-line consistent-return
          as(filePath) {
            if (filePath.endsWith('.woff2') || filePath.endsWith('.woff')) {
              return getLink(filePath);
            }
          },
        },
        {
          templatePath: templatePathTemp,
          replace: '<!-- FONT_PRELOAD2 --><!-- /FONT_PRELOAD2 -->',
          // eslint-disable-next-line consistent-return
          as(filePath) {
            if (filePath.endsWith('.ttf')) {
              return getLink(filePath);
            }
          },
        },
      ]),
    ],
  });

  beforeEach(() => {
    fs.cpSync(templatePathRes, templatePathTemp);
  });

  afterEach(() => {
    fs.unlinkSync(templatePathTemp);
    fs.writeFileSync(
      path.resolve('test/res/entry.ts'),
      `import './global.css';

export const test = 1;
`,
      'utf-8'
    );
  });

  await it('Check without assets hash', async () => {
    await build({
      ...getConfig(),
      entryNames: '[name]',
      assetNames: '[name]',
    });

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['entry.js'],
        [
          'Inter-Regular.woff2',
          'Inter-Medium.woff2',
          'Roboto-Regular-webfont.woff',
          'Roboto-Medium-webfont.woff',
        ],
        ['Roboto-Regular-webfont.ttf', 'Roboto-Medium-webfont.ttf']
      )
    );
  });

  await it('Check with dynamic folder', async () => {
    await build({
      ...getConfig(),
      entryNames: '[ext]/[name]',
      assetNames: '[ext]/[name]',
    });

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['js/entry.js'],
        [
          'woff2/Inter-Regular.woff2',
          'woff2/Inter-Medium.woff2',
          'woff/Roboto-Regular-webfont.woff',
          'woff/Roboto-Medium-webfont.woff',
        ],
        ['ttf/Roboto-Regular-webfont.ttf', 'ttf/Roboto-Medium-webfont.ttf']
      )
    );
  });

  await it('Check with assets hash', async () => {
    await build({
      ...getConfig(),
      entryNames: '[ext]/[name]-[hash]',
      assetNames: '[ext]/[name]-[hash]',
    });

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['js/entry-DFRBPFO5.js'],
        [
          'woff2/Inter-Regular-2CAK4GH5.woff2',
          'woff2/Inter-Medium-EQWQJPXY.woff2',
          'woff/Roboto-Regular-webfont-2R5R5RCH.woff',
          'woff/Roboto-Medium-webfont-BL2D4F4R.woff',
        ],
        ['ttf/Roboto-Regular-webfont-IGXAQO5Y.ttf', 'ttf/Roboto-Medium-webfont-P7RET3M3.ttf']
      )
    );
  });

  await it('Check with relative outdir', async () => {
    await build({
      ...getConfig(),
      entryNames: '[ext]/[name]-[hash]',
      assetNames: '[ext]/[name]-[hash]',
      outdir: './test/tmp',
    });

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['js/entry-DFRBPFO5.js'],
        [
          'woff2/Inter-Regular-2CAK4GH5.woff2',
          'woff2/Inter-Medium-EQWQJPXY.woff2',
          'woff/Roboto-Regular-webfont-2R5R5RCH.woff',
          'woff/Roboto-Medium-webfont-BL2D4F4R.woff',
        ],
        ['ttf/Roboto-Regular-webfont-IGXAQO5Y.ttf', 'ttf/Roboto-Medium-webfont-P7RET3M3.ttf']
      )
    );
  });

  await it('Check with publicPath', async () => {
    await build({
      ...getConfig(),
      entryNames: '[ext]/[name]-[hash]',
      assetNames: '[ext]/[name]-[hash]',
      publicPath: '/static/',
    });

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['/static/js/entry-43Y4EPON.js'],
        [
          '/static/woff2/Inter-Regular-2CAK4GH5.woff2',
          '/static/woff2/Inter-Medium-EQWQJPXY.woff2',
          '/static/woff/Roboto-Regular-webfont-2R5R5RCH.woff',
          '/static/woff/Roboto-Medium-webfont-BL2D4F4R.woff',
        ],
        [
          '/static/ttf/Roboto-Regular-webfont-IGXAQO5Y.ttf',
          '/static/ttf/Roboto-Medium-webfont-P7RET3M3.ttf',
        ]
      )
    );
  });

  await it('Check with publicPath no trailing slash', async () => {
    await build({
      ...getConfig(),
      entryNames: '[ext]/[name]-[hash]',
      assetNames: '[ext]/[name]-[hash]',
      publicPath: '/static',
    });

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['/static/js/entry-AOUHOEB7.js'],
        [
          '/static/woff2/Inter-Regular-2CAK4GH5.woff2',
          '/static/woff2/Inter-Medium-EQWQJPXY.woff2',
          '/static/woff/Roboto-Regular-webfont-2R5R5RCH.woff',
          '/static/woff/Roboto-Medium-webfont-BL2D4F4R.woff',
        ],
        [
          '/static/ttf/Roboto-Regular-webfont-IGXAQO5Y.ttf',
          '/static/ttf/Roboto-Medium-webfont-P7RET3M3.ttf',
        ]
      )
    );
  });

  await it('Check replace on rebuild', async () => {
    const ctx = await context({
      ...getConfig(),
      entryNames: '[name]',
      assetNames: '[name]',
    });

    await ctx.rebuild();

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['entry.js'],
        [
          'Inter-Regular.woff2',
          'Inter-Medium.woff2',
          'Roboto-Regular-webfont.woff',
          'Roboto-Medium-webfont.woff',
        ],
        ['Roboto-Regular-webfont.ttf', 'Roboto-Medium-webfont.ttf']
      )
    );

    fs.writeFileSync(
      path.resolve('test/res/entry.ts'),
      `import './global2.css';

  export const test = 1;
  `,
      'utf-8'
    );

    await ctx.rebuild();

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['entry.js'],
        ['Inter-Regular.woff2', 'Roboto-Regular-webfont.woff'],
        ['Roboto-Regular-webfont.ttf']
      )
    );

    fs.writeFileSync(
      path.resolve('test/res/entry.ts'),
      `import './global3.css';

  export const test = 1;
  `,
      'utf-8'
    );

    await ctx.rebuild();

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(['entry.js'], ['Inter-Regular.woff2'], [])
    );

    fs.writeFileSync(
      path.resolve('test/res/entry.ts'),
      `import './global.css';

  export const test = 1;
  `,
      'utf-8'
    );

    await ctx.rebuild();

    assert.equal(
      fs.readFileSync(templatePathTemp, 'utf8'),
      getResult(
        ['entry.js'],
        [
          'Inter-Regular.woff2',
          'Inter-Medium.woff2',
          'Roboto-Regular-webfont.woff',
          'Roboto-Medium-webfont.woff',
        ],
        ['Roboto-Regular-webfont.ttf', 'Roboto-Medium-webfont.ttf']
      )
    );

    await ctx.dispose();
  });
});
