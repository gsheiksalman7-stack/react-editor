declare module "@babel/standalone" {
  export function transform(
    code: string,
    options?: {
      filename?: string;
      presets?: (string | any)[];
      plugins?: (string | any)[];
    }
  ): { code: string };
}