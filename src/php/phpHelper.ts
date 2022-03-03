import * as php from "php-parser";
import * as vscode from "vscode";

import Helper from "../helpers/helper";
import ParameterDetails from "../helpers/parameterDetails";
import ParameterPosition from "../helpers/parameterPosition";
import PHPConfiguration from "./phpConfiguration";

export default class PHPHelper {
  static parse(code: string, range: vscode.Range): ParameterPosition[][] {
    const parameters: ParameterPosition[][] = [];
    const parser = new php.Engine({
      parser: {
        extractDoc: true,
        php7: true,
        locations: true,
        suppressErrors: true,
      },
      ast: {
        all_tokens: true,
        withPositions: true,
      },
    });

    code = Helper.removeShebang(code).replace("<?php", "");
    const ast: any = parser.parseEval(code);
    const functionCalls: any[] = this.crawlAST(ast);

    functionCalls.forEach((expression) => {
      parameters.push(this.getParametersFromExpression(expression, range));
    });

    return parameters;
  }

  static crawlAST(ast: any, functionCalls = []): any[] {
    const canAcceptArguments = ast.kind && (ast.kind === "call" || ast.kind === "new");
    const hasArguments = ast.arguments && ast.arguments.length > 0;

    if (canAcceptArguments && hasArguments) {
      functionCalls.push(ast);
    }

    for (const [, value] of Object.entries(ast)) {
      if (value instanceof Object) {
        functionCalls = this.crawlAST(value, functionCalls);
      }
    }

    return functionCalls;
  }

  static getParametersFromExpression(expression: any, range: vscode.Range): ParameterPosition[] | undefined {
    const parameters = [];
    if (!expression.arguments) {
      return undefined;
    }

    expression.arguments.forEach((argument: any, key: number) => {
      if (!expression.what || (!expression.what.offset && !expression.what.loc)) {
        return;
      }

      const expressionLoc = expression.what.offset ? expression.what.offset.loc.start : expression.what.loc.end;
      if (expressionLoc.line > range.start.line || expressionLoc.line < range.end.line) {
        parameters.push({
          namedValue: argument.name ?? null,
          expression: {
            line: parseInt(expressionLoc.line) - 1,
            character: parseInt(expressionLoc.column),
          },
          key: key,
          start: {
            line: parseInt(argument.loc.start.line) - 1,
            character: parseInt(argument.loc.start.column),
          },
          end: {
            line: parseInt(argument.loc.end.line) - 1,
            character: parseInt(argument.loc.end.column),
          },
        });
      }
    });

    return parameters;
  }

  static async getParameterNames(uri: vscode.Uri, languageParameters: ParameterPosition[]): Promise<ParameterDetails[]> {
    const firstParameter = languageParameters[0];
    let parameters: any[];
    let isVariadic = false;

    const description: any = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      uri,
      new vscode.Position(
        firstParameter.expression.line,
        firstParameter.expression.character
      )
    );

    if (description && description.length > 0) {
      try {
        const regex = /(?<=@param)[^.]*?((?:\.{3})?\$[\w]+).*?[\r\n|\n—] ?(.*?)[\r\n|\n](?:_@param|_@return)/gs;
        const definition = Helper.getFunctionDefinition(<vscode.MarkdownString[]>description[0].contents);
        parameters = definition ? [...definition.matchAll(regex)] : [];
      } catch (error) {
        console.error(error);
      }
    }

    if (!parameters) {
      return Promise.reject();
    }

    const parameterDetails: ParameterDetails[] = parameters.map((parameterInformation: any): ParameterDetails => {
      let name = parameterInformation[1];
      const definition = parameterInformation[2];

      if (name.startsWith("...")) {
        isVariadic = true;
        name = name.slice(3);
      }

      const parameter: ParameterDetails = {
        name: name,
        definition: definition
      };

      return parameter;
    });

    let namedValue = undefined;
    const parametersLength = parameterDetails.length;
    const suppressWhenArgumentMatchesName = PHPConfiguration.suppressWhenArgumentMatchesName();
    for (let i = 0; i < languageParameters.length; i++) {
      const parameter = languageParameters[i];
      const key = parameter.key;

      if (isVariadic && key >= parameterDetails.length - 1) {
        if (namedValue === undefined) namedValue = parameterDetails[parameterDetails.length - 1].name;

        if (suppressWhenArgumentMatchesName && namedValue.replace("$", "") === parameter.namedValue) {
          return Promise.reject();
        }

        const name = PHPHelper.showDollarSign(namedValue);
        const number = key - parametersLength + 1;

        parameterDetails[i] = {
          name: PHPConfiguration.showVariadicNumbers() ? `${name}[${number}]` : name,
          definition: parameterDetails[parameterDetails.length - 1].definition
        };

        continue;
      }

      if (parameterDetails[key]) {
        let name = parameterDetails[key].name;

        if (suppressWhenArgumentMatchesName && name.replace("$", "") === parameter.namedValue) {
          parameterDetails[i] = undefined;
          continue;
        }

        name = PHPHelper.showDollarSign(name);
        parameterDetails[i].name = name;
        continue;
      }

      parameterDetails[i] = undefined;
      continue;
    }

    return parameterDetails;
  }

  static showDollarSign(str: string): string {
    if (PHPConfiguration.showDollarSign()) {
      return str;
    }

    return str.replace("$", "");
  }
}
