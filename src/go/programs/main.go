package main

import (
	"bufio"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"log"
	"os"
	"strconv"
	"unicode/utf8"
)

func main() {
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, os.Args[1]+".go", nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
	}
	text, err := os.Open(os.Args[1]+".go")
    if err != nil {
        log.Fatal(err)
    }
    defer text.Close()
	scanner := bufio.NewScanner(text)

	range_start_line, err := strconv.Atoi(os.Args[2])
	range_end_line, err := strconv.Atoi(os.Args[3])
	previous_line := 0
	previous_line_scan := scanner.Scan();
	previous_line_text := scanner.Text();

	ast.Inspect(file, func(n ast.Node) bool {
		functionCall, ok := n.(*ast.CallExpr)
		if ok && range_start_line < fset.Position(functionCall.Lparen).Line && fset.Position(functionCall.Lparen).Line <= range_end_line {
			for _, arg := range functionCall.Args {
				for (previous_line < fset.Position(arg.Pos()).Line - 1) {
					previous_line = previous_line + 1
					previous_line_scan = scanner.Scan()
					if (previous_line_scan) {
						previous_line_text = scanner.Text()
					}
				}

				fmt.Printf("expression call: %s | expression line: %d | expression character: %d | argument start line: %d | argument start character: %d | argument end line: %d | argument end character: %d\n",
					functionCall.Fun,
					fset.Position(functionCall.Lparen).Line,
					DetermineCorrectCharacterPosition(previous_line_text, fset.Position(functionCall.Lparen).Column),
					fset.Position(arg.Pos()).Line,
					DetermineCorrectCharacterPosition(previous_line_text, fset.Position(arg.Pos()).Column),
					fset.Position(arg.End()).Line,
					DetermineCorrectCharacterPosition(previous_line_text, fset.Position(arg.End()).Column))
			}
			fmt.Println("NEW EXPRESSION")
			return true
		}
		return true
	})
}

func DetermineCorrectCharacterPosition(line string, character_position int) int {
	line = line[:character_position]
	return utf8.RuneCountInString(line)
}
