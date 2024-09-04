import * as fs from 'node:fs';

import { Plugin } from 'esbuild';

import { TypeOptions } from './types.js';
import { validateOptions } from './validators/validateOptions.js';
import { pluginName } from './constants.js';
import { validateSetup } from './validators/validateSetup.js';
import { validateResult } from './validators/validateResult.js';

export const pluginInjectPreload = (options: TypeOptions): Plugin => {
  validateOptions(options);

  return {
    name: pluginName,
    setup(buildRaw) {
      const build = validateSetup(buildRaw);

      build.onEnd((resultRaw) => {
        const result = validateResult(resultRaw);

        let template = fs.readFileSync(options.templatePath, 'utf-8');
        const outputs = Object.keys(result.metafile.outputs);
        const outDir = build.initialOptions.outdir.split('/').pop();

        template = template.replace(
          options.replaceString,
          outputs
            .filter((str) => str.endsWith(options.ext))
            .map((str) => str.replace(new RegExp(`${outDir}/?`), ''))
            .map(
              (str) =>
                `<link as="${options.linkType}" crossorigin="anonymous" href="/${str}" rel="preload">`
            )
            .join('\n')
        );

        fs.writeFileSync(options.templatePath, template, 'utf-8');

        return Promise.resolve();
      });
    },
  };
};
