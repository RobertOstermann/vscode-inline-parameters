import * as vscode from "vscode";

export default class Configuration {
  /**
   * Initialize the configuration options that require a reload upon change.
   */
  static initialize(): void {
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("inline-parameters")) {
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
