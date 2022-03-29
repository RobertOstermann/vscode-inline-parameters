import * as vscode from "vscode";

export default class Output {
  static outputChannel = vscode.window.createOutputChannel("inline-parameters");
}
