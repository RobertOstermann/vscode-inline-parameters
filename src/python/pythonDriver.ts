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
      async provideInlayHints(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.InlayHint[]> {
        const result: vscode.InlayHint[] = [];
        const text = document.getText();

        const functionParameters = PythonHelper.parse(text, range, context);
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
            const parameterName = Helper.formatParameterName(parameters[index].name, PythonConfiguration.hintBeforeParameter(), "=");
            const parameterDefinition = parameters[index].definition;

            if (!parameterName) continue;

            let inlayHint: vscode.InlayHint;

            if (PythonConfiguration.hintBeforeParameter()) {
              const position = new vscode.Position(parameter.start.line, parameter.start.character);
              const inlayHintPart = new vscode.InlayHintLabelPart(parameterName);
              inlayHint = new vscode.InlayHint(position, [inlayHintPart], vscode.InlayHintKind.Parameter);
              inlayHint.tooltip = new vscode.MarkdownString(parameterDefinition);
              if (index == languageParameters.length - 1) {
                inlayHint.textEdits = [vscode.TextEdit.insert(position, parameterName)];
              }
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
