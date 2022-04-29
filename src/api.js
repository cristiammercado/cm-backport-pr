const github = require('@actions/github');
const core = require('@actions/core');

let client = undefined;

const initClient = (token = '') => {
    client = github.getOctokit(token);
    core.info('Started Octokit REST API client with auth token');
};

const getClient = () => {
    if (client === null || client === undefined) {
        throw new Error('Octokit REST API client was not initialized');
    }

    return client.rest;
};

module.exports = {
    initClient,
    getClient
}
