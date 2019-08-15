<a href="https://gramps.js.org/"><img src="https://gramps.js.org/assets/img/gramps-banner.png" alt="GrAMPS · An easier way to manage the data sources powering your GraphQL server" width="450"></a>
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors)

# GrAMPS CLI — Tools for Data Source Development

[![license](https://img.shields.io/npm/l/@gramps/cli.svg)](https://github.com/gramps-graphql/gramps-cli/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@gramps/cli.svg?style=flat)](https://www.npmjs.com/package/@gramps/cli) [![Build Status](https://travis-ci.org/gramps-graphql/gramps-cli.svg?branch=master)](https://travis-ci.org/gramps-graphql/gramps-cli) [![Maintainability](https://api.codeclimate.com/v1/badges/6e50700346b19721b006/maintainability)](https://codeclimate.com/github/gramps-graphql/gramps-cli/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/6e50700346b19721b006/test_coverage)](https://codeclimate.com/github/gramps-graphql/gramps-cli/test_coverage) [![Greenkeeper badge](https://badges.greenkeeper.io/gramps-graphql/gramps-cli.svg)](https://greenkeeper.io/) [![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors)

## Quickstart

To get started with the GrAMPS CLI:

```bash
# Install the CLI
yarn add --dev @gramps/cli@beta
# npm install --save-dev @gramps/cli@beta
```

> **NOTE:** We prefer Yarn, but if you use npm, use the alternative commands shown in comments below each example.

### Start an empty development gateway

```bash
$(yarn bin)/gramps dev
# $(npm bin)/gramps dev
```

This will start a gateway server on port 8080 (or a random port if 8080 is in use). You can open the GraphQL Playground at http://localhost:8080/playground to verify the gateway is working.

### Develop a data source locally

If you're working on a custom data source, you can test it by running the following:

```bash
# Using live data
$(yarn bin)/gramps dev --data-source ../my-data-source
# $(npm bin)/gramps dev --data-source ../my-data-source

# Turn on mock data
$(yarn bin)/gramps dev --data-source ../my-data-source --mock
# $(npm bin)/gramps dev --data-source ../my-data-source --mock
```

> **NOTE:** You can develop using multiple local data sources by passing multiple paths to the `--data-sources` option (an alias of `--data-source`):
>
> ```bash
> $(yarn bin)/gramps dev --data-sources ./one ./two
> # $(npm bin)/gramps dev --data-sources ./one ./two
> ```
>
> This is helpful if you're working on something like [schema stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html).

### Start a custom GraphQL gateway

When working with the CLI, any GrAMPS-powered gateway can be used for development — just provide the path to its start script in the `--gateway` option:

```bash
$(yarn bin)/gramps dev --gateway ../my-gateway
# $(npm bin)/gramps dev --gateway ../my-gateway
```

> **NOTE:** This is useful for running a production gateway locally.

### Use a local data source with a custom gateway

```bash
$(yarn bin)/gramps dev -g ./gateway -d ./data-source
# $(npm bin)/gramps dev -g ./gateway -d ./data-source
```

> **NOTE:** For brevity, the shorthand of `--gateway` and `--data-source` — `-g` and `-d` respectively — are used here.

If the data source is already installed on the gateway, GrAMPS will override it with the local version. This is extremely useful for debugging, maintenance, and experimentation.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/163561?v=4" width="100px;"/><br /><sub><b>Jason Lengstorf</b></sub>](https://code.lengstorf.com)<br />[💻](https://github.com/gramps-graphql/gramps-cli/commits?author=jlengstorf "Code") [📖](https://github.com/gramps-graphql/gramps-cli/commits?author=jlengstorf "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/5205440?v=4" width="100px;"/><br /><sub><b>Eric Wyne</b></sub>](https://github.com/ecwyne)<br />[💻](https://github.com/gramps-graphql/gramps-cli/commits?author=ecwyne "Code") | [<img src="https://avatars0.githubusercontent.com/u/2964921?v=4" width="100px;"/><br /><sub><b>Tim Schoenheider</b></sub>](https://github.com/timrs2998)<br />[📖](https://github.com/gramps-graphql/gramps-cli/commits?author=timrs2998 "Documentation") |
| :---: | :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
