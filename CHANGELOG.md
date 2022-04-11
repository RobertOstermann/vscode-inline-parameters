# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.3] - 2021-03-31

- Fix Python AST parsing errors when using Python 2.7 - [issue #4](https://github.com/RobertOstermann/vscode-inline-parameters/issues/4)

## [1.1.2] - 2021-03-31

- Add executable path setting for Golang and Python
- Fix Python parameters not working for version less than Python 3.6 - [issue #4](https://github.com/RobertOstermann/vscode-inline-parameters/issues/4)

## [1.1.1] - 2021-03-31

- Fix regex for parsing Golang parameters - [issue #3](https://github.com/RobertOstermann/vscode-inline-parameters/issues/3)

## [1.1.0] - 2021-03-31

- Show correct parameter for methods in Golang - [issue #3](https://github.com/RobertOstermann/vscode-inline-parameters/issues/3)

## [1.0.9] - 2021-03-29

- Python Support

## [1.0.8] - 2021-03-29

- Update README

## [1.0.7] - 2021-03-29

- Golang Support

## [1.0.6] - 2021-03-07

- Fix bug in PHP when the parameter name was not found.

## [1.0.5] - 2021-03-07

- Backend changes.

## [1.0.4] - 2021-03-07

- Slight performance improvement for PHP parameters.

## [1.0.3] - 2021-03-07

- Fix bug introduced in 1.0.2

## [1.0.2] - 2021-03-07

- Attempt to improve PHP parameter functionality for larger files.

## [1.0.1] - 2021-03-03

- Fix problems with PHP parameters.

## [1.0.0] - 2021-03-03

**BREAKING CHANGES**

- Rework the extension to use the new Inlay-Hints API.
- Change the configuration properties.
- Remove Javascript support (use VSCode provided support with settings in `javascript.inlayHints`)
- Remove TypeScript support (use VSCode provided support with settings in `typescript.inlayHints`)

## [0.2.0] - 2021-11-30

- Added `renderOptions` to decorations to allow display before or after the parameter

## [0.1.9] - 2021-11-04

- Fixed problem of decorations not being removed when there are errors in the code

## [0.1.8] - 2021-11-04

- Fixed _Cannot read property `setDecorations` of undefined_

## [0.1.7] - 2021-11-02

- Update **README** to reflect accurate version, installs, and ratings

## [0.1.6] - 2021-10-31

- Fixed **largeFileOptimizations** showing wrong decorations on active editor change

## [0.1.5] - 2021-10-31

- Improved **largeFileOptimizations** to only get decorations for the lines within view
- Fixed **largeFileOptimizations** (Decorations no longer appear multiple times)
- Added CHANGELOG
