const core = require('@actions/core');

const mergeMethods = ['merge', 'squash', 'rebase'];

let defaultPRTitle = false;

const readInputParameters = (options = undefined) => {

    if (options !== undefined) {
        core.info('Reading input parameters from internal method...');
        return validateOptions(options);
    }

    core.info('Reading input parameters from GitHub workflow...');

    const inputOptions = {
        token: core.getInput('token', {required: true, trimWhitespace: true}),
        prFromBranch: core.getInput('pr-from-branch', {required: true}),
        prToBranch: core.getInput('pr-to-branch', {required: true}),
        prTitle: core.getInput('pr-title', {trimWhitespace: true}),
        prBody: core.getInput('pr-body', {trimWhitespace: true}),
        prFailIfExists: core.getBooleanInput('pr-fail-if-exists'),
        prUpdateIfExists: core.getBooleanInput('pr-update-if-exists'),
        maintainerCanModify: core.getBooleanInput('maintainer-can-modify'),
        draft: core.getBooleanInput('draft'),
        mergePRAfterCreated: core.getBooleanInput('merge-pr-after-created'),
        mergeCommitTitle: core.getInput('merge-commit-title', {trimWhitespace: true}),
        mergeCommitBody: core.getInput('merge-commit-body', {trimWhitespace: true}),
        mergeMethod: core.getInput('merge-method')
    };

    return validateOptions(inputOptions);
};

const validateOptions = (inputs = {}) => {
    const errors = [];
    core.info('Validating input parameters...');

    if (String(inputs.prTitle).trim().length === 0) {
        inputs.prTitle = `[Backport PR] From ${inputs.prFromBranch} to ${inputs.prToBranch}`;
        defaultPRTitle = true;
    }

    if (inputs.draft && inputs.mergePRAfterCreated) {
        errors.push(`Cannot set 'draft' with value ${inputs.draft} and 'merge-pr-after-created' with value ${inputs.mergePRAfterCreated}: It's not possible to merge a PR draft`);
    }

    if (!mergeMethods.includes(inputs.mergeMethod)) {
        errors.push(`'merge-method' doesn't have a valid value: ${inputs.mergeMethod}. Valid values are ${mergeMethods.join(', ')}`);
    }

    if (errors.length > 0) {
        core.warning(`${errors.length} errors were found in the input parameters. Please check and try again`);
        throw new Error(errors.toString());
    }

    core.info('Input parameters validation passed successfully');

    return inputs;
};

const isDefaultTitle = () => defaultPRTitle;

module.exports = {
    readInputParameters,
    isDefaultTitle
}
