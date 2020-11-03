"use strict";

const phraseList = require('./phraseList.json');

function search(text) {
    const matches = [];
    for (const key in phraseList) {
        const phrase = phraseList[key];
        const regex = new RegExp(key, 'i');
        let textMatch = regex.exec(text);
        if (textMatch !== null) matches.push({
            displayReferenceType: 'Phrase',
            displayReference: `Matched on "${textMatch[0]}"`,
            referenceType: 'phrase',
            referenceId: phrase,
            fullMatchedText: textMatch[0]
        });
    }
    return matches;
}

module.exports = {
    search
};
