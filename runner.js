// const core = require('@actions/core');
const fs = require('fs').promises;
const _fs = require('fs');

const sarifLoader = require('./sarifLoader');
const resultProcessor = require('./sarifProcessors/resultProcessor');
const ruleProcessor = require('./sarifProcessors/ruleProcessor');
const logger = require('./logger');

const OUTPUT_DIR = 'processed-sarifs';

async function writeOutputFile(outFilename, data) {
    await fs.writeFile(outFilename, data, 'utf8');
}

async function run(inFile, outFile, languageKey, onFailure) {
    try {
        const pathType = await sarifLoader.getPathType(inFile);
        let fileCount = 1;
        logger.debug(`Input path type: ${pathType}`);

        if (pathType !== 'file') {
            const exists = await _fs.existsSync(OUTPUT_DIR);
            if (!exists) {
                await fs.mkdir(OUTPUT_DIR);
            }
        }

        console.log(inFile);
        // load SARIF file from input location
        const sarifs = await sarifLoader.load(inFile);
        for (const sarif of sarifs) {
            logger.debug(JSON.stringify(sarif, null, 4));

            // process each run
            if (sarif && sarif.runs) {
                for (const run of sarif.runs) {
                    // process run for results
                    const triggeredRules = await resultProcessor.process(run, languageKey);
                    
                    // process run for rules
                    await ruleProcessor.process(run, languageKey, triggeredRules);
                }
            }

            // write SARIF file to output location
            const outputData = JSON.stringify(sarif);
            logger.debug(JSON.stringify(sarif, null, 4));

            if (pathType === 'file') {
                logger.debug(`Writing file: ${outFile}`);
                await writeOutputFile(outFile, outputData);
            }
            else {
                const outPath = `./${OUTPUT_DIR}/${fileCount}.sarif`;
                logger.debug(`Writing file: ${outPath}`);
                await writeOutputFile(outPath, outputData);
            }

            fileCount++;
        }

    } catch (error) {
        onFailure(error.message);
        throw error;
    }
}

module.exports = {
    run
}