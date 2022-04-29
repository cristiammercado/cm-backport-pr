const core = require('@actions/core');
const github = require('@actions/github');

const {getClient} = require('./api');
const {isDefaultTitle} = require('./validation');

const getOpenPR = async (head, base, repoOwner = undefined, repoName = undefined) => {
    const owner = repoOwner ? repoOwner : github.context.repo.owner;
    const repo = repoName ? repoName : github.context.repo.repo;
    const state = 'open';

    core.info(`Checking if there is a open PR in repo ${owner}/${repo} from ${head} to ${base}...`);

    const parameters = {owner, repo, head, base, state};
    const response = await getClient().pulls.list(parameters);

    if (response && response.data && response.data.length > 0) {
        const pr = response.data[0];
        core.info(`An active PR was found: # ${pr.number} (${pr.html_url}) (draft: ${pr.draft})`);
        return pr;
    }

    core.info(`No active PR was found`);
    return null;
};

const updatePR = async (number, title, message, repoOwner = undefined, repoName = undefined) => {
    const owner = repoOwner ? repoOwner : github.context.repo.owner;
    const repo = repoName ? repoName : github.context.repo.repo;
    const state = 'open';

    core.info(`Updating PR in repo ${owner}/${repo} (PR Number: ${number})...`);

    const parameters = {owner, repo, pull_number: number, state};

    if (!isDefaultTitle() && String(title).trim().length > 0) {
        parameters.title = title;
    }

    if (String(message).trim().length > 0) {
        parameters.body = message;
    }

    const response = await getClient().pulls.update(parameters);

    if (response && response.data) {
        const pr = response.data;
        core.info(`Updated PR: # ${pr.number} (${pr.html_url}) (draft: ${pr.draft})`);
        return pr;
    }

    throw new Error(`Error updating PR in repo ${owner}/${repo} (PR Number: ${number})`);
};

const createPR = async (head, base, title, body, maintainerCanModify, draft, repoOwner = undefined, repoName = undefined) => {
    const owner = repoOwner ? repoOwner : github.context.repo.owner;
    const repo = repoName ? repoName : github.context.repo.repo;

    core.info(`Creating new PR in repo ${owner}/${repo} from ${head} to ${base} (draft: ${draft})...`);

    const parameters = {
        owner,
        repo,
        title,
        head,
        base,
        body,
        maintainer_can_modify: maintainerCanModify,
        draft
    };
    const response = await getClient().pulls.create(parameters);

    if (response && response.data) {
        const pr = response.data;
        core.info(`Created new PR: # ${pr.number} (${pr.html_url}) (draft: ${pr.draft})`);
        return pr;
    }

    throw new Error(`Error creating new PR in repo ${owner}/${repo} from ${head} to ${base} (draft: ${draft})`);
};

const mergePR = async (number, title, message, method, repoOwner = undefined, repoName = undefined) => {
    const owner = repoOwner ? repoOwner : github.context.repo.owner;
    const repo = repoName ? repoName : github.context.repo.repo;

    core.info(`Merging PR in repo ${owner}/${repo} (PR Number: ${number})...`);

    const parameters = {owner, repo, pull_number: number, merge_method: method};

    if (String(title).trim().length > 0) {
        parameters.commit_title = title;
    }

    if (String(message).trim().length > 0) {
        parameters.commit_message = message;
    }

    const response = await getClient().pulls.merge(parameters);

    if (response && response.data && response.data.sha) {
        const sha = response.data.sha;
        core.info(`Merged PR: # ${number} (SHA: ${sha})`);
        return sha;
    }

    throw new Error(`Error merging PR in repo ${owner}/${repo} (PR Number: ${number})`);
}

module.exports = {
    getOpenPR,
    updatePR,
    createPR,
    mergePR
};
