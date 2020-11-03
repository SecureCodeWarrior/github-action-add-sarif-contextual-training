"use strict";

const cweSearcher = require('../referenceSearchers/cweSearcher');
const directLinking = require('../directLinking');
const helpProcessor = require('./helpProcessor');
const textObjectProcessor = require('./textObjectProcessor');
const phraseSearcher = require('../referenceSearchers/phraseSearcher');

async function process(run, languageKey) {
    if (run && run.tool && run.tool.driver && run.tool.driver.rules) {
        for (const rule of run.tool.driver.rules) {
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

                    if (!rule.help) rule.help = {};

                    if (!isShown) {
                        isShown = true;
                        helpProcessor.appendHeader(rule.help);
                    }

                    helpProcessor.appendTrainingData(rule.help, trainingData.name, trainingData.description, trainingData.url, trainingData.videos, match.displayReference);
                }
            }
        }
    }
}

module.exports = {
    process
};
