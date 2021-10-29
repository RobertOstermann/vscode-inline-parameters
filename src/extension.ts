import * as vscode from 'vscode'
import * as phpDriver from './drivers/php'
import * as luaDriver from './drivers/lua'
import * as javascriptDriver from './drivers/javascript'
import * as javascriptReactDriver from './drivers/javascriptreact'
import * as typescriptDriver from './drivers/typescript'
import * as typescriptReactDriver from './drivers/typescriptreact'
import * as javaDriver from './drivers/java'
import { Annotations } from './annotationProvider'
import Commands from './commands'
import { LanguageDriver, ParameterPosition } from './utils'

const hintDecorationType = vscode.window.createTextEditorDecorationType({})

async function updateDecorations(activeEditor, languageDrivers: Record<string, LanguageDriver>) {
  if (!activeEditor) {
    return
  }

  const isEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enabled");

  if (!(activeEditor.document.languageId in languageDrivers) || !isEnabled) {
    activeEditor.setDecorations(hintDecorationType, []);
    return;
  }

  const lineLimit = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("lineLimit");

  if (lineLimit && lineLimit < activeEditor.document.lineCount) {
    activeEditor.setDecorations(hintDecorationType, []);
    return;
  }

  const driver: LanguageDriver =
    languageDrivers[activeEditor.document.languageId];

  const fastParameters = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("fastParameters");

  let code = activeEditor.document.getText();

  if (fastParameters) {
    activeEditor.setDecorations(hintDecorationType, []);
    let current = activeEditor.selection.active.line;
    let startLine = current - Number(fastParameters);
    startLine = startLine < 0 ? 0 : startLine;
    let endLine = current + Number(fastParameters);
    endLine = endLine > activeEditor.document.lineCount ? activeEditor.document.lineCount : endLine;
    console.log(startLine + ' ' + endLine);
    let start = new vscode.Position(startLine, 0);
    let end = new vscode.Position(endLine, 0);
    let range = new vscode.Range(start, end);
    code = activeEditor.document.getText(range);
  }

  let functionParametersList: ParameterPosition[][];

  try {
    functionParametersList = driver.parse(code)
  } catch (error) {
    // Error parsing language's AST, likely a syntax error on the user's side
    console.log(error);
  }

  if (!functionParametersList || functionParametersList.length === 0) {
    return
  }

  const languageFunctions: vscode.DecorationOptions[] = []

  const leadingCharacters = vscode.workspace.getConfiguration('inline-parameters').get('leadingCharacters')
  const trailingCharacters = vscode.workspace.getConfiguration('inline-parameters').get('trailingCharacters')
  const parameterCase = vscode.workspace.getConfiguration('inline-parameters').get('parameterCase')

  for (const languageParameters of functionParametersList) {
    if (languageParameters === undefined) continue;

    let parameters;

    try {
      parameters = await driver.getParameterNameList(
        activeEditor,
        languageParameters
      )
    } catch (error) {
      console.log(error);
      continue;
    }

    for (let index = 0; index < languageParameters.length; index++) {
      let parameterName = parameters[index]
      let parameter = languageParameters[index]

      if (parameterName === undefined) continue;

      const start = new vscode.Position(
        parameter.start.line,
        parameter.start.character
      )

      const end = new vscode.Position(
        parameter.end.line,
        parameter.end.character
      )

      if (!parameterName) {
        continue
      }

      if (parameterCase === 'uppercase') {
        parameterName = parameterName.toUpperCase()
      }

      if (parameterCase === 'lowercase') {
        parameterName = parameterName.toLowerCase()
      }

      const annotation = Annotations.parameterAnnotation(
        leadingCharacters + parameterName + trailingCharacters,
        new vscode.Range(start, end)
      )

      languageFunctions.push(annotation)
    }
  }

  activeEditor.setDecorations(hintDecorationType, languageFunctions)
}

function getActiveLanguageDrivers() {
  let languageDrivers: Record<string, LanguageDriver> = {};

  const phpEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("phpEnabled");

  const luaEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("luaEnabled");

  const javascriptEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("javascriptEnabled");

  const typescriptEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("typescriptEnabled");

  const javaEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("javaEnabled");

  if (phpEnabled) {
    languageDrivers.php = phpDriver;
  }

  if (luaEnabled) {
    languageDrivers.lua = luaDriver;
  }

  if (javascriptEnabled) {
    languageDrivers.javascript = javascriptDriver;
    languageDrivers.javascriptreact = javascriptReactDriver;
  }

  if (typescriptEnabled) {
    languageDrivers.typescript = typescriptDriver;
    languageDrivers.typescriptreact = typescriptReactDriver;
  }

  if (javaEnabled) {
    languageDrivers.java = javaDriver;
  }

  return languageDrivers;
}

export function activate(context: vscode.ExtensionContext) {
  const languageDrivers: Record<string, LanguageDriver> = {
    php: phpDriver,
    lua: luaDriver,
    javascript: javascriptDriver,
    javascriptreact: javascriptReactDriver,
    typescript: typescriptDriver,
    typescriptreact: typescriptReactDriver,
    java: javaDriver,
  }

  let timeout: NodeJS.Timer | undefined = undefined
  let activeEditor = vscode.window.activeTextEditor

  Commands.registerCommands()

  function triggerUpdateDecorations(timer: boolean = true) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }

    timeout = setTimeout(
      () => updateDecorations(activeEditor, getActiveLanguageDrivers()),
      timer ? 2500 : 25
    );
  }

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('inline-parameters')) {
      triggerUpdateDecorations(false)
    }
  })

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor

      if (editor) {
        triggerUpdateDecorations(false)
      }
    },
    null,
    context.subscriptions
  )

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(false)
      }
    },
    null,
    context.subscriptions
  )

  if (activeEditor) {
    triggerUpdateDecorations()
  }
}
