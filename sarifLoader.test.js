"use strict";

const sarifLoader = require('./sarifLoader');

test('sarifLoader should better load test001 and retrieve version', async () => {
  const sarifs = await sarifLoader.load('./fixtures/test001.sarif');
  expect(sarifs.length).toEqual(1);
  for (const sarif of sarifs) {
    expect(sarif.version).toEqual('2.1.0');
  }
});

test('sarifLoader should better load fixtures directory and retrieve versions from each file', async () => {
  const sarifs = await sarifLoader.load('./fixtures');
  expect(sarifs.length).toEqual(9);
  for (const sarif of sarifs) {
    expect(sarif.version).toEqual('2.1.0');
  }
});

test('sarifLoader should better load fixtures directory with trailing slash and retrieve versions from each file', async () => {
  const sarifs = await sarifLoader.load('./fixtures/');
  expect(sarifs.length).toEqual(9);
  for (const sarif of sarifs) {
    expect(sarif.version).toEqual('2.1.0');
  }
});

test('sarifLoader should better load fixtures via glob', async () => {
  const sarifs = await sarifLoader.load('./fixtures/subdir_test/*.json');
  expect(sarifs.length).toEqual(2);
  for (const sarif of sarifs) {
    expect(sarif.version).toEqual('2.1.0');
  }
});

test('sarifLoader should better load fixtures via glob with directory wildcard', async () => {
  const sarifs = await sarifLoader.load('./fixtures/**/*.json');
  expect(sarifs.length).toEqual(2);
  for (const sarif of sarifs) {
    expect(sarif.version).toEqual('2.1.0');
  }
});
