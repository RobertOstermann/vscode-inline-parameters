
import { execSync } from "child_process";
import * as vscode from "vscode";

import Helper from "../helpers/helper";
import ParameterDetails from "../helpers/parameterDetails";
import ParameterPosition from "../helpers/parameterPosition";
import GoConfiguration from "./goConfiguration";

export default class GoHelper {
  static parse(code: string, fsPath: string, context: vscode.ExtensionContext): ParameterPosition[][] {
    fsPath = fsPath.replace(/\.go/, "");

    const command = `go run ${context.extensionPath}/out/src/go/helpers/main.go ${fsPath}`;
    const output = execSync(command).toString();

    return this.getParametersFromOutput(code, output);
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
      const goRegex = /expression line: (.*?) \| expression character: (.*?) \| argument start line: (.*?) \| argument start character: (.*?) \| argument end line: (.*?) \| argument end character: (.*)/;

      if (newExpressionRegex.test(line)) {
        if (parameters[index].length > 0) {
          index++;
          parameters[index] = [];
        }
        key = 0;
        continue;
      }

      if (goRegex.test(line)) {
        const result = goRegex.exec(line);
        // Get tabs at start and
        const expressionLine = parseInt(result[1]) - 1;
        const expressionCharacter = parseInt(result[2]) - 1;
        const argumentStartLine = parseInt(result[3]) - 1;
        const argumentStartCharacter = parseInt(result[4]) - 1;
        const argumentEndLine = parseInt(result[5]) - 1;
        const argumentEndCharacter = parseInt(result[6]) - 1;
        let namedValue = undefined;
        if (argumentStartLine === argumentEndLine) {
          namedValue = codeLines[argumentStartLine].substring(argumentStartCharacter, argumentEndCharacter);
        }
        const parameterPosition: ParameterPosition = {
          namedValue: namedValue,
          expression: {
            line: expressionLine,
            character: expressionCharacter,
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
    let definition = "";
    let definitions: string[];
    const firstParameter = languageParameters[0];
    const description: any = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      uri,
      new vscode.Position(
        firstParameter.expression.line,
        firstParameter.expression.character
      )
    );

    const goParameterNameRegex = /^[a-zA-Z_]([0-9a-zA-Z_]+)?/g;
    if (description && description.length > 0) {
      try {
        const regEx = /^func .*\((.*)\)/gm;
        definitions = Helper.getFunctionDefinition(<vscode.MarkdownString[]>description[0].contents)?.match(regEx);

        if (!definitions || !definitions[0]) {
          return Promise.reject();
        }

        definition = definitions[0];
      } catch (error) {
        console.error(error);
      }
    }

    if (definition.includes("...")) {
      isVariadic = true;
    }

    const parameters: string[] = definition
      .substring(definition.indexOf("(") + 1, definition.indexOf(")"))
      .replace(/\[/g, "").replace(/\]/g, "")
      // eslint-disable-next-line no-useless-escape
      .split(/,|[\.\.\.]/)
      .map(parameter => parameter.trim())
      .map(parameter => {
        if (parameter.includes("...")) {
          isVariadic = true;
        }
        const matches = parameter.match(goParameterNameRegex);
        if (!matches || !matches[0]) {
          return null;
        }

        return matches[0];
      })
      .filter(parameter => parameter);

    if (!parameters || parameters.length === 0) {
      Promise.reject();
    }

    let namedValue = undefined;
    const parametersLength = parameters.length;
    const suppressWhenArgumentMatchesName = GoConfiguration.suppressWhenArgumentMatchesName();
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
        parameters[i] = GoConfiguration.showVariadicNumbers() ? `${namedValue}[${number}]` : namedValue;

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
