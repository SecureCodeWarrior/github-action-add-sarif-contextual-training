"use strict";

function addTextAndMarkdown(helpObj, textToAdd, markdownToAdd) {
    if (helpObj && !helpObj.text && !helpObj.markdown) {
        helpObj.text = textToAdd;
        helpObj.markdown = markdownToAdd;
        return;
    }

    if (helpObj && helpObj.text) {
        helpObj.text += `\n\n${textToAdd}`;
    }

    if (helpObj && helpObj.markdown) {
        helpObj.markdown += `\n\n${markdownToAdd}`;
    }
}

function appendHeader(helpObj) {
    let textToAdd = 'Build your secure coding skills and defend your code:';
    let markdownToAdd = `## Build your secure coding skills and defend your code`;
    addTextAndMarkdown(helpObj, textToAdd, markdownToAdd);
}

function appendTrainingData(helpObj, name, description, url, videos, displayReference) {
    // encode spaces in URLs to not break GFM
    url = url.replace(/ /g, '%20');
    if (videos && videos[0]) videos[0] = videos[0].replace(/ /g, '%20');

    let textToAdd = `[${displayReference}] ${name}`;
    if (videos && videos[0]) textToAdd += ` [What is this? (2min video)](${videos[0]})`;
    textToAdd += `\n\n${description} [Try this challenge in Secure Code Warrior](${url})`;

    let markdownToAdd = `#### [${displayReference}] ${name}`
    if (videos && videos[0]) markdownToAdd += ` *[What is this? (2min video)](${videos[0]})*`;
    markdownToAdd += `\n\n* ${description} [Try this challenge in Secure Code Warrior](${url})`;

    addTextAndMarkdown(helpObj, textToAdd, markdownToAdd);
}

module.exports = {
    appendHeader,
    appendTrainingData
};
