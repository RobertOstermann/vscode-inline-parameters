package anotherpackage

type Struct struct{}

func (a Struct) Method(s string) string {
	return s
}

func Function(s string) string {
	return s
}

type Interface interface {
	Method(string) string
}

func FunctionWithInterfaceParameter(a Interface, s string) string {
	return a.Method(s)
}
