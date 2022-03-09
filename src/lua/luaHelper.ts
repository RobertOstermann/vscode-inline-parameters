
import * as vscode from "vscode";

import Helper from "../helpers/helper";
import ParameterDetails from "../helpers/parameterDetails";
import ParameterPosition from "../helpers/parameterPosition";
import LuaConfiguration from "./luaConfiguration";
export default class LuaHelper {
  static parse(code: string, start: number): ParameterPosition[][] {
    const parameters: ParameterPosition[][] = [];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const parser = require("luaparse");

    code = Helper.removeShebang(code);
    const ast: any = parser.parse(code, {
      comments: false,
      locations: true
    });
    const functionCalls: any[] = this.crawlAST(ast);

    functionCalls.forEach((expression) => {
      parameters.push(this.getParametersFromExpression(expression, start));
    });

    return parameters;
  }

  static crawlAST(ast: any, functionCalls = []): any[] {
    const canAcceptArguments = ast.type && ast.type === "CallExpression";
    const hasArguments = ast.arguments && ast.arguments.length > 0;

    if (canAcceptArguments && hasArguments) {
      functionCalls.push(ast);
    }

    for (const [key, value] of Object.entries(ast)) {
      if (key === "comments") {
        continue;
      }

      if (value instanceof Object) {
        functionCalls = this.crawlAST(value, functionCalls);
      }
    }

    return functionCalls;
  }

  static getParametersFromExpression(expression: any, start: number): ParameterPosition[] | undefined {
    const parameters = [];
    if (!expression.arguments) {
      return undefined;
    }

    expression.arguments.forEach((argument: any, key: number) => {
      const argumentLoc = argument.loc;
      const expressionLoc = expression.base.identifier.loc.start;
      parameters.push({
        namedValue: argument.name ?? null,
        expression: {
          line: parseInt(expressionLoc.line) + start - 1,
          character: parseInt(expressionLoc.column),
        },
        key: key,
        start: {
          line: parseInt(argumentLoc.start.line) + start - 1,
          character: parseInt(argumentLoc.start.column),
        },
        end: {
          line: parseInt(argumentLoc.end.line) + start - 1,
          character: parseInt(argumentLoc.end.column),
        },
      });
    });

    return parameters;
  }

  static async getParameterNames(uri: vscode.Uri, languageParameters: ParameterPosition[]): Promise<ParameterDetails[]> {
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
    const suppressWhenArgumentMatchesName = LuaConfiguration.suppressWhenArgumentMatchesName();
    const luaParameterNameRegex = /^[a-zA-Z_]([0-9a-zA-Z_]+)?/g;

    if (description && description.length > 0) {
      try {
        const regEx = /^function .*\((.*)\)/gm;
        definitions = Helper.getFunctionDefinition(<vscode.MarkdownString[]>description[0].contents)?.match(regEx);

        if (!definitions || !definitions[0]) {
          return Promise.reject();
        }

        definition = definitions[0];
      } catch (error) {
        console.error(error);
      }
    }

    const parameters: string[] = definition
      .substring(definition.indexOf("(") + 1, definition.lastIndexOf(")"))
      .replace(/\[/g, "").replace(/\]/g, "")
      .split(",")
      .map(parameter => parameter.trim())
      .map(parameter => {
        const matches = parameter.match(luaParameterNameRegex);
        if (!matches || !matches[0]) {
          return null;
        }

        return matches[0];
      })
      .filter(parameter => parameter);

    parameters.filter((_param, index) => {
      const parameter = languageParameters[index];
      if (parameter === undefined) return false;
      const key = parameter.key;
      const namedValue = parameter.namedValue;

      if (!parameters || !parameters[key]) {
        return false;
      }

      const name = parameters[key];

      if (suppressWhenArgumentMatchesName && name === namedValue) {
        return false;
      }

      return true;
    });

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
