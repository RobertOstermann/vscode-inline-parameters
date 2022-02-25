import * as vscode from "vscode";

export default class PHPConfiguration {
  /**
   * @returns Enable inline parameters for PHP.
   */
  static enabled(): boolean {
    return vscode.workspace
      .getConfiguration("inline-parameters.php")
      .get("enabled");
  }

  /**
   * @returns Should the inlay hint appear before the parameter. If this is set to `false` the hint will appear after the parameter.
   */
  static hintBeforeParameter(): boolean {
    return vscode.workspace
      .getConfiguration("inline-parameters.php")
      .get("hintBeforeParameter");
  }

  /**
   * @returns Show the $ character before PHP parameter names.
   */
  static showDollarSign(): boolean {
    return vscode.workspace
      .getConfiguration("inline-parameters.php")
      .get("showDollarSign");
  }

  /**
   * @returns Suppress parameter name hints on arguments whose text is identical to the parameter name.
   */
  static suppressWhenArgumentMatchesName(): boolean {
    return vscode.workspace
      .getConfiguration("inline-parameters.php")
      .get("suppressWhenArgumentMatchesName");
  }
}
