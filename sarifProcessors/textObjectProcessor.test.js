"use strict";

const textObjectProcessor = require('./textObjectProcessor');

test('textObjectProcessor should extract text and markdown strings when both are present', async () => {
    const result = textObjectProcessor.extractText({
        text: 'aaa',
        markdown: 'bbb'
    });
    expect(result).toEqual('\naaa\nbbb');
});

test('textObjectProcessor should extract text string only if markdown is missing', async () => {
    const result = textObjectProcessor.extractText({
        text: 'aaa'
    });
    expect(result).toEqual('\naaa');
});

test('textObjectProcessor should extract markdown string only if text is missing', async () => {
    const result = textObjectProcessor.extractText({
        markdown: 'bbb'
    });
    expect(result).toEqual('\nbbb');
});

test('textObjectProcessor should extract nothing if both are missing', async () => {
    const result = textObjectProcessor.extractText({});
    expect(result).toEqual('');
});
