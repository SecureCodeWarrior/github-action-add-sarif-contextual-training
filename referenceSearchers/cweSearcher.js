"use strict";

const regex = new RegExp(/cwe[ \-:_]*(\d+)/, 'gi')

function search(text) {
    const matches = [];
    let textMatch = regex.exec(text);
    while (textMatch !== null) {
        if (textMatch) matches.push({
            referenceType: 'cwe',
            referenceId: textMatch[1],
            fullMatchedText: textMatch[0]
        });
        textMatch = regex.exec(text);
    }
    return matches;
}

module.exports = {
    search
};
