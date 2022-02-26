import * as vscode from "vscode";

export default class MarkdownDriver {
  static Register() {
    vscode.languages.registerInlayHintsProvider("markdown", new class implements vscode.InlayHintsProvider {
      provideInlayHints(document: vscode.TextDocument, range: vscode.Range): vscode.InlayHint[] {
        const result: vscode.InlayHint[] = [];
        const text = document.getText(range);

        const end = document.offsetAt(range.end);
        let pos = document.offsetAt(range.start);

        while (pos < end) {
          const fooIdx = text.indexOf("foo", pos);
          const barIdx = text.indexOf("bar", pos);

          if (barIdx < 0 && fooIdx < 0) {
            break; // not found
          }

          if (fooIdx < 0 || (barIdx >= 0 && barIdx < fooIdx)) {
            // before BAR
            const before = document.positionAt(barIdx);
            const part = new vscode.InlayHintLabelPart("foo");

            const firstFooIdx = text.indexOf("foo");
            if (firstFooIdx >= 0) {
              part.location = new vscode.Location(document.uri, document.positionAt(firstFooIdx));
            }

            const hint = new vscode.InlayHint(before, [part]);
            hint.command = { command: "hello.inlayHint", title: "dbl click", arguments: ["BAR"] };
            result.push(hint);
            pos = barIdx + 3;
            continue;
          }

          if (barIdx < 0 || (fooIdx >= 0 && fooIdx < barIdx)) {
            // after FOO
            const after = document.positionAt(fooIdx + 3 /* 'foo'.length */);
            const part = new vscode.InlayHintLabelPart("bar");
            const hint = new vscode.InlayHint(after, [part]);
            hint.command = { command: "hello.inlayHint", title: "dbl click", arguments: ["FOO"] };
            result.push(hint);
            pos = fooIdx + 3;
            continue;
          }
        }

        return result;
      }

      async resolveInlayHint(hint: vscode.InlayHint): Promise<vscode.InlayHint> {
        await new Promise(resolve => setTimeout(resolve, 567));
        hint.tooltip = new vscode.MarkdownString("$(pass) Tooltip _resolved_!", true);
        return hint;
      }
    });

    vscode.languages.registerDefinitionProvider("markdown", new class implements vscode.DefinitionProvider {
      provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        const range = document.getWordRangeAtPosition(position);
        const result: vscode.Location[] = [];
        const text = document.getText();
        let pos = 0;

        if (!range || document.getText(range) !== "foo") {
          return undefined;
        }

        // eslint-disable-next-line no-constant-condition
        while (true) {
          pos = text.indexOf("foo", pos);
          if (pos < 0) {
            break;
          }
          result.push(new vscode.Location(document.uri, document.positionAt(pos)));
          pos += 4;
        }

        return result;
      }
    });

    vscode.languages.registerHoverProvider("markdown", new class implements vscode.HoverProvider {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        const wait = Math.round(Math.random() * 654);
        await new Promise(resolve => setTimeout(resolve, wait));
        return new vscode.Hover(
          new vscode.MarkdownString(`This is the fake language hover for markdown (artifically delayed by \`${wait}\`ms)`)
        );
      }
    });

    vscode.commands.registerCommand("hello.inlayHint", (what: any) => {
      vscode.window.showInformationMessage("You clicked: " + String(what));
    });
  }
}
