"use strict";

const phraseSearcher = require('./phraseSearcher');

test('phraseSearcher exact match', async () => {
    const result = phraseSearcher.search('blah blah sql injection foo');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "sql injection"',
            fullMatchedText: 'sql injection',
            referenceType: 'phrase',
            referenceId: 'sql injection'
        }
    ]);
});

test('phraseSearcher different case', async () => {
    const result = phraseSearcher.search('blah blah sQl inJecTion foo');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "sQl inJecTion"',
            fullMatchedText: 'sQl inJecTion',
            referenceType: 'phrase',
            referenceId: 'sql injection'
        }
    ]);
});

test('phraseSearcher multiline and different case', async () => {
    const result = phraseSearcher.search('blah blah\nfoobar\ndeSERialiZATion aTTack\nsomething more\nzzz');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "deSERialiZATion aTTack"',
            fullMatchedText: 'deSERialiZATion aTTack',
            referenceType: 'phrase',
            referenceId: 'deserialization attack'
        }
    ]);
});

test('phraseSearcher no match', async () => {
    const result = phraseSearcher.search('abc');
    expect(result).toEqual([]);
});

test('phraseSearcher regex phrases 1', async () => {
    const result = phraseSearcher.search('something CR/LF injection something');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "CR/LF injection"',
            fullMatchedText: 'CR/LF injection',
            referenceType: 'phrase',
            referenceId: 'cr-lf injection'
        }
    ]);
});

test('phraseSearcher regex phrases 2', async () => {
    const result = phraseSearcher.search('blah untrusted deserialization blah');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "untrusted deserialization"',
            fullMatchedText: 'untrusted deserialization',
            referenceType: 'phrase',
            referenceId: 'insecure deserialization'
        }
    ]);
});

test('phraseSearcher regex phrases 3', async () => {
    const result = phraseSearcher.search('blah insecure cryptographic algorithm blah');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "insecure cryptographic algorithm"',
            fullMatchedText: 'insecure cryptographic algorithm',
            referenceType: 'phrase',
            referenceId: 'weak cryptographic algorithm'
        }
    ]);
});

test('phraseSearcher regex phrases 4', async () => {
    const result = phraseSearcher.search('blah 64-bit block cipher blah');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "64-bit block cipher"',
            fullMatchedText: '64-bit block cipher',
            referenceType: 'phrase',
            referenceId: '64-bit block size cipher'
        }
    ]);
});

test('phraseSearcher regex phrases 5', async () => {
    const result = phraseSearcher.search('blah DOM-Based Cross-Site Scripting blah');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "DOM-Based Cross-Site Scripting"',
            fullMatchedText: 'DOM-Based Cross-Site Scripting',
            referenceType: 'phrase',
            referenceId: 'dom-based cross-site scripting'
        },
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "Cross-Site Scripting"',
            fullMatchedText: 'Cross-Site Scripting',
            referenceType: 'phrase',
            referenceId: 'cross-site scripting'
        }
    ]);
});

test('phraseSearcher multiple matches', async () => {
    const result = phraseSearcher.search('blah SSRF blah\nsomething Csrf something');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "Csrf"',
            fullMatchedText: 'Csrf',
            referenceType: 'phrase',
            referenceId: 'csrf'
        },
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "SSRF"',
            fullMatchedText: 'SSRF',
            referenceType: 'phrase',
            referenceId: 'ssrf'
        }
    ]);
});

test('phraseSearcher multiple matches with duplicate', async () => {
    const result = phraseSearcher.search('blah SSRF blah\nsomething Csrf something\nCSRF');
    expect(result).toEqual([
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "Csrf"',
            fullMatchedText: 'Csrf',
            referenceType: 'phrase',
            referenceId: 'csrf'
        },
        {
            displayReferenceType: 'Phrase',
            displayReference: 'Matched on "SSRF"',
            fullMatchedText: 'SSRF',
            referenceType: 'phrase',
            referenceId: 'ssrf'
        }
    ]);
});
