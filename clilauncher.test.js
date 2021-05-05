const fs = require('fs');

const runner = require('./runner');

const testInput = "test-resources/testInput.sarif"
const testOutput = "test-resources/output.sarif";
const expectedOutput = "test-resources/expected.sarif"

afterAll(async () => {
    fs.unlink(testOutput, () => {});
});

test('changed sarif includes Secure Code Warrior info', async () => {
    await runner.run(testInput, testOutput, null, () => {});

    expect(fs.readFileSync(testOutput)).toEqual(fs.readFileSync(expectedOutput));
});

