import {
    DecorationInstanceRenderOptions,
    DecorationOptions,
    Range,
    ThemeColor,
    workspace,
} from "vscode";

export class Annotations {
    public static parameterAnnotation(
        message: string,
        range: Range
    ): DecorationOptions {
        const renderOptions = workspace.getConfiguration("inline-parameters").get("renderOptions");
        if (renderOptions === "afterParameter") {
            const afterParameter = new Range(range?.start, range?.end);
            return {
                range: afterParameter,
                renderOptions: {
                    after: {
                        contentText: message,
                        color: new ThemeColor("inlineparameters.annotationForeground"),
                        backgroundColor: new ThemeColor("inlineparameters.annotationBackground"),
                        fontStyle: workspace.getConfiguration("inline-parameters").get("fontStyle"),
                        fontWeight: workspace.getConfiguration("inline-parameters").get("fontWeight"),
                        textDecoration: `;
                            font-size: ${workspace.getConfiguration("inline-parameters").get("fontSize")};
                            margin: ${workspace.getConfiguration("inline-parameters").get("margin")};
                            padding: ${workspace.getConfiguration("inline-parameters").get("padding")};
                            border-radius: ${workspace.getConfiguration("inline-parameters").get("borderRadius")};
                            border: ${workspace.getConfiguration("inline-parameters").get("border")};
                            vertical-align: baseline;
                        `,
                    },
                } as DecorationInstanceRenderOptions,
            } as DecorationOptions;
        } else if (renderOptions === "nearParameter") {
            const nearParameter = new Range(range?.start, range?.start);
            return {
                range: nearParameter,
                renderOptions: {
                    after: {
                        contentText: message,
                        color: new ThemeColor("inlineparameters.annotationForeground"),
                        backgroundColor: new ThemeColor("inlineparameters.annotationBackground"),
                        fontStyle: workspace.getConfiguration("inline-parameters").get("fontStyle"),
                        fontWeight: workspace.getConfiguration("inline-parameters").get("fontWeight"),
                        textDecoration: `;
                            font-size: ${workspace.getConfiguration("inline-parameters").get("fontSize")};
                            margin: ${workspace.getConfiguration("inline-parameters").get("margin")};
                            padding: ${workspace.getConfiguration("inline-parameters").get("padding")};
                            border-radius: ${workspace.getConfiguration("inline-parameters").get("borderRadius")};
                            border: ${workspace.getConfiguration("inline-parameters").get("border")};
                            vertical-align: baseline;
                        `,
                    },
                } as DecorationInstanceRenderOptions,
            } as DecorationOptions;
        } else if (renderOptions === "nearParentheses") {
            const nearParentheses = new Range(range?.start, range?.end);
            return {
                range: nearParentheses,
                renderOptions: {
                    before: {
                        contentText: message,
                        color: new ThemeColor("inlineparameters.annotationForeground"),
                        backgroundColor: new ThemeColor("inlineparameters.annotationBackground"),
                        fontStyle: workspace.getConfiguration("inline-parameters").get("fontStyle"),
                        fontWeight: workspace.getConfiguration("inline-parameters").get("fontWeight"),
                        textDecoration: `;
                            font-size: ${workspace.getConfiguration("inline-parameters").get("fontSize")};
                            margin: ${workspace.getConfiguration("inline-parameters").get("margin")};
                            padding: ${workspace.getConfiguration("inline-parameters").get("padding")};
                            border-radius: ${workspace.getConfiguration("inline-parameters").get("borderRadius")};
                            border: ${workspace.getConfiguration("inline-parameters").get("border")};
                            vertical-align: baseline;
                        `,
                    },
                } as DecorationInstanceRenderOptions,
            } as DecorationOptions;
        }
    }
}
