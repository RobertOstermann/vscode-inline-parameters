# Inline Parameters for VSCode

<p align="center">
  <img src="https://raw.githubusercontent.com/imliam/vscode-inline-parameters/master/icon.png" alt="Inline Parameters for VSCode">
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.inline-parameters-extended"><img src="https://vsmarketplacebadge.apphb.com/version-short/RobertOstermann.inline-parameters-extended.svg" alt="VS Marketplace Version"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.inline-parameters-extended"><img src="https://vsmarketplacebadge.apphb.com/installs-short/RobertOstermann.inline-parameters-extended.svg" alt="VS Marketplace Installs"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.inline-parameters-extended"><img src="https://vsmarketplacebadge.apphb.com/rating-short/RobertOstermann.inline-parameters-extended.svg" alt="VS Marketplace Rating"></a>
</p>
  
<h2 align="center">
Implement the new Inlay Hints API to add Inline Parameters for Java, Lua, and PHP. 
</h2>

<p align="center">
  <img src="https://raw.githubusercontent.com/imliam/vscode-inline-parameters/master/example.gif" alt="Example of extension">
</p>

This is a feature that was [popularized by JetBrains' IDEs](https://blog.jetbrains.com/phpstorm/2017/03/new-in-phpstorm-2017-1-parameter-hints/) that can give you additional context when reading your code, making it easier to understand what different function parameters refer to by showing the parameter's name inline.

Speed up your development with parameter hints!

## Language Support

Currently, this extension supports the following languages:

- Java
- Lua (with [Sumneko's Lua language server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua))
- PHP (with the [Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) language server)

## Settings

The extension provides a handful of configuration settings you can use to customise the look and behaviour of the parameters.

| Name                                                     | Description                                                                                                            | Default |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------- |
| `inline-parameters.java.enabled`                         | Show inline parameters for Java                                                                                        | `true`  |
| `inline-parameters.java.hintBeforeParameter`             | Should the inlay hint appear before the parameter. If this is set to `false` the hint will appear after the parameter. | `true`  |
| `inline-parameters.java.showVariadicNumbers`             | Show the number of times a variadic parameter has been called                                                          | `true`  |
| `inline-parameters.java.suppressWhenArgumentMatchesName` | If the value given to a parameter is the same as the parameter name, hide the parameter name                           | `true`  |
| `inline-parameters.lua.enabled`                          | Show inline parameters for Lua                                                                                         | `true`  |
| `inline-parameters.lua.hintBeforeParameter`              | Should the inlay hint appear before the parameter. If this is set to `false` the hint will appear after the parameter. | `true`  |
| `inline-parameters.lua.suppressWhenArgumentMatchesName`  | If the value given to a parameter is the same as the parameter name, hide the parameter name                           | `true`  |
| `inline-parameters.php.enabled`                          | Show inline parameters for PHP                                                                                         | `true`  |
| `inline-parameters.php.hintBeforeParameter`              | Should the inlay hint appear before the parameter. If this is set to `false` the hint will appear after the parameter. | `true`  |
| `inline-parameters.php.showDollarSign`                   | Show the $ character before PHP parameter names                                                                        | `false` |
| `inline-parameters.php.showVariadicNumbers`              | Show the number of times a variadic parameter has been called                                                          | `true`  |
| `inline-parameters.php.suppressWhenArgumentMatchesName`  | If the value given to a parameter is the same as the parameter name, hide the parameter name                           | `true`  |

## Inlay Hint Settings

This extension utilizes the Inlay-Hints API provided by VSCode. Here are some additional settings provided by VSCode.

| Name                           | Description                                                                                                                                                                       | Default |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `editor.inlayHints.enabled`    | Enables Inlay Hints for the editor.                                                                                                                                               | `true`  |
| `editor.inlayHints.fontFamily` | Controls font family of inlay hints in the editor. When set to empty, the `#editor.fontFamily#` is used.                                                                          | `""`    |
| `editor.inlayHints.fontSize`   | Controls font size of inlay hints in the editor. A default of 90% of `#editor.fontSize#` is used when the configured value is less than `5` or greater than the editor font size. | `0`     |

There are also several settings to enable Inlay Hints for both JavaScript and TypeScript.  
These settings are available in the following setting sections.  
`javascript.inlayHints`  
`typescript.inlayHints`

## Contributions

Additional language support is welcome as pull requests, and highly encouraged. You can see the source code to see how existing languages have been implemented.

Currently, the extension has 2 major steps that all language drivers must implement:

1. Parsing the source code of the currently active file (Using an AST library - [AST Explorer](https://astexplorer.net/) can assist in navigating it) to retrieve a list of positions where annotations should be inserted.
2. Getting the name of the parameters to use as the annotations. Existing language drivers do this by triggering the hover providers for the function being called, and extracting the parameter names from the description.

## Credits / Links

- [Benjamin Lannon](https://github.com/lannonbr) for the (no longer maintained) [VSCode JS Annotations extension](https://github.com/lannonbr/vscode-js-annotations) (where some AST parsing for the Javascript languages was borrowed from)
- [Bobby Zrncev](https://github.com/bzrncev) for the [IntelliJ Parameter Hints](https://github.com/bzrncev/intellij-parameter-hints) extension which achieves the same for PHP
- [jrieken](https://github.com/jrieken/test-inlayhints)
- [Liam Hammett](https://github.com/imliam)
- [RichardLuo0](https://github.com/RichardLuo0)
- [VSCode's Extension Samples](https://github.com/microsoft/vscode-extension-samples/tree/master/decorator-sample), which was a huge help to get started
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see the [license file](LICENSE.md) for more information.
