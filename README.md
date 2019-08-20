# Farquest

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

![Logo](src/assets/logo.svg)

A AWS lambda to kick off a AWS Fargate Task with a custom payload, return the response, and close the task afterwards.

## Running locally

- Clone the repository

- Install the depedencies running:
  
  ```bash
  npm i
  ```

- Create your custom `.env` file following the example provided `.env.example`

- Fill the `tests/samples/payload.json` with your custom payload

- Execute the lambda with a `npm start`, or alternativelly, by executing the container with a `docker-compose run --rm lambda`

    > If running through the container, remember to build the image first. Also, you could try [nicely ask docker](https://github.com/IcaliaLabs/plis) for container operations if you're into it.

## Running in AWS Lambda

- Configure your environment variables

- Hit your lambda with a request

- Profit

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center">
        <a href="https://twitter.com/_nikolas_vs"><img src="https://avatars1.githubusercontent.com/u/7339932?s=460&v=4" width="100px;" alt="Nikolas V. Serafini"/><br /><sub><b>Nikolas V. Serafini</b></sub></a><br /> <a href="https://github.com/Emethium/farquest/commits?author=Emethium" title="Code">💻</a><a href="#infra-jakebolam" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Emethium/farquest/commits?author=Emethium" title="Documentation">📖</a> <a href="#review-kentcdodds" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-jakebolam" title="Maintenance">🚧<a>
    </td>
    <td align="center">
        <a href="https://medium.com/@pedrogryzinsky"><img src="https://avatars1.githubusercontent.com/u/8284669?s=460&v=4" width="100px;" alt="Nikolas V. Serafini"/><br /><sub><b>Pedro Gryzinsky</b></sub></a><br /> <a href="https://github.com/Emethium/farquest/commits?author=pedrogryzinsky" title="Code">💻</a><a href="#infra-jakebolam" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Emethium/farquest/commits?author=pedrogryzinsky" title="Documentation">📖</a> <a href="#review-kentcdodds" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-jakebolam" title="Maintenance">🚧<a>
    </td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://allcontributors.org) specification.
