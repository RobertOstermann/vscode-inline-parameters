import ast
import types
import builtins
from sys import argv

def main():
    with open(argv[1], "r") as source:
        tree = ast.parse(source.read())

    analyzer = Analyzer()
    analyzer.visit(tree)
    analyzer.report()


range_start_line = int(argv[2])
range_end_line = int(argv[3])
ignore_built_in = argv[4].lower() == 'true' if len(argv) > 4 else False


class Analyzer(ast.NodeVisitor):
    def visit_Call(self, node):
        try:
            function_id = node.func.id # type: ignore
            getattr(builtins, function_id)
            is_built_in = True
        except:
            is_built_in = False

        if ignore_built_in and is_built_in:
            ast.NodeVisitor.generic_visit(self, node)
            return

        expression_line = "expression line: " + str(node.func.lineno)
        expression_character = "expression character: " + str(node.func.col_offset)
        if range_start_line < node.func.lineno <= range_end_line:
            try:
                expression_end_line = "expression end line: " + str(node.func.end_lineno)
                expression_end_character = "expression end character: " + str(node.func.end_col_offset)
            except:
                expression_end_line = "expression end line: " + str(node.func.lineno)
                expression_end_character = "expression end character: " + str(node.func.col_offset)
            for argument in node.args:
                argument_start_line = "argument start line: " + str(argument.lineno)
                argument_start_character = "argument start character: " + str(argument.col_offset)
                try:
                    argument_end_line = "argument end line: " + str(argument.end_lineno)
                    argument_end_character = "argument end character: " + str(argument.end_col_offset)
                except:
                    argument_end_line = "argument end line: " + str(argument.lineno)
                    argument_end_character = "argument end character: " + str(argument.col_offset)
                print(
                    str(expression_line) + " | "
                    + str(expression_character) + " | "
                    + str(expression_end_line) + " | "
                    + str(expression_end_character) + " | "
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
