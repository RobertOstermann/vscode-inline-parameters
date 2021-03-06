import * as vscode from "vscode";

export default class JavaConfiguration {
  static javaConfiguration = vscode.workspace.getConfiguration("inline-parameters.java");

  /**
   * @returns Enable inline parameters for Java.
   */
  static enabled(): boolean {
    return this.javaConfiguration.get("enabled");
  }

  /**
   * @returns Should the inlay hint appear before the parameter. If this is set to `false` the hint will appear after the parameter.
   */
  static hintBeforeParameter(): boolean {
    return this.javaConfiguration.get("hintBeforeParameter");
  }

  /**
   * @returns Show the number of times a variadic parameter has been called.
   */
  static showVariadicNumbers(): boolean {
    return this.javaConfiguration.get("showVariadicNumbers");
  }

  /**
   * @returns Suppress parameter name hints on arguments whose text is identical to the parameter name.
   */
  static suppressWhenArgumentMatchesName(): boolean {
    return this.javaConfiguration.get("suppressWhenArgumentMatchesName");
  }
}
