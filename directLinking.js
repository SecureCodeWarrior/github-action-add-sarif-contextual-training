"use strict";

const fetch = require('node-fetch');
const { URL, URLSearchParams } = require('url');

const API_URL_ORIGIN = 'https://integration-api.securecodewarrior.com';
const API_URL_PATH = '/api/v1/trial';
const PARTNER_ID = 'github-sarif-action';
const INTEGRATION_ID = 'github';
const MAX_ATTEMPTS = 3;
const MIN_REQUEST_INTERVAL_MS = 100;
const REQUEST_TIMEOUT_MS = 10000;
const RETRY_BASE_DELAY_MS = 250;
const MAX_RETRY_DELAY_MS = 5000;

const responseCache = new Map();
let lastRequestStartedAt = 0;
let requestQueue = Promise.resolve();

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function buildUrl(mappingListId, mappingKey, languageKey) {
    const idValue = [PARTNER_ID];
    if (process.env.GITHUB_REPOSITORY) {
        const githubOwner = process.env.GITHUB_REPOSITORY.split('/')[0];
        idValue.push(githubOwner);
    }

    const query = new URLSearchParams({
        Id: idValue.join(':'),
        MappingList: mappingListId,
        MappingKey: mappingKey,
        IntegrationId: INTEGRATION_ID
    });
    if (languageKey) {
        query.set('LanguageKey', languageKey);
    }

    const url = new URL(API_URL_PATH, API_URL_ORIGIN);
    url.search = query.toString();
    return url.toString();
}

function getRetryDelay(response, attempt) {
    const retryAfter = response.headers && response.headers.get('retry-after');
    if (retryAfter && /^\d+(\.\d+)?$/.test(retryAfter)) {
        const retryDelay = Number(retryAfter) * 1000;
        return retryDelay <= MAX_RETRY_DELAY_MS ? retryDelay : null;
    }

    return RETRY_BASE_DELAY_MS * (2 ** attempt);
}

async function throttle() {
    const elapsed = Date.now() - lastRequestStartedAt;
    const waitTime = Math.max(0, MIN_REQUEST_INTERVAL_MS - elapsed);
    if (waitTime > 0) {
        await sleep(waitTime);
    }
    lastRequestStartedAt = Date.now();
}

async function fetchTrainingData(url) {
    let lastError;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        await throttle();

        const controller = new global.AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(url, {
                signal: controller.signal
            });
            if (response.ok) {
                return await response.json();
            }
        }
        catch (error) {
            lastError = error;
            if (attempt === MAX_ATTEMPTS - 1) {
                throw error;
            }
            await sleep(RETRY_BASE_DELAY_MS * (2 ** attempt));
            continue;
        }
        finally {
            clearTimeout(timeout);
        }

        if (response.body && typeof response.body.destroy === 'function') {
            response.body.destroy();
        }

        const error = new Error(`Secure Code Warrior API returned ${response.status} ${response.statusText || ''}`.trim());
        error.status = response.status;
        lastError = error;

        const isRetryable = response.status === 429 || (response.status >= 500 && response.status <= 599);
        if (!isRetryable || attempt === MAX_ATTEMPTS - 1) {
            throw error;
        }

        const retryDelay = getRetryDelay(response, attempt);
        if (retryDelay === null) {
            throw error;
        }
        await sleep(retryDelay);
    }

    throw lastError;
}

async function getTrainingData(mappingListId, mappingKey, languageKey) {
    const url = buildUrl(mappingListId, mappingKey, languageKey);
    if (responseCache.has(url)) {
        return responseCache.get(url);
    }

    const request = requestQueue.then(() => fetchTrainingData(url));
    requestQueue = request.catch(() => {});
    responseCache.set(url, request);

    try {
        return await request;
    }
    catch (error) {
        responseCache.delete(url);
        throw error;
    }
}

function resetForTesting() {
    responseCache.clear();
    lastRequestStartedAt = 0;
    requestQueue = Promise.resolve();
}

module.exports = {
    getTrainingData,
    resetForTesting
};
