declare module 'atom-ide' {
  export interface MarkdownService {
    render (markdownText: string, grammar: string) => Promise<string>;
  }
}
