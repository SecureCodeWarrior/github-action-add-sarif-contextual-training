"use strict";

const fetch = require('node-fetch');
const logger = require('./logger');

const API_URL_ORIGIN = 'https://integration-api.securecodewarrior.com';
const API_URL_PATH = '/api/v1/trial';
const PARTNER_ID = 'github-sarif-action';

async function getTrainingData(mappingListId, mappingKey, languageKey) {

    logger.debug('getTrainingData:enter');

    // create an list of values to populate into the Id param of the DI linking API
    let idValue = [PARTNER_ID];
    //process.env.GITHUB_REPOSITORY.split('/')
    logger.debug('process.env.GITHUB_REPOSITORY', process.env.GITHUB_REPOSITORY);
    if (process.env.GITHUB_REPOSITORY) {
        idValue.push(process.env.GITHUB_REPOSITORY.split('/')[0]);
    }

    let url;
    if (languageKey) {
        url = `${API_URL_ORIGIN}${API_URL_PATH}?Id=z${idValue.join(':')}&MappingList=${mappingListId}&MappingKey=${mappingKey}&LanguageKey=${languageKey}`;
    }
    else {
        url = `${API_URL_ORIGIN}${API_URL_PATH}?Id=z${idValue.join(':')}&MappingList=${mappingListId}&MappingKey=${mappingKey}`;
    }

    logger.debug('getTrainingData:exit');

    return fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Received error response', response);
            }
            return response.json();
        });

    
}

module.exports = {
    getTrainingData
}
