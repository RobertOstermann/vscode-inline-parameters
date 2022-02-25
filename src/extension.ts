import * as vscode from 'vscode';
import * as phpDriver from './drivers/php';
import * as luaDriver from './drivers/lua';
import * as javaDriver from './drivers/java';
import { Annotations } from './annotationProvider';
import Commands from './commands';
import { LanguageDriver, ParameterPosition } from './utils';
import RegisterMarkdown from "./register/markdown";

export function activate(context: vscode.ExtensionContext) {
  RegisterMarkdown();
}

async function updateDecorations(activeEditor: vscode.TextEditor, languageDrivers: Record<string, LanguageDriver>) {
  let currentDecorations: vscode.DecorationOptions[] = [];

  if (!activeEditor) {
    return;
  }

  let visibleRangeStart = activeEditor.visibleRanges[0].start.line;
  let visibleRangeEnd = activeEditor.visibleRanges[0].end.line;
  let range = Math.ceil((visibleRangeEnd - visibleRangeStart) / 2);

  const driver: LanguageDriver = languageDrivers[activeEditor.document.languageId];

  let code = activeEditor.document.getText();
  let functionParametersList: ParameterPosition[][];

  try {
    functionParametersList = driver.parse(code);
  } catch (error) {
    // Error parsing language's AST, likely a syntax error on the user's side
    let currentLine = activeEditor.selection.active.line;
    let unchangedDecorations: vscode.DecorationOptions[] = [];

    currentDecorations = unchangedDecorations;
  }

  if (!functionParametersList || functionParametersList.length === 0) {
    return;
  }

  const languageFunctions: vscode.DecorationOptions[] = [];

  const parameterCase = vscode.workspace.getConfiguration('inline-parameters').get('parameterCase');

  for (const languageParameters of functionParametersList) {
    if (languageParameters === undefined) continue;

    let parameters: string[];

    try {
      parameters = await driver.getParameterNameList(
        activeEditor,
        languageParameters
      );
    } catch (error) {
      continue;
    }

    for (let index = 0; index < languageParameters.length; index++) {
      let parameterName = parameters[index];
      let parameter = languageParameters[index];

      if (parameterName === undefined) continue;

      const start = new vscode.Position(
        parameter.start.line,
        parameter.start.character
      );

      const end = new vscode.Position(
        parameter.end.line,
        parameter.end.character
      );

      if (!parameterName) {
        continue;
      }

      if (parameterCase === 'uppercase') {
        parameterName = parameterName.toUpperCase();
      }

      if (parameterCase === 'lowercase') {
        parameterName = parameterName.toLowerCase();
      }

      const annotation = Annotations.parameterAnnotation(
        parameterName,
        new vscode.Range(start, end)
      );

      languageFunctions.push(annotation);
    }
  }


  currentDecorations = languageFunctions;
}

function getActiveLanguageDrivers() {
  let languageDrivers: Record<string, LanguageDriver> = {};

  const enablePHP = vscode.workspace
    .getConfiguration("inline-parameters.php")
    .get("enabled");

  const enableLua = vscode.workspace
    .getConfiguration("inline-parameters.lua")
    .get("enabled");

  const enableJava = vscode.workspace
    .getConfiguration("inline-parameters.java")
    .get("enabled");

  if (enablePHP) {
    languageDrivers.php = phpDriver;
  }

  if (enableLua) {
    languageDrivers.lua = luaDriver;
  }

  if (enableJava) {
    languageDrivers.java = javaDriver;
  }

  return languageDrivers;
}

