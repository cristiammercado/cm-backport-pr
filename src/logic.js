const core = require('@actions/core');

const {initClient} = require('./api');
const {getOpenPR, createPR, mergePR, updatePR} = require('./pr');
const {readInputParameters} = require('./validation');

const start = async () => {

    // Read input parameters from workflow
    const options = readInputParameters();

    // Init REST API Client with auth token
    initClient(options.token);

    // Get open PR
    let pr = await getOpenPR(options.prFromBranch, options.prToBranch);

    if (pr !== null && options.prFailIfExists) {
        throw new Error(`An active PR was found ('pr-fail-if-exists' is true): # ${pr.number} (${pr.html_url}) (draft: ${pr.draft})`)
    }

    if (pr !== null && !options.prUpdateIfExists) {
        core.warning(`An active PR was found but 'pr-update-if-exists' is false, finished action tasks`);

        core.setOutput('pr-number', pr.number);
        core.setOutput('pr-url', pr.html_url);
        core.setOutput('pr-sha', '');

        return;
    }

    // If PR is found but is a draft, cannot be merged if mergePRAfterCreated is true
    if (pr !== null && pr.draft && options.mergePRAfterCreated) {
        throw new Error(`An active PR was found but it cannot be merged, it's a draft (merge-pr-after-created: true): # ${pr.number} (${pr.html_url}) (draft: ${pr.draft})`);
    }

    if (pr !== null) {
        // Update current PR
        pr = await updatePR(pr.number, options.prTitle, options.prBody);
    } else {
        // Create PR if not exists
        pr = await createPR(options.prFromBranch, options.prToBranch, options.prTitle, options.prBody, options.maintainerCanModify, options.draft);
    }

    let sha = '';

    if (options.mergePRAfterCreated) {
        // If automatic merge is active, merge PR
        sha = await mergePR(pr.number, options.mergeCommitTitle, options.mergeCommitBody, options.mergeMethod);
    }

    core.setOutput('pr-number', pr.number);
    core.setOutput('pr-url', pr.html_url);
    core.setOutput('pr-sha', sha);
};

module.exports = {
    start
};
