"use strict";

const core = require('@actions/core');
// const languageResolver = require('./languageResolver')
const logger = require('./logger');
const { run } = require('./runner');

async function start() {
    const inFile = core.getInput('inputSarifFile');
    const outFile = core.getInput('outputSarifFile');
    const languageKey = core.getInput('languageKey') || null;
    const renameCodeQLTool = core.getBooleanInput('renameCodeQLTool');

    logger.setLogger((msg) => core.debug(msg));
    const onFailure = (message) => core.setFailed(message);

    await run(inFile, outFile, languageKey, onFailure, {
        renameCodeQLTool
    });
}

start().catch((error) => {
    if (!process.exitCode) {
        core.setFailed(error.message);
    }
});
