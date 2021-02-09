let logger = console.log;

function setLogger(loggerFunction) {
    logger = loggerFunction;
}

function debug(message) {
    logger(message);
}

module.exports = {
    setLogger,
    debug
}