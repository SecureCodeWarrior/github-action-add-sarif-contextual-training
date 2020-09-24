"use strict";

const fs = require('fs').promises;

async function load(inFilePath) {
    const sarifText = await fs.readFile(inFilePath, 'utf-8');
    const sarif = JSON.parse(sarifText);
    return sarif;
}

module.exports = {
    load
};
