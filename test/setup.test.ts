import * as path from 'node:path';
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { build, BuildOptions } from 'esbuild';

import { validateResult } from '../src/validators/validateResult.js';
import { validateSetup } from '../src/validators/validateSetup.js';
import { pluginInjectPreload } from '../src/index.js';

const nonObjects = [0, true, null, '', [], () => false];
const nonTrue = [0, false, null, '', [], () => false, {}];
const nonFullString = [0, false, null, '', [], () => false, {}, true];

void describe('Validate setup', async () => {
  const config: BuildOptions = {
    entryPoints: [path.resolve('test/res/entry.ts')],
    bundle: true,
    format: 'iife',
    logLevel: 'silent',
    outdir: '1',
    write: false,
    metafile: true,
    target: 'node18',
    platform: 'node',
    packages: 'external',
    resolveExtensions: ['.ts'],
    plugins: [
      pluginInjectPreload([
        {
          templatePath: '1',
          replace: '<!-- ENTRY_SCRIPT --><!-- /ENTRY_SCRIPT -->',
          as: () => undefined,
        },
      ]),
    ],
  };

  await it('validateSetup throws an error', () => {
    assert.doesNotThrow(() =>
      validateSetup({ initialOptions: { metafile: true, outdir: '1' } } as any)
    );

    nonTrue.forEach((value: any) => {
      assert.throws(
        () => validateSetup({ initialOptions: { metafile: value, outdir: '1' } } as any),
        {
          message:
            '@espcom/esbuild-plugin-inject-preload: "metafile" parameter must be set to "true" is esbuild config',
        }
      );
    });

    nonFullString.forEach((value: any) => {
      assert.throws(
        () => validateSetup({ initialOptions: { metafile: true, outdir: value } } as any),
        {
          message:
            '@espcom/esbuild-plugin-inject-preload: "outdir" parameter must be set is esbuild config',
        }
      );
    });
  });

  await it('validateResult throws an error', () => {
    assert.doesNotThrow(() => validateResult({ metafile: {} } as any));

    nonObjects.forEach((value: any) => {
      assert.throws(() => validateResult({ metafile: value } as any), {
        message:
          '@espcom/esbuild-plugin-inject-preload: "metafile" parameter must be set to "true" is esbuild config',
      });
    });
  });

  await it('metafile option should be enabled', async () => {
    try {
      await build({ ...config, metafile: false });
    } catch (error: any) {
      assert.match(
        error.message,
        new RegExp(
          '@espcom/esbuild-plugin-inject-preload: "metafile" parameter must be set to "true" is esbuild config'
        )
      );
    }
  });

  await it('outdir should be present', async () => {
    try {
      await build({ ...config, outdir: '' });
    } catch (error: any) {
      assert.match(
        error.message,
        new RegExp(
          '@espcom/esbuild-plugin-inject-preload: "outdir" parameter must be set is esbuild config'
        )
      );
    }
  });
});
