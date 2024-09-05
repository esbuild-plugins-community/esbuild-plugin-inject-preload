import * as fs from 'node:fs';
import * as path from 'node:path';

import { Plugin } from 'esbuild';

import { TypeOptions } from './types.js';
import { validateOptions } from './validators/validateOptions.js';
import { pluginName } from './constants.js';
import { validateSetup } from './validators/validateSetup.js';
import { validateResult } from './validators/validateResult.js';

function joinWithPublicPath(publicPath: string, relPath: string) {
  const relPathNormalized = path.normalize(relPath);
  const slash = publicPath.endsWith('/') ? '' : '/';

  return `${publicPath}${slash}${relPathNormalized}`;
}

export const pluginInjectPreload = (options: TypeOptions): Plugin => {
  validateOptions(options);

  return {
    name: pluginName,
    setup(buildRaw) {
      const build = validateSetup(buildRaw);

      build.onEnd((resultRaw) => {
        const result = validateResult(resultRaw);

        options.forEach((option) => {
          let template = fs.readFileSync(option.templatePath, 'utf-8');
          let replaceString = '';

          Object.keys(result.metafile.outputs).forEach((filePath) => {
            let targetPath = path.relative(build.initialOptions.outdir, filePath);

            if (build.initialOptions.publicPath) {
              targetPath = joinWithPublicPath(build.initialOptions.publicPath, targetPath);
            }

            replaceString += option.as(targetPath) || '';
          });

          const parts = option.replace.split('><');

          template = template.replace(
            new RegExp(`(${parts[0]}>)(.+)?(<${parts[1]})`),
            // eslint-disable-next-line max-params
            (m, left, content, right) => {
              return left + replaceString + right;
            }
          );

          fs.writeFileSync(option.templatePath, template, 'utf-8');
        });

        return Promise.resolve();
      });
    },
  };
};
