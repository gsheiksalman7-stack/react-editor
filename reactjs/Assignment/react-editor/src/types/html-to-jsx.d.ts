declare module "html-to-jsx" {
  interface Options {
    createClass?: boolean;
  }

  export default class HTMLtoJSX {
    constructor(options?: Options);
    convert(html: string): string;
  }
}