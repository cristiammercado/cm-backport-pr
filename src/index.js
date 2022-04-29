const core = require('@actions/core');

const {start} = require('./logic');

const run = async () => {
    core.info(`Starting cm-backport-pr action at ${new Date()}...`);
    await start();
};

run().catch(error => core.setFailed(error.message));
