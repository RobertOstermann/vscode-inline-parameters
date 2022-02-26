import * as vscode from "vscode";

import markdownDriver from "./drivers/markdown";
import phpDriver from "./php/phpDriver";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(context: vscode.ExtensionContext) {
  setTimeout(() => {
    markdownDriver.Register();
    phpDriver.Register();
  }, 1000);
}
