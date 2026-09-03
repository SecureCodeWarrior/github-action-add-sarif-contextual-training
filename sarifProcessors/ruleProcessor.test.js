"use strict";

const directLinking = require('../directLinking');
const resultProcessor = require('./resultProcessor');
const ruleProcessor = require('./ruleProcessor');
const sarifLoader = require('../sarifLoader');

jest.mock('../directLinking');

beforeEach(() => {
    directLinking.getTrainingData.mockReset();
});

test('ruleProcessor should load test001 and not add anything', async () => {
    const sarifs = await sarifLoader.load('./fixtures/test001.sarif');
    for (const sarif of sarifs) {
        await ruleProcessor.processRun(sarif.runs[0], 'java', new Map([
            ['TEST01', true]
        ]));

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
    }
});

test('ruleProcessor should load test002 and add contextual micro-learning material 4 times (for cWe-352 [ONLY ONCE - cwe-----352 should not add duplicate material], cwe89, CWE: 79 and CWE_94)', async () => {
    const sarifs = await sarifLoader.load('./fixtures/test002.sarif');
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

    for (const sarif of sarifs) {
        await ruleProcessor.processRun(sarif.runs[0], 'java', new Map([
            ['TEST01', true],
            ['TEST02', true]
        ]));

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
                "text": `some help text\n\nBuild your secure coding skills and defend your code:\n\n[CWE 89] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
                "markdown": `## Build your secure coding skills and defend your code\n\n#### [CWE 89] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
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
                "text": `Some text here some text here\n\nBuild your secure coding skills and defend your code:\n\n[CWE 352] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 89] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 79] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 94] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
                "markdown": `# A Heading\n\nSome text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here some text here\n\n## A Smaller Heading\n\nMore text here more text here more text here more text here more text here more text here CWE_94 more text here more text here\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 352] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 89] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 79] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 94] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            }
        });
    }
});

test('ruleProcessor should load test003 and add 2 entries based on the rule id and name', async () => {
    const sarifs = await sarifLoader.load('./fixtures/test003.sarif');
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

    for (const sarif of sarifs) {
        await ruleProcessor.processRun(sarif.runs[0], 'java', new Map([
            ['TEST01 CWE-22', true]
        ]));

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
                "text": `some help text\n\nBuild your secure coding skills and defend your code:\n\n[CWE 22] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 23] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
                "markdown": `markdown version some link [here](https://github.com)\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 22] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 23] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            }
        });
    }
});

test('ruleProcessor should load test004 and add 4 entries based on the rule id, rule name and tags (x2)', async () => {
    const sarifs = await sarifLoader.load('./fixtures/test004.sarif');
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

    for (const sarif of sarifs) {
        await ruleProcessor.processRun(sarif.runs[0], 'python', new Map([
            ['TEST01 CWE-22', true]
        ]));

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
                "text": `some help text\n\nBuild your secure coding skills and defend your code:\n\n[CWE 22] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 23] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 24] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 25] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
                "markdown": `markdown version some link [here](https://github.com)\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 22] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 23] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 24] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 25] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
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
    }
});

test('ruleProcessor should add CWE entries and suppress phrase matches that resolve to the same training', async () => {
    const sarifs = await sarifLoader.load('./fixtures/test005.sarif');
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

    for (const sarif of sarifs) {
        await ruleProcessor.processRun(sarif.runs[0], 'java', new Map([
            ['TEST01 CWE-22', true]
        ]));

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
                "text": "SQL injection in some component"
            },
            "fullDescription": {
                "text": "There is a use-after-free vulnerability in there somewhere too"
            },
            "help": {
                "text": `some help text\n\nBuild your secure coding skills and defend your code:\n\n[CWE 22] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 23] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n[CWE 24] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`,
                "markdown": `markdown version some link [here](https://github.com)\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 22] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 23] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})\n\n#### [CWE 24] ${NAME} *[What is this? (2min video)](${VIDEOS[0]})*\n\n* ${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            },
            "properties": {
                "tags": [
                    "Tag A",
                    "cwE-24",
                    "Tag B",
                    "ssrF"
                ]
            }
        });
    }
});

test('ruleProcessor should load test006 and appropriately handle missing help object and fallback to markdown/text fullDescription', async () => {
    const sarifs = await sarifLoader.load('./fixtures/test006.sarif');
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

    for (const sarif of sarifs) {
        await ruleProcessor.processRun(sarif.runs[0], 'java', new Map([
            ['TEST01', true],
            ['TEST02', true],
            ['TEST03', true],
            ['TEST04', true],
            ['TEST05', true]
        ]));

        // TEST01 expect material added to help.text and help.markdown (normal case)
        expect(sarif.runs[0].tool.driver.rules[0]).toEqual({
            "id": "TEST01",
            "name": "Test 01 rule name cwe: 23",
            "messageStrings": {
                "default": {
                    "text": "This is the message text. It might be very long."
                }
            },
            "shortDescription": {
                "text": "short description"
            },
            "fullDescription": {
                "markdown": "full description markdown",
                "text": "full description text"
            },
            "help": {
                "markdown": "markdown version some link [here](https://github.com)\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 23] AAA *[What is this? (2min video)](ddd)*\n\n* bbb [Try this challenge in Secure Code Warrior](ccc)",
                "text": `some help text\n\nBuild your secure coding skills and defend your code:\n\n[CWE 23] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            },
            "properties": {
                "tags": [
                    "Tag A"
                ]
            }
        });

        // TEST02 expect material added to empty help.text and help.markdown
        expect(sarif.runs[0].tool.driver.rules[1]).toEqual({
            "id": "TEST02",
            "name": "Test 02 rule name",
            "messageStrings": {
                "default": {
                    "text": "This is the message text. It might be very long."
                }
            },
            "shortDescription": {
                "text": "short description"
            },
            "fullDescription": {
                "markdown": "full description markdown",
                "text": "full description text"
            },
            "help": {
                "markdown": "## Build your secure coding skills and defend your code\n\n#### [CWE 94] AAA *[What is this? (2min video)](ddd)*\n\n* bbb [Try this challenge in Secure Code Warrior](ccc)",
                "text": `Build your secure coding skills and defend your code:\n\n[CWE 94] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            },
            "properties": {
                "tags": [
                    "CWE 94"
                ]
            }
        });

        // TEST03 expect fullDescription used to init help object and then material appended
        expect(sarif.runs[0].tool.driver.rules[2]).toEqual({
            "id": "TEST03",
            "name": "Test 03 rule name",
            "messageStrings": {
                "default": {
                    "text": "This is the message text. It might be very long."
                }
            },
            "shortDescription": {
                "text": "short description"
            },
            "fullDescription": {
                "markdown": "full description markdown",
                "text": "full description text"
            },
            "help": {
                "markdown": "full description markdown\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 123] AAA *[What is this? (2min video)](ddd)*\n\n* bbb [Try this challenge in Secure Code Warrior](ccc)",
                "text": `full description text\n\nBuild your secure coding skills and defend your code:\n\n[CWE 123] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            },
            "properties": {
                "tags": [
                    "CWE 123"
                ]
            }
        });

        // TEST04 expect fullDescription.text used to init help object for both text and markdown and then material appended
        expect(sarif.runs[0].tool.driver.rules[3]).toEqual({
            "id": "TEST04",
            "name": "Test 04 rule name",
            "messageStrings": {
                "default": {
                    "text": "This is the message text. It might be very long."
                }
            },
            "shortDescription": {
                "text": "short description"
            },
            "fullDescription": {
                "text": "full description text"
            },
            "help": {
                "markdown": "full description text\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 234] AAA *[What is this? (2min video)](ddd)*\n\n* bbb [Try this challenge in Secure Code Warrior](ccc)",
                "text": `full description text\n\nBuild your secure coding skills and defend your code:\n\n[CWE 234] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            },
            "properties": {
                "tags": [
                    "CWE 234"
                ]
            }
        });

        // TEST05 expect fullDescription.text used to init help object for both text and markdown and then material appended
        expect(sarif.runs[0].tool.driver.rules[4]).toEqual({
            "id": "TEST05",
            "name": "Test 05 rule name",
            "messageStrings": {
                "default": {
                    "text": "This is the message text. It might be very long."
                }
            },
            "shortDescription": {
                "text": "short description"
            },
            "fullDescription": {
                "markdown": "full description markdown"
            },
            "help": {
                "markdown": "full description markdown\n\n## Build your secure coding skills and defend your code\n\n#### [CWE 345] AAA *[What is this? (2min video)](ddd)*\n\n* bbb [Try this challenge in Secure Code Warrior](ccc)",
                "text": `Build your secure coding skills and defend your code:\n\n[CWE 345] ${NAME} [What is this? (2min video)](${VIDEOS[0]})\n\n${DESCRIPTION} [Try this challenge in Secure Code Warrior](${URL})`
            },
            "properties": {
                "tags": [
                    "CWE 345"
                ]
            }
        });
    }
});

test('ruleProcessor should handle extension rules and preserve the CodeQL tool name by default', async () => {
    const sarifs = await sarifLoader.load('./fixtures/codeql-extension-rules.sarif');
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

    for (const sarif of sarifs) {
        await ruleProcessor.processRun(sarif.runs[0], 'java', new Map([
            ['py/path-injection', true],
            ['py/command-line-injection', true]
        ]));

        expect(sarif.runs[0].tool.driver.name).toEqual('CodeQL');
        for (const rule of sarif.runs[0].tool.extensions[0].rules) {
            expect(rule.help.text).toContain('Build your secure coding skills and defend your code:');
            expect(rule.help.markdown).toContain('## Build your secure coding skills and defend your code');
            expect(rule.help.markdown).not.toContain('Matched on');
        }
    }
});

describe('processRun - CodeQL tool name compatibility', () => {

    function createRunWithName(name) {
        return {
            tool: {
                driver: {
                    name,
                    rules: [],
                },
            },
        };
    }

    test.each([
        'CodeQL',
        'codeql',
        'CODEQL',
        'CoDeQl',
        ' CodeQL '
    ])('preserves "%s" by default', async (name) => {
        const run = createRunWithName(name);
        await ruleProcessor.processRun(run, '', new Set());
        expect(run.tool.driver.name).toBe(name);
    });

    test('renames CodeQL when compatibility behavior is enabled', async () => {
        const run = createRunWithName('  codeql  ');
        await ruleProcessor.processRun(run, '', new Set(), {
            renameCodeQLTool: true
        });
        expect(run.tool.driver.name).toBe('GitHub CodeQL');
    });

    test.each([
        'SonarQube',
        'CodeQL Pro',
        '',
        null
    ])('does not rename the unrelated name "%s"', async (name) => {
        const run = createRunWithName(name);
        await ruleProcessor.processRun(run, '', new Set(), {
            renameCodeQLTool: true
        });
        expect(run.tool.driver.name).toBe(name);
    });
});

test('ruleProcessor should not add duplicate training when SARIF is processed twice', async () => {
    const sarifs = await sarifLoader.load('./fixtures/test003.sarif');
    directLinking.getTrainingData.mockResolvedValue({
        name: 'AAA',
        description: 'bbb',
        url: 'ccc',
        videos: []
    });

    for (const sarif of sarifs) {
        const triggeredRules = new Map([
            ['TEST01 CWE-22', true]
        ]);
        await ruleProcessor.processRun(sarif.runs[0], 'java', triggeredRules);
        await ruleProcessor.processRun(sarif.runs[0], 'java', triggeredRules);

        const help = sarif.runs[0].tool.driver.rules[0].help;
        expect(help.text.match(/Build your secure coding skills and defend your code:/g)).toHaveLength(1);
        expect(help.markdown.match(/## Build your secure coding skills and defend your code/g)).toHaveLength(1);
        expect(directLinking.getTrainingData).toHaveBeenCalledTimes(2);
    }
});

test('ruleProcessor should keep processing when training lookup fails', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sarifs = await sarifLoader.load('./fixtures/test003.sarif');
    directLinking.getTrainingData.mockRejectedValue(new Error('API unavailable'));

    for (const sarif of sarifs) {
        await expect(ruleProcessor.processRun(sarif.runs[0], 'java', new Map([
            ['TEST01 CWE-22', true]
        ]))).resolves.toBeUndefined();

        expect(sarif.runs[0].tool.driver.rules[0].help).toEqual({
            text: 'some help text',
            markdown: 'markdown version some link [here](https://github.com)'
        });
    }

    warning.mockRestore();
});

test('ruleProcessor should recover missing entries after a partial failure', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sarifs = await sarifLoader.load('./fixtures/test003.sarif');
    directLinking.getTrainingData
        .mockResolvedValueOnce({
            name: 'Path traversal',
            description: 'bbb',
            url: 'https://scw.io/cwe-22',
            videos: []
        })
        .mockRejectedValueOnce(new Error('API unavailable'));

    for (const sarif of sarifs) {
        const triggeredRules = new Map([
            ['TEST01 CWE-22', true]
        ]);
        await ruleProcessor.processRun(sarif.runs[0], 'java', triggeredRules);

        directLinking.getTrainingData.mockResolvedValue({
            name: 'Relative path traversal',
            description: 'bbb',
            url: 'https://scw.io/cwe-23',
            videos: []
        });
        await ruleProcessor.processRun(sarif.runs[0], 'java', triggeredRules);

        const help = sarif.runs[0].tool.driver.rules[0].help;
        expect(help.markdown).toContain('#### [CWE 22]');
        expect(help.markdown).toContain('#### [CWE 23]');
        expect(help.markdown.match(/## Build your secure coding skills and defend your code/g)).toHaveLength(1);
    }

    warning.mockRestore();
});

test('ruleProcessor should normalize URLs before suppressing duplicate phrase entries', async () => {
    const run = {
        tool: {
            driver: {
                name: 'Example SAST',
                rules: [{
                    id: 'CWE-79 SQL injection',
                    help: {
                        text: 'Build your secure coding skills and defend your code:\n\n[CWE 79] Existing training [Try this challenge in Secure Code Warrior](https://scw.io/path%20traversal)',
                        markdown: '## Build your secure coding skills and defend your code\n\n#### [CWE 79] Existing training\n\n[Try this challenge in Secure Code Warrior](https://scw.io/path%20traversal)'
                    }
                }]
            }
        }
    };
    directLinking.getTrainingData.mockResolvedValue({
        name: 'Path traversal',
        description: 'bbb',
        url: 'https://scw.io/path traversal',
        videos: []
    });

    await ruleProcessor.processRun(run, null, new Map([
        ['CWE-79 SQL injection', true]
    ]));

    expect(run.tool.driver.rules[0].help.markdown).not.toContain('Matched on');
    expect(directLinking.getTrainingData).toHaveBeenCalledTimes(1);
});

test('ruleProcessor should enrich only the referenced component when rule IDs collide', async () => {
    const run = {
        tool: {
            driver: {
                name: 'Example SAST',
                rules: [{
                    id: 'CWE-79'
                }]
            },
            extensions: [{
                rules: [{
                    id: 'CWE-79'
                }]
            }]
        },
        results: [{
            ruleId: 'CWE-79',
            rule: {
                id: 'CWE-79',
                index: 0,
                toolComponent: {
                    index: 0
                }
            }
        }]
    };
    directLinking.getTrainingData.mockResolvedValue({
        name: 'AAA',
        description: 'bbb',
        url: 'ccc',
        videos: []
    });

    const triggeredRules = await resultProcessor.process(run);
    await ruleProcessor.processRun(run, null, triggeredRules);

    expect(run.tool.driver.rules[0].help).toBeUndefined();
    expect(run.tool.extensions[0].rules[0].help.markdown).toContain('Secure Code Warrior');
});
