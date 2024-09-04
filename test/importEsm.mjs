import { describe, it } from 'node:test';
import assert from 'node:assert';

import * as exportContent from '../dist/esm/index.js';

void describe('Test import esm', async () => {
  await it('success', () => {
    assert.deepEqual(Object.keys(exportContent), ['pluginInjectPreload']);
    assert.deepEqual(typeof exportContent.pluginInjectPreload, 'function');
  });
});
