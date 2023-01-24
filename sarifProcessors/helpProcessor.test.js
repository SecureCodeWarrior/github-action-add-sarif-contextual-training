"use strict";

const helpProcessor = require('./helpProcessor');

const NAME = 'SQL injection';
const DESCRIPTION = 'SQL injection is bad.';
const URL = 'https://scw.io/sql-injection';
const VIDEOS = ['https://scw.io/video'];
const NO_VIDEO = [];
const DISPLAY_REF = 'CWE 123';

test('helpProcessor should create both text and markdown if neither are present', async () => {
    const helpObj = {};
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS, DISPLAY_REF);
    expect(helpObj).toEqual({
        markdown: `#### [${DISPLAY_REF}] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
        text: `[${DISPLAY_REF}] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
    });
});

test('helpProcessor should append to markdown and add text if only markdown is present', async () => {
    const helpObj = {
        markdown: 'existing markdown'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS, DISPLAY_REF);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n#### [${DISPLAY_REF}] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
        text: `[${DISPLAY_REF}] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
    });
});

test('helpProcessor should append to markdown and add text if only markdown is present (no video case)', async () => {
    const helpObj = {
        markdown: 'existing markdown'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, NO_VIDEO, DISPLAY_REF);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n#### [${DISPLAY_REF}] ${NAME}\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
        text: `[${DISPLAY_REF}] ${NAME}\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
    });
});

test('helpProcessor should append to text and add markdown if only text is present', async () => {
    const helpObj = {
        text: 'existing text'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS, DISPLAY_REF);
    expect(helpObj).toEqual({
        markdown: `#### [${DISPLAY_REF}] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
        text: `existing text\n\n[${DISPLAY_REF}] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
    });
});

test('helpProcessor should append to both text and markdown if both are present', async () => {
    const helpObj = {
        markdown: 'existing markdown',
        text: 'existing text'
    };
    helpProcessor.appendTrainingData(helpObj, NAME, DESCRIPTION, URL, VIDEOS, DISPLAY_REF);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n#### [${DISPLAY_REF}] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
        text: `existing text\n\n[${DISPLAY_REF}] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
    });
});

test('helpProcessor should append header to both text and markdown if both are present', async () => {
    const helpObj = {
        markdown: 'existing markdown',
        text: 'existing text'
    };
    helpProcessor.appendHeader(helpObj);
    expect(helpObj).toEqual({
        markdown: `existing markdown\n\n## Build your secure coding skills and defend your code`,
        text: `existing text\n\nBuild your secure coding skills and defend your code:`
    });
});
