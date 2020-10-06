"use strict";

const core = require('@actions/core');
const github = require('@actions/github');

// get env GITHUB_REPOSITORY (should be something like octocat/Hello-World)
const githubRepository = process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split('/');
const repoOwner = githubRepository && githubRepository[0];
const repoName = githubRepository && githubRepository[1];

const LANGUAGE_KEYS = {
    'Ansible': 'ansible',
    'C': 'c',
    'C#': 'c#',
    'C++': 'c++',
    'CloudFormation': 'cloudformation',
    'COBOL': 'cobol',
    'Docker': 'docker',
    'Dockerfile': 'docker',
    'Go': 'go',
    'HCL': 'terraform',
    'Java': 'java',
    'Java Server Pages': 'java:ee_jsp',
    'JavaScript': 'javascript',
    'Kotlin': 'kotlin:android_sdk',
    'Kubernetes': 'kubernetes',
    'Objective-C': 'objc',
    'Perl': 'perl',
    'PHP': 'php',
    'PLSQL': 'plsql',
    'PowerShell': 'powershell',
    'Python': 'python',
    'Ruby': 'ruby',
    'Rust': 'rust',
    'Scala': 'scala',
    'Swift': 'swift',
    'Terraform': 'terraform',
    'TypeScript': 'typescript'
};

async function getLanguageFromRepo(token) {
    if (!token) return null;
    if (!repoOwner || !repoName) return null;

    let language;

    try {
        const octokit = github.getOctokit(token);
        const response = await octokit.repos.get({
            owner: repoOwner,
            repo: repoName
        });
        const repo = response && response.data;
        if (!repo) throw new Error('Repo not found');

        language = LANGUAGE_KEYS[repo.language] || null;
    }
    catch (e) {
        core.error(e);
        language = null;
    }

    return language;
}

module.exports = {
    getLanguageFromRepo
};
