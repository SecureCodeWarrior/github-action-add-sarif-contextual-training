"use strict";

const cweSearcher = require('./cweSearcher');

test('cweSearcher uppercase and no space', async () => {
    const result = cweSearcher.search('CWE22');
    expect(result).toEqual([
        {
            fullMatchedText: 'CWE22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher uppercase and space with leading characters', async () => {
    const result = cweSearcher.search('aaaCWE 22');
    expect(result).toEqual([
        {
            fullMatchedText: 'CWE 22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher lowercase and underscore with trailing characters', async () => {
    const result = cweSearcher.search('cwe_22bbb');
    expect(result).toEqual([
        {
            fullMatchedText: 'cwe_22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher mixed case and dash with leading and trailing characters', async () => {
    const result = cweSearcher.search('ccccWe-22ddd');
    expect(result).toEqual([
        {
            fullMatchedText: 'cWe-22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher mixed case and colon with leading and trailing space and characters', async () => {
    const result = cweSearcher.search('zzz CwE:22 zzz');
    expect(result).toEqual([
        {
            fullMatchedText: 'CwE:22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher mixed case and colon with space', async () => {
    const result = cweSearcher.search('cWE: 22');
    expect(result).toEqual([
        {
            fullMatchedText: 'cWE: 22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher lowercase and mix of colon, dash, underscore and space, and leading and trailing characters', async () => {
    const result = cweSearcher.search('aaacwe:-_    _-:::---_ 22bbb');
    expect(result).toEqual([
        {
            fullMatchedText: 'cwe:-_    _-:::---_ 22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher multiple matches', async () => {
    const result = cweSearcher.search('aaacwe:-_    _-:::---_ 22bbb cwe94aaaaCWE89, CwE: 123. cwe_456zzz');
    expect(result).toEqual([
        {
            fullMatchedText: 'cwe:-_    _-:::---_ 22',
            referenceType: 'cwe',
            referenceId: '22'
        },
        {
            fullMatchedText: 'cwe94',
            referenceType: 'cwe',
            referenceId: '94'
        },
        {
            fullMatchedText: 'CWE89',
            referenceType: 'cwe',
            referenceId: '89'
        },
        {
            fullMatchedText: 'CwE: 123',
            referenceType: 'cwe',
            referenceId: '123'
        },
        {
            fullMatchedText: 'cwe_456',
            referenceType: 'cwe',
            referenceId: '456'
        }
    ]);
});

test('cweSearcher multiline lowercase with space', async () => {
    const result = cweSearcher.search('aaa\ncwe 22bbb');
    expect(result).toEqual([
        {
            fullMatchedText: 'cwe 22',
            referenceType: 'cwe',
            referenceId: '22'
        }
    ]);
});

test('cweSearcher multiple matches multiline mixed case with mixture', async () => {
    const result = cweSearcher.search('aaa\nbbb\nccc\n\n\ndafaweCwE 22bbb\nafewfaawe\naecwE   :::---___  __89aa\nddddd');
    expect(result).toEqual([
        {
            fullMatchedText: 'CwE 22',
            referenceType: 'cwe',
            referenceId: '22'
        },
        {
            fullMatchedText: 'cwE   :::---___  __89',
            referenceType: 'cwe',
            referenceId: '89'
        }
    ]);
});
