"use strict";

const cweSearcher = require('../referenceSearchers/cweSearcher');
const directLinking = require('../directLinking');
const helpProcessor = require('./helpProcessor');
const textObjectProcessor = require('./textObjectProcessor');
const phraseSearcher = require('../referenceSearchers/phraseSearcher');

async function processRule(rule, languageKey, triggeredRules) {
    if (!triggeredRules.has(rule) && !triggeredRules.has(rule.id)) {
        return;
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
    const alreadyAddedTrainingUrls = helpProcessor.getTrainingUrls(rule.help);
    let isShown = helpProcessor.hasTrainingHeader(rule.help);
    for (const match of matches) {
        const matchId = `${match.referenceType}::${match.referenceId}`;
        if (!alreadyAddedEntries[matchId]) {
            alreadyAddedEntries[matchId] = 1;
            if (helpProcessor.hasTrainingEntry(rule.help, match.displayReference)) {
                continue;
            }

            // call Direct Linking API
            let trainingData;
            try {
                trainingData = await directLinking.getTrainingData(match.referenceType, match.referenceId, languageKey);
            }
            catch (e) {
                console.warn(`Unable to load Secure Code Warrior training for ${match.displayReference}: ${e.message}`);
                continue;
            }
            if (!trainingData || !trainingData.url) {
                console.warn(`Secure Code Warrior returned incomplete training data for ${match.displayReference}`);
                continue;
            }
            const normalizedTrainingUrl = trainingData.url.replace(/ /g, '%20');

            // CWE mappings are more precise than phrase matches, so suppress phrase
            // entries that resolve to training already added for this rule.
            if (match.referenceType === 'phrase' && alreadyAddedTrainingUrls.has(normalizedTrainingUrl)) {
                continue;
            }
            alreadyAddedTrainingUrls.add(normalizedTrainingUrl);

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

            helpProcessor.appendTrainingData(rule.help, trainingData.name, trainingData.description, normalizedTrainingUrl, trainingData.videos, match.displayReference);
        }
    }
}

async function processRun(run, languageKey, triggeredRules, options = {}) {
    if (run && run.tool && run.tool.driver) {
        // PLAT-15858 Update to handle trimming and case-insensitive matches
        if (options.renameCodeQLTool && run.tool.driver.name && run.tool.driver.name.trim().toLowerCase() === 'codeql') {
            // Compatibility workaround for https://github.com/github/codeql-action/issues/305
            // ref: https://github.com/github/codeql-action/issues/305
            run.tool.driver.name = 'GitHub CodeQL';
        }

        for (const rule of run.tool.driver.rules || []) {
            try {
                await processRule(rule, languageKey, triggeredRules);
            }
            catch (e) {
                console.error('Error', e);
                continue;
            }
        }
    }

    if (run && run.tool && run.tool.extensions && run.tool.extensions) {
        for (const extension of run.tool.extensions) {
            if (!extension.rules || !Array.isArray(extension.rules)) continue;

            for (const rule of extension.rules) {
                try {
                    await processRule(rule, languageKey, triggeredRules);
                }
                catch (e) {
                    console.error('Error', e);

                    continue;
                }
            }
        }
    }
}

module.exports = {
    processRun
};
