import { TypeOptions } from '../types.js';
import { pluginName } from '../constants.js';

export function validateOptions(options?: TypeOptions) {
  if (!options) {
    throw new Error(`${pluginName}: Options must be a plain object`);
  }

  if (Object.prototype.toString.call(options) !== '[object Object]') {
    throw new Error(`${pluginName}: Options must be a plain object`);
  }

  if (typeof options.ext !== 'string') {
    throw new Error(`${pluginName}: The "ext" parameter must be a string`);
  }
  if (!options.ext) {
    throw new Error(`${pluginName}: The "ext" parameter must be a non-empty string`);
  }

  if (typeof options.linkType !== 'string') {
    throw new Error(`${pluginName}: The "linkType" parameter must be a string`);
  }
  if (!options.linkType) {
    throw new Error(`${pluginName}: The "linkType" parameter must be a non-empty string`);
  }

  if (typeof options.templatePath !== 'string') {
    throw new Error(`${pluginName}: The "templatePath" parameter must be a string`);
  }
  if (!options.templatePath) {
    throw new Error(`${pluginName}: The "templatePath" parameter must be a non-empty string`);
  }

  if (typeof options.replaceString !== 'string') {
    throw new Error(`${pluginName}: The "replaceString" parameter must be a string`);
  }
  if (!options.replaceString) {
    throw new Error(`${pluginName}: The "replaceString" parameter must be a non-empty string`);
  }
}
