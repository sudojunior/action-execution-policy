# action-execution-policy

Set PowerShell's ExecutionPolicy for this run.

*This is primarily designed for self-hosted runners, where the execution policy isn't usually set to allow PowerShell to be used the way Actions expects. By default, it is set to revert the policy upon completion.*

## Usage

```yml
# Defaults
- uses: sudojunior/action-execution-policy@v1
  with:
    execution-policy: Bypass
    execution-scope: CurrentUser
    revert-on-completion: 'true'
    # force-policy: 'false'
```