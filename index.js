"use strict";

const core = require('@actions/core');
const fs = require('fs').promises;

const sarifLoader = require('./sarifLoader');
const resultProcessor = require('./sarifProcessors/resultProcessor');
const ruleProcessor = require('./sarifProcessors/ruleProcessor');
const taxonomyProcessor = require('./sarifProcessors/taxonomyProcessor');

async function writeOutputFile(outFilename, data) {
    await fs.writeFile(outFilename, data, 'utf8');
}

async function run() {
    try {
        const inFile = core.getInput('inputSarifFile');
        const outFile = core.getInput('outputSarifFile');

        // load SARIF file from input location
        const sarif = await sarifLoader.load(inFile);

        // process each run
        if (sarif && sarif.runs) {
            for (const run of sarif.runs) {
                // process run for rules
                await ruleProcessor.process(run);

                // process run for taxonomies
                await taxonomyProcessor.process(run);

                // process run for results
                await resultProcessor.process(run);
            }
        }

        // write SARIF file to output location
        const outputData = JSON.stringify(sarif);
        await writeOutputFile(outFile, outputData);

    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
}

run();
