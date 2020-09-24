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
    let textToAdd = 'Secure Code Warrior Training:';
    let markdownToAdd = `## Secure Code Warrior Training`;
    addTextAndMarkdown(helpObj, textToAdd, markdownToAdd);
}

function appendTrainingData(helpObj, name, description, url, videos) {
    // encode spaces in URLs to not break GFM
    url = url.replace(/ /g, '%20');
    if (videos && videos[0]) videos[0] = videos[0].replace(/ /g, '%20');

    let textToAdd = `${name} - ${description} [Train Now](${url})`;
    if (videos && videos[0]) textToAdd += ` or [watch an explainer video](${videos[0]})`;

    let markdownToAdd = `#### ${name}\n\n${description}\n\n**[Train Now](${url})**`;
    if (videos && videos[0]) markdownToAdd += ` or [watch an explainer video](${videos[0]})`;

    addTextAndMarkdown(helpObj, textToAdd, markdownToAdd);
}

module.exports = {
    appendHeader,
    appendTrainingData
};
