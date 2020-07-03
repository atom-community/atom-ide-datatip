# Contributing

## Getting Started

In order to contribute a bug fix or a feature, follow these steps:

1. Fork the repository

2. Make a branch for your fix or feature

3. When you've tested out your fix or new feature, commit using commit message guidelines as listed below.

4. Submit a Pull Request to the main github repository (that you initially cloned from).

5. Celebrate! :tada:

## Commit Message Guidelines

To make package deployment easier, we've opted to use Travis CI to deploy and version our package. When a PR is merged into master, it looks at all of the commits since the last release and figures out what the new version should be and then releases. In order to figure out what the next version should be, we need to use a commit message format that allows us to indicate how the commit affects the code base.

### Format

The format we follow is:

"[type]: [message]

[optional description]

[optional footer]"

_Type_: Here are the types available and when they should be used:

| Type            | Effect                                                         | Used for                                                            |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- |
| fix             | Creates a patch release                                        | Bug fixes that don't break the public API                           |
| feat            | Creates a minor release                                        | Features added that don't break the public API                      |
| BREAKING CHANGE | Creates a major release (this is only used after we reach 1.0) | Features or bug fixes that require breaking changes                 |
| chore           | Does not make a release                                        | Development work that doesn't affect the core package functionality |

Please checkout the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.3/#summary) to find more types and what they do.

_Message_: can be anything you want. Start with a lower case. Limit the first line (type and message) to 50 chars.

_Description_: try to describe _why_ your change was needed rather than _what_ your change was (we can see that in the code). Wrap lines at 72 chars.

_Footer_: If your bug fix or feature is related to a github issue, this is where you would link it. For example, `Fixes: #1`.

### More Info

**Semantic Releases**: https://github.com/semantic-release/semantic-release
**Commit Message Format**: https://www.conventionalcommits.org/en/v1.0.0-beta.3/#summary
**Commit Message Best Practices**: https://chris.beams.io/posts/git-commit/
