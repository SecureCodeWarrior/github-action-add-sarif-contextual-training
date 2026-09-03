"use strict";

const core = require('@actions/core');
const runner = require('./runner');

jest.mock('@actions/core');
jest.mock('./runner');

test('index should pass action inputs to the runner', async () => {
    core.getInput.mockImplementation((name) => ({
        inputSarifFile: 'input.sarif',
        outputSarifFile: 'output.sarif',
        languageKey: 'javascript:react'
    })[name] || '');
    core.getBooleanInput.mockReturnValue(false);
    runner.run.mockResolvedValue();

    require('./index');
    await new Promise((resolve) => setImmediate(resolve));

    expect(runner.run).toHaveBeenCalledWith(
        'input.sarif',
        'output.sarif',
        'javascript:react',
        expect.any(Function),
        {
            renameCodeQLTool: false
        }
    );
});
