export default interface ParameterPosition {
  functionCall?: string;

  namedValue?: string;

  expression: {
    line: number,
    character: number,
  };

  key: number;

  start: {
    line: number,
    character: number,
  };

  end: {
    line: number,
    character: number,
  };
}
