"use strict";

const github = require('@actions/github');
const languageResolver = require('./languageResolver');

jest.mock('@actions/github');

test('languageResolver should resolve JavaScript', async () => {
    github.getOctokit.mockImplementation(() => {
        return {
            repos: {
                get: function () {
                    return {
                        data: {
                            language: 'JavaScript'
                        }
                    }
                }
            }
        }
    });

    const token = 'abc';
    const language = await languageResolver.getLanguageFromRepo(token);
    expect(language).toEqual('javascript');
});

test('languageResolver should resolve HCL', async () => {
    github.getOctokit.mockImplementation(() => {
        return {
            repos: {
                get: function () {
                    return {
                        data: {
                            language: 'HCL'
                        }
                    }
                }
            }
        }
    });

    const token = 'abc';
    const language = await languageResolver.getLanguageFromRepo(token);
    expect(language).toEqual('terraform');
});

test('languageResolver should resolve C#', async () => {
    github.getOctokit.mockImplementation(() => {
        return {
            repos: {
                get: function () {
                    return {
                        data: {
                            language: 'C#'
                        }
                    }
                }
            }
        }
    });

    const token = 'abc';
    const language = await languageResolver.getLanguageFromRepo(token);
    expect(language).toEqual('c#');
});

test('languageResolver should not resolve TEST', async () => {
    github.getOctokit.mockImplementation(() => {
        return {
            repos: {
                get: function () {
                    return {
                        data: {
                            language: 'TEST'
                        }
                    }
                }
            }
        }
    });

    const token = 'abc';
    const language = await languageResolver.getLanguageFromRepo(token);
    expect(language).toEqual(null);
});
