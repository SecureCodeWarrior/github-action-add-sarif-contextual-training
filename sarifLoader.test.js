"use strict";

const sarifLoader = require('./sarifLoader');

test('sarifLoader should load test001 and retrieve version', async () => {
  const sarif = await sarifLoader.load('./fixtures/test001.sarif');
  expect(sarif.version).toEqual('2.1.0');
});
