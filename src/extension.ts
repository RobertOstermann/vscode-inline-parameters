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
let oldLineCount = 0

async function updateDecorations(activeEditor: vscode.TextEditor, languageDrivers: Record<string, LanguageDriver>) {
  if (!activeEditor) {
    return
  }

  const isEnabled = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enabled")

  const lineLimit = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("lineLimit")

  const lineCount = activeEditor.document.lineCount - 1

  if (
    !isEnabled ||
    !(activeEditor.document.languageId in languageDrivers) ||
    (lineLimit && lineLimit <= lineCount)
  ) {
    decorations = []
    oldLineCount = 0
    activeEditor.setDecorations(hintDecorationType, decorations)
    return
  }

  const largeFileOptimizations = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("largeFileOptimizations")

  if (largeFileOptimizations && largeFileOptimizations < lineCount && decorations.length > 0) {
    let currentLine = activeEditor.selection.active.line
    let unchangedDecorations: vscode.DecorationOptions[] = []
    if (lineCount === oldLineCount) {
      decorations.forEach((decoration) => {
        let decorationStart = decoration.range.start.line
        let decorationEnd = decoration.range.end.line
        if (decorationStart < currentLine || decorationEnd > currentLine) {
          unchangedDecorations.push(decoration)
        }
      })
    } else {
      decorations.forEach((decoration) => {
        let decorationStart = decoration.range.start.line
        if (decorationStart < currentLine) {
          unchangedDecorations.push(decoration)
        }
      })
    }

    decorations = unchangedDecorations
    activeEditor.setDecorations(hintDecorationType, unchangedDecorations)
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

    if (largeFileOptimizations && largeFileOptimizations < lineCount && decorations.length > 0) {
      let currentLine = activeEditor.selection.active.line
      let parameterLine = languageParameters[0].start.line
      if (lineCount === oldLineCount) {
        if (parameterLine < currentLine || parameterLine > currentLine) {
          continue
        }
      } else if (parameterLine < currentLine) {
        continue
      }
    }

    let parameters: string[]

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

  oldLineCount = lineCount
  if (largeFileOptimizations && largeFileOptimizations < lineCount) {
    decorations = decorations.concat(languageFunctions)
  } else {
    decorations = languageFunctions
  }
  activeEditor.setDecorations(hintDecorationType, decorations)
}

function getActiveLanguageDrivers() {
  let languageDrivers: Record<string, LanguageDriver> = {}

  const enablePHP = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enablePHP")

  const enableLua = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enableLua")

  const enableJavascript = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enableJavascript")

  const enableTypescript = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enableTypescript")

  const enableJava = vscode.workspace
    .getConfiguration("inline-parameters")
    .get("enableJava")

  if (enablePHP) {
    languageDrivers.php = phpDriver
  }

  if (enableLua) {
    languageDrivers.lua = luaDriver
  }

  if (enableJavascript) {
    languageDrivers.javascript = javascriptDriver
    languageDrivers.javascriptreact = javascriptReactDriver
  }

  if (enableTypescript) {
    languageDrivers.typescript = typescriptDriver
    languageDrivers.typescriptreact = typescriptReactDriver
  }

  if (enableJava) {
    languageDrivers.java = javaDriver
  }

  return languageDrivers
}

export function activate(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined
  let activeEditor = vscode.window.activeTextEditor
  let languageDrivers = getActiveLanguageDrivers()

  Commands.registerCommands()

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
      decorations = []
      oldLineCount = 0
      activeEditor.setDecorations(hintDecorationType, [])
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
