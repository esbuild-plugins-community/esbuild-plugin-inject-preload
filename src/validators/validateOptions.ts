import { TypeOptions } from '../types.js';
import { pluginName } from '../constants.js';

export function validateOptions(options?: TypeOptions) {
  if (!options || !Array.isArray(options)) {
    throw new Error(`${pluginName}: Options must be an array`);
  }

  options.forEach((option) => {
    if (Object.prototype.toString.call(option) !== '[object Object]') {
      throw new Error(`${pluginName}: Option item must be a plain object`);
    }

    if (typeof option.templatePath !== 'string') {
      throw new Error(`${pluginName}: The "templatePath" parameter must be a string`);
    }
    if (!option.templatePath) {
      throw new Error(`${pluginName}: The "templatePath" parameter must be a non-empty string`);
    }

    if (typeof option.replace !== 'string') {
      throw new Error(`${pluginName}: The "replace" parameter must be a string`);
    }
    if (!option.replace) {
      throw new Error(`${pluginName}: The "replace" parameter must be a non-empty string`);
    }
    if (!/<!-- [\w]+ --><!-- \/[\w]+ -->/g.test(option.replace)) {
      throw new Error(`${pluginName}: The "replace" parameter must be a closed html comment`);
    }

    if (typeof option.as !== 'function') {
      throw new Error(`${pluginName}: The "as" parameter must be a function`);
    }
  });
}
