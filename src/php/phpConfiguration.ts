import * as vscode from "vscode";

export default class PHPConfiguration {
  static phpConfiguration = vscode.workspace.getConfiguration("inline-parameters.php");

  /**
   * @returns Enable inline parameters for PHP.
   */
  static enabled(): boolean {
    return this.phpConfiguration.get("enabled");
  }

  /**
   * @returns Should the inlay hint appear before the parameter. If this is set to `false` the hint will appear after the parameter.
   */
  static hintBeforeParameter(): boolean {
    return this.phpConfiguration.get("hintBeforeParameter");
  }

  /**
   * @returns Show the $ character before PHP parameter names.
   */
  static showDollarSign(): boolean {
    return this.phpConfiguration.get("showDollarSign");
  }

  /**
   * @returns Show the number of times a variadic parameter has been called.
   */
  static showVariadicNumbers(): boolean {
    return this.phpConfiguration.get("showVariadicNumbers");
  }

  /**
   * @returns Suppress parameter name hints on arguments whose text is identical to the parameter name.
   */
  static suppressWhenArgumentMatchesName(): boolean {
    return this.phpConfiguration.get("suppressWhenArgumentMatchesName");
  }
}
