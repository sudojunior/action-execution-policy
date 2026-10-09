import * as core from '@actions/core';
import {exec, getExecOutput} from '@actions/exec';
import { EXECUTION_POLICY, SCOPE } from './constants';

try {
    let inputPolicy = core.getInput("execution-policy", { required: true });
    let inputScope = core.getInput("execution-scope", { required: false }) ?? 'CurrentUser';
    const revert = core.getBooleanInput("revert-on-completion", { required: false }) ?? true;
    const force = core.getBooleanInput("force-policy", { required: false }) ?? false;

    EXECUTION_POLICY.assert(inputPolicy);
    inputPolicy = EXECUTION_POLICY.get(inputPolicy);

    SCOPE.assert(inputScope);
    inputScope = SCOPE.get(inputScope);

    const currentPolicy = await getExecOutput(`powershell -command 'Get-ExecutionPolicy -Scope ${inputScope}'`);

    core.setOutput("original-policy", currentPolicy);

    if (!force && currentPolicy.stdout === inputPolicy) {
        core.info("ExecutionPolicy override is not needed, as policy already matches for this scope.");
        process.exit(1);
    }

    if (revert) {
        core.saveState("policy", currentPolicy);
        core.info(`Current policy '${currentPolicy}' has been saved into state.`);
    }

    await exec(`powershell -command 'Set-ExecutionPolicy -Scope ${inputScope} -ExecutionPolicy ${inputPolicy}'`);
    core.info(`Policy set to '${inputPolicy}' for '${inputScope}'`);
} catch (error) {
    core.setFailed(error.message);
}