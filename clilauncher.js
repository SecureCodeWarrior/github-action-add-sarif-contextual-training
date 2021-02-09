const logger = require('./logger');
const runner = require('./runner');

async function start() {
    logger.setLogger((msg) => console.log("[DEBUG]" + msg));
    const onFailure = (message) => console.log(message);

    console.log(process.argv);
    const args = process.argv.splice(2);
    if (args.length !== 2) {
        onFailure("Requires 2 arguments");
        usage();
        return;
    }

    let inFile = args[0];
    let outFile = args[1];

    runner.run(inFile, outFile, null, onFailure);
}

function usage() {
    console.log("usage: clilauncher.js <inputfile> <outputfile>");
}

start();