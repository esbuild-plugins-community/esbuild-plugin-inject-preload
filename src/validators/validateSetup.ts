import { PluginBuild } from 'esbuild';

import { pluginName } from '../constants.js';

export function validateSetup(build: PluginBuild) {
  if (build.initialOptions.metafile !== true) {
    throw new Error(`${pluginName}: "metafile" parameter must be set to "true" is esbuild config`);
  }

  if (typeof build.initialOptions.outdir !== 'string' || !build.initialOptions.outdir) {
    throw new Error(`${pluginName}: "outdir" parameter must be set is esbuild config`);
  }

  return build as PluginBuild & { initialOptions: { outdir: string } };
}
