# CM Backport PR

This action will create a pull request from the indicated source branch to the destination branch with the corresponding changes. The pull request can automatically be closed once it has been created if you want.

**IMPORTANT:** This action has been created for personal use. If you want to use it, do it at your own risk.

## Usage

You can now consume the action by referencing the **v1** version:

```yaml
name: CM Backport PR

on:
  push:
    branches:
      - master

jobs:
  backport:
    name: CM Backport PR
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Backport from master to develop
        id: cmb
        uses: cristiammercado/cm-backport-pr@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          pr-from-branch: master
          pr-to-branch: develop
          pr-title: "A PR title"
          pr-body: "The PR body."
          pr-fail-if-exists: false
          pr-update-if-exists: false
          maintainer-can-modify: true
          draft: false
          merge-pr-after-created: true
          merge-commit-title: "Merge commit title"
          merge-commit-body: "Merge commit message."
          merge-method: squash

      - name: Output from action
          run: |
            echo "PR Number: ${{ steps.cmb.outputs.pr-number }}"
            echo "PR URL: ${{ steps.cmb.outputs.pr-url }}"
            echo "PR SHA: ${{ steps.cmb.outputs.pr-sha }}"
  
```

## Options

| Name                     | Description                                                                                                                                                                                                                | Required | Default                                                  |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------------------------|
| `token`                  | [Personal access token (PAT)](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) if you don't want to use the default value for this field. | False    | `${{ secrets.GITHUB_TOKEN }}`                            |
| `pr-from-branch`         | The name of the branch where your changes are implemented. This should be an existing branch on the current repository.                                                                                                    | True     |                                                          |
| `pr-to-branch`           | The name of the branch you want the changes pulled into. This should be an existing branch on the current repository.                                                                                                      | True     |                                                          |
| `pr-title`               | The title of the new pull request.                                                                                                                                                                                         | False    | \[Backport PR\] From `pr-from-branch` to `pr-to-branch`  |
| `pr-body`                | The contents of the pull request.                                                                                                                                                                                          | False    | (empty)                                                  |
| `pr-fail-if-exists`      | If there is already a PR that matches the configured branches, with this option you can control whether you want the action to throw an error.                                                                             | False    | true                                                     |
| `pr-update-if-exists`    | If there is already a PR that matches the configured branches, with this option you can update that PR with the new content.                                                                                               | False    | false                                                    |
| `maintainer-can-modify`  | Indicates whether maintainers can modify the pull request.                                                                                                                                                                 | False    | true                                                     |
| `draft`                  | Indicates whether the pull request is a draft. Check first if you can create [draft PRs](https://docs.github.com/en/rest/reference/pulls#create-a-pull-request) in the related repo.                                       | False    | false                                                    |
| `merge-pr-after-created` | Indicates whether the PR should be merged once it has been created. **Note:** Old PRs not created in this workflow will not be merged.                                                                                     | False    | false                                                    |
| `merge-commit-title`     | Title for the automatic commit message.                                                                                                                                                                                    | False    | (empty)                                                  |
| `merge-commit-body`      | Extra detail to append to automatic commit message.                                                                                                                                                                        | False    | (empty)                                                  |
| `merge-method`           | Merge method to use. Possible values are `merge`, `squash` or `rebase`.                                                                                                                                                    | False    | merge                                                    |

## Output

| Name        | Description                                                                                         |
|-------------|-----------------------------------------------------------------------------------------------------|
| `pr-number` | Number of the PR created/updated.                                                                   |
| `pr-url`    | Web URL of the PR created/updated.                                                                  |
| `pr-sha`    | SHA of the commit merged if option `merge-pr-after-created` was true, otherwise is an empty string. |


## Additional Info

This action is heavily based on the [Pull Requests GitHub Rest API](https://docs.github.com/en/rest/reference/pulls). If at any moment you want to collaborate or add some functionality, you can [create an issue](https://github.com/cristiammercado/backport-pr/issues/new) and when I have the time I will review it. I don't guarantee that it will be added to the action or fully tested.

## License

MIT
