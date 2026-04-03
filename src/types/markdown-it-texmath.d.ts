declare module "markdown-it-texmath" {
  import type MarkdownIt from "markdown-it";

  type TexmathDelimiters =
    | "brackets"
    | "dollars"
    | "gitlab"
    | "julia"
    | "kramdown";

  interface TexmathOptions {
    engine: {
      renderToString: (
        math: string,
        options?: Record<string, unknown>,
      ) => string;
    };
    delimiters?: TexmathDelimiters;
    katexOptions?: Record<string, unknown>;
    outerSpace?: boolean;
  }

  const texmath: MarkdownIt.PluginWithOptions<TexmathOptions>;

  export default texmath;
}
