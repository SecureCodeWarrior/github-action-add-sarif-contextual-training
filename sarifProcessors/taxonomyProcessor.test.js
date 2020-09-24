"use strict";

const taxonomyProcessor = require('./taxonomyProcessor');
const sarifLoader = require('../sarifLoader');

test('taxonomyProcessor should load test001 and add contextual micro-learning material', async () => {
  const sarif = await sarifLoader.load('./fixtures/test001.sarif');
  const processed = await taxonomyProcessor.process(sarif.runs[0]);
  expect(processed.tool.driver.name).toEqual('Tool Name 3');
});
