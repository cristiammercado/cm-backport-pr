const core = require('@actions/core');

const {readInputParameters} = require('../src/validation');
const {initClient} = require('../src/api');
const {getOpenPR, updatePR, createPR, mergePR} = require('../src/pr');

const inputParameters = {
    token: 'look-for-a-valid-token',
    prFromBranch: 'feature/test',
    prToBranch: 'develop',
    prTitle: '',
    prBody: '',
    prFailIfExists: false,
    prUpdateIfExists: true,
    maintainerCanModify: true,
    draft: false,
    mergePRAfterCreated: true,
    mergeCommitTitle: '',
    mergeCommitBody: '',
    mergeMethod: 'squash'
};

const fakeOwner = 'cristiammercado';
const fakeRepo = 'test';

test('Validate draft and automatic merge input values', () => {
    expect(() => readInputParameters({
        prUpdateState: 'open',
        maintainerCanModify: true,
        draft: true,
        mergePRAfterCreated: true,
        mergeCommitTitle: 'any',
        mergeCommitBody: 'any'
    })).toThrow(`Cannot set 'draft' with value true and 'merge-pr-after-created' with value true: It's not possible to merge a PR draft`);
});

test('Validate merge method for automatic merge input value', () => {
    expect(() => readInputParameters({
        prUpdateState: 'open',
        maintainerCanModify: true,
        mergePRAfterCreated: true,
        mergeCommitTitle: 'any',
        mergeCommitBody: 'any',
        mergeMethod: 'any'
    })).toThrow(`'merge-method' doesn't have a valid value: any. Valid values are merge, squash, rebase`);
});

test.skip('Full flow', async () => {

    // Read input parameters from workflow
    const options = readInputParameters(inputParameters);

    // Init REST API Client with auth token
    initClient(options.token);

    // Get open PR
    let pr = await getOpenPR(options.prFromBranch, options.prToBranch, fakeOwner, fakeRepo);

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
        pr = await updatePR(pr.number, options.prTitle, options.prBody, fakeOwner, fakeRepo);
    } else {
        // Create PR if not exists
        pr = await createPR(options.prFromBranch, options.prToBranch, options.prTitle, options.prBody, options.maintainerCanModify, options.draft, fakeOwner, fakeRepo);
    }

    let sha = '';

    if (options.mergePRAfterCreated) {
        // If automatic merge is active, merge PR
        sha = await mergePR(pr.number, options.mergeCommitTitle, options.mergeCommitBody, options.mergeMethod, fakeOwner, fakeRepo);
    }

    console.log('Results:', pr.number, pr.html_url, sha);

    expect(pr.number).toBeDefined();
    expect(pr.html_url).toBeDefined();
    expect(sha).toBeDefined();
});
