package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"log"
	"os"
)

func main() {
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, os.Args[1]+".go", nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
	}

	ast.Inspect(file, func(n ast.Node) bool {
		functionCall, ok := n.(*ast.CallExpr)
		if ok {
			for _, arg := range functionCall.Args {
				fmt.Printf("expression line: %d | expression character: %d | argument start line: %d | argument start character: %d | argument end line: %d | argument end character: %d\n",
					fset.Position(functionCall.Lparen).Line,
					fset.Position(functionCall.Lparen).Column,
					fset.Position(arg.Pos()).Line,
					fset.Position(arg.Pos()).Column,
					fset.Position(arg.End()).Line,
					fset.Position(arg.End()).Column)
			}
			fmt.Println("NEW EXPRESSION")
			return true
		}
		return true
	})
}
