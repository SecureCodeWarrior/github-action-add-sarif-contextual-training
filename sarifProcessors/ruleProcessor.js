"use strict";

const cweSearcher = require('../referenceSearchers/cweSearcher');
const directLinking = require('../directLinking');
const helpProcessor = require('./helpProcessor');
const textObjectProcessor = require('./textObjectProcessor');
const phraseSearcher = require('../referenceSearchers/phraseSearcher');

async function processRule(rule, languageKey, triggeredRules) {
    if (!triggeredRules.has(rule.id)) {
        throw new Error('Rule not triggered');
    }

    let ruleText = '';

    if (rule.id) ruleText += rule.id;

    if (rule.name) ruleText += rule.name;

    if (rule.message) ruleText += textObjectProcessor.extractText(rule.message);

    if (rule.messageStrings) {
        for (const messageStringId in rule.messageStrings) {
            const messageString = rule.messageStrings[messageStringId];
            ruleText += textObjectProcessor.extractText(messageString);
        }
    }

    if (rule.shortDescription) ruleText += textObjectProcessor.extractText(rule.shortDescription);

    if (rule.fullDescription) ruleText += textObjectProcessor.extractText(rule.fullDescription);

    if (rule.help) ruleText += textObjectProcessor.extractText(rule.help);

    if (rule.properties && rule.properties.tags && Array.isArray(rule.properties.tags)) ruleText += rule.properties.tags.join(' ');

    // search ruleText
    let matches = cweSearcher.search(ruleText);
    matches = matches.concat(phraseSearcher.search(ruleText));
    const alreadyAddedEntries = {};
    let isShown = false;
    for (const match of matches) {
        const matchId = `${match.referenceType}::${match.referenceId}`;
        if (!alreadyAddedEntries[matchId]) {
            alreadyAddedEntries[matchId] = 1;

            // call Direct Linking API
            let trainingData;
            try {
                trainingData = await directLinking.getTrainingData(match.referenceType, match.referenceId, languageKey);
            }
            catch (e) {
                trainingData = null;
                continue;
            }

            if (!rule.help) rule.help = {
                // if `help` is not present but fullDescription is present
                // init `help` with `fullDescription` to avoid overwriting the displayed description
                // for `markdown` fallback to `text` if there is no `fullDescription.markdown`
                // for `text` fallback to "No description" if there is no `fullDescription.text`
                text: (rule.fullDescription && rule.fullDescription.text) || '',
                markdown: (rule.fullDescription && (rule.fullDescription.markdown || rule.fullDescription.text)) || ''
            };

            if (!isShown) {
                isShown = true;
                helpProcessor.appendHeader(rule.help);
            }

            helpProcessor.appendTrainingData(rule.help, trainingData.name, trainingData.description, trainingData.url, trainingData.videos, match.displayReference);
        }
    }
}

async function processRun(run, languageKey, triggeredRules) {
    if (run && run.tool && run.tool.driver && run.tool.driver.rules) {
        if (run.tool.driver.name === 'CodeQL') {
            // workaround for help text being overwritten by CodeQL template when GitHub detects CodeQL
            // ref: https://github.com/github/codeql-action/issues/305
            run.tool.driver.name = 'GitHub CodeQL';
        }

        for (const rule of run.tool.driver.rules) {
            try {
                await processRule(rule, languageKey, triggeredRules);
            }
            catch (e) {
                continue;
            }
        }
    }

    if (run && run.tool && run.tool.extensions && run.tool.extensions) {
        for (const extension of run.tool.extensions) {
            for (const rule of extension.rules) {
                try {
                    await processRule(rule, languageKey, triggeredRules);
                }
                catch (e) {
                    continue;
                }
            }
        }
    }
}

module.exports = {
    processRun
};
