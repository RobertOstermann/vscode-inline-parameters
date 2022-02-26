import * as java from "java-ast";
import * as vscode from "vscode";

import Helper from "../helpers/helper";
import ParameterDetails from "../helpers/parameterDetails";
import ParameterPosition from "../helpers/parameterPosition";
import JavaConfiguration from "./javaConfiguration";

export default class JavaHelper {
  static parse(code: string): ParameterPosition[][] {
    const editor = vscode.window.activeTextEditor;
    const parameters: ParameterPosition[][] = [];

    code = Helper.removeShebang(code);
    const ast: any = java.parse(code);
    const functionCalls: any[] = this.getFunctionCalls(ast);

    functionCalls.forEach((expression) => {
      parameters.push(this.getParametersFromMethod(editor, expression));
    });

    return parameters;
  }

  static getFunctionCalls(ast: java.ParseTree): any[] {
    const functionCalls: any = [];

    class JavaMethodListener implements java.JavaParserListener {
      enterArguments = (args: java.ArgumentsContext) => {
        const params = args.expressionList()?.expression();
        if (params) {
          functionCalls.push(args);
        }
      };
      enterMethodCall = (method: java.MethodCallContext) => {
        const params = method.expressionList()?.expression();
        if (params) {
          functionCalls.push(method);
        }
      };
    }

    const listener: java.JavaParserListener = new JavaMethodListener();

    java.walk(listener, ast);

    return functionCalls;
  }

  static getParametersFromMethod(editor: vscode.TextEditor, method: any): ParameterPosition[] {
    const parameters = [];

    const params = method.expressionList().expression();

    params.forEach((param, key) => {
      parameters.push(this.parseParameter(editor, method, param, key));
    });

    return parameters;
  }

  static parseParameter(editor: vscode.TextEditor, expression: any, argument: java.ExpressionContext, key: number): ParameterPosition {
    const parameter: ParameterPosition = {
      namedValue: argument.text ?? null,
      expression: {
        line: expression.start.line - 1,
        character: expression.start.charPositionInLine,
      },
      key: key,
      start: {
        line: argument.start.line - 1,
        character: argument.start.charPositionInLine,
      },
      end: {
        line: argument.stop.line - 1,
        character: argument.stop.charPositionInLine,
      },
    };

    const line = editor.document.lineAt(parameter.start.line);

    const offset = editor.options.insertSpaces ? 0 : line.firstNonWhitespaceCharacterIndex * 3;

    parameter.expression.character -= offset;
    parameter.start.character -= offset;
    parameter.end.character -= offset;

    return parameter;
  }

  static async getParameterNames(uri: vscode.Uri, languageParameters: ParameterPosition[]): Promise<ParameterDetails[]> {
    let isVariadic = false;
    let parameters: any[];
    const firstParameter = languageParameters[0];
    const description = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      uri,
      new vscode.Position(
        firstParameter.expression.line,
        firstParameter.expression.character
      )
    );

    if (description && description.length > 0) {
      try {
        const functionDefinitionRegex = /[^ ](?!^)\((.*)\)/gm;
        let definition: string | string[] | undefined = Helper.getFunctionDefinition(<vscode.MarkdownString[]>description[0].contents)?.match(functionDefinitionRegex);

        if (!definition || definition.length === 0) {
          return Promise.reject();
        }

        definition = definition[0].slice(2, -1);

        const jsParameterNameRegex = /[a-zA-Z_$][0-9a-zA-Z_$]*$/g;

        parameters = definition.split(",")
          .map((parameter: string) => parameter.trim())
          .map((parameter: string) => {
            if (parameter.includes("...")) {
              isVariadic = true;
            }

            const matches = parameter.match(jsParameterNameRegex);

            if (matches && matches.length) {
              return matches[0];
            }

            return parameter;
          });
      } catch (error) {
        console.error(error);
      }
    }

    if (!parameters) {
      return Promise.reject();
    }

    let namedValue = undefined;
    const parametersLength = parameters.length;
    const suppressWhenArgumentMatchesName = JavaConfiguration.suppressWhenArgumentMatchesName();
    for (let i = 0; i < languageParameters.length; i++) {
      const parameter = languageParameters[i];
      const key = parameter.key;

      if (isVariadic && key >= parameters.length - 1) {
        if (namedValue === undefined) namedValue = parameters[parameters.length - 1];

        if (suppressWhenArgumentMatchesName && namedValue === parameter.namedValue) {
          return Promise.reject();
        }

        const number = key - parametersLength + 1;
        parameters[i] = JavaConfiguration.showVariadicNumbers() ? `${namedValue}[${number}]` : namedValue;

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
