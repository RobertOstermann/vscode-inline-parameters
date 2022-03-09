import * as vscode from "vscode";

export default class Configuration {
  /**
   * Initialize the configuration options that require a reload upon change.
   */
  static initialize(): void {
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("inline-parameters.java.enabled") ||
        event.affectsConfiguration("inline-parameters.java.hintBeforeParameter") ||
        event.affectsConfiguration("inline-parameters.java.showVariadicNumbers") ||
        event.affectsConfiguration("inline-parameters.lua.suppressWhenArgumentMatchesName") ||
        event.affectsConfiguration("inline-parameters.lua.enabled") ||
        event.affectsConfiguration("inline-parameters.lua.hintBeforeParameter") ||
        event.affectsConfiguration("inline-parameters.lua.suppressWhenArgumentMatchesName") ||
        event.affectsConfiguration("inline-parameters.php.enabled") ||
        event.affectsConfiguration("inline-parameters.php.hintBeforeParameter") ||
        event.affectsConfiguration("inline-parameters.php.showDollarSign") ||
        event.affectsConfiguration("inline-parameters.php.showVariadicNumbers") ||
        event.affectsConfiguration("inline-parameters.php.suppressWhenArgumentMatchesName")
      ) {
        const action = "Reload";
        vscode.window
          .showInformationMessage(
            "Reload window for configuration change to take effect.",
            action
          )
          .then(selectedAction => {
            if (selectedAction === action) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          });
      }
    });
  }
}
