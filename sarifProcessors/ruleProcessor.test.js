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
    const name = 'AAA';
    const description = 'bbb';
    const url = 'ccc';
    const videos = ['ddd'];
    directLinking.getTrainingData.mockResolvedValue({
        name,
        description,
        url,
        videos
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
            "text": `some help text\n\nSecure Code Warrior Training:\n\n${name} - ${description} [Train Now](${url}) or [watch an explainer video](${videos[0]})`        }
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
            "text": `Some text here some text here\n\nSecure Code Warrior Training:\n\n${name} - ${description} [Train Now](${url}) or [watch an explainer video](${videos[0]})\n\n${name} - ${description} [Train Now](${url}) or [watch an explainer video](${videos[0]})\n\n${name} - ${description} [Train Now](${url}) or [watch an explainer video](${videos[0]})\n\n${name} - ${description} [Train Now](${url}) or [watch an explainer video](${videos[0]})`,
            "markdown": `# A Heading\n\nSome text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here\n\n## A Smaller Heading\n\nMore text here more text here more text here more text here more text here more text here CWE_94 more text here more text here\n\n## Secure Code Warrior Training\n\n#### ${name}\n\n${description}\n\n**[Train Now](${url})** or [watch an explainer video](${videos[0]})\n\n#### ${name}\n\n${description}\n\n**[Train Now](${url})** or [watch an explainer video](${videos[0]})\n\n#### ${name}\n\n${description}\n\n**[Train Now](${url})** or [watch an explainer video](${videos[0]})\n\n#### ${name}\n\n${description}\n\n**[Train Now](${url})** or [watch an explainer video](${videos[0]})`
        }
    });
});

test('ruleProcessor should load test003 and add 2 entries based on the rule id and name', async () => {
    const sarif = await sarifLoader.load('./fixtures/test003.sarif');
    const name = 'AAA';
    const description = 'bbb';
    const url = 'ccc';
    const videos = ['ddd'];
    directLinking.getTrainingData.mockResolvedValue({
        name,
        description,
        url,
        videos
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
          "text": `some help text\n\nSecure Code Warrior Training:\n\n${name} - ${description} [Train Now](${url}) or [watch an explainer video](${videos[0]})\n\n${name} - ${description} [Train Now](${url}) or [watch an explainer video](${videos[0]})`,
          "markdown": `markdown version some link [here](https://github.com)\n\n## Secure Code Warrior Training\n\n#### ${name}\n\n${description}\n\n**[Train Now](${url})** or [watch an explainer video](${videos[0]})\n\n#### ${name}\n\n${description}\n\n**[Train Now](${url})** or [watch an explainer video](${videos[0]})`
        }
      });
});
