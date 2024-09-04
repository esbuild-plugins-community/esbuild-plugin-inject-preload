import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';

import { pluginInjectPreload } from '../src/index.js';
import { TypeOptions } from '../src/types.js';

const nonObjects = [0, true, null, '', [], () => false];
const nonStrings = [0, true, null, [], () => false, {}];

const getOptions = (options: Partial<TypeOptions>) => {
  return {
    ext: typeof options.ext !== 'undefined' ? options.ext : '1',
    linkType: typeof options.linkType !== 'undefined' ? options.linkType : '1',
    templatePath: typeof options.templatePath !== 'undefined' ? options.templatePath : '1',
    replaceString: typeof options.replaceString !== 'undefined' ? options.replaceString : '1',
  };
};

void describe('Validate options', async () => {
  await it('options should be an object', () => {
    // @ts-ignore
    assert.throws(() => pluginInjectPreload(), {
      message: '@espcom/esbuild-plugin-inject-preload: Options must be a plain object',
    });

    nonObjects.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(value), {
        message: '@espcom/esbuild-plugin-inject-preload: Options must be a plain object',
      });
    });
  });

  await it('options.ext should be a full string', () => {
    assert.doesNotThrow(() => pluginInjectPreload(getOptions({})));

    assert.throws(() => pluginInjectPreload(getOptions({ ext: '' })), {
      message:
        '@espcom/esbuild-plugin-inject-preload: The "ext" parameter must be a non-empty string',
    });

    nonStrings.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(getOptions({ ext: value })), {
        message: '@espcom/esbuild-plugin-inject-preload: The "ext" parameter must be a string',
      });
    });
  });

  await it('options.linkType should be a full string', () => {
    assert.doesNotThrow(() => pluginInjectPreload(getOptions({})));

    assert.throws(() => pluginInjectPreload(getOptions({ linkType: '' })), {
      message:
        '@espcom/esbuild-plugin-inject-preload: The "linkType" parameter must be a non-empty string',
    });

    nonStrings.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(getOptions({ linkType: value })), {
        message: '@espcom/esbuild-plugin-inject-preload: The "linkType" parameter must be a string',
      });
    });
  });

  await it('options.templatePath should be a full string', () => {
    assert.doesNotThrow(() => pluginInjectPreload(getOptions({})));

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

  await it('options.replaceString should be a full string', () => {
    assert.doesNotThrow(() => pluginInjectPreload(getOptions({})));

    assert.throws(() => pluginInjectPreload(getOptions({ replaceString: '' })), {
      message:
        '@espcom/esbuild-plugin-inject-preload: The "replaceString" parameter must be a non-empty string',
    });

    nonStrings.forEach((value: any) => {
      assert.throws(() => pluginInjectPreload(getOptions({ replaceString: value })), {
        message:
          '@espcom/esbuild-plugin-inject-preload: The "replaceString" parameter must be a string',
      });
    });
  });
});
