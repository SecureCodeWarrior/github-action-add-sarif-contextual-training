"use strict";

const fetch = require('node-fetch');

const API_URL_ORIGIN = 'https://integration-api.securecodewarrior.com';
const API_URL_PATH = '/api/v1/trial';
const PARTNER_ID = 'github-sarif-action';

async function getTrainingData(mappingListId, mappingKey, languageKey) {
    let url;
    if (languageKey) {
        url = `${API_URL_ORIGIN}${API_URL_PATH}?Id=${PARTNER_ID}&MappingList=${mappingListId}&MappingKey=${mappingKey}&LanguageKey=${languageKey}`;
    }
    else {
        url = `${API_URL_ORIGIN}${API_URL_PATH}?Id=${PARTNER_ID}&MappingList=${mappingListId}&MappingKey=${mappingKey}`;
    }
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
