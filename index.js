"use strict";

const core = require('@actions/core');
const fs = require('fs').promises;
const _fs = require('fs');

const languageResolver = require('./languageResolver');
const sarifLoader = require('./sarifLoader');
const resultProcessor = require('./sarifProcessors/resultProcessor');
const ruleProcessor = require('./sarifProcessors/ruleProcessor');
const taxonomyProcessor = require('./sarifProcessors/taxonomyProcessor');

const OUTPUT_DIR = 'processed-sarifs';

async function writeOutputFile(outFilename, data) {
    await fs.writeFile(outFilename, data, 'utf8');
}

async function run() {
    try {
        const inFile = core.getInput('inputSarifFile');
        const outFile = core.getInput('outputSarifFile');

        // check if token provided and get language
        const githubToken = core.getInput('githubToken');
        let languageKey = null;
        if (githubToken) {
            languageKey = await languageResolver.getLanguageFromRepo(githubToken);
            core.debug(`Repository language: ${languageKey}`);
        }

        const pathType = await sarifLoader.getPathType(inFile);
        let fileCount = 1;
        core.debug(`Input path type: ${pathType}`);

        if (pathType !== 'file') {
            const exists = await _fs.existsSync(OUTPUT_DIR);
            if (!exists) {
                await fs.mkdir(OUTPUT_DIR);
            }
        }

        // load SARIF file from input location
        const sarifs = await sarifLoader.load(inFile);
        for (const sarif of sarifs) {
            core.debug(JSON.stringify(sarif, null, 4));

            // process each run
            if (sarif && sarif.runs) {
                for (const run of sarif.runs) {
                    // process run for rules
                    await ruleProcessor.process(run, languageKey);

                    // process run for taxonomies
                    await taxonomyProcessor.process(run, languageKey);

                    // process run for results
                    await resultProcessor.process(run, languageKey);
                }
            }

            // write SARIF file to output location
            const outputData = JSON.stringify(sarif);
            core.debug(JSON.stringify(sarif, null, 4));

            if (pathType === 'file') {
                core.debug(`Writing file: ${outFile}`);
                await writeOutputFile(outFile, outputData);
            }
            else {
                const outPath = `./${OUTPUT_DIR}/${fileCount}.sarif`;
                core.debug(`Writing file: ${outPath}`);
                await writeOutputFile(outPath, outputData);
            }

            fileCount++;
        }

    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
}

run();
