"use strict";

const directLinking = require('../directLinking');
const ruleProcessor = require('./ruleProcessor');
const sarifLoader = require('../sarifLoader');

jest.mock('../directLinking');

test('ruleProcessor should load test001 and not add anything', async () => {
    const sarif = await sarifLoader.load('./fixtures/test001.sarif');
    await ruleProcessor.process(sarif.runs[0]);

    // expect no change
    expect(sarif.runs[0].tool.driver.rules[0]).toEqual({
        "id": "TEST01",
        "name": "Test 01 rule name",
        "messageStrings": {
            "default": {
                "text": "This is the message text. It might be very long."
            }
        },
        "shortDescription": {
            "text": "Failed to release dynamic memory."
        },
        "fullDescription": {
            "text": "Unused variables, imports, functions or classes may be a symptom of a bug and should be examined carefully."
        },
        "help": {
            "text": "some help text",
            "markdown": "markdown version some link [here](https://github.com)"
        }
    });
});

test('ruleProcessor should load test002 and add contextual micro-learning material 4 times (for cWe-352 [ONLY ONCE - cwe-----352 should not add duplicate material], cwe89, CWE: 79 and CWE_94)', async () => {
    const sarif = await sarifLoader.load('./fixtures/test002.sarif');
    const NAME = 'AAA';
    const DESCRIPTION = 'bbb';
    const URL = 'ccc';
    const VIDEOS = ['ddd'];
    directLinking.getTrainingData.mockResolvedValue({
        name: NAME,
        description: DESCRIPTION,
        url: URL,
        videos: VIDEOS
    });
    await ruleProcessor.process(sarif.runs[0]);

    // expect material added to help.text only
    expect(sarif.runs[0].tool.driver.rules[0]).toEqual({
        "id": "TEST01",
        "name": "Test 01 rule name",
        "messageStrings": {
            "default": {
                "text": "This is the message text. It might be very long."
            }
        },
        "shortDescription": {
            "text": "Failed to release dynamic memory, but not really because this is CWE 89. Yes really."
        },
        "fullDescription": {
            "text": "Unused variables, imports, functions or classes may be a symptom of a bug and should be examined carefully."
        },
        "help": {
            "text": `some help text\n\nSecure Code Warrior Training:\n\n[CWE 89] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
        }
    });

    // expect material added to help.text and help.markdown
    expect(sarif.runs[0].tool.driver.rules[1]).toEqual({
        "id": "TEST02",
        "name": "Test 02 rule name",
        "messageStrings": {
            "default": {
                "text": "aaa"
            }
        },
        "shortDescription": {
            "text": "blah blah\na there is a cWe-352 vulnerability\nhow about that"
        },
        "fullDescription": {
            "text": "something something cwe89 something CWE: 79 and\nsomething else cwe-----352 again"
        },
        "help": {
            "text": `Some text here some text here\n\nSecure Code Warrior Training:\n\n[CWE 352] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 89] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 79] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 94] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
            "markdown": `# A Heading\n\nSome text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here\n\n## A Smaller Heading\n\nMore text here more text here more text here more text here more text here more text here CWE_94 more text here more text here\n\n## Secure Code Warrior Training\n\n#### [CWE 352] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 89] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 79] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 94] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
        }
    });
});

test('ruleProcessor should load test003 and add 2 entries based on the rule id and name', async () => {
    const sarif = await sarifLoader.load('./fixtures/test003.sarif');
    const NAME = 'AAA';
    const DESCRIPTION = 'bbb';
    const URL = 'ccc';
    const VIDEOS = ['ddd'];
    directLinking.getTrainingData.mockResolvedValue({
        name: NAME,
        description: DESCRIPTION,
        url: URL,
        videos: VIDEOS
    });
    await ruleProcessor.process(sarif.runs[0]);

    // expect material added to help.text and help.markdown
    expect(sarif.runs[0].tool.driver.rules[0]).toEqual({
        "id": "TEST01 CWE-22",
        "name": "Test 01 rule name cwe: 23",
        "messageStrings": {
            "default": {
                "text": "This is the message text. It might be very long."
            }
        },
        "shortDescription": {
            "text": "Failed to release dynamic memory."
        },
        "fullDescription": {
            "text": "Unused variables, imports, functions or classes may be a symptom of a bug and should be examined carefully."
        },
        "help": {
            "text": `some help text\n\nSecure Code Warrior Training:\n\n[CWE 22] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 23] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
            "markdown": `markdown version some link [here](https://github.com)\n\n## Secure Code Warrior Training\n\n#### [CWE 22] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 23] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
        }
    });
});

test('ruleProcessor should load test004 and add 4 entries based on the rule id, rule name and tags (x2)', async () => {
    const sarif = await sarifLoader.load('./fixtures/test004.sarif');
    const NAME = 'AAA';
    const DESCRIPTION = 'bbb';
    const URL = 'ccc';
    const VIDEOS = ['ddd'];
    directLinking.getTrainingData.mockResolvedValue({
        name: NAME,
        description: DESCRIPTION,
        url: URL,
        videos: VIDEOS
    });
    await ruleProcessor.process(sarif.runs[0]);

    // expect material added to help.text and help.markdown
    expect(sarif.runs[0].tool.driver.rules[0]).toEqual({
        "id": "TEST01 CWE-22",
        "name": "Test 01 rule name cwe: 23",
        "messageStrings": {
            "default": {
                "text": "This is the message text. It might be very long."
            }
        },
        "shortDescription": {
            "text": "Failed to release dynamic memory."
        },
        "fullDescription": {
            "text": "Unused variables, imports, functions or classes may be a symptom of a bug and should be examined carefully."
        },
        "help": {
            "text": `some help text\n\nSecure Code Warrior Training:\n\n[CWE 22] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 23] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 24] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 25] ${NAME} [What is this?](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
            "markdown": `markdown version some link [here](https://github.com)\n\n## Secure Code Warrior Training\n\n#### [CWE 22] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 23] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 24] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 25] ${NAME} *[What is this?](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
        },
        "properties": {
            "tags": [
                "Tag A",
                "cwE-24",
                "Tag B",
                "Cwe_25"
            ]
        }
    });
});
