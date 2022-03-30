import ast
from pprint import pprint
from sys import argv


def main():
    with open(argv[1], "r") as source:
        tree = ast.parse(source.read())

    analyzer = Analyzer()
    analyzer.visit(tree)
    analyzer.report()


class Analyzer(ast.NodeVisitor):
    def visit_Call(self, node):
        expression_line = f"expression line: {node.func.lineno}"
        expression_character = f"expression character: {node.func.col_offset}"
        for argument in node.args:
            argument_start_line = f"argument start line: {argument.lineno}"
            argument_start_character = f"argument start character: {argument.col_offset}"
            argument_end_line = f"argument end line: {argument.end_lineno}"
            argument_end_character = f"argument end character: {argument.end_col_offset}"
            print(f'{expression_line} | {expression_character} | {argument_start_line} | {argument_start_character} | {argument_end_line} | {argument_end_character}')
        print("NEW EXPRESSION")
        ast.NodeVisitor.generic_visit(self, node)

    def report(self):
        return


if __name__ == "__main__":
    main()
