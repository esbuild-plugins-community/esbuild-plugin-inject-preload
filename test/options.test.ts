import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';

import { pluginInjectPreload } from '../src/index.js';
import { TypeOptions } from '../src/types.js';

const nonArrays = [0, true, null, '', {}, () => false];
const nonObjects = [0, true, null, '', [], () => false];
const nonStrings = [0, true, null, [], () => false, {}];
const nonFunctions = [0, true, null, [], '', {}];

const getOptions = (options: Partial<TypeOptions[number]>) => {
  return [
    {
      templatePath: typeof options.templatePath !== 'undefined' ? options.templatePath : '1',
      replace:
        typeof options.replace !== 'undefined'
          ? options.replace
          : '<!-- ENTRY_SCRIPT --><!-- /ENTRY_SCRIPT -->',
      as: typeof options.as !== 'undefined' ? options.as : () => undefined,
    },
  ] as TypeOptions;
};

void describe('Validate options', async () => {
  await it('options should be an array', () => {
    // @ts-ignore
    assert.throws(() => pluginInjectPreload(), {
      message: '@espcom/esbuild-plugin-inject-preload: Options must be an array',
    });

    nonArrays.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(value), {
        message: '@espcom/esbuild-plugin-inject-preload: Options must be an array',
      });
    });
  });

  await it('option should be an object', () => {
    nonObjects.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload([value]), {
        message: '@espcom/esbuild-plugin-inject-preload: Option item must be a plain object',
      });
    });

    assert.doesNotThrow(() => pluginInjectPreload(getOptions({})));
  });

  await it('options.templatePath should be a full string', () => {
    assert.throws(() => pluginInjectPreload(getOptions({ templatePath: '' })), {
      message:
        '@espcom/esbuild-plugin-inject-preload: The "templatePath" parameter must be a non-empty string',
    });

    nonStrings.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(getOptions({ templatePath: value })), {
        message:
          '@espcom/esbuild-plugin-inject-preload: The "templatePath" parameter must be a string',
      });
    });
  });

  await it('options.replace should be a closed html comment', () => {
    assert.throws(() => pluginInjectPreload(getOptions({ replace: '' })), {
      message:
        '@espcom/esbuild-plugin-inject-preload: The "replace" parameter must be a non-empty string',
    });
    assert.throws(() => pluginInjectPreload(getOptions({ replace: '1' })), {
      message:
        '@espcom/esbuild-plugin-inject-preload: The "replace" parameter must be a closed html comment',
    });

    nonStrings.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(getOptions({ replace: value })), {
        message: '@espcom/esbuild-plugin-inject-preload: The "replace" parameter must be a string',
      });
    });
  });

  await it('options.as should be a function', () => {
    nonFunctions.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(getOptions({ as: value })), {
        message: '@espcom/esbuild-plugin-inject-preload: The "as" parameter must be a function',
      });
    });
  });
});
