const { describe, it } = require('node:test');
const assert = require('node:assert');

const exportContent = require('../dist/cjs/index');

void describe('Test import cjs', async () => {
  await it('success', () => {
    assert.deepEqual(Object.keys(exportContent), ['pluginInjectPreload']);
    assert.deepEqual(typeof exportContent.pluginInjectPreload, 'function');
  });
});
