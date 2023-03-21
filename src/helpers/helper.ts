import { MarkdownString } from "vscode";

export default class Helper {
  /**
   * Finds the markdown string that includes the function definition.
   * 
   * @param hoverList - The markdown strings retrieved from the `vscode.executeHoverProvider` command.
   * @returns The hover value that most likely includes the function definition.
   */
  static getFunctionDefinition(hoverList: MarkdownString[]): string | undefined {
    for (const hover of hoverList) {
      if (hover.value.includes("```"))
        return hover.value;
    }

    return undefined;
  }

  /**
   * Formats the parameter and adds extra characters for display.
   * 
   * @param parameterName - The parameter name to format.
   * @param hintBeforeParameter - The position of the parameter.
   * @param separator - Separator to add between hint and parameter if hint is before parameter. Default is `:`.
   * @returns The parameter formatted for display.
   */
  static formatParameterName(parameterName: string, hintBeforeParameter: boolean, separator: string = ":"): string {
    if (hintBeforeParameter) parameterName += separator;

    return parameterName;
  }

  /**
   * Removes any shebang character sequences from the text.
   * 
   * @param text - The text to remove the shebang from.
   * @returns The text without the shebang character sequence.
   */
  static removeShebang(text: string): string {
    const textArray = text.split("\n");

    if (textArray[0].slice(0, 2) === "#!") {
      textArray[0] = "";
    }

    return textArray.join("\n");
  }
}
