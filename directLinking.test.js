"use strict";

const fetch = require('node-fetch');
const { URL } = require('url');
const directLinking = require('./directLinking');

jest.mock('node-fetch');

const TRAINING_DATA = {
    name: 'Cross-site scripting',
    description: 'Test description',
    url: 'https://portal.securecodewarrior.com/training',
    videos: []
};

function createResponse(status, data = TRAINING_DATA, retryAfter = null) {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        headers: {
            get: jest.fn(() => retryAfter)
        },
        json: jest.fn().mockResolvedValue(data)
    };
}

beforeEach(() => {
    fetch.mockReset();
    directLinking.resetForTesting();
});

test('directLinking should include owner tracking, integration id and language key', async () => {
    fetch.mockResolvedValue(createResponse(200));

    await directLinking.getTrainingData('cwe', '79', 'javascript:react');

    const requestUrl = new URL(fetch.mock.calls[0][0]);
    expect(requestUrl.searchParams.get('Id')).toEqual('github-sarif-action:scw');
    expect(requestUrl.searchParams.get('MappingList')).toEqual('cwe');
    expect(requestUrl.searchParams.get('MappingKey')).toEqual('79');
    expect(requestUrl.searchParams.get('IntegrationId')).toEqual('github');
    expect(requestUrl.searchParams.get('LanguageKey')).toEqual('javascript:react');
    expect(fetch.mock.calls[0][1].signal).toBeDefined();
});

test('directLinking should omit an empty language key', async () => {
    fetch.mockResolvedValue(createResponse(200));

    await directLinking.getTrainingData('cwe', '79', null);

    const requestUrl = new URL(fetch.mock.calls[0][0]);
    expect(requestUrl.searchParams.has('LanguageKey')).toEqual(false);
});

test('directLinking should cache duplicate requests', async () => {
    fetch.mockResolvedValue(createResponse(200));

    const first = await directLinking.getTrainingData('cwe', '79', 'javascript');
    const second = await directLinking.getTrainingData('cwe', '79', 'javascript');

    expect(first).toEqual(TRAINING_DATA);
    expect(second).toEqual(TRAINING_DATA);
    expect(fetch).toHaveBeenCalledTimes(1);
});

test('directLinking should retry rate-limited requests', async () => {
    fetch
        .mockResolvedValueOnce(createResponse(429, null, '0'))
        .mockResolvedValueOnce(createResponse(200));

    await expect(directLinking.getTrainingData('cwe', '79', null)).resolves.toEqual(TRAINING_DATA);

    expect(fetch).toHaveBeenCalledTimes(2);
});

test('directLinking should not retry before a long Retry-After delay expires', async () => {
    fetch.mockResolvedValue(createResponse(429, null, '60'));

    await expect(directLinking.getTrainingData('cwe', '79', null)).rejects.toMatchObject({
        status: 429
    });

    expect(fetch).toHaveBeenCalledTimes(1);
});

test('directLinking should retry any server error', async () => {
    fetch
        .mockResolvedValueOnce(createResponse(520, null, '0'))
        .mockResolvedValueOnce(createResponse(200));

    await expect(directLinking.getTrainingData('cwe', '79', null)).resolves.toEqual(TRAINING_DATA);

    expect(fetch).toHaveBeenCalledTimes(2);
});

test('directLinking should not retry non-transient responses', async () => {
    fetch.mockResolvedValue(createResponse(400));

    await expect(directLinking.getTrainingData('cwe', 'invalid', null)).rejects.toMatchObject({
        status: 400
    });

    expect(fetch).toHaveBeenCalledTimes(1);
});

test('directLinking should evict failed requests from the cache', async () => {
    fetch
        .mockResolvedValueOnce(createResponse(400))
        .mockResolvedValueOnce(createResponse(200));

    await expect(directLinking.getTrainingData('cwe', '79', null)).rejects.toMatchObject({
        status: 400
    });
    await expect(directLinking.getTrainingData('cwe', '79', null)).resolves.toEqual(TRAINING_DATA);

    expect(fetch).toHaveBeenCalledTimes(2);
});

test('directLinking should keep the timeout active while reading the response body', async () => {
    jest.useFakeTimers();
    fetch.mockImplementation((url, options) => Promise.resolve({
        ok: true,
        status: 200,
        headers: {
            get: jest.fn()
        },
        json: () => new Promise((resolve, reject) => {
            void resolve;
            options.signal.addEventListener('abort', () => {
                const error = new Error('The operation was aborted');
                error.name = 'AbortError';
                reject(error);
            });
        })
    }));

    const request = directLinking.getTrainingData('cwe', '79', null);
    const rejection = request.catch((error) => error);
    await jest.runAllTimersAsync();

    await expect(rejection).resolves.toMatchObject({
        name: 'AbortError'
    });
    expect(fetch).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
});
