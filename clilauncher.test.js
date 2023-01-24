const fs = require('fs');

const runner = require('./runner');

const testInput = "test-resources/testInput.sarif"
const testOutput = "test-resources/output.sarif";
const expectedOutput = "test-resources/expected.sarif"

describe('cli launcher tests', () => {
    afterEach((done) => {
        fs.unlink(testOutput, done);
    }, 15000);

    it('changed sarif includes Secure Code Warrior info', async () => {
        await runner.run(testInput, testOutput, null, () => {});

        const jsonOutput = JSON.stringify(JSON.parse(fs.readFileSync(testOutput, { encoding: 'utf8' })), null, 2);
        const jsonExpected = JSON.stringify(JSON.parse(fs.readFileSync(expectedOutput, { encoding: 'utf8' })), null, 2);

        expect(jsonOutput).toEqual(jsonExpected);
    }, 15000);
});
