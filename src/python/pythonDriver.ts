import * as vscode from "vscode";

import Helper from "../helpers/helper";
import Output from "../helpers/output";
import ParameterDetails from "../helpers/parameterDetails";
import PythonConfiguration from "./pythonConfiguration";
import PythonHelper from "./pythonHelper";

export default class PythonDriver {
  static Register(context: vscode.ExtensionContext) {
    Output.outputChannel.appendLine("Register Python");

    vscode.languages.registerInlayHintsProvider("python", new class implements vscode.InlayHintsProvider {
      async provideInlayHints(document: vscode.TextDocument): Promise<vscode.InlayHint[]> {
        const result: vscode.InlayHint[] = [];
        const code = document.getText();
        // eslint-disable-next-line no-useless-escape
        const fsPath = document.uri.fsPath.replace(/\\/g, "/");

        const functionParameters = PythonHelper.parse(code, fsPath, context);
        for (const languageParameters of functionParameters) {
          if (languageParameters === undefined) continue;
          let parameters: ParameterDetails[];

          try {
            parameters = await PythonHelper.getParameterNames(document.uri, languageParameters);
          } catch (error) {
            continue;
          }

          for (let index = 0; index < languageParameters.length; index++) {
            const parameter = languageParameters[index];
            if (parameters[index] === undefined || parameters[index].name === undefined) continue;
            const parameterName = Helper.formatParameterName(parameters[index].name, PythonConfiguration.hintBeforeParameter());
            const parameterDefinition = parameters[index].definition;

            if (!parameterName) continue;

            let inlayHint: vscode.InlayHint;

            if (PythonConfiguration.hintBeforeParameter()) {
              const position = new vscode.Position(parameter.start.line, parameter.start.character);
              const inlayHintPart = new vscode.InlayHintLabelPart(parameterName);
              inlayHint = new vscode.InlayHint(position, [inlayHintPart], vscode.InlayHintKind.Parameter);
              inlayHint.tooltip = new vscode.MarkdownString(parameterDefinition);
              inlayHint.paddingRight = true;
            } else {
              const position = new vscode.Position(parameter.end.line, parameter.end.character);
              const inlayHintPart = new vscode.InlayHintLabelPart(parameterName);
              inlayHint = new vscode.InlayHint(position, [inlayHintPart], vscode.InlayHintKind.Parameter);
              inlayHint.tooltip = new vscode.MarkdownString(parameterDefinition);
              inlayHint.paddingLeft = true;
            }

            result.push(inlayHint);
          }
        }

        return result;
      }
    });
  }
}
