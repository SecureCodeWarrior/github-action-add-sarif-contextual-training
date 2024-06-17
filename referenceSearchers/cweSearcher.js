"use strict";

const regex = new RegExp(/cwe[ \-:_]*(\d+)/, 'gi')

function search(text) {
    const matches = [];
    let textMatch = regex.exec(text);
    while (textMatch !== null) {
        if (textMatch) matches.push({
            displayReferenceType: 'CWE',
            displayReference: `CWE ${textMatch[1]}`,
            referenceType: 'cwe',
            referenceId: parseInt(textMatch[1], 10).toString(),
            fullMatchedText: textMatch[0]
        });
        textMatch = regex.exec(text);
    }
    return matches;
}

module.exports = {
    search
};
