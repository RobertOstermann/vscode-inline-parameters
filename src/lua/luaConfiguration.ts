import * as vscode from "vscode";

export default class LuaConfiguration {
  static luaConfiguration = vscode.workspace.getConfiguration("inline-parameters.lua");

  /**
   * @returns Enable inline parameters for Lua.
   */
  static enabled(): boolean {
    return this.luaConfiguration.get("enabled");
  }

  /**
   * @returns Should the inlay hint appear before the parameter. If this is set to `false` the hint will appear after the parameter.
   */
  static hintBeforeParameter(): boolean {
    return this.luaConfiguration.get("hintBeforeParameter");
  }

  /**
   * @returns Suppress parameter name hints on arguments whose text is identical to the parameter name.
   */
  static suppressWhenArgumentMatchesName(): boolean {
    return this.luaConfiguration.get("suppressWhenArgumentMatchesName");
  }
}
