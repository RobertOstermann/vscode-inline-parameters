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
let decorations: vscode.DecorationOptions[] = []

async function updateDecorations(activeEditor, languageDrivers: Record<string, LanguageDriver>) {
  if (!activeEditor) {
    return
  }

  const isEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enabled")

  if (!(activeEditor.document.languageId in languageDrivers) || !isEnabled) {
    activeEditor.setDecorations(hintDecorationType, [])
    return
  }

  const lineLimit = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("lineLimit")

  if (lineLimit && lineLimit < activeEditor.document.lineCount) {
    activeEditor.setDecorations(hintDecorationType, [])
    return
  }

  const driver: LanguageDriver =
    languageDrivers[activeEditor.document.languageId]

  let code = activeEditor.document.getText()
  let functionParametersList: ParameterPosition[][]

  try {
    functionParametersList = driver.parse(code)
  } catch (error) {
    // Error parsing language's AST, likely a syntax error on the user's side
    console.log(error)
  }

  if (!functionParametersList || functionParametersList.length === 0) {
    return
  }

  const languageFunctions: vscode.DecorationOptions[] = []

  const leadingCharacters = vscode.workspace.getConfiguration('inline-parameters').get('leadingCharacters')
  const trailingCharacters = vscode.workspace.getConfiguration('inline-parameters').get('trailingCharacters')
  const parameterCase = vscode.workspace.getConfiguration('inline-parameters').get('parameterCase')

  for (const languageParameters of functionParametersList) {
    if (languageParameters === undefined) continue

    let parameters

    try {
      parameters = await driver.getParameterNameList(
        activeEditor,
        languageParameters
      )
    } catch (error) {
      continue
    }

    for (let index = 0; index < languageParameters.length; index++) {
      let parameterName = parameters[index]
      let parameter = languageParameters[index]

      if (parameterName === undefined) continue

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

  decorations = languageFunctions
  activeEditor.setDecorations(hintDecorationType, decorations)
}

function getActiveLanguageDrivers() {
  let languageDrivers: Record<string, LanguageDriver> = {}

  const phpEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("phpEnabled")

  const luaEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("luaEnabled")

  const javascriptEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("javascriptEnabled")

  const typescriptEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("typescriptEnabled")

  const javaEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("javaEnabled")

  if (phpEnabled) {
    languageDrivers.php = phpDriver
  }

  if (luaEnabled) {
    languageDrivers.lua = luaDriver
  }

  if (javascriptEnabled) {
    languageDrivers.javascript = javascriptDriver
    languageDrivers.javascriptreact = javascriptReactDriver
  }

  if (typescriptEnabled) {
    languageDrivers.typescript = typescriptDriver
    languageDrivers.typescriptreact = typescriptReactDriver
  }

  if (javaEnabled) {
    languageDrivers.java = javaDriver
  }

  return languageDrivers
}

export function activate(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined
  let intervalId: NodeJS.Timeout
  let activeEditor = vscode.window.activeTextEditor
  let languageDrivers = getActiveLanguageDrivers()
  let timer = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("timer")

  Commands.registerCommands()

  if (timer) {
    intervalId = setInterval(updateDecorationsOnTimer, Number(timer))
  }

  function updateDecorationsOnTimer() {
    updateDecorations(activeEditor, languageDrivers)
  }

  function triggerUpdateDecorations(timer: boolean = true) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }

    timeout = setTimeout(
      () => updateDecorations(activeEditor, languageDrivers),
      timer ? 2500 : 25
    )
  }

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('inline-parameters')) {
      timer = vscode.workspace
        .getConfiguration("inline-parameters")
        .get("timer")
      if (timer) {
        if (intervalId) {
          clearInterval(intervalId)
        }
        intervalId = setInterval(updateDecorationsOnTimer, Number(timer))
      }
      languageDrivers = getActiveLanguageDrivers()
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
