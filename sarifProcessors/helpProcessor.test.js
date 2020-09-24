"use strict";

const helpProcessor = require('./helpProcessor');

const NAME = 'SQL injection';
const DESCRIPTION = 'SQL injection is bad.';
const URL = 'https://scw.io/sql-injection';
const VIDEOS = ['https://scw.io/video'];
const NO_VIDEO = [];

test('helpProcessor should create both text and markdown if neither are present', async () => {
    const helpObj = {};
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS);
    expect(helpObj).toEqual({
        markdown: `#### ${NAME}\n\n${DESCRIPTION}\n\n**[Train Now](${URL})** or [watch an explainer video](${VIDEOS[0]})`,
        text: `${NAME} - ${DESCRIPTION} [Train Now](${URL}) or [watch an explainer video](${VIDEOS[0]})`
    });
});

test('helpProcessor should append to markdown if only markdown is present', async () => {
    const helpObj = {
        markdown: 'existing markdown'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n#### ${NAME}\n\n${DESCRIPTION}\n\n**[Train Now](${URL})** or [watch an explainer video](${VIDEOS[0]})`
    });
});

test('helpProcessor should append to markdown if only markdown is present (no video case)', async () => {
    const helpObj = {
        markdown: 'existing markdown'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, NO_VIDEO);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n#### ${NAME}\n\n${DESCRIPTION}\n\n**[Train Now](${URL})**`
    });
});

test('helpProcessor should append to text if only text is present', async () => {
    const helpObj = {
        text: 'existing text'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS);
    expect(helpObj).toEqual({
        text: `existing text\n\n${NAME} - ${DESCRIPTION} [Train Now](${URL}) or [watch an explainer video](${VIDEOS[0]})`
    });
});

test('helpProcessor should append to both text and markdown if both are present', async () => {
    const helpObj = {
        markdown: 'existing markdown',
        text: 'existing text'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n#### ${NAME}\n\n${DESCRIPTION}\n\n**[Train Now](${URL})** or [watch an explainer video](${VIDEOS[0]})`,
        text: `existing text\n\n${NAME} - ${DESCRIPTION} [Train Now](${URL}) or [watch an explainer video](${VIDEOS[0]})`
    });
});

test('helpProcessor should append header to both text and markdown if both are present', async () => {
    const helpObj = {
        markdown: 'existing markdown',
        text: 'existing text'
    };
    helpProcessor.appendHeader(helpObj);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n## Secure Code Warrior Training`,
        text: `existing text\n\nSecure Code Warrior Training:`
    });
});
