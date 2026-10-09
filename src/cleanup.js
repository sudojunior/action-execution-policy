import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { SCOPE } from './constants';

try {
    let inputScope = core.getInput("execution-scope", { required: false }) ?? 'CurrentUser';
    const revert = core.getBooleanInput("revert-on-completion", { required: false }) ?? true;

    SCOPE.assert(inputScope);
    inputScope = SCOPE.get(inputScope);

    const policy = core.getState("policy");

    // if (revert === false || policy === undefined) process.exit(1);

    if (revert && policy !== '') {
        await exec(`powershell -command 'Set-ExecutionPolicy -Scope ${inputScope} -ExecutionPolicy ${policy}'`);
        core.info(`Policy has been reverted to ${policy}.`);
    }
} catch (error) {
    core.setFailed(error.message);
}