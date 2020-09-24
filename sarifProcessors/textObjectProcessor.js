"use strict";

function extractText(textObject) {
    let result = '';
    if (textObject.text) result = `${result}\n${textObject.text}`;
    if (textObject.markdown) result = `${result}\n${textObject.markdown}`;
    return result;
}

module.exports = {
    extractText
};
