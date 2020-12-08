"use strict";

const resultProcessor = require('./resultProcessor');
const sarifLoader = require('../sarifLoader');

test('resultProcessor should load test001 and add contextual micro-learning material', async () => {
  const sarifs = await sarifLoader.load('./fixtures/test001.sarif');
  for (const sarif of sarifs) {
    const ruleMap = await resultProcessor.process(sarif.runs[0]);
    expect(ruleMap.has('TEST01')).toEqual(true);
    expect(ruleMap.get('TEST01')).toEqual(true);
    expect(ruleMap.get('TEST02')).toEqual(undefined);
  }
});
