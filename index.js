"use strict";

const core = require('@actions/core');
// const languageResolver = require('./languageResolver')
const logger = require('./logger');
const { run } = require('./runner');

async function start() {
    const inFile = core.getInput('inputSarifFile');
    const outFile = core.getInput('outputSarifFile');

    logger.setLogger((msg) => core.debug(msg));
    const onFailure = (message) => core.setFailed(message);

    run(inFile, outFile, null, onFailure);
}

start();
