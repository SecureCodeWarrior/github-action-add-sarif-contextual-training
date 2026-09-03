"use strict";

const resultProcessor = require('./resultProcessor');
const sarifLoader = require('../sarifLoader');

test('resultProcessor should load test001 and add contextual micro-learning material', async () => {
  const sarifs = await sarifLoader.load('./fixtures/test001.sarif');
  for (const sarif of sarifs) {
    const ruleMap = await resultProcessor.process(sarif.runs[0]);
    expect(ruleMap.has(sarif.runs[0].tool.driver.rules[0])).toEqual(true);
    expect(ruleMap.has(sarif.runs[0].tool.driver.rules[1])).toEqual(false);
  }
});

test('resultProcessor should resolve a rule reference id when ruleId is absent', async () => {
  const run = {
    tool: {
      driver: {
        rules: [{
          id: 'referenced-rule'
        }]
      }
    },
    results: [{
      rule: {
        id: 'referenced-rule'
      }
    }]
  };

  const ruleMap = await resultProcessor.process(run);

  expect(ruleMap.has(run.tool.driver.rules[0])).toEqual(true);
});

test('resultProcessor should resolve driver and extension rule indexes', async () => {
  const run = {
    tool: {
      driver: {
        rules: [{
          id: 'driver-rule'
        }]
      },
      extensions: [{
        rules: [{
          id: 'extension-rule'
        }]
      }]
    },
    results: [{
      ruleIndex: 0
    }, {
      rule: {
        index: 0,
        toolComponent: {
          index: 0
        }
      }
    }]
  };

  const ruleMap = await resultProcessor.process(run);

  expect(ruleMap.has(run.tool.driver.rules[0])).toEqual(true);
  expect(ruleMap.has(run.tool.extensions[0].rules[0])).toEqual(true);
});

test('resultProcessor should resolve driver index -1 and named or GUID extension references', async () => {
  const run = {
    tool: {
      driver: {
        name: 'Example SAST',
        guid: 'driver-guid',
        rules: [{
          id: 'driver-rule'
        }]
      },
      extensions: [{
        name: 'Example rules',
        guid: 'extension-guid',
        rules: [{
          id: 'extension-rule',
          guid: 'rule-guid'
        }]
      }]
    },
    results: [{
      rule: {
        index: 0,
        toolComponent: {
          index: -1
        }
      }
    }, {
      rule: {
        index: 0,
        toolComponent: {
          name: 'Example rules'
        }
      }
    }, {
      rule: {
        guid: 'rule-guid',
        toolComponent: {
          guid: 'extension-guid'
        }
      }
    }]
  };

  const ruleMap = await resultProcessor.process(run);

  expect(ruleMap.has(run.tool.driver.rules[0])).toEqual(true);
  expect(ruleMap.has(run.tool.extensions[0].rules[0])).toEqual(true);
});

test('resultProcessor should distinguish duplicate rule IDs in different components', async () => {
  const run = {
    tool: {
      driver: {
        rules: [{
          id: 'duplicate-rule'
        }]
      },
      extensions: [{
        rules: [{
          id: 'duplicate-rule'
        }]
      }]
    },
    results: [{
      ruleId: 'duplicate-rule',
      rule: {
        id: 'duplicate-rule',
        index: 0,
        toolComponent: {
          index: 0
        }
      }
    }]
  };

  const ruleMap = await resultProcessor.process(run);

  expect(ruleMap.has(run.tool.driver.rules[0])).toEqual(false);
  expect(ruleMap.has(run.tool.extensions[0].rules[0])).toEqual(true);
});

test('resultProcessor should fall back to rule ID when an index is stale', async () => {
  const run = {
    tool: {
      driver: {
        rules: []
      },
      extensions: [{
        rules: [{
          id: 'first-rule'
        }, {
          id: 'target-rule'
        }]
      }]
    },
    results: [{
      ruleId: 'target-rule',
      rule: {
        id: 'target-rule',
        index: 5,
        toolComponent: {
          index: 0
        }
      }
    }]
  };

  const ruleMap = await resultProcessor.process(run);

  expect(ruleMap.has(run.tool.extensions[0].rules[1])).toEqual(true);
});
