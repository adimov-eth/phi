declare module 'lips' {
  export class Environment {
    get(name: string, options?: { throwError?: boolean }): any;
    set(name: string, value: any): void;
    defineRosetta?(name: string, config: any): void;
  }

  export const env: Environment;
  
  export function exec(code: string, env?: Environment): Promise<any>;
  
  export class Pair {
    car: any;
    cdr: any;
    constructor(car: any, cdr: any);
  }
  
  export class Nil {
    toString(): string;
    valueOf(): null;
  }
}