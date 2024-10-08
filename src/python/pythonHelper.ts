import { execSync } from "child_process";
import * as fs from "fs";
import { PythonShell } from "python-shell";
import * as vscode from "vscode";

import Helper from "../helpers/helper";
import Output from "../helpers/output";
import ParameterDetails from "../helpers/parameterDetails";
import ParameterPosition from "../helpers/parameterPosition";
import PythonConfiguration from "./pythonConfiguration";

export default class PythonHelper {
  static outputCommand = true;

  static parse(text: string, range: vscode.Range, context: vscode.ExtensionContext): ParameterPosition[][] {
    const pythonPath = PythonHelper.getPythonPath().replace(/\\/g, "/");
    const baseExtensionPath = context.extensionPath.replace(/\\/g, "/");
    // const extensionPath = `${baseExtensionPath}/src/python/programs/main.py`; // Development
    const extensionPath = `${baseExtensionPath}/out/src/python/programs/main.py`; // Production
    const tempFolder = `${baseExtensionPath}/out/src/temp`;
    const tempPath = `${tempFolder}/temp_python.go`;
    const startLine = range.start.line;
    const endLine = range.end.line;

    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder, { recursive: true });
    }

    try {
      fs.writeFileSync(tempPath, text);
    } catch (error) {
      console.log(error);
      return [];
    }

    const ignoreBuiltInFunctions = PythonConfiguration.ignoreBuiltInFunctions() ? "true" : "false"
    const command = `"${pythonPath}" "${extensionPath}" "${tempPath}" ${startLine} ${endLine} ${ignoreBuiltInFunctions}`;

    if (this.outputCommand) {
      Output.outputChannel.appendLine(`Python Command: ${command}`);
      this.outputCommand = false;
    }

    let output: string;
    try {
      output = execSync(command).toString();
      fs.rmSync(tempPath);
    } catch (error) {
      console.log(error);
      return [];
    }

    return this.getParametersFromOutput(text, output);
  }

  public static getPythonPath(resource: vscode.Uri = null): string {
    if (PythonConfiguration.executablePath()) {
      return PythonConfiguration.executablePath();
    }
    // adapted from vscode-restructuredtext/vscode-restructuredtext#224
    const extension = vscode.extensions.getExtension("ms-python.python");
    if (!extension) {
      return PythonShell.defaultPythonPath;
    }

    const pythonPath = extension.exports.settings.getExecutionDetails(resource).execCommand;
    return pythonPath[0]; // might be more elements if conda, but we are not bothering to support that yet
  }

  static getParametersFromOutput(code: string, output: string): ParameterPosition[][] | undefined {
    const parameters: ParameterPosition[][] = [];
    const lines = output.split("\n");
    const codeLines = code.split("\n");
    let key = 0;
    let index = 0;
    parameters[index] = [];

    for (const line of lines) {
      const newExpressionRegex = /NEW EXPRESSION/;
      const pythonRegex = /expression line: (.*?) \| expression character: (.*?) \| expression end line: (.*?) \| expression end character: (.*?) \| argument start line: (.*?) \| argument start character: (.*?) \| argument end line: (.*?) \| argument end character: (.*)/;

      if (newExpressionRegex.test(line)) {
        if (parameters[index].length > 0) {
          index++;
          parameters[index] = [];
        }
        key = 0;
        continue;
      }

      if (pythonRegex.test(line)) {
        const result = pythonRegex.exec(line);
        let i = 0;
        const expressionLine = parseInt(result[++i]) - 1;
        const expressionCharacter = parseInt(result[++i]);
        const expressionEndLine = parseInt(result[++i]) - 1;
        const expressionEndCharacter = parseInt(result[++i]);
        const argumentStartLine = parseInt(result[++i]) - 1;
        const argumentStartCharacter = parseInt(result[++i]);
        const argumentEndLine = parseInt(result[++i]) - 1;
        const argumentEndCharacter = parseInt(result[++i]);
        let namedValue = undefined;

        if (argumentStartLine === argumentEndLine) {
          namedValue = codeLines[argumentStartLine].substring(argumentStartCharacter, argumentEndCharacter);
        }

        const parameterPosition: ParameterPosition = {
          namedValue: namedValue,
          expression: {
            start: {
              line: expressionLine,
              character: expressionCharacter,
            },
            end: {
              line: expressionEndLine,
              character: expressionEndCharacter
            }
          },
          key: key,
          start: {
            line: argumentStartLine,
            character: argumentStartCharacter,
          },
          end: {
            line: argumentEndLine,
            character: argumentEndCharacter,
          }
        };

        parameters[index].push(parameterPosition);
        key++;
      }
    }

    return parameters;
  }

  static async getParameterNames(uri: vscode.Uri, languageParameters: ParameterPosition[]): Promise<ParameterDetails[]> {
    let isVariadic = false;
    let functionName = "";
    let definition = "";
    let definitions: string[];
    const firstParameter = languageParameters[0];
    const description: any = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      uri,
      new vscode.Position(
        firstParameter.expression.end.line,
        firstParameter.expression.end.character
      )
    );

    if (description && description.length > 0) {
      try {
        const regEx = /.*?(?:class |\(function\) def |\(method\) def )(\w+)\((.*?)\)/s;
        const functionDefinition = Helper.getFunctionDefinition(<vscode.MarkdownString[]>description[0].contents);
        definitions = functionDefinition?.match(regEx);

        if (!definitions || !definitions[2]) {
          return Promise.reject();
        }


        functionName = definitions[1] ?? "";
        definition = definitions[2];
      } catch (error) {
        console.error(error);
      }
    }

    const pythonParameterRegex = /\*?[a-zA-Z_][0-9a-zA-Z_]*?:/g;
    const parameters: string[] = Array.from(definition.match(pythonParameterRegex), m => m)
      // eslint-disable-next-line no-useless-escape
      .map(parameter => {
        const paramaterName = parameter.replace(/\*|:/g, "");
        if (isVariadic) {
          return null;
        }
        if (parameter.includes("*")) isVariadic = true;

        return paramaterName;
      })
      .filter(parameter => parameter);

    if (!parameters || parameters.length === 0) {
      return Promise.reject();
    }

    if (PythonConfiguration.ignoreFunctions().includes(functionName)) {
      return Promise.reject();
    }

    let namedValue = undefined;
    const parametersLength = parameters.length;
    const suppressWhenArgumentMatchesName = PythonConfiguration.suppressWhenArgumentMatchesName();
    for (let i = 0; i < languageParameters.length; i++) {
      const parameter = languageParameters[i];
      const key = parameter.key;

      if (isVariadic && key >= parameters.length - 1) {
        if (namedValue === undefined) namedValue = parameters[parameters.length - 1];

        if (suppressWhenArgumentMatchesName && namedValue === parameter.namedValue) {
          parameters[i] = undefined;
          continue;
        }

        const number = key - parametersLength + 1;
        parameters[i] = PythonConfiguration.showVariadicNumbers() ? `${namedValue}[${number}]` : namedValue;

        continue;
      }

      if (parameters[key]) {
        const name = parameters[key];

        if (suppressWhenArgumentMatchesName && name === parameter.namedValue) {
          parameters[i] = undefined;
        }

        continue;
      }

      parameters[i] = undefined;
      continue;
    }

    const parameterDetails: ParameterDetails[] = parameters.map((value): ParameterDetails => {
      const parameter: ParameterDetails = {
        name: value,
        definition: ""
      };

      return parameter;
    });

    return parameterDetails;
  }
}
