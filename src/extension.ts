import * as vscode from "vscode";

import GoConfiguration from "./go/goConfiguration";
import GoDriver from "./go/goDriver";
import Configuration from "./helpers/configuration";
import JavaConfiguration from "./java/javaConfiguration";
import JavaDriver from "./java/javaDriver";
import LuaConfiguration from "./lua/luaConfiguration";
import LuaDriver from "./lua/luaDriver";
// import MarkdownDriver from "./markdown/markdown";
import PHPConfiguration from "./php/phpConfiguration";
import PHPDriver from "./php/phpDriver";
import PythonConfiguration from "./python/pythonConfiguration";
import PythonDriver from "./python/pythonDriver";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(context: vscode.ExtensionContext) {
  Configuration.initialize();

  setTimeout(() => {
    // MarkdownDriver.Register();
    if (GoConfiguration.enabled) GoDriver.Register(context);
    if (JavaConfiguration.enabled) JavaDriver.Register();
    if (LuaConfiguration.enabled) LuaDriver.Register();
    if (PHPConfiguration.enabled) PHPDriver.Register();
    if (PythonConfiguration.enabled) PythonDriver.Register(context);
  }, 1000);
}
