"use strict";

const fs = require('fs').promises;
const _glob = require('glob');
const path = require('path');
const glob = _glob.globSync;

const logger = require('./logger');

const regex = new RegExp(/\.sarif$/, 'i');

async function getPathType(path) {
    try {
        const fileStat = await fs.stat(path);
        if (fileStat.isDirectory()) {
            return 'directory';
        }
        else if (fileStat.isFile()) {
            return 'file';
        }
        else {
            return 'glob';
        }
    }
    catch(e) {
        // must be glob path
        return 'glob';
    }
}

async function getDirectoryFiles(inDirPath) {
    const dirents = await fs.readdir(inDirPath, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const direntPath = path.resolve(inDirPath, dirent.name);
        return dirent.isDirectory() ? getDirectoryFiles(direntPath) : direntPath;
    }));
    return files.flat(100);
}

async function loadFile(inFilePath) {
    logger.debug(`Loading file: ${inFilePath}`);
    const sarifText = await fs.readFile(inFilePath, 'utf-8');
    const sarif = JSON.parse(sarifText);
    return sarif;
}

async function load(inFilePath) {
    try {
        const fileStat = await fs.stat(inFilePath);

        if (fileStat.isDirectory()) {
            const files = await getDirectoryFiles(inFilePath);
            const result = await Promise.all(files.filter(file => {
                return regex.test(file);
            }).map(async (file) => {
                return loadFile(file);
            }));
            return result;
        }
        else if (fileStat.isFile()) {
            return [
                await loadFile(inFilePath)
            ];
        }
        else {
            throw new Error();
        }
    }
    catch(e) {
        // else assume glob or wildcard expression
        const globFiles = await glob(inFilePath);
        const result = await Promise.all(globFiles.map(async (file) => {
            return loadFile(file);
        }));
        return result;
    }
}

module.exports = {
    getPathType,
    load
};
