declare module 'node:test' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export default test;
}

declare module 'node:assert/strict' {
  function assert(value: unknown, message?: string): asserts value;
  namespace assert {
    export function ok(value: unknown, message?: string): asserts value;
    export function equal<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    export function notEqual(actual: unknown, expected: unknown, message?: string): void;
    export function deepEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    export function throws(fn: () => unknown, error?: RegExp | ((err: unknown) => boolean), message?: string): void;
    export function match(string: string, regexp: RegExp, message?: string): void;
  }
  export default assert;
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
}

declare const process: {
  cwd(): string;
};
