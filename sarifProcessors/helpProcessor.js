"use strict";

const TRAINING_HEADER_TEXT = 'Build your secure coding skills and defend your code:';
const TRAINING_HEADER_MARKDOWN = '## Build your secure coding skills and defend your code';

function addTextAndMarkdown(helpObj, textToAdd, markdownToAdd) {
    // This will blindly add to both text and markdown but the help object supplied will always have both
    if (helpObj && helpObj.text) {
        helpObj.text += `\n\n${textToAdd}`;
    }
    else if (helpObj && !helpObj.text) {
        helpObj.text = textToAdd;
    }

    if (helpObj && helpObj.markdown) {
        helpObj.markdown += `\n\n${markdownToAdd}`;
    }
    else if (helpObj && !helpObj.markdown) {
        helpObj.markdown = markdownToAdd;
    }
}

function appendHeader(helpObj) {
    addTextAndMarkdown(helpObj, TRAINING_HEADER_TEXT, TRAINING_HEADER_MARKDOWN);
}

function hasTrainingHeader(helpObj) {
    return Boolean(helpObj && (
        (helpObj.text && helpObj.text.includes(TRAINING_HEADER_TEXT)) ||
        (helpObj.markdown && helpObj.markdown.includes(TRAINING_HEADER_MARKDOWN))
    ));
}

function hasTrainingEntry(helpObj, displayReference) {
    const reference = `[${displayReference}]`;
    return Boolean(helpObj && (
        (helpObj.text && helpObj.text.includes(reference)) ||
        (helpObj.markdown && helpObj.markdown.includes(reference))
    ));
}

function getTrainingUrls(helpObj) {
    const urls = new Set();
    const content = helpObj && `${helpObj.text || ''}\n${helpObj.markdown || ''}`;
    const regex = /\[Try this challenge in Secure Code Warrior\]\(([^)]+)\)/g;
    let match = content && regex.exec(content);
    while (match) {
        urls.add(match[1]);
        match = regex.exec(content);
    }
    return urls;
}

function appendTrainingData(helpObj, name, description, url, videos, displayReference) {
    // encode spaces in URLs to not break GFM
    url = url.replace(/ /g, '%20');
    const videoUrl = videos && videos[0] && videos[0].replace(/ /g, '%20');

    let textToAdd = `[${displayReference}] ${name}`;
    if (videoUrl) textToAdd += ` [What is this? (2min video)](${videoUrl})`;
    textToAdd += `\n\n${description} [Try this challenge in Secure Code Warrior](${url})`;

    let markdownToAdd = `#### [${displayReference}] ${name}`
    if (videoUrl) markdownToAdd += ` *[What is this? (2min video)](${videoUrl})*`;
    markdownToAdd += `\n\n* ${description} [Try this challenge in Secure Code Warrior](${url})`;

    addTextAndMarkdown(helpObj, textToAdd, markdownToAdd);
}

module.exports = {
    appendHeader,
    appendTrainingData,
    hasTrainingEntry,
    hasTrainingHeader,
    getTrainingUrls
};
