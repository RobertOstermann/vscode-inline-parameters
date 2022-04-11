import ast
from sys import argv


def main():
    with open(argv[1], "r") as source:
        tree = ast.parse(source.read())

    analyzer = Analyzer()
    analyzer.visit(tree)
    analyzer.report()


class Analyzer(ast.NodeVisitor):
    def visit_Call(self, node):
        expression_line = "expression line: " + str(node.func.lineno)
        expression_character = "expression character: " + str(node.func.col_offset)
        for argument in node.args:
            argument_start_line = "argument start line: " + str(argument.lineno)
            argument_start_character = "argument start character: " + str(argument.col_offset)
            argument_end_line = "argument end line: " + str(argument.end_lineno)
            argument_end_character = "argument end character: " + str(argument.end_col_offset)
            print(
                str(expression_line) + " | "
                + str(expression_character) + " | "
                + str(argument_start_line) + " | "
                + str(argument_start_character) + " | "
                + str(argument_end_line) + " | "
                + str(argument_end_character)
            )
        print("NEW EXPRESSION")
        ast.NodeVisitor.generic_visit(self, node)

    def report(self):
        return


if __name__ == "__main__":
    main()
