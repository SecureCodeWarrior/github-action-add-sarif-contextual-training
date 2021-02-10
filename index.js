"use strict";

const core = require('@actions/core');
const languageResolver = require('./languageResolver')
const logger = require('./logger');
const { run } = require('./runner');

async function start() {
    const inFile = core.getInput('inputSarifFile');
    const outFile = core.getInput('outputSarifFile');

    logger.setLogger((msg) => core.debug(msg));
    const onFailure = (message) => core.setFailed(message);

    // check if token provided and get language
    const githubToken = core.getInput('githubToken');
    let languageKey = null;
    if (githubToken) {
        languageKey = await languageResolver.getLanguageFromRepo(githubToken);
        logger.debug(`Repository language: ${languageKey}`);
    }

    run(inFile, outFile, githubToken, languageKey, onFailure);
}

start();
