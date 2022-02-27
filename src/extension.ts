import * as vscode from "vscode";

import JavaConfiguration from "./java/javaConfiguration";
import JavaDriver from "./java/javaDriver";
import LuaConfiguration from "./lua/luaConfiguration";
import LuaDriver from "./lua/luaDriver";
// import MarkdownDriver from "./markdown/markdown";
import PHPConfiguration from "./php/phpConfiguration";
import PHPDriver from "./php/phpDriver";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(context: vscode.ExtensionContext) {
  setTimeout(() => {
    // MarkdownDriver.Register();
    if (JavaConfiguration.enabled) JavaDriver.Register();
    if (LuaConfiguration.enabled) LuaDriver.Register();
    if (PHPConfiguration.enabled) PHPDriver.Register();
  }, 1000);
}
