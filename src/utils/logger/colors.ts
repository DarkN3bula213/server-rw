interface ColorFunction {
  (text: string): string;
  node: (text: string) => string;
  browser: number[];
}

interface Colors {
  background: {
    [key: string]: ColorFunction;
  };
  foreground: {
    [key: string]: ColorFunction;
  };
  yellow: ColorFunction;
  blue: ColorFunction;
  grey: ColorFunction;
  cyan: ColorFunction;
  green: ColorFunction;
  red: ColorFunction;
}

const createColorFunction = (code: string, rgb: number[]) =>
  Object.assign((text: string) => `${code}${text}\x1b[0m`, {
    node: (text: string) => `${code}${text}\x1b[0m`,
    browser: rgb,
  });

const colors: Colors = {
  background: {
    bgBlack: createColorFunction('\x1b[40m', [0, 0, 0]),
    bgRed: createColorFunction('\x1b[41m', [255, 0, 0]),
    bgGreen: createColorFunction('\x1b[42m', [0, 255, 0]),
    bgYellow: createColorFunction('\x1b[43m', [255, 255, 0]),
    bgBlue: createColorFunction('\x1b[44m', [0, 0, 255]),
    bgMagenta: createColorFunction('\x1b[45m', [255, 0, 255]),
    bgCyan: createColorFunction('\x1b[46m', [0, 255, 255]),
    bgWhite: createColorFunction('\x1b[47m', [255, 255, 255]),
  },
  foreground: {
    black: createColorFunction('\x1b[30m', [0, 0, 0]),
    red: createColorFunction('\x1b[31m', [255, 0, 0]),
    green: createColorFunction('\x1b[32m', [0, 255, 0]),
    yellow: createColorFunction('\x1b[33m', [255, 255, 0]),
    blue: createColorFunction('\x1b[34m', [0, 0, 255]),
    magenta: createColorFunction('\x1b[35m', [255, 0, 255]),
    cyan: createColorFunction('\x1b[36m', [0, 255, 255]),
    white: createColorFunction('\x1b[37m', [255, 255, 255]),
  },
  yellow: createColorFunction('\x1b[33m', [255, 255, 0]),
  blue: createColorFunction('\x1b[34m', [0, 0, 255]),
  grey: createColorFunction('\x1b[90m', [128, 128, 128]),
  cyan: createColorFunction('\x1b[36m', [0, 255, 255]),
  green: createColorFunction('\x1b[32m', [0, 255, 0]),
  red: createColorFunction('\x1b[31m', [255, 0, 0]),
};

export default colors;
